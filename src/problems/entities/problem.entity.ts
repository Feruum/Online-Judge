import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export class TestCase {
    input: string;
    output: string;
}

@Entity()
export class Problem {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    title: string;

    @Column({ type: 'text' })
    description: string;

    @Column({ unique: true })
    slug: string;

    @Column('float', { default: 1.0 })
    timeLimit: number; // in seconds

    @Column('int', { default: 128 })
    memoryLimit: number; // in MB

    @Column('jsonb', { default: [] })
    testCases: TestCase[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
