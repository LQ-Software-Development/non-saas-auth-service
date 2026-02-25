import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBody, ApiHeader, ApiTags } from '@nestjs/swagger';
import { AdminApplicationKeyGuard } from 'src/auth/guards/admin-application-key.guard';
import { CreateParticipantDto } from './dto/create-participant.dto';
import { UpdateParticipantDto } from './dto/update-participant.dto';
import { CreateOrganizationParticipantsService } from './services/create-organization-participants.service';
import { DeleteOrganizationParticipantService } from './services/delete-organization-participant.service';
import { GetOrganizationParticipantService } from './services/get-organization-participant.service';
import { ListOrganizationParticipantsService } from './services/list-organization-participants.service';
import { UpdateOrganizationParticipantService } from './services/update-organization-participant.service';

@ApiHeader({
  name: 'application-key',
  required: true,
  description: 'Application Key for Admin Access',
})
@UseGuards(AdminApplicationKeyGuard)
@ApiTags('Admin | Organizations | Participants')
@Controller('admin/organizations/:organizationId/participants')
export class ParticipantsController {
  constructor(
    private readonly createOrganizationParticipantsService: CreateOrganizationParticipantsService,
    private readonly listOrganizationParticipantsService: ListOrganizationParticipantsService,
    private readonly getOrganizationParticipantService: GetOrganizationParticipantService,
    private readonly deleteOrganizationParticipantService: DeleteOrganizationParticipantService,
    private readonly updateOrganizationParticipantService: UpdateOrganizationParticipantService,
  ) { }

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

  @Get(':id')
  findOne(
    @Param('organizationId') organizationId: string,
    @Param('id') id: string,
  ) {
    return this.getOrganizationParticipantService.execute(organizationId, id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateParticipantDto: UpdateParticipantDto,
  ) {
    return this.updateOrganizationParticipantService.execute(id, updateParticipantDto);
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
