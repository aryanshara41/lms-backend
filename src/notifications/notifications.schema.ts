import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export enum NotificationStatus {
  READ = 'read',
  UNREAD = 'unread',
}

export type NotificationDocument = HydratedDocument<Notification>;

@Schema()
export class Notification {
  @Prop({ required: true })
  user: string;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  message: string;

  @Prop({ required: true, default: NotificationStatus.UNREAD })
  status: string;
}

export const notificationSchema = SchemaFactory.createForClass(Notification);
