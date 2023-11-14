import { Prop, Schema, SchemaFactory, raw } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { Review } from './review/review.schema';
import { CourseData } from './courseData/courseData.schema';

export type CourseDocument = HydratedDocument<Course>;

@Schema({ timestamps: true })
export class Course {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  price: number;

  @Prop({ type: Number, default: 0 })
  estimatedPrice: number;

  @Prop(
    raw({
      public_id: { type: String, required: true },
      url: { type: String, required: true },
    }),
  )
  thumbnail: object;

  @Prop({ required: true })
  tags: string;

  @Prop({ required: true })
  level: string;

  @Prop({ required: true })
  demoUrl: string;

  @Prop([
    {
      title: String,
    },
  ])
  benefits: [object];

  @Prop([{ title: String }])
  prerequisites: [object];

  @Prop([Review])
  reviews: Review[];

  @Prop([CourseData])
  courseData: CourseData[];

  @Prop({ type: Number, default: 0 })
  ratings: number;

  @Prop({ type: Number, default: 0 })
  purchased: number;
  save: any;
}

export const courseSchema = SchemaFactory.createForClass(Course);
