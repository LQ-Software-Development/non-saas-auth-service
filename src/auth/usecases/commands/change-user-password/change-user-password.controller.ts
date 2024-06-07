import { Body, Controller, Put } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ControllerBase } from '../../../../core/application/controller.base';
import { ChangePasswordDto } from './change-user-password.dto';
import { ChangeUserPassowrdUseCase } from './change-user-password.usecase';

@Controller('recovery')
@ApiTags('Recovery')
export class ChangeUserPassowrdController extends ControllerBase {
  constructor(
    private readonly changeUserPasswordUseCase: ChangeUserPassowrdUseCase,
  ) {
    super();
  }

  @ApiOperation({ summary: 'Rota para atualizar sua senha' })
  @ApiCreatedResponse({
    status: 201,
    type: ChangePasswordDto,
    description: 'Senha atualziada com sucesso',
  })
  @ApiBadRequestResponse({
    status: 400,
    description: 'O corpo da requisição esta errado, confira',
  })
  @ApiInternalServerErrorResponse({
    status: 500,
    description: 'Erro interno na hora de persistir o anuncio',
  })
  @Put('password')
  async changeUserPassword(@Body() data: ChangePasswordDto){
    const result = await this.changeUserPasswordUseCase.changePassword(data);
    if (result.isFailure) {
      return this.handleErrorResponse(result.error);
    }

    return result.value;
  }
}
