import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Participant } from '../entities/participant.entity';

@Injectable()
export class RemoveParticipantService {
    constructor(
        @InjectModel(Participant.name)
        private readonly participantModel: Model<Participant>,
    ) { }

    async execute({ id, organizationId }: { id: string; organizationId: string }) {
        const participant = await this.participantModel.findOne({
            _id: id,
            organizationId,
        });

        if (!participant) {
            return;
        }

        return participant.deleteOne();
    }
}
