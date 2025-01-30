import { Injectable } from '@nestjs/common';
import { User } from 'src/auth/database/providers/schema/user.schema';
import * as axios from 'axios';

@Injectable()
export class SendResetPasswordEmailService {
  async sendResetPasswordEmail(user: User, token: string) {
    if (!process.env.EMAIL_VERIFICATION_SENDER_URL) {
      return console.warn(
        'EMAIL_VERIFICATION_SENDER_URL is not set. Skipping sending email.',
      );
    }

    if (!process.env.PASSWORD_RECOVERY_URL) {
      return console.warn(
        'PASSWORD_RECOVERY_URL is not set. Skipping sending email.',
      );
    }

    await axios.default.post(
      `${process.env.EMAIL_VERIFICATION_SENDER_URL}/emails`,
      {
        template: 'reset-password',
        data: {
          name: user.name,
          resetLink: process.env.PASSWORD_RECOVERY_URL + '?token=' + token,
        },
        email: user.email,
      },
    );
  }
}
