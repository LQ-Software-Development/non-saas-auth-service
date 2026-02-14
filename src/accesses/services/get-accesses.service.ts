import { ForbiddenException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Organization } from "src/organizations/entities/organization.schema";
import { Participant } from "src/organizations/participants/entities/participant.entity";
import { Position } from "src/organizations/positions/entities/position.entity";

export class GetAccessesService {
    constructor(
        @InjectModel(Participant.name)
        private readonly participantsRepository: Model<Participant>,
        @InjectModel(Organization.name)
        private readonly organizationsRepository: Model<Organization>,
        @InjectModel(Position.name)
        private readonly positionsRepository: Model<Position>,
    ) { }

    async execute(userId: string) {
        // Run both queries in parallel
        const [participants, ownedOrganizations] = await Promise.all([
            this.participantsRepository.find({ userId, organizationId: { $ne: null } }),
            this.organizationsRepository.find({ ownerId: userId }),
        ]);

        const participantOrganizations = await Promise.all(
            participants.map(p => this.organizationsRepository.findById(p.organizationId))
        );

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

        const participantByOrgId = new Map(participants.map(p => [String(p.organizationId), p]));

        // Coleta os IDs de positions para buscar em batch
        const positionIds = participants
            .filter(p => p.positionId)
            .map(p => p.positionId);

        // Busca todas as positions de uma vez
        const positions = positionIds.length > 0
            ? await this.positionsRepository.find({
                _id: { $in: positionIds },
                deletedAt: null,
            })
            : [];

        const positionById = new Map(positions.map(p => [String(p._id), p]));

        return organizations.map(org => {
            const participant = participantByOrgId.get(String(org.id));
            const position = participant?.positionId
                ? positionById.get(String(participant.positionId))
                : null;

            return {
                ...org.toObject(),
                permissions: participant?.permissions || {},
                role: participant?.role || 'owner',
                position: position?.toObject() || null,
                positionId: participant?.positionId || null,
            };
        });
    }
}
