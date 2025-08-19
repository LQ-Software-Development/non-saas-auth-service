import { Module } from "@nestjs/common";
import { ProfilesController } from "./profiles.controller";
import { GetProfileService } from "./services/get-profile.service";
import { MongooseModule } from "@nestjs/mongoose";
import { Participant, ParticipantSchema } from "src/organizations/participants/entities/participant.entity";
import { PutProfileService } from "./services/put-profile.service";
import { User, UserSchema } from "src/auth/database/providers/schema/user.schema";

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Participant.name, schema: ParticipantSchema }
        ])
    ],
    controllers: [ProfilesController],
    providers: [GetProfileService, PutProfileService]
})
export class ProfilesModule { }
