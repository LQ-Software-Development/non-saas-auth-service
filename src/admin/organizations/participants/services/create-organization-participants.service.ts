import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Participant } from 'src/organizations/participants/entities/participant.entity';
import { CreateParticipantDto } from '../dto/create-participant.dto';
import { applyCommissionDefaults } from 'src/organizations/participants/utils/commission.utils';

export class CreateOrganizationParticipantsService {
  constructor(
    @InjectModel(Participant.name)
    private readonly participantModel: Model<Participant>,
  ) { }

  async execute(organizationId: string, data: CreateParticipantDto[]) {
    const participants = await this.participantModel.insertMany(
      data.map((participant) => ({
        ...participant,
        organizationId,
        metadata: applyCommissionDefaults(participant.metadata),
      })),
    );

    return participants;
  }
}
