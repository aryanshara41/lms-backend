import { IsString } from 'class-validator';

export class CreateAnswerDto {
  @IsString()
  answer: string;

  @IsString()
  courseId: string;

  @IsString()
  contentId: string;

  @IsString()
  questionId: string;
}

export class Question{
  @IsString()
  question: string;
}