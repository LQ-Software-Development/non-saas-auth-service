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
        // Run both queries in parallel
        const [participants, ownedOrganizations] = await Promise.all([
            this.participantsRepository.find({ userId, organizationId: { $ne: null } }),
            this.organizationsRepository.find({ ownerId: userId }),
        ]);

        // Fetch organizations for which the user is a participant
        const participantOrganizations = await Promise.all(
            participants.map(async (participant) => {
                return this.organizationsRepository.findById(participant.organizationId);
            })
        );

        // Combine and deduplicate organizations (by _id)
        const allOrganizationsMap = new Map();
        for (const org of participantOrganizations) {
            if (org) allOrganizationsMap.set(String(org._id), org);
        }
        for (const org of ownedOrganizations) {
            if (org) allOrganizationsMap.set(String(org._id), org);
        }
        const organizations = Array.from(allOrganizationsMap.values());

        if (!organizations || organizations.length === 0) {
            throw new ForbiddenException('No organizations found for this user');
        }

        return organizations.map(org => ({
            ...org.toObject(),
            permissions: participants.find(participant => participant.organizationId === org.id)?.permissions || {},
            role: participants.find(participant => participant.organizationId === org.id)?.role || 'owner',
        // Create a Map for O(1) participant lookup by organizationId
        const participantByOrgId = new Map(participants.map(p => [String(p.organizationId), p]));
        return organizations.map(org => {
            const participant = participantByOrgId.get(String(org.id));
            return {
                ...org.toObject(),
                permissions: participant?.permissions || {},
                role: participant?.role || 'owner',
            };
        });
    }
}
