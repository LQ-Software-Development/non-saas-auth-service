import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Participant } from '../entities/participant.entity';
import { User } from 'src/auth/database/providers/schema/user.schema';

@Injectable()
export class GetParticipantsService {
    constructor(
        @InjectModel(Participant.name)
        private readonly participantModel: Model<Participant>,
        @InjectModel(User.name)
        private readonly userModel: Model<User>,
    ) { }

    async execute({ organizationId }: { organizationId: string }) {
        const relations = await this.participantModel.find({ organizationId });

        const users = await this.userModel.find({
            $or: [
                { email: { $in: relations.map((relation) => relation.email) } },
                { document: { $in: relations.map((relation) => relation.document) } },
            ],
        });

        const usersWithRelations = relations.map((relation) => {
            const user = users.find(
                (user) =>
                    user.email === relation.email || user.document === relation.document,
            );

            return {
                ...user?.toObject(),
                pending: user ? false : true,
                userId: user?._id,
                ...relation.toObject(),
                metadata: {
                    ...relation.metadata,
                },
                role: relation.role,
            };
        });

        return usersWithRelations;
    }
}
