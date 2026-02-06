import { Prop, raw, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ParticipantPermissions } from '../types/permissions.type';

@Schema()
export class Participant {
  @Prop()
  name: string;

  @Prop()
  role: string;

  @Prop()
  email: string;

  @Prop()
  document: string;

  @Prop()
  phone: string;

  @Prop()
  organizationId?: string;

  @Prop()
  userId: string;

  /** ID do cargo (Position) vinculado ao participante */
  @Prop()
  positionId?: string;

  @Prop(raw({}))
  permissions?: ParticipantPermissions;

  @Prop(raw({}))
  metadata: Record<string, any>;

  // created and updated at
  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: Date, default: Date.now })
  updatedAt: Date;

  @Prop({ type: Date, default: null })
  deletedAt?: Date;
}

export const ParticipantSchema = SchemaFactory.createForClass(Participant);
