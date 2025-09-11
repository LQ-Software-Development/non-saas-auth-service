import { Controller, Post, Body, Patch } from '@nestjs/common';
import { CreateRecoveryDto } from './dto/create-recovery.dto';
import { CreateRecoveryGenerateCodeService } from './services/create-recovery-generate-code.service';
import { ApiTags } from '@nestjs/swagger';
import { PostRecoveryValidateCodeService } from './services/post-recovery-validate-code.service';
import { ValidateCodeDto } from './dto/validate-code.dto';
import { UpdateRecoveryDto } from './dto/update-recovery.dto';
import { UpdatePasswordWithCodeService } from './services/update-password-with-code.service';

@ApiTags('Recovery with Code')
@Controller('recovery')
export class RecoveryController {
  constructor(
    private readonly codeService: CreateRecoveryGenerateCodeService,
    private readonly postRecoveryService: PostRecoveryValidateCodeService,
    private readonly updatePasswordWithCodeService: UpdatePasswordWithCodeService,
  ) { }

  @Post('generate-code')
  generateCode(@Body() createRecoveryDto: CreateRecoveryDto) {
    return this.codeService.execute(createRecoveryDto);
  }

  @Post('validate-code')
  validateCode(@Body() validateCodeDto: ValidateCodeDto) {
    return this.postRecoveryService.execute(validateCodeDto);
  }

  @Patch('change-password-with-code')
  changePasswordWithCode(@Body() updateRecoveryDto: UpdateRecoveryDto) {
    return this.updatePasswordWithCodeService.execute(updateRecoveryDto);
  }
}
