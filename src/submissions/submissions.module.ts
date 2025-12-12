import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';
import { SubmissionsService } from './submissions.service';
import { SubmissionsController } from './submissions.controller';
import { Submission } from './entities/submission.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([Submission]),
        BullModule.registerQueue({
            name: 'submission_queue',
        }),
    ],
    controllers: [SubmissionsController],
    providers: [SubmissionsService],
    exports: [SubmissionsService],
})
export class SubmissionsModule { }
