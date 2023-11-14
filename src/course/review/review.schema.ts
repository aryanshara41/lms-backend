import { Prop, Schema, SchemaFactory, raw } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ReviewDocument = HydratedDocument<Review>;

@Schema()
export class Review {
  @Prop(
    raw({
      avatar: {
        public_id: { type: String, required: true },
        url: { type: String, required: true },
      },
      name: { type: String, required: true },
    }),
  )
  user: object;

  @Prop({ type: Number, default: 0 })
  rating: number;

  @Prop()
  comment: string;
}

export const reviewSchema = SchemaFactory.createForClass(Review);
