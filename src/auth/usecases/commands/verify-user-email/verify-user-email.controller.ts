import { Body, Controller, Param, Post } from '@nestjs/common';
import { VerifyUserEmailUseCase } from './verify-user-email.usecase';
import { ApiTags } from '@nestjs/swagger';
import { VerifyUserEmailDto } from './verify-user-email.dto';
import { ControllerBase } from 'src/core/application/controller.base';

@ApiTags('Autenticação')
@Controller('users')
export class VerifyUserEmailController extends ControllerBase {
  constructor(private readonly verifyUserEmailUseCase: VerifyUserEmailUseCase) {
    super();
  }

  @Post(':id/verify-email')
  async verifyUserEmail(
    @Param('id') userId: string,
    @Body() data: VerifyUserEmailDto,
  ) {
    const result = await this.verifyUserEmailUseCase.execute(
      userId,
      data.emailToken,
    );

    if (result.isFailure) {
      return this.handleErrorResponse(result.error);
    }

    return result.value;
  }
}
