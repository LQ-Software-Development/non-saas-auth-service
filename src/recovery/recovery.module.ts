import { Module } from '@nestjs/common';
import { RecoveryController } from './recovery.controller';
import { CreateRecoveryGenerateCodeService } from './services/create-recovery-generate-code.service';
import { AuthModule } from '../auth/auth.module';
import { PostRecoveryValidateCodeService } from './services/post-recovery-validate-code.service';
import { UpdatePasswordWithCodeService } from './services/update-password-with-code.service';

@Module({
  imports: [AuthModule],
  controllers: [RecoveryController],
  providers: [CreateRecoveryGenerateCodeService, PostRecoveryValidateCodeService, UpdatePasswordWithCodeService],
})
export class RecoveryModule { }
