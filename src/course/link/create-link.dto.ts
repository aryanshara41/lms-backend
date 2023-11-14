import { IsString } from 'class-validator';

export class CreateLinkDto {
  @IsString()
  title: string;

  @IsString()
  url: string;
}
