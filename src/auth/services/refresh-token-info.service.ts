import { ForbiddenException, Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../database/providers/schema/user.schema';
import { Organization } from 'src/organizations/entities/organization.schema';
import { Participant } from 'src/organizations/participants/entities/participant.entity';

@Injectable()
export class RefreshTokenInfoService {
  constructor(
    private readonly jwtService: JwtService,
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
    @InjectModel(Organization.name)
    private readonly organizationModel: Model<Organization>,
    @InjectModel(Participant.name)
    private readonly participantModel: Model<Participant>,
  ) {}

  async execute(userId: string) {
    const whereClauseOrganizationRelations = [];

    const user = await this.userModel.findById(userId);

    if (!user) {
      throw new ForbiddenException('User or password incorrect');
    }

    if (user.email) {
      whereClauseOrganizationRelations.push({ email: user.email });
    }
    if (user.document) {
      whereClauseOrganizationRelations.push({ document: user.document });
    }

    const organizationRelations = await this.participantModel.find({
      $or: whereClauseOrganizationRelations,
    });

    const organizationIds = organizationRelations.map(
      (relation) => relation.organizationId,
    );

    const organizations = await this.organizationModel
      .find({
        $or: [{ ownerId: user.id }, { _id: { $in: organizationIds } }],
      })
      .select('id name externalId metadata');

    const organizationsWithRoles = organizations.map((organization) => {
      const relation = organizationRelations.find(
        (relation) => relation.organizationId === organization.id,
      );

      return {
        ...organization.toObject(),
        id: organization.id,
        participantId: relation?.id,
        role: relation?.role || 'owner',
      };
    });

    if (!user) {
      throw new ForbiddenException('User or password incorrect');
    }

    const newToken = this.jwtService.sign({
      sub: user.id,
      accesses: organizationsWithRoles,
      name: user.name,
      email: user.email,
      verifiedEmail: user.verifiedEmail,
    });

    return {
      name: user.name,
      userId: user.id,
      verifiedEmail: user.verifiedEmail,
      token: newToken,
      accesses: organizationsWithRoles,
    };
  }
}
