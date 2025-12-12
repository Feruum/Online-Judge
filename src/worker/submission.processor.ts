import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { ProblemsService } from '../problems/problems.service';
import { SubmissionsService } from '../submissions/submissions.service';
import { SubmissionStatus, Verdict } from '../submissions/entities/submission.entity';
import Docker from 'dockerode';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

@Processor('submission_queue')
export class SubmissionProcessor extends WorkerHost {
    private readonly logger = new Logger(SubmissionProcessor.name);
    private docker = new Docker({ socketPath: process.env.DOCKER_SOCK_PATH || '//./pipe/docker_engine' });

    constructor(
        private readonly problemsService: ProblemsService,
        private readonly submissionsService: SubmissionsService,
    ) {
        super();
    }

    async process(job: Job<any, any, string>): Promise<any> {
        const { submissionId, code, language, problemId } = job.data;
        this.logger.log(`Processing submission ${submissionId} for problem ${problemId}`);

        try {
            const problem = await this.problemsService.findOne(problemId);
            if (!problem) throw new Error('Problem not found');

            let finalVerdict = Verdict.ACCEPTED;
            let totalOutput = '';

            // Prepare temp dir
            const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'oj-'));
            const codeFilename = language === 'cpp' ? 'main.cpp' : 'code.py';
            const codePath = path.join(tmpDir, codeFilename);
            fs.writeFileSync(codePath, code);

            // COMPILATION STEP (C++ Only)
            if (language === 'cpp') {
                let compileContainer: Docker.Container | null = null;
                try {
                    compileContainer = await this.docker.createContainer({
                        Image: 'gcc:latest',
                        Cmd: ['sh', '-c', 'g++ -o /app/code/main /app/code/main.cpp'],
                        HostConfig: {
                            Binds: [`${tmpDir}:/app/code`],
                            NetworkMode: 'none',
                            Memory: 512 * 1024 * 1024, // 512MB for compilation is safe
                            NanoCpus: 2000000000, // 2 CPUs for faster compilation
                        },
                        WorkingDir: '/app/code',
                        Tty: false,
                    });

                    await compileContainer.start();
                    const result = await compileContainer.wait(); // Wait indefinitely (or add a generous 10s timeout)

                    if (result.StatusCode !== 0) {
                        // Gather compilation errors
                        const logBuffer = await compileContainer.logs({ stdout: true, stderr: true });
                        let output = '';
                        let current = 0;
                        while (current < logBuffer.length) {
                            const size = logBuffer.readUInt32BE(current + 4);
                            output += logBuffer.subarray(current + 8, current + 8 + size).toString('utf8');
                            current += 8 + size;
                        }

                        // Fail early
                        await this.submissionsService.update(submissionId, {
                            status: SubmissionStatus.COMPLETED,
                            verdict: Verdict.COMPILATION_ERROR,
                            output: output || 'Compilation Failed'
                        });
                        fs.rmSync(tmpDir, { recursive: true, force: true });
                        return; // EXIT JOB
                    }
                } finally {
                    if (compileContainer) {
                        try { await compileContainer.remove({ force: true }); } catch (e) { }
                    }
                }
            }

            // EXECUTION STEP (Iterate Test Cases)
            for (const testCase of problem.testCases) {
                const inputPath = path.join(tmpDir, 'input.txt');
                fs.writeFileSync(inputPath, testCase.input);

                // For C++, run the compiled binary. For Python, run the interpreter.
                const cmd = language === 'cpp'
                    ? ['sh', '-c', '/app/code/main < /app/code/input.txt']
                    : ['sh', '-c', 'python /app/code/code.py < /app/code/input.txt'];

                const containerImage = language === 'cpp' ? 'gcc:latest' : 'python:3.9-alpine';
                const memoryLimitBytes = problem.memoryLimit * 1024 * 1024;

                let container: Docker.Container | null = null;
                try {
                    container = await this.docker.createContainer({
                        Image: containerImage,
                        Cmd: cmd,
                        HostConfig: {
                            Binds: [`${tmpDir}:/app/code`],
                            NetworkMode: 'none',
                            Memory: memoryLimitBytes,
                            MemorySwap: memoryLimitBytes,
                            NanoCpus: 1000000000, // 1 CPU
                            PidsLimit: 50,
                        },
                        WorkingDir: '/app/code',
                        Tty: false,
                    });

                    await container.start();

                    // Strict Timeout Handling
                    const timeLimitMs = (problem.timeLimit * 1000) + 100; // 100ms grace period only
                    let timedOut = false;

                    const waitPromise = container.wait();
                    const timeoutPromise = new Promise((_, reject) =>
                        setTimeout(() => {
                            timedOut = true;
                            container!.stop().catch(e => this.logger.error(`Error stopping container: ${e}`));
                            reject(new Error('TLE'));
                        }, timeLimitMs)
                    );

                    try {
                        const result: any = await Promise.race([waitPromise, timeoutPromise]);
                        const exitCode = result.StatusCode;

                        // logs
                        const logBuffer = await container.logs({ stdout: true, stderr: true });
                        let output = '';
                        let current = 0;
                        while (current < logBuffer.length) {
                            const size = logBuffer.readUInt32BE(current + 4);
                            output += logBuffer.subarray(current + 8, current + 8 + size).toString('utf8');
                            current += 8 + size;
                        }
                        output = output.trim();

                        if (exitCode !== 0) {
                            if (exitCode === 137) {
                                finalVerdict = Verdict.MEMORY_LIMIT_EXCEEDED;
                                totalOutput = 'Memory Limit Exceeded';
                            } else {
                                finalVerdict = Verdict.RUNTIME_ERROR;
                                totalOutput = `Runtime Error (Exit Code: ${exitCode})\n${output}`;
                            }
                            break;
                        }

                        if (output !== testCase.output.trim()) {
                            finalVerdict = Verdict.WRONG_ANSWER;
                            totalOutput = `Expected: ${testCase.output}\nGot: ${output}`;
                            break;
                        }

                    } catch (err: any) {
                        if (err.message === 'TLE') {
                            finalVerdict = Verdict.TIME_LIMIT_EXCEEDED;
                            totalOutput = 'Time Limit Exceeded';
                            break;
                        }
                        throw err;
                    }

                } finally {
                    if (container) {
                        try { await container.remove({ force: true }); } catch (e) { }
                    }
                }
            }

            // Cleanup tmp
            fs.rmSync(tmpDir, { recursive: true, force: true });

            this.logger.log(`Verdict: ${finalVerdict}`);
            await this.submissionsService.update(submissionId, { status: SubmissionStatus.COMPLETED, verdict: finalVerdict, output: totalOutput });

        } catch (e) {
            this.logger.error(e);
            await this.submissionsService.update(submissionId, { status: SubmissionStatus.ERROR, verdict: Verdict.RUNTIME_ERROR, output: e.message });
        }
    }
}
