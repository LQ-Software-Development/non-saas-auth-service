import { Module } from "@nestjs/common";
import { ProfilesController } from "./profiles.controller";
import { GetProfileService } from "./services/get-profile.service";
import { MongooseModule } from "@nestjs/mongoose";
import { Participant, ParticipantSchema } from "src/organizations/participants/entities/participant.entity";
import { PutProfileService } from "./services/put-profile.service";
import { Organization, OrganizationSchema } from "src/organizations/entities/organization.schema";

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Participant.name, schema: ParticipantSchema },
            { name: Organization.name, schema: OrganizationSchema }
        ])
    ],
    controllers: [ProfilesController],
    providers: [GetProfileService, PutProfileService]
})
export class ProfilesModule { }
