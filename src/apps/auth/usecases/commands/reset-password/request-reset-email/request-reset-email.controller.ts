import { Body, Controller, Post } from "@nestjs/common";
import { ApiBadRequestResponse, ApiCreatedResponse, ApiInternalServerErrorResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { ControllerBase } from "src/core/application/controller.base";
import { RequestResetEmailUseCase } from "./request-reset-email.usecase";
import { RequestResetEmailDto } from "./request-reset-email.dto";

@Controller('reset-password')
@ApiTags('Reset Password')
export class RequestResetEmailController extends ControllerBase{
  constructor(
    private readonly requestResetEmailUseCase: RequestResetEmailUseCase
  ) {
    super();
  }

  @ApiOperation({ summary: 'Rota para pedir email de reset da senha' })
  @ApiOkResponse({
    status: 200,
    description: 'Senha atualziada com sucesso',
  })
  @ApiBadRequestResponse({
    status: 400,
    description: 'O corpo da requisição esta errado, confira',
  })
  @ApiNotFoundResponse({
    status: 404,
    description: 'Email não cadastrado'
  })
  @ApiInternalServerErrorResponse({
    status: 500,
    description: 'Erro interno na hora de persistir o anuncio',
  })
  @Post('')
  async requestResetEmail(@Body() data: RequestResetEmailDto){
    const result = await this.requestResetEmailUseCase.requestResetEmail(data.email)

    if(result.isFailure){
      return this.handleErrorResponse(result.error)
    }

    return result.value
  }
}