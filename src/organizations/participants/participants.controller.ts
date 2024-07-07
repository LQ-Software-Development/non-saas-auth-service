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
import { ParticipantsService } from './participants.service';
import { CreateParticipantDto } from './dto/create-participant.dto';
import { UpdateParticipantDto } from './dto/update-participant.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@ApiTags('Participants')
@Controller('organizations/:organizationId/participants')
export class ParticipantsController {
  constructor(private readonly participantsService: ParticipantsService) {}

  @Post()
  create(
    @Body() createParticipantDto: CreateParticipantDto,
    @Param('organizationId') organizationId: string,
  ) {
    return this.participantsService.create({
      ...createParticipantDto,
      organizationId,
    });
  }

  @Get()
  findAll(@Param('organizationId') organizationId: string) {
    return this.participantsService.findAll({
      organizationId,
    });
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @Param('organizationId') organizationId: string,
  ) {
    return this.participantsService.findOne({
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
    return this.participantsService.update({
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
    return this.participantsService.remove({
      id,
      organizationId,
    });
  }
}
