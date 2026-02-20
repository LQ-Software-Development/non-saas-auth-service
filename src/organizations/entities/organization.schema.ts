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

  @Prop({ default: false })
  customerUserIntegrationEnabled?: boolean;

  @Prop(raw({}))
  branding?: {
    appName?: string;
    logoUrl?: string;
    primaryColor?: string;
    backgroundColor?: string;
    footerText?: string;
  };

  @Prop({ default: true })
  active: boolean;

  @Prop({ required: false, unique: true, sparse: true })
  applicationKey?: string;

  @Prop()
  ownerId: string;

  @Prop({ default: now() })
  createdAt?: Date;

  @Prop({ default: now() })
  updatedAt?: Date;
}

export const OrganizationSchema = SchemaFactory.createForClass(Organization);
