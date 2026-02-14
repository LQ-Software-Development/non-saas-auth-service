import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  User,
  UserSchema,
} from 'src/auth/database/providers/schema/user.schema';
import { ParticipantsController } from './participants.controller';
import { Participant, ParticipantSchema } from './entities/participant.entity';
import { CreateParticipantService } from './services/create-participant.service';
import { GetParticipantsService } from './services/get-participants.service';
import { GetParticipantService } from './services/get-participant.service';
import { UpdateParticipantService } from './services/update-participant.service';
import { RemoveParticipantService } from './services/remove-participant.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Participant.name, schema: ParticipantSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [ParticipantsController],
  providers: [
    CreateParticipantService,
    GetParticipantsService,
    GetParticipantService,
    UpdateParticipantService,
    RemoveParticipantService,
  ],
})
export class ParticipantsModule { }
