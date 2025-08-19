import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Participant } from "src/organizations/participants/entities/participant.entity";

export class GetProfileService {
    constructor(
        @InjectModel(Participant.name)
        private readonly userModel: Model<Participant>,
    ) { }

    async execute(userId: string, organizationId?: string) {
        const profile = await this.userModel.findOne({ userId, organizationId });

        if (!profile && organizationId) {
            throw new Error('Profile not found');
        }

        return profile || {};
    }
}
