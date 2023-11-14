import { IsNumber, IsString } from 'class-validator';

export class CreateReviewDto {
  @IsString()
  review: string;

  @IsNumber()
  rating: number;
}
