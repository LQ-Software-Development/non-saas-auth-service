import { Module } from "@nestjs/common";
import { ProfilesController } from "./accesses.controller";
import { GetAccessesService } from "./services/get-accesses.service";
import { MongooseModule } from "@nestjs/mongoose";
import { Participant, ParticipantSchema } from "src/organizations/participants/entities/participant.entity";
import { Organization, OrganizationSchema } from "src/organizations/entities/organization.schema";
import { GetAccessService } from "./services/get-access.service";

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Participant.name, schema: ParticipantSchema },
            { name: Organization.name, schema: OrganizationSchema }
        ])
    ],
    controllers: [ProfilesController],
    providers: [GetAccessesService, GetAccessService]
})
export class AccessesModule { }
