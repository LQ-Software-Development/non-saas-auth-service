import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Delete,
} from '@nestjs/common';
import { CreateParticipantDto } from './dto/create-participant.dto';
import { CreateOrganizationParticipantsService } from './services/create-organization-participants.service';
import { ListOrganizationParticipantsService } from './services/list-organization-participants.service';
import { ApiBody, ApiHeader, ApiTags } from '@nestjs/swagger';
import { ApplicationKeyGuard } from 'src/auth/guards/application-key.guard';
import { DeleteOrganizationParticipantService } from './services/delete-organization-participant.service';

@ApiHeader({
  name: 'application-key',
  required: true,
  description: 'Application Key for Admin Access',
})
@UseGuards(ApplicationKeyGuard)
@ApiTags('Admin | Organizations | Participants')
@Controller('admin/organizations/:organizationId/participants')
export class ParticipantsController {
  constructor(
    private readonly createOrganizationParticipantsService: CreateOrganizationParticipantsService,
    private readonly listOrganizationParticipantsService: ListOrganizationParticipantsService,
    private readonly deleteOrganizationParticipantService: DeleteOrganizationParticipantService,
  ) {}

  @ApiBody({
    type: [CreateParticipantDto],
  })
  @Post()
  create(
    @Param('organizationId') organizationId: string,
    @Body() createParticipantDto: CreateParticipantDto[],
  ) {
    return this.createOrganizationParticipantsService.execute(
      organizationId,
      createParticipantDto,
    );
  }

  @Get()
  findAll(@Param('organizationId') organizationId: string) {
    return this.listOrganizationParticipantsService.execute(organizationId);
  }

  @Delete(':id')
  delete(
    @Param('organizationId') organizationId: string,
    @Param('id') id: string,
  ) {
    return this.deleteOrganizationParticipantService.execute(
      organizationId,
      id,
    );
  }
}
