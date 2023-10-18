import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { EntityType } from 'src/enums/entity-type.enum';

export type EntityDocument = Entity & Document;

@Schema()
export class Entity {
  @Prop({ index: true })
  entity_id: string;

  @Prop({
    type: String,
    enum: Object.values(EntityType),
    required: true,
  })
  entity_type: EntityType;

  @Prop({ required: true })
  user_id: string;

  @Prop()
  phone_number: string;

  @Prop()
  email: string;

  @Prop()
  location: string;

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

export const EntitySchema = SchemaFactory.createForClass(Entity);