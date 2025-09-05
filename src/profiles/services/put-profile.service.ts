import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Participant } from "src/organizations/participants/entities/participant.entity";
import { PutProfileDto } from "../dto/put-profile.dto";
import { ForbiddenException } from "@nestjs/common";
import { Organization } from "src/organizations/entities/organization.schema";

export class PutProfileService {
    constructor(
        @InjectModel(Participant.name)
        private readonly profileModel: Model<Participant>,
        @InjectModel(Organization.name)
        private readonly organizationModel: Model<Organization>,
    ) { }

    async execute({ userId, organizationId, ...data }: PutProfileDto) {
        delete data.permissions;
        delete data.role;

        if (organizationId) {
            const existsAccess = await this.profileModel.findOne({ userId, organizationId });
            const existsOrganization = await this.organizationModel.exists({ _id: organizationId, ownerId: userId });

            if (!existsAccess && !existsOrganization) {
                throw new ForbiddenException('User does not have access to this organization');
            }
        }

        const filter = { userId, organizationId: organizationId || null };
        const update = { $set: data };
        const options = { upsert: true, new: true, setDefaultsOnInsert: true };

        const profile = await this.profileModel.findOneAndUpdate(filter, update, options);

        return profile;
    }
}
