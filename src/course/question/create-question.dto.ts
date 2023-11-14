import { IsString } from 'class-validator';

export class CreateQuestionDto {
  @IsString()
  question: string;

  @IsString()
  courseId: string;

  @IsString()
  contentId: string;
}
