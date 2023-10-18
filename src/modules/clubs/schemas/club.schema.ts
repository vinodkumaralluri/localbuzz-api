import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ClubMemberSchema, ClubMemberDocument } from './member.schema';
import { ClubTypes } from 'src/enums/club-types.enum';

export type ClubDocument = Club & Document;

@Schema()
export class Club {
  @Prop({ index: true })
  club_id: string;

  @Prop({ required: true })
  name: string;

  @Prop({ 
    type: String,
    enum: Object.values(ClubTypes),
    required: true,
  })
  type: ClubTypes;

  @Prop({ required: true })
  description: string;

  @Prop()
  club_image: string;

  @Prop({
    type: [ClubMemberSchema],
  })
  members: ClubMemberDocument[]

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

export const ClubSchema = SchemaFactory.createForClass(Club);