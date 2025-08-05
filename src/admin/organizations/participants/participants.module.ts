import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ParticipantsController } from './participants.controller';
import { ListOrganizationParticipantsService } from './services/list-organization-participants.service';
import { CreateOrganizationParticipantsService } from './services/create-organization-participants.service';
import {
  Participant,
  ParticipantSchema,
} from 'src/organizations/participants/entities/participant.entity';
import { DeleteOrganizationParticipantService } from './services/delete-organization-participant.service';
import { User, UserSchema } from 'src/auth/database/providers/schema/user.schema';
import { UpdateOrganizationParticipantService } from './services/update-organization-participant.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Participant.name, schema: ParticipantSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [ParticipantsController],
  providers: [
    CreateOrganizationParticipantsService,
    ListOrganizationParticipantsService,
    DeleteOrganizationParticipantService,
    UpdateOrganizationParticipantService,
  ],
})
export class ParticipantsModule {}
