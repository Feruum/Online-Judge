import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { SubmissionProcessor } from './submission.processor';
import { ProblemsModule } from '../problems/problems.module';
import { SubmissionsModule } from '../submissions/submissions.module'; // Ensure SubmissionsModule exports Service, Entity or Repository

@Module({
    imports: [
        BullModule.registerQueue({
            name: 'submission_queue',
        }),
        ProblemsModule,
        SubmissionsModule,
    ],
    providers: [SubmissionProcessor],
})
export class WorkerModule { }
