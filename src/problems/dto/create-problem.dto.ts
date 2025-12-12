import { IsString, IsNotEmpty, IsNumber, IsArray, ValidateNested, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

class TestCaseDto {
    @IsString()
    @IsNotEmpty()
    input: string;

    @IsString()
    @IsNotEmpty()
    output: string;
}

export class CreateProblemDto {
    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsNotEmpty()
    description: string;

    @IsString()
    @IsNotEmpty()
    slug: string;

    @IsNumber()
    @IsOptional()
    timeLimit?: number;

    @IsNumber()
    @IsOptional()
    memoryLimit?: number;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => TestCaseDto)
    testCases: TestCaseDto[];
}
