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
  document: string;

  @Prop({ default: now() })
  createdAt?: Date;

  @Prop({ default: now() })
  updatedAt?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

export interface UserSchemaInterface {
  _id?: string;
  email: string;
  password: string;
  name: string;
  document: string;
  verifiedEmail: boolean;
  emailToken: string; // token to verify email ex. 123456
  createdAt: Date;
  updatedAt: Date;
}

export const userSchemaProviders = [
  {
    provide: 'AUTH_USER_MODEL',
    useFactory: (connection: Connection) =>
      connection.model('User', UserSchema),
    inject: ['AUTH_DB_CONNECTION'],
  },
];
