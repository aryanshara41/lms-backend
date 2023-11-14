import { IsIn, IsString } from 'class-validator';
import { UserRole } from '../user.schema';

export class UpdateUserRoleDto {
  @IsString()
  id: string;

  @IsIn([UserRole.ADMIN, UserRole.USER])
  role: string;
}
