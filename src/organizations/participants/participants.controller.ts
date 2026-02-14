import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { CreateParticipantDto } from './dto/create-participant.dto';
import { UpdateParticipantDto } from './dto/update-participant.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CreateParticipantService } from './services/create-participant.service';
import { GetParticipantsService } from './services/get-participants.service';
import { GetParticipantService } from './services/get-participant.service';
import { UpdateParticipantService } from './services/update-participant.service';
import { RemoveParticipantService } from './services/remove-participant.service';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@ApiTags('Participants')
@Controller('organizations/:organizationId/participants')
export class ParticipantsController {
  constructor(
    private readonly createParticipantService: CreateParticipantService,
    private readonly getParticipantsService: GetParticipantsService,
    private readonly getParticipantService: GetParticipantService,
    private readonly updateParticipantService: UpdateParticipantService,
    private readonly removeParticipantService: RemoveParticipantService,
  ) { }

  @Post()
  create(
    @Body() createParticipantDto: CreateParticipantDto,
    @Param('organizationId') organizationId: string,
  ) {
    return this.createParticipantService.execute({
      ...createParticipantDto,
      organizationId,
    });
  }

  @Get()
  findAll(@Param('organizationId') organizationId: string) {
    return this.getParticipantsService.execute({
      organizationId,
    });
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @Param('organizationId') organizationId: string,
  ) {
    return this.getParticipantService.execute({
      id: id,
      organizationId,
    });
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Param('organizationId') organizationId: string,
    @Body() updateParticipantDto: UpdateParticipantDto,
  ) {
    return this.updateParticipantService.execute({
      ...updateParticipantDto,
      id,
      organizationId,
    });
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
    @Param('organizationId') organizationId: string,
  ) {
    return this.removeParticipantService.execute({
      id,
      organizationId,
    });
  }
}
