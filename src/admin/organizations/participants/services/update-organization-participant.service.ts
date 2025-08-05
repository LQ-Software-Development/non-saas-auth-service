import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Participant } from 'src/organizations/participants/entities/participant.entity';
import { UpdateParticipantDto } from '../dto/update-participant.dto';
import { NotFoundException } from '@nestjs/common';

export class UpdateOrganizationParticipantService {
  constructor(
    @InjectModel(Participant.name)
    private readonly participantModel: Model<Participant>,
  ) {}

  async execute(participantId: string, data: UpdateParticipantDto) {
    const participant = await this.participantModel.findById(participantId);

    if (!participant) {
      throw new NotFoundException(`Participant with id ${participantId} not found`);
    }

    Object.assign(participant, data);

    await participant.save();
    return participant;
  }
}
