import {
  BadRequestException,
  Body,
  Controller,
  Param,
  Patch,
  Query,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { ControllerBase } from '../../../../core/application/controller.base';
import { UpdateUserUseCase } from './update-user.usecase';
import {
  DuplicateFields,
  UpdateUserDto,
  UpdateUserOptionsDto,
} from './update-user.dto';

@Controller('updated-user')
@ApiTags('Update User')
export class UpdateUserController extends ControllerBase {
  constructor(private readonly userUpdateUseCase: UpdateUserUseCase) {
    super();
  }

  @ApiOperation({ summary: 'Rota para atualizar dados do Usuario' })
  @ApiCreatedResponse({
    status: 201,
    description: 'Dados atualziada com sucesso',
  })
  @ApiNotFoundResponse({
    status: 404,
    description: 'Usuario não encontrado',
  })
  @ApiBadRequestResponse({
    status: 400,
    description: 'O corpo da requisição esta errado, confira',
  })
  @ApiInternalServerErrorResponse({
    status: 500,
    description: 'Erro interno na hora de persistir o anuncio',
  })
  @ApiQuery({ name: 'findDuplicates', enum: DuplicateFields, isArray: true })
  @Patch('/:id')
  async update(
    @Param('id') id: string,
    @Body() data: UpdateUserDto,
    @Query() options: UpdateUserOptionsDto,
  ) {
    const result = await this.userUpdateUseCase.update(id, data, options);
    if (result.isFailure) {
      return this.handleErrorResponse(result.error);
    }

    return result.value;
  }
}
