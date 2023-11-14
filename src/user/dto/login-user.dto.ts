import { IsEmail, IsString } from 'class-validator';

export class LoginUserDto {
  @IsString()
  password: string;

  @IsEmail()
  email: string;
}
