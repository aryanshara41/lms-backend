import { IsString } from "class-validator";

export class CreateNotificationDto{
    @IsString()
    user: string;

    @IsString()
    title: string;

    @IsString()
    message: string;
}