import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Participant } from 'src/organizations/participants/entities/participant.entity';

@Injectable()
export class DeleteOrganizationParticipantService {
  constructor(
    @InjectModel(Participant.name) private participantModel: Model<Participant>,
  ) {}

  async execute(organizationId: string, id: string) {
    await this.participantModel.findByIdAndDelete(id);
  }
}
