import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { CreateSubmissionDto } from './dto/create-submission.dto';
import { Submission, SubmissionStatus } from './entities/submission.entity';

@Injectable()
export class SubmissionsService {
    constructor(
        @InjectRepository(Submission)
        private submissionRepository: Repository<Submission>,
        @InjectQueue('submission_queue') private submissionQueue: Queue,
    ) { }

    async create(createSubmissionDto: CreateSubmissionDto) {
        const submission = this.submissionRepository.create({
            ...createSubmissionDto,
            status: SubmissionStatus.PENDING,
        });
        const savedSubmission = await this.submissionRepository.save(submission);

        await this.submissionQueue.add('execute_submission', {
            submissionId: savedSubmission.id,
            code: savedSubmission.code,
            language: savedSubmission.language,
            problemId: savedSubmission.problemId,
        });

        return savedSubmission;
    }

    findAll() {
        return this.submissionRepository.find();
    }


    findOne(id: string) {
        return this.submissionRepository.findOneBy({ id });
    }

    async update(id: string, updateData: Partial<Submission>) {
        await this.submissionRepository.update(id, updateData);
        return this.findOne(id);
    }
}
