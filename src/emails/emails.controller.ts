import { Controller } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { User } from 'src/auth/database/providers/schema/user.schema';
import { SendVerifyEmailService } from './services/send-verify-email.service';
import { SendResetPasswordEmailService } from './services/send-reset-password-email.service';

@Controller()
export class EmailsController {
  constructor(
    private readonly sendVerifyEmailService: SendVerifyEmailService,
    private readonly sendResetPasswordEmailService: SendResetPasswordEmailService,
  ) {}

  @OnEvent('users.created')
  handleUserCreatedEvent(payload: User) {
    if (!payload.emailToken || !payload.email) return;

    this.sendVerifyEmailService.sendVerifyEmail(payload);
  }

  @OnEvent('users.update-email')
  handleUserUpdateEmailEvent(payload: User) {
    if (!payload.emailToken || !payload.email) return;

    this.sendVerifyEmailService.sendVerifyEmail(payload);
  }

  @OnEvent('users.request-password-reset')
  handleUserRequestPasswordResetEvent(payload: { user: User; token: string }) {
    if (!payload.user.email) return;
    this.sendResetPasswordEmailService.sendResetPasswordEmail(
      payload.user,
      payload.token,
    );
  }
}
