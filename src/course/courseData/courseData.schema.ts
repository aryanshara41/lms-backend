import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { Link } from '../link/link.schema';
import { Question } from '../question/question.schema';

export type CourseDataDocument = HydratedDocument<CourseData>;

@Schema()
export class CourseData {
  @Prop()
  videoUrl: string;

  @Prop()
  videoThumbnail: string;

  @Prop()
  title: string;

  @Prop()
  videoSection: string;

  @Prop()
  description: string;

  @Prop()
  videoLength: number;

  @Prop()
  videoPlayer: string;

  @Prop([Link])
  links: Link[];

  @Prop()
  suggestion: string;

  @Prop([Question])
  questions: Question[];
}

export const courseDataSchema = SchemaFactory.createForClass(CourseData);
