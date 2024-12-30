import { Prop, raw, Schema, SchemaFactory } from '@nestjs/mongoose';

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
  organizationId: string;

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
