import { Module } from '@nestjs/common';
import { ParticipantsController } from './participants.controller';
import { ListOrganizationParticipantsService } from './services/list-organization-participants.service';
import { CreateOrganizationParticipantsService } from './services/create-organization-participants.service';

@Module({
  controllers: [ParticipantsController],
  providers: [
    CreateOrganizationParticipantsService,
    ListOrganizationParticipantsService,
  ],
})
export class ParticipantsModule {}
