import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

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

  @Prop({ type: Object, default: {} })
  metadata: Record<string, any>;
}

export const ParticipantSchema = SchemaFactory.createForClass(Participant);
