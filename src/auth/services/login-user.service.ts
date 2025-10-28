import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
// RepositoryInterface is not used, maybe remove later if not needed elsewhere implicitly
// import { UserRepositoryInterface } from '../../../repositories/user.repository.interface';
import { LoginUserDto } from '../dto/login-user.dto';
import { Result } from '../../core/application/result';
import { ForbiddenException, InternalServerErrorException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { User } from '../database/providers/schema/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Participant } from '../../organizations/participants/entities/participant.entity';
import { Organization } from '../../organizations/entities/organization.schema';

// Interface for the successful login payload
interface LoginSuccessPayload {
  token: string;
  userId: string;
  name: string;
  verifiedEmail: boolean;
  phone?: string;
  document?: string;
  accesses: OrganizationAccessFormat[];
}

// Interface for the formatted organization access
interface OrganizationAccessFormat {
  id: string;
  name: string;
  externalId?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  participantId?: Types.ObjectId;
  role: string;
  accessMetadata?: Record<string, any>;
}

// Interface for the result of finding and validating user
interface FoundUserResult {
  user: User & { _id: Types.ObjectId }; // Use _id directly from lean()
  idString: string; // Provide the string version separately
  identifierField: 'email' | 'phone' | 'document';
  identifierValue: string;
}

@Injectable()
export class LoginUserService {
  constructor(
    // @Inject('user-repository')
    // private readonly userRepository: UserRepositoryInterface, // Not directly used after refactor
    @Inject('jwt-service') private readonly jwtService: JwtService,
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
    @InjectModel(Participant.name)
    private readonly participantModel: Model<Participant>,
    @InjectModel(Organization.name)
    private readonly organizationModel: Model<Organization>,
  ) { }

  async login(data: LoginUserDto): Promise<Result<LoginSuccessPayload>> {
    try {
      const { user, idString, identifierField, identifierValue } =
        await this._findAndValidateUser(data);

      const accesses = await this._getUserAccesses(
        user,
        idString,
        identifierField,
        identifierValue,
      );

      const token = this.jwtService.sign({
        sub: idString,
        accesses: accesses.map((access) => ({
          ...access,
          metadata: data.noMetadataOnToken ? undefined : access.metadata,
          accessMetadata: data.noMetadataOnToken ? undefined : access.accessMetadata,
        })),
        name: user.name,
        email: user.email,
        verifiedEmail: user.verifiedEmail,
        document: user.document,
        phone: user.phone,
      });

      return Result.ok({
        name: user.name,
        userId: idString,
        verifiedEmail: user.verifiedEmail,
        phone: user.phone,
        document: user.document,
        token,
        accesses: accesses,
      });
    } catch (error) {
      if (error instanceof ForbiddenException) {
        throw error;
      }
      // Rethrow or return a generic server error
      throw new InternalServerErrorException(
        'An unexpected error occurred during login.',
      );
    }
  }

  private async _findAndValidateUser(
    data: LoginUserDto,
  ): Promise<FoundUserResult> {
    const { document, email, password, phone } = data;
    let user: User & { _id: Types.ObjectId };
    let identifierField: 'email' | 'phone' | 'document';
    let identifierValue: string;

    if (email) {
      identifierField = 'email';
      identifierValue = email;
      user = await this.userModel.findOne({ email }).lean().exec();
    } else if (phone) {
      identifierField = 'phone';
      identifierValue = phone;
      user = await this.userModel.findOne({ phone }).lean().exec();
    } else if (document) {
      identifierField = 'document';
      identifierValue = document;
      user = await this.userModel.findOne({ document }).lean().exec();
    } else {
      // Should be caught by DTO validation, but handle defensively
      throw new ForbiddenException('No valid identifier provided.');
    }

    if (!user) {
      throw new ForbiddenException('User or password incorrect');
    }

    const idString = user._id.toString();

    if (!bcrypt.compareSync(password, user.password)) {
      throw new ForbiddenException('User or password incorrect');
    }

    return { user, idString, identifierField, identifierValue };
  }

  private async _getUserAccesses(
    user: User & { _id: Types.ObjectId },
    userIdString: string,
    loginIdentifierField: 'email' | 'phone' | 'document',
    loginIdentifierValue: string,
  ): Promise<OrganizationAccessFormat[]> {
    let primaryParticipants: (Participant & { _id: Types.ObjectId })[] = [];
    let validatedSecondaryParticipants: (Participant & { _id: Types.ObjectId })[] = [];

    // --- Passo 1: Busca Primária ---
    if (loginIdentifierValue) {
      const primaryQueryCondition = { [loginIdentifierField]: loginIdentifierValue };
      primaryParticipants = await this.participantModel
        .find({
          $and: [
            primaryQueryCondition,
            { $or: [{ deletedAt: { $exists: false } }, { deletedAt: null }] },
          ],
        })
        .lean()
        .exec();
    }
    const primaryParticipantIds = primaryParticipants.map((p) => p._id);

    // --- Passo 2: Identificar Secundários ---
    const secondaryIdentifiersToCheck: { field: string; value: string }[] = [];
    if (user.email && loginIdentifierField !== 'email') {
      secondaryIdentifiersToCheck.push({ field: 'email', value: user.email });
    }
    if (user.phone && loginIdentifierField !== 'phone') {
      secondaryIdentifiersToCheck.push({ field: 'phone', value: user.phone });
    }
    if (user.document && loginIdentifierField !== 'document') {
      secondaryIdentifiersToCheck.push({ field: 'document', value: user.document });
    }

    // --- Passo 3: Busca Secundária ---
    let potentialSecondaryParticipants: (Participant & { _id: Types.ObjectId })[] = [];
    if (secondaryIdentifiersToCheck.length > 0) {
      const orConditions = secondaryIdentifiersToCheck.map(({ field, value }) => ({ [field]: value }));
      potentialSecondaryParticipants = await this.participantModel
        .find({
          $and: [
            { _id: { $nin: primaryParticipantIds } },
            { $or: orConditions },
            { $or: [{ deletedAt: { $exists: false } }, { deletedAt: null }] },
          ],
        })
        .lean()
        .exec();
    }

    // --- Passo 4: Validação Cruzada Simplificada ---
    validatedSecondaryParticipants = []; // Resetar
    if (potentialSecondaryParticipants.length > 0) {
      for (const participant of potentialSecondaryParticipants) {
        let hasConflict = false;
        const matchedInfo = secondaryIdentifiersToCheck.find(secId =>
          participant[secId.field as keyof Participant] === secId.value
        );
        if (!matchedInfo) {
          continue; // Pula este participante
        }
        const matchedField = matchedInfo.field;
        // Validação Cruzada Simplificada:
        if (matchedField !== 'email' && user.email != null && participant.email != null && user.email !== participant.email) {
          hasConflict = true;
        }
        if (!hasConflict && matchedField !== 'phone' && user.phone != null && participant.phone != null && user.phone !== participant.phone) {
          hasConflict = true;
        }
        if (!hasConflict && matchedField !== 'document' && user.document != null && participant.document != null && user.document !== participant.document) {
          hasConflict = true;
        }
        if (!hasConflict) {
          validatedSecondaryParticipants.push(participant);
        }
      }
    }
    // --- Passo 5: Combinar --- (Primários vêm primeiro)
    const allValidParticipants = [
      ...primaryParticipants.map(p => ({ ...p, organizationId: String(p.organizationId) })),
      ...validatedSecondaryParticipants.map(p => ({ ...p, organizationId: String(p.organizationId) })),
    ];

    if (allValidParticipants.length === 0 && !(await this.organizationModel.exists({ ownerId: userIdString }))) {
      return [];
    }

    // --- Passo 6: Buscar Organizações --- 
    const organizationIdsToSearch = allValidParticipants.map(
      (relation) => relation.organizationId,
    ).filter(id => id);
    const findOrConditions: any[] = [
      { ownerId: userIdString }
    ];
    if (organizationIdsToSearch.length > 0) {
      findOrConditions.push({ _id: { $in: organizationIdsToSearch } });
    }
    const organizations = await this.organizationModel
      .find({ $or: findOrConditions })
      .select('id name externalId metadata createdAt updatedAt ownerId')
      .lean()
      .exec();

    // --- Passo 7: Formatar Acessos (Abordagem sem Map) ---
    const organizationsWithRoles = organizations.map((organization) => {
      const orgIdString = String(organization._id);
      const relation = allValidParticipants.find(p => String(p.organizationId) === orgIdString);
      let role: string;
      let participantId: Types.ObjectId | undefined = undefined;
      let accessMetadata: Record<string, any> | undefined = undefined;
      if (relation) {
        role = relation.role;
        participantId = relation._id;
        accessMetadata = {
          ...(relation.metadata || {}),
          createdAt: relation.createdAt,
          updatedAt: relation.updatedAt,
        };
        if (!role) {
          role = 'member';
        }
      } else if (organization.ownerId === userIdString) {
        role = 'owner';
        participantId = undefined;
        accessMetadata = undefined;
      } else {
        role = 'unknown';
        participantId = undefined;
        accessMetadata = undefined;
      }
      return {
        id: orgIdString,
        name: organization.name,
        externalId: organization.externalId,
        metadata: organization.metadata,
        createdAt: organization.createdAt,
        updatedAt: organization.updatedAt,
        participantId: participantId,
        role: role,
        accessMetadata: accessMetadata,
      };
    });
    return organizationsWithRoles;
  }
}