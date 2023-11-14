import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type LinkDocument = HydratedDocument<Link>;

@Schema()
export class Link {
  @Prop()
  title: string;

  @Prop()
  url: string;
}

export const linkSchema = SchemaFactory.createForClass(Link);