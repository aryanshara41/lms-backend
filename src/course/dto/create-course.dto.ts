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

export class CreateCourseDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsNumber()
  price: number;

  @IsNumber()
  @IsOptional()
  estimatedPrice: number;

  @IsString()
  thumbnail: string;

  @IsString()
  tags: string;

  @IsString()
  level: string;

  @IsString()
  demoUrl: string;

  @IsArray()
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => BenefitsDto)
  benefits: BenefitsDto[];

  @IsArray()
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => BenefitsDto)
  prerequisites: BenefitsDto[];

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CourseDataDto)
  courseData: CourseDataDto[];
}
