import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { notificationSchema } from './notifications.schema';
import { NotificationService } from './notifications.service';
import { NotificationController } from './notifications.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: 'Notification',
        schema: notificationSchema,
      },
    ]),
  ],
  providers: [NotificationService],
  controllers: [NotificationController],
  exports: [NotificationService]
})
export class NotificationModule {}
