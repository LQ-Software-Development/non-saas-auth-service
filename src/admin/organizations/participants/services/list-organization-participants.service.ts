import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Participant } from 'src/organizations/participants/entities/participant.entity';

export class ListOrganizationParticipantsService {
  constructor(
    @InjectModel(Participant.name)
    private readonly participantModel: Model<Participant>,
  ) {}

  async execute(organizationId: string) {
    const participants = await this.participantModel.find({
      organizationId,
    });

    return participants;
  }
}
