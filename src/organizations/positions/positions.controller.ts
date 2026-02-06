import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards,
    Query,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiOperation,
    ApiQuery,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CreatePositionDto } from './dto/create-position.dto';
import { UpdatePositionDto } from './dto/update-position.dto';
import { CreatePositionService } from './services/create-position.service';
import { GetPositionsService } from './services/get-positions.service';
import { GetPositionService } from './services/get-position.service';
import { UpdatePositionService } from './services/update-position.service';
import { RemovePositionService } from './services/remove-position.service';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@ApiTags('Positions')
@Controller('organizations/:organizationId/positions')
export class PositionsController {
    constructor(
        private readonly createPositionService: CreatePositionService,
        private readonly getPositionsService: GetPositionsService,
        private readonly getPositionService: GetPositionService,
        private readonly updatePositionService: UpdatePositionService,
        private readonly removePositionService: RemovePositionService,
    ) { }

    @Post()
    @ApiOperation({ summary: 'Criar um novo cargo na organização' })
    @ApiResponse({ status: 201, description: 'Cargo criado com sucesso' })
    @ApiResponse({ status: 409, description: 'Já existe um cargo com esse nome' })
    create(
        @Body() createPositionDto: CreatePositionDto,
        @Param('organizationId') organizationId: string,
    ) {
        return this.createPositionService.execute({
            ...createPositionDto,
            organizationId,
        });
    }

    @Get()
    @ApiOperation({ summary: 'Listar cargos da organização' })
    @ApiQuery({
        name: 'active',
        required: false,
        type: Boolean,
        description: 'Filtrar por status ativo/inativo',
    })
    @ApiResponse({ status: 200, description: 'Lista de cargos' })
    findAll(
        @Param('organizationId') organizationId: string,
        @Query('active') active?: string,
    ) {
        return this.getPositionsService.execute({
            organizationId,
            active: active !== undefined ? active === 'true' : undefined,
        });
    }

    @Get(':id')
    @ApiOperation({ summary: 'Buscar cargo por ID' })
    @ApiResponse({ status: 200, description: 'Cargo encontrado' })
    @ApiResponse({ status: 404, description: 'Cargo não encontrado' })
    findOne(
        @Param('id') id: string,
        @Param('organizationId') organizationId: string,
    ) {
        return this.getPositionService.execute({
            id,
            organizationId,
        });
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Atualizar cargo' })
    @ApiResponse({ status: 200, description: 'Cargo atualizado com sucesso' })
    @ApiResponse({ status: 404, description: 'Cargo não encontrado' })
    @ApiResponse({ status: 409, description: 'Já existe um cargo com esse nome' })
    update(
        @Param('id') id: string,
        @Param('organizationId') organizationId: string,
        @Body() updatePositionDto: UpdatePositionDto,
    ) {
        return this.updatePositionService.execute({
            ...updatePositionDto,
            id,
            organizationId,
        });
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Remover cargo (soft delete)' })
    @ApiResponse({ status: 204, description: 'Cargo removido com sucesso' })
    @ApiResponse({ status: 404, description: 'Cargo não encontrado' })
    remove(
        @Param('id') id: string,
        @Param('organizationId') organizationId: string,
    ) {
        return this.removePositionService.execute({
            id,
            organizationId,
        });
    }
}
