import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type DealDocument = Deal & Document;

@Schema()
export class Deal {
  @Prop({ index: true })
  deal_id: string;

  @Prop({ required: true })
  entity_id: string;

  @Prop({ required: true })
  product: string;

  @Prop()
  deal_image: string;

  @Prop({ required: true })
  deal: string;

  @Prop({ required: true })
  expiry_date: string;

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

export const DealSchema = SchemaFactory.createForClass(Deal);