import { IsEmail, IsOptional, IsString } from 'class-validator';

export class SocialAuthDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @IsOptional()
  avatar: string;
}
