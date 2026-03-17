import { ControllerBase } from '../../../../core/application/controller.base';
import { RegisterUserUseCase } from './register-user.usecase';
import { Body, Controller, Headers, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiOperation,
  ApiTags,
  ApiHeader,
} from '@nestjs/swagger';
import { RegisterDto } from './register-user.dto';

@Controller('registro')
@ApiTags('Autenticação')
export class RegisterUserController extends ControllerBase {
  constructor(private readonly registerUserUseCase: RegisterUserUseCase) {
    super();
  }

  @ApiOperation({ summary: 'Rota de registro' })
  @ApiCreatedResponse({
    status: 201,
    type: RegisterDto,
    description: 'cadastro criado com sucesso',
  })
  @ApiBadRequestResponse({
    status: 400,
    description: 'O corpo da requisição esta errado, confira',
  })
  @ApiInternalServerErrorResponse({
    status: 500,
    description: 'Erro interno na hora de persistir o anuncio',
  })
  @ApiHeader({
    name: 'application-key',
    required: false,
    description: 'Application key para registrar como superuser',
  })
  @Post('')
  async register(
    @Body() data: RegisterDto,
    @Headers('application-key') applicationKey?: string,
  ) {
    const isSuperuser =
      !!applicationKey && applicationKey === process.env.APPLICATION_KEY;

    const result = await this.registerUserUseCase.register({
      ...data,
      superuser: isSuperuser,
    });
    if (result.isFailure) {
      return this.handleErrorResponse(result.error);
    }

    return result.value;
  }
}
