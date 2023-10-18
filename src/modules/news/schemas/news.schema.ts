import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type NewsDocument = News & Document;

@Schema()
export class News {
  @Prop({ index: true })
  news_id: string;

  @Prop({ required: true })
  headlines: string;

  @Prop({ required: true })
  content: string;

  @Prop()
  content_image: string;

  @Prop({ required: true })
  location: string[];

  @Prop({ required: true })
  location_name: string;

  @Prop({ required: true })
  created_at: string;

  @Prop({ required: true })
  created_by: string;

  @Prop()
  updated_at: string;

  @Prop()
  updated_by: string;

  @Prop({ default: 1 })
  status?: number;
}

export const NewsSchema = SchemaFactory.createForClass(News);