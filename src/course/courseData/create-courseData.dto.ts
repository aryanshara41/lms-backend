import {
  ArrayMinSize,
  IsArray,
  IsNumber,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateLinkDto } from '../link/create-link.dto';

export class CourseDataDto {
  @IsString()
  videoUrl: string;

  // @IsString()
  // videoThumbnail: string;

  @IsString()
  title: string;

  @IsString()
  videoSection: string;

  @IsString()
  description: string;

  @IsNumber()
  videoLength: number;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateLinkDto)
  links: CreateLinkDto[];
}
