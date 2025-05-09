import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import {
  User,
  UserSchema,
} from 'src/auth/database/providers/schema/user.schema';
import { Participant, ParticipantSchema } from 'src/organizations/participants/entities/participant.entity';
import { Organization, OrganizationSchema } from 'src/organizations/entities/organization.schema';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Participant.name, schema: ParticipantSchema },
      { name: Organization.name, schema: OrganizationSchema },
    ]),
  ],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
