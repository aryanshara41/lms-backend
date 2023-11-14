import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type OrderDocument = HydratedDocument<Order>;

@Schema({ timestamps: true })
export class Order {
  @Prop({ required: true })
  courseId: string;

  @Prop({ required: true })
  userId: string;

  @Prop({ type: Object, required: true })
  payment_info: object;
}

export const orderSchema = SchemaFactory.createForClass(Order);
