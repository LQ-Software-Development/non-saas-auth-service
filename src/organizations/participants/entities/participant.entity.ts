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
}

export const ParticipantSchema = SchemaFactory.createForClass(Participant);
