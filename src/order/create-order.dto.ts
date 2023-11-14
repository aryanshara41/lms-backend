import { IsObject, IsString } from 'class-validator';

export class CreateOrderDto {
  @IsString()
  courseId: string;

  @IsObject()
  payment_info: object;
}
