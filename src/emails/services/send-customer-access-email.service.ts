import { Injectable } from '@nestjs/common';
import * as axios from 'axios';
import { User } from 'src/auth/database/providers/schema/user.schema';

@Injectable()
export class SendCustomerAccessEmailService {
  async sendCustomerAccessEmail(
    user: User,
    password: string,
    branding?: {
      appName?: string;
      logoUrl?: string;
      primaryColor?: string;
      backgroundColor?: string;
      footerText?: string;
    },
  ) {
    if (!process.env.EMAIL_VERIFICATION_SENDER_URL) {
      return console.warn(
        'EMAIL_VERIFICATION_SENDER_URL is not set. Skipping sending email.',
      );
    }

    const loginUrl = process.env.CUSTOMER_LOGIN_URL;

    await axios.default.post(
      `${process.env.EMAIL_VERIFICATION_SENDER_URL}/emails`,
      {
        template: 'customer-access',
        data: {
          name: user.name,
          password,
          loginUrl,
          subject: 'Acesso criado',
          branding,
        },
        email: user.email,
      },
    );
  }
}
