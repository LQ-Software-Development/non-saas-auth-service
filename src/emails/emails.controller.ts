import { Controller } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { User } from 'src/auth/database/providers/schema/user.schema';
import { SendVerifyEmailService } from './services/send-verify-email.service';

@Controller()
export class EmailsController {
  constructor(
    private readonly sendVerifyEmailService: SendVerifyEmailService,
  ) {}

  @OnEvent('users.created')
  handleUserCreatedEvent(payload: User) {
    if (!payload.emailToken || !payload.email) return;

    this.sendVerifyEmailService.sendVerifyEmail(payload);
  }
}
