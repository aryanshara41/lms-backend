import {
  Controller,
  Get,
  UseGuards,
  HttpException,
  HttpStatus,
  Put,
  Param,
} from '@nestjs/common';
import { AuthGuard } from 'src/auth/jwt-auth.guard';
import { Roles } from 'src/roles.decorator';
import { RolesGuard } from 'src/roles.guard';
import { UserRole } from 'src/user/user.schema';
import { NotificationService } from './notifications.service';
import { Notification } from './notifications.schema';

@UseGuards(AuthGuard, RolesGuard)
@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Roles(UserRole.ADMIN)
  @Get('all')
  async getAllNotifications(): Promise<Notification[]> {
    try {
      return await this.notificationService.getAllNotifications();
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }

  @Roles(UserRole.ADMIN)
  @Put('update-notification/:id')
  async updateNotification(@Param('id') id: string): Promise<Notification[]> {
    try {
      return await this.notificationService.updateNotification(id);
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }
}
