import { Module } from '@nestjs/common';
import { OrganizationService } from './organizatons.service';
import { OrganizationController } from './organizations.controller';

import { MongooseModule } from '@nestjs/mongoose';
import {
  Organization,
  OrganizationSchema,
} from 'src/organizations/entities/organization.schema';
import { ParticipantsModule } from './participants/participants.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Organization.name, schema: OrganizationSchema },
    ]),
    ParticipantsModule,
  ],
  controllers: [OrganizationController],
  providers: [OrganizationService],
})
export class OrganizationModule {}
