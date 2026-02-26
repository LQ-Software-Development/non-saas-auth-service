import { Module } from '@nestjs/common';
import { OrganizationsService } from './organizations.service';
import { OrganizationsController } from './organizations.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Organization,
  OrganizationSchema,
} from './entities/organization.schema';
import { ParticipantsModule } from './participants/participants.module';
import { UpdateSetupProgressService } from './services/update-setup-progress.service';
import { GetSetupProgressService } from './services/get-setup-progress.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Organization.name, schema: OrganizationSchema },
    ]),
    ParticipantsModule,
  ],
  controllers: [OrganizationsController],
  providers: [OrganizationsService, UpdateSetupProgressService, GetSetupProgressService],
})
export class OrganizationsModule {}
