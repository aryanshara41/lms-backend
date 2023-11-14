import { IsString } from 'class-validator';

export class ActivateUserDto {
  @IsString()
  activationCode: string;

  @IsString()
  activationToken: string;
}
