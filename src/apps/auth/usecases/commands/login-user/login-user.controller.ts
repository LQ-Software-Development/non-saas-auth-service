import { Body, Controller, Post } from '@nestjs/common';
import { ApiBadRequestResponse, ApiCreatedResponse, ApiInternalServerErrorResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ControllerBase } from 'src/core/application/controller.base';
import { LoginUserUseCase } from './login-user.usecase';
import { LoginUserDto } from './login-user.dto';

@Controller('login')
@ApiTags('autenticação')
export class LoginUserController extends ControllerBase {
  constructor(private readonly loginUserUseCase: LoginUserUseCase) {
    super();
  }

  @ApiOperation({ summary: 'Rota de login' })
  @ApiCreatedResponse({
    status: 201,
    type: LoginUserDto,
    description: 'Usuario logado criado com sucesso',
  })
  @ApiBadRequestResponse({
    status: 400,
    description: 'O corpo da requisição esta errado, confira',
  })
  @ApiInternalServerErrorResponse({
    status: 500,
    description: 'Erro interno na hora de persistir o anuncio',
  })
  @Post('')
  async login(@Body() data: LoginUserDto) {
    return (await this.loginUserUseCase.login(data)).value;
  }
}
