import { IsString, IsNotEmpty, IsNumber, IsEnum } from 'class-validator';

export class CreateSubmissionDto {
    @IsString()
    @IsNotEmpty()
    code: string;

    @IsString()
    @IsNotEmpty()
    language: string;

    @IsNumber()
    @IsNotEmpty()
    problemId: number;
}
