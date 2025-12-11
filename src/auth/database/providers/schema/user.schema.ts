import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Connection, HydratedDocument, now } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema()
export class User {
  @Prop()
  name: string;

  @Prop()
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ default: false })
  verifiedEmail?: boolean;

  @Prop()
  emailToken: string;

  @Prop()
  passwordToken?: string;

  @Prop()
  document: string;

  @Prop({ default: now() })
  createdAt?: Date;

  @Prop({ default: now() })
  updatedAt?: Date;

  @Prop({ type: Object, default: {} })
  metadata?: any;

  @Prop({ required: false })
  phone?: string;

  @Prop({ required: false })
  index?: number;
}

export const UserSchema = SchemaFactory.createForClass(User);

// Auto-increment index
UserSchema.pre('save', async function (next) {
  if (this.isNew && !this.index) {
    const lastUser = await this.constructor
      .findOne({}, { index: 1 })
      .sort({ index: -1 })
      .lean();
    this.index = lastUser?.index ? lastUser.index + 1 : 1;
  }
  next();
});

export interface UserSchemaInterface {
  _id?: string;
  email: string;
  password: string;
  name: string;
  document: string;
  verifiedEmail: boolean;
  emailToken: string; // token to verify email ex. 123456
  passwordToken?: string; // token to recover password
  createdAt: Date;
  updatedAt: Date;
  metadata: Record<string, any>;
  phone?: string;
  index?: number;
}

export const userSchemaProviders = [
  {
    provide: 'AUTH_USER_MODEL',
    useFactory: (connection: Connection) =>
      connection.model('User', UserSchema),
    inject: ['AUTH_DB_CONNECTION'],
  },
];
