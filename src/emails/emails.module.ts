import { Module } from '@nestjs/common';
import { EmailsController } from './emails.controller';
import { SendVerifyEmailService } from './services/send-verify-email.service';

@Module({
  controllers: [EmailsController],
  providers: [SendVerifyEmailService],
  exports: [],
})
export class EmailsModule {}
