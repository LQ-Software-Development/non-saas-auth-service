import { Module } from '@nestjs/common';
import { EmailsController } from './emails.controller';
import { SendVerifyEmailService } from './services/send-verify-email.service';
import { SendResetPasswordEmailService } from './services/send-reset-password-email.service';
import { SendCustomerAccessEmailService } from './services/send-customer-access-email.service';

@Module({
  controllers: [EmailsController],
  providers: [
    SendVerifyEmailService,
    SendResetPasswordEmailService,
    SendCustomerAccessEmailService,
  ],
  exports: [SendCustomerAccessEmailService],
})
export class EmailsModule { }
