import { Controller, Get, Post, Body, Param, ParseIntPipe } from '@nestjs/common';
import { ProblemsService } from './problems.service';
import { CreateProblemDto } from './dto/create-problem.dto';

@Controller('problems')
export class ProblemsController {
    constructor(private readonly problemsService: ProblemsService) { }

    @Post()
    create(@Body() createProblemDto: CreateProblemDto) {
        return this.problemsService.create(createProblemDto);
    }

    @Get()
    findAll() {
        return this.problemsService.findAll();
    }

    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.problemsService.findOne(id);
    }
}
