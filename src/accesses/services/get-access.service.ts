import { ForbiddenException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Organization } from "src/organizations/entities/organization.schema";
import { Participant } from "src/organizations/participants/entities/participant.entity";

export class GetAccessService {
    constructor(
        @InjectModel(Participant.name)
        private readonly participantsRepository: Model<Participant>,
        @InjectModel(Organization.name)
        private readonly organizationsRepository: Model<Organization>,
    ) { }

    async execute(userId: string, organizationId: string) {
        const organization = await this.organizationsRepository.findById(organizationId);

        if (!organization) {
            throw new ForbiddenException('Organization not found');
        }

        const participant = await this.participantsRepository.findOne({ userId, organizationId });

        if (!participant && organization.ownerId !== userId) {
            throw new ForbiddenException('User does not have access to this organization');
        }

        return {
            ...organization.toObject(),
            permissions: participant?.permissions || {},
            role: participant?.role || 'owner',
        };
    }
}
