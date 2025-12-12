import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { Problem } from '../../problems/entities/problem.entity';

export enum SubmissionStatus {
    PENDING = 'PENDING',
    PROCESSING = 'PROCESSING',
    COMPLETED = 'COMPLETED',
    ERROR = 'ERROR',
}

export enum Verdict {
    ACCEPTED = 'Accepted',
    WRONG_ANSWER = 'Wrong Answer',
    TIME_LIMIT_EXCEEDED = 'Time Limit Exceeded',
    MEMORY_LIMIT_EXCEEDED = 'Memory Limit Exceeded',
    RUNTIME_ERROR = 'Runtime Error',
    COMPILATION_ERROR = 'Compilation Error',
    NONE = 'None',
}

@Entity()
export class Submission {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'text' })
    code: string;

    @Column()
    language: string; // 'cpp' | 'python'

    @Column({
        type: 'enum',
        enum: SubmissionStatus,
        default: SubmissionStatus.PENDING,
    })
    status: SubmissionStatus;

    @Column({
        type: 'enum',
        enum: Verdict,
        default: Verdict.NONE,
    })
    verdict: Verdict;

    @Column({ type: 'text', nullable: true })
    output: string;

    @ManyToOne(() => Problem, { onDelete: 'CASCADE' })
    problem: Problem;

    @Column()
    problemId: number;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
