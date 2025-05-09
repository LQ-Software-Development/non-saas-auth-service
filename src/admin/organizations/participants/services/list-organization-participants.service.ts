import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Participant } from 'src/organizations/participants/entities/participant.entity';
import { User, UserDocument } from 'src/auth/database/providers/schema/user.schema';

export class ListOrganizationParticipantsService {
  constructor(
    @InjectModel(Participant.name)
    private readonly participantModel: Model<Participant>,
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  async execute(organizationId: string) {
    const participants = await this.participantModel.find({ organizationId });
    const users = await this.userModel.find({
      $or: [
        { email: { $in: participants.map(p => p.email) } },
        { document: { $in: participants.map(p => p.document) } },
      ],
    });
    return participants.map(participant => {
      const participantObj = participant.toObject();
      const user = users.find(
        u => u.email === participant.email || u.document === participant.document,
      );
      return {
        ...participantObj,
        userId: user?._id,
      };
    });
  }
}
