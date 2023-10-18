import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ClubMemberDocument = ClubMember & Document;

@Schema()
export class ClubMember {
  @Prop({ index: true })
  club_member_id: string;

  @Prop({ required: true })
  user_id: string;

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

export const ClubMemberSchema = SchemaFactory.createForClass(ClubMember);