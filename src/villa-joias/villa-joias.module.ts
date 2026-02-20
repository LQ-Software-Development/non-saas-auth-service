import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
    Organization,
    OrganizationSchema,
} from '../organizations/entities/organization.schema';
import {
    Participant,
    ParticipantSchema,
} from '../organizations/participants/entities/participant.entity';
import { AuthModule } from '../auth/auth.module';
import { VillaJoiasController } from './villa-joias.controller';
import { ChangeParticipantPasswordService } from './services/change-participant-password.service';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Organization.name, schema: OrganizationSchema },
            { name: Participant.name, schema: ParticipantSchema },
        ]),
        AuthModule,
    ],
    controllers: [VillaJoiasController],
    providers: [ChangeParticipantPasswordService],
})
export class VillaJoiasModule { }
