import { Body, Controller, Param, Put } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ControllerBase } from 'src/core/application/controller.base';
import { RequestResetPasswordUseCase } from './request-reset-password.usecase';
import { RequestResetPasswordDto } from './request-reset-password.dto';

@Controller('reset-password')
@ApiTags('Reset Password')
export class RequestResetPasswordController extends ControllerBase {
  constructor(
    private readonly requestResetPasswordUseCase: RequestResetPasswordUseCase,
  ) {
    super();
  }

  @Put('/:token')
  async resetPassword(
    @Param('token') token: string,
    @Body() data: RequestResetPasswordDto,
  ) {
    return await this.requestResetPasswordUseCase.resetPassword(data, token);
  }
}
