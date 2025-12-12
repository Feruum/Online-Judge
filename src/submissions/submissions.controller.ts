import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { SubmissionsService } from './submissions.service';
import { CreateSubmissionDto } from './dto/create-submission.dto';

@Controller('submissions')
export class SubmissionsController {
    constructor(private readonly submissionsService: SubmissionsService) { }

    @Post()
    create(@Body() createSubmissionDto: CreateSubmissionDto) {
        return this.submissionsService.create(createSubmissionDto);
    }

    @Get()
    findAll() {
        return this.submissionsService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.submissionsService.findOne(id);
    }
}
