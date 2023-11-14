import { IsString } from 'class-validator';

export class GetALLQuestionsDto {
  @IsString()
  courseId: string;
  @IsString()
  contentId: string;
}
