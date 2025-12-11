import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Participant } from 'src/organizations/participants/entities/participant.entity';
import { NotFoundException } from '@nestjs/common';

export class GetOrganizationParticipantService {
  constructor(
    @InjectModel(Participant.name)
    private readonly participantModel: Model<Participant>,
  ) { }

  async execute(organizationId: string, participantId: string) {
    const participant = await this.participantModel.findOne({
      _id: participantId,
      organizationId,
      deletedAt: null,
    });

    if (!participant) {
      throw new NotFoundException(
        `Participant with id ${participantId} not found in organization ${organizationId}`,
      );
    }

    return participant;
  }
}
