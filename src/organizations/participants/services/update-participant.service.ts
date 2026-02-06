import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Participant } from '../entities/participant.entity';
import { UpdateParticipantDto } from '../dto/update-participant.dto';

@Injectable()
export class UpdateParticipantService {
    constructor(
        @InjectModel(Participant.name)
        private readonly participantModel: Model<Participant>,
    ) { }

    execute(updateParticipantDto: UpdateParticipantDto) {
        const { id, organizationId, ...rest } = updateParticipantDto;
        return this.participantModel.updateOne({ _id: id, organizationId }, rest);
    }
}
