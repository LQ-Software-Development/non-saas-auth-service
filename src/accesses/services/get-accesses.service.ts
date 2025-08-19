import { ForbiddenException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Organization } from "src/organizations/entities/organization.schema";
import { Participant } from "src/organizations/participants/entities/participant.entity";

export class GetAccessesService {
    constructor(
        @InjectModel(Participant.name)
        private readonly participantsRepository: Model<Participant>,
        @InjectModel(Organization.name)
        private readonly organizationsRepository: Model<Organization>,
    ) { }

    async execute(userId: string) {
        const participants = await this.participantsRepository.find({ userId, organizationId: { $ne: null } });

        const organizations = await Promise.all(participants.map(async (participant) => {
            return this.organizationsRepository.findById(participant.organizationId);
        }));

        organizations.push(...await this.organizationsRepository.find({
            ownerId: userId,
        }));

        if (!organizations || organizations.length === 0) {
            throw new ForbiddenException('No organizations found for this user');
        }

        return organizations.map(org => ({
            ...org.toObject(),
            permissions: participants.find(participant => participant.organizationId === org.id)?.permissions || {},
            role: participants.find(participant => participant.organizationId === org.id)?.role || 'owner',
        }));
    }
}
