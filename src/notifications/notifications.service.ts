import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateNotificationDto } from './create-notifications.dto';
import {
  Notification,
  NotificationDocument,
  NotificationStatus,
} from './notifications.schema';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class NotificationService {
  constructor(
    @InjectModel('Notification') private notificationModel: Model<Notification>,
  ) {}

  @Cron('0 0 0 * * *')
  async deleteNotifications() {
    const thirtyDayAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    await this.notificationModel.deleteMany({
      status: NotificationStatus.READ,
      createdAt: { $lt: thirtyDayAgo },
    });
  }

  async createNotification(
    notificationData: CreateNotificationDto,
  ): Promise<Notification> {
    return await this.notificationModel.create(notificationData);
  }

  async getAllNotifications(): Promise<Notification[]> {
    return await this.notificationModel.find({}).sort({ createdAt: -1 });
  }

  async updateNotification(
    notificationId: string,
  ): Promise<NotificationDocument[]> {
    try {
      const notification =
        await this.notificationModel.findById(notificationId);

      if (!notification) {
        throw new HttpException(
          'Invalid notification id',
          HttpStatus.NOT_FOUND,
        );
      }

      notification.status = NotificationStatus.READ;

      await notification.save();

      const data = await this.notificationModel
        .find({})
        .sort({ createdAt: -1 });
      return data;
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }
}
