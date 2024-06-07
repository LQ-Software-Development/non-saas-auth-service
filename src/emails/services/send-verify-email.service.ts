import { Injectable } from '@nestjs/common';
import { User } from 'src/auth/database/providers/schema/user.schema';
import * as axios from 'axios';

@Injectable()
export class SendVerifyEmailService {
  async sendVerifyEmail(user: User) {
    await axios.default.post(
      `${process.env.EMAIL_VERIFICATION_SENDER_URL}/emails`,
      {
        template: 'verify-email',
        data: {
          name: user.name,
          verificationCode: user.emailToken,
        },
        email: 'string',
      },
    );
  }
}
