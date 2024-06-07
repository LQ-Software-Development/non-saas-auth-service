import { Body, Controller, Param, Put } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ControllerBase } from '../../../../../core/application/controller.base';
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

  @ApiOperation({ summary: 'Rota de Atualizar a senha.' })
  @ApiOkResponse({
    status: 200,
    description: 'Senha atualziada com sucesso',
  })
  @ApiBadRequestResponse({
    status: 400,
    description: 'O corpo da requisição esta errado, confira',
  })
  @ApiInternalServerErrorResponse({
    status: 500,
    description: 'Erro o token dever estar expirado ou invalido',
  })
  @Put('/:token')
  async resetPassword(
    @Param('token') token: string,
    @Body() data: RequestResetPasswordDto,
  ) {
    const result = await this.requestResetPasswordUseCase.resetPassword(
      data,
      token,
    );
    if (result.isFailure) {
      return this.handleErrorResponse(result.error);
    }
    return result.value;
  }
}
