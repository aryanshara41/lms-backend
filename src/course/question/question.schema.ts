import { Prop, Schema, SchemaFactory, raw } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type QuestionDocument = HydratedDocument<Question>;

@Schema({ timestamps: true })
export class Question {
  @Prop(
    raw({
      avatar: {
        public_id: { type: String, required: true },
        url: { type: String, required: true },
      },
      name: { type: String, required: true },
      _id: { type: String, required: true },
      email: { type: String, reqiured: true },
    }),
  )
  user: object;

  @Prop()
  question: string;

  @Prop([Object])
  questionReplies: object[];
}

export const questionSchema = SchemaFactory.createForClass(Question);
