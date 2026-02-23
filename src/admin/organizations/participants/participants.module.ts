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
import { GetOrganizationParticipantService } from './services/get-organization-participant.service';
import {
  Organization,
  OrganizationSchema,
} from 'src/organizations/entities/organization.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Participant.name, schema: ParticipantSchema },
      { name: User.name, schema: UserSchema },
      { name: Organization.name, schema: OrganizationSchema },
    ]),
  ],
  controllers: [ParticipantsController],
  providers: [
    CreateOrganizationParticipantsService,
    ListOrganizationParticipantsService,
    GetOrganizationParticipantService,
    DeleteOrganizationParticipantService,
    UpdateOrganizationParticipantService,
  ],
})
export class ParticipantsModule { }
