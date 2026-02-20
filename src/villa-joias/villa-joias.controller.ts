import {
    Controller,
    Patch,
    Body,
    UseGuards,
    Req,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiHeader } from '@nestjs/swagger';
import { ApplicationKeyGuard } from '../auth/guards/application-key.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ChangeParticipantPasswordService } from './services/change-participant-password.service';
import { ChangeParticipantPasswordDto } from './dtos/change-participant-password.dto';

@ApiTags('Villa Joias')
@Controller('villa-joias')
export class VillaJoiasController {
    constructor(
        private readonly changeParticipantPasswordService: ChangeParticipantPasswordService,
    ) { }

    @Patch('change-password')
    @UseGuards(ApplicationKeyGuard, JwtAuthGuard)
    @ApiBearerAuth()
    @ApiHeader({
        name: 'application-key',
        description: 'Application-key da organização',
        required: true,
    })
    @ApiOperation({
        summary: 'Altera a senha de um participante da organização',
        description:
            'Requer application-key válida (header) e JWT do usuário (Bearer token). ' +
            'O usuário autenticado deve ser um participante da organização vinculada à application-key.',
    })
    async changePassword(
        @Req() request: any,
        @Body() dto: ChangeParticipantPasswordDto,
    ) {
        const organizationId = request.organizationId;

        return this.changeParticipantPasswordService.execute(
            organizationId,
            dto,
        );
    }
}
