import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Participant } from '../entities/participant.entity';
import { CreateParticipantDto } from '../dto/create-participant.dto';

@Injectable()
export class CreateParticipantService {
    constructor(
        @InjectModel(Participant.name)
        private readonly participantModel: Model<Participant>,
    ) { }

    execute(createParticipantDto: CreateParticipantDto) {
        const createdParticipant = new this.participantModel(createParticipantDto);
        return createdParticipant.save();
    }
}
