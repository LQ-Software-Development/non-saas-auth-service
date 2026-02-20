import {
    Controller,
    Post,
    Delete,
    Param,
    UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiHeader } from '@nestjs/swagger';
import { AdminApplicationKeyGuard } from '../auth/guards/admin-application-key.guard';
import { GenerateApplicationKeyService } from './services/generate-application-key.service';
import { RevokeApplicationKeyService } from './services/revoke-application-key.service';

@ApiTags('Application Keys')
@UseGuards(AdminApplicationKeyGuard)
@ApiHeader({
    name: 'application-key',
    description: 'Application-key do admin (variável de ambiente)',
    required: true,
})
@Controller('application-keys')
export class ApplicationKeysController {
    constructor(
        private readonly generateApplicationKeyService: GenerateApplicationKeyService,
        private readonly revokeApplicationKeyService: RevokeApplicationKeyService,
    ) { }

    @Post(':organizationId')
    @ApiOperation({ summary: 'Gera uma application-key para a organização' })
    @ApiParam({ name: 'organizationId', description: 'ID da organização' })
    async generate(@Param('organizationId') organizationId: string) {
        return this.generateApplicationKeyService.execute(organizationId);
    }

    @Delete(':organizationId')
    @ApiOperation({ summary: 'Revoga a application-key da organização' })
    @ApiParam({ name: 'organizationId', description: 'ID da organização' })
    async revoke(@Param('organizationId') organizationId: string) {
        return this.revokeApplicationKeyService.execute(organizationId);
    }
}
