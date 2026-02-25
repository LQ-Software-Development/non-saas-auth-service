import { Injectable } from '@nestjs/common';
import { User } from 'src/auth/database/providers/schema/user.schema';
import * as axios from 'axios';

@Injectable()
export class SendVerifyEmailService {
  async sendVerifyEmail(user: User) {
    if (!process.env.EMAIL_VERIFICATION_SENDER_URL) {
      return console.warn(
        'EMAIL_VERIFICATION_SENDER_URL is not set. Skipping sending email.',
      );
    }

    await axios.default.post(
      `${process.env.EMAIL_VERIFICATION_SENDER_URL}/emails`,
      {
        template: 'verify-email',
        data: {
          subject: 'Verificação de e-mail',
          name: user.name,
          verificationCode: user.emailToken,
        },
        email: user.email,
      },
    );
  }
}
