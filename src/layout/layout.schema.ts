import { Prop, Schema, SchemaFactory, raw } from '@nestjs/mongoose';

@Schema()
export class Faq {
  @Prop()
  question: string;

  @Prop()
  answer: string;
}

@Schema()
export class Category {
  @Prop(
    raw({
      title: { type: String, required: true },
    }),
  )
  title: object;
}

@Schema()
export class Layout {
  @Prop()
  type: string;

  @Prop([Faq])
  faq: Faq[];

  @Prop([Category])
  categories: Category[];

  @Prop(
    raw({
      image: {
        public_id: { type: String, required: true },
        url: { type: String, required: true },
      },
      title: { type: String },
      subtitle: { type: String },
    }),
  )
  banner: object;
}

export const layoutSchema = SchemaFactory.createForClass(Layout);
