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
    this.sendVerifyEmailService.sendVerifyEmail(payload);
  }
}
