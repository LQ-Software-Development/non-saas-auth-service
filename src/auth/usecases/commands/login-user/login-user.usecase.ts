import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserRepositoryInterface } from '../../../repositories/user.repository.interface';
import { LoginUserDto } from './login-user.dto';
import { Result } from '../../../../core/application/result';
import { ForbiddenException } from '../../../../core/exceptions';
import * as bcrypt from 'bcrypt';
import { User } from 'src/auth/database/providers/schema/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Participant } from 'src/organizations/participants/entities/participant.entity';
import { Organization } from 'src/organizations/entities/organization.schema';

@Injectable()
export class LoginUserUseCase {
  constructor(
    @Inject('user-repository')
    private readonly userRepository: UserRepositoryInterface,
    @Inject('jwt-service') private readonly jwtService: JwtService,
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
    @InjectModel(Participant.name)
    private readonly participantModel: Model<Participant>,
    @InjectModel(Organization.name)
    private readonly organizationModel: Model<Organization>,
  ) {}

  async login(
    data: LoginUserDto,
  ): Promise<Result<{ token: string; userId: string }>> {
    const { document, email, password } = data;

    const user = await this.userModel.findOne({
      $or: [{ document }, { email }],
    });

    if (!user) {
      return Result.fail(new ForbiddenException('User or password incorrect'));
    }

    const organizationRelations = await this.participantModel.find({
      $or: [
        user.email && { email: user.email },
        user.document && { document: user.document },
        user.id && { userId: user.id },
      ],
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
        role: relation?.role || 'owner',
      };
    });

    if (!user) {
      return Result.fail(new ForbiddenException('User or password incorrect'));
    }

    if (!bcrypt.compareSync(password, user.password)) {
      return Result.fail(new ForbiddenException('User or password incorrect'));
    }

    const token = this.jwtService.sign({
      sub: user.id,
      accesses: organizationsWithRoles,
      name: user.name,
      email: user.email,
      verifiedEmail: user.verifiedEmail,
    });

    return Result.ok({
      name: user.name,
      userId: user.id,
      verifiedEmail: user.verifiedEmail,
      token,
      accesses: organizationsWithRoles,
    });
  }
}
