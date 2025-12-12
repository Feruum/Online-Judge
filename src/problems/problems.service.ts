import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateProblemDto } from './dto/create-problem.dto';
import { Problem } from './entities/problem.entity';

@Injectable()
export class ProblemsService {
    constructor(
        @InjectRepository(Problem)
        private readonly problemRepository: Repository<Problem>,
    ) { }

    async create(createProblemDto: CreateProblemDto): Promise<Problem> {
        const problem = this.problemRepository.create(createProblemDto);
        try {
            return await this.problemRepository.save(problem);
        } catch (error) {
            if (error.code === '23505') {
                throw new (await import('@nestjs/common')).ConflictException('Problem with this slug already exists');
            }
            throw error;
        }
    }

    async findAll(): Promise<Problem[]> {
        return this.problemRepository.find();
    }

    async findOne(id: number): Promise<Problem> {
        const problem = await this.problemRepository.findOneBy({ id });
        if (!problem) {
            throw new NotFoundException(`Problem with ID ${id} not found`);
        }
        return problem;
    }
}
