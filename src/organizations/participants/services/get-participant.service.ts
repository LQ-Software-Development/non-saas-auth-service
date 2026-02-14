import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Participant } from '../entities/participant.entity';
import { User } from 'src/auth/database/providers/schema/user.schema';

@Injectable()
export class GetParticipantService {
    constructor(
        @InjectModel(Participant.name)
        private readonly participantModel: Model<Participant>,
        @InjectModel(User.name)
        private readonly userModel: Model<User>,
    ) { }

    async execute({
        id,
        organizationId,
    }: {
        id: string;
        organizationId: string;
    }) {
        const relation = await this.participantModel.findOne({
            _id: id,
            organizationId,
        });

        if (!relation) {
            return null;
        }

        const user = await this.userModel.findOne({
            $or: [{ email: relation.email }, { document: relation.document }],
        });

        const relationObj = relation.toObject();
        const userObj = user?.toObject();

        return {
            ...userObj,
            pending: user ? false : true,
            userId: user?._id,
            ...relationObj,
            metadata: {
                ...relationObj.metadata,
            },
            role: relationObj.role,
        };
    }
}
