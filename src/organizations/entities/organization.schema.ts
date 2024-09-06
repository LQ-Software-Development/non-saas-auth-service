import { Prop, raw, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, now } from 'mongoose';

export type OrganizationDocument = HydratedDocument<Organization>;

@Schema()
export class Organization {
  @Prop()
  name: string;

  @Prop()
  externalId?: string;

  @Prop(raw({}))
  metadata: Record<string, any>;

  @Prop({ default: true })
  active: boolean;

  @Prop()
  ownerId: string;

  @Prop({ default: now() })
  createdAt?: Date;

  @Prop({ default: now() })
  updatedAt?: Date;
}

export const OrganizationSchema = SchemaFactory.createForClass(Organization);
