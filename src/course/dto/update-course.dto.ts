import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { CourseDataDto } from '../courseData/create-courseData.dto';

class BenefitsDto {
  @IsString()
  title: string;
}

export class UpdateCourseDto {
  @IsString()
  @IsOptional()
  name: string;

  @IsString()
  @IsOptional()
  description: string;

  @IsNumber()
  @IsOptional()
  price: number;

  @IsNumber()
  @IsOptional()
  estimatedPrice: number;

  @IsString()
  @IsOptional()
  thumbnail: string;

  @IsString()
  @IsOptional()
  tags: string;

  @IsString()
  @IsOptional()
  level: string;

  @IsString()
  @IsOptional()
  demoUrl: string;

  @IsArray()
  @IsNotEmpty()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => BenefitsDto)
  benefits: BenefitsDto[];

  @IsArray()
  @IsNotEmpty()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => BenefitsDto)
  prerequisites: BenefitsDto[];

  @IsArray()
  @ArrayMinSize(1)
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CourseDataDto)
  courseData: CourseDataDto[];
}
