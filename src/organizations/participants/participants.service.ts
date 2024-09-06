import { Injectable } from '@nestjs/common';
import { CreateParticipantDto } from './dto/create-participant.dto';
import { UpdateParticipantDto } from './dto/update-participant.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Participant } from './entities/participant.entity';
import { Model } from 'mongoose';
import { User } from 'src/auth/database/providers/schema/user.schema';

@Injectable()
export class ParticipantsService {
  constructor(
    @InjectModel(Participant.name)
    private readonly participantModel: Model<Participant>,
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
  ) {}

  create(createParticipantDto: CreateParticipantDto) {
    const createdParticipant = new this.participantModel(createParticipantDto);

    return createdParticipant.save();
  }

  async findAll({ organizationId }: { organizationId: string }) {
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
        ...relation.toObject(),
        metadata: {
          // This merge user and participant metadata
          // ...user.metadata,
          ...relation.metadata,
        },
        role: relation.role,
      };
    });
    return usersWithRelations;
  }

  findOne({ id, organizationId }: { id: string; organizationId: string }) {
    return this.participantModel.findOne({ _id: id, organizationId });
  }

  update(updateParticipantDto: UpdateParticipantDto) {
    const { id, organizationId, ...rest } = updateParticipantDto;

    return this.participantModel.updateOne({ _id: id, organizationId }, rest);
  }

  async remove({ id, organizationId }: { id: string; organizationId: string }) {
    const participant = await this.participantModel.findOne({
      _id: id,
      organizationId,
    });

    if (!participant) {
      return;
    }

    return participant.deleteOne();
  }
}
