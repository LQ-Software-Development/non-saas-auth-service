import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User } from 'src/auth/database/providers/schema/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { Parser } from 'json2csv';
import * as fs from 'fs';
import * as path from 'path';
import axios from 'axios';
import * as FormData from 'form-data';
import { Participant } from 'src/organizations/participants/entities/participant.entity';
import { Organization } from 'src/organizations/entities/organization.schema';
import { OrganizationAccessFormatDto } from './dto/organization-access-format.dto';
import { GetUserResponseDto } from './dto/get-user-response.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<User>,
    @InjectModel(Participant.name)
    private participantModel: Model<Participant>,
    @InjectModel(Organization.name)
    private organizationModel: Model<Organization>,
  ) {}

  create(createUserDto: CreateUserDto) {
    return 'This action adds a new user';
  }

  async findAll(props: { page: number; limit: number }) {
    const data = await this.userModel
      .find()
      .skip((props.page - 1) * props.limit)
      .limit(props.limit);

    const count = await this.userModel.countDocuments();

    return {
      data,
      count,
    };
  }

  async exportUsersToCSV(): Promise<string> {
    const users = await this.userModel.find().lean();

    // Extrair campos de metadata dinamicamente
    const metadataFields = new Set<string>();
    users.forEach((user) => {
      if (user.metadata) {
        Object.keys(user.metadata).forEach((key) =>
          metadataFields.add(`metadata.${key}`),
        );
      }
    });

    const fields = [
      '_id',
      'name',
      'email',
      'createdAt',
      'updatedAt',
      ...Array.from(metadataFields),
    ];
    const opts = { fields };
    const parser = new Parser(opts);
    const csv = parser.parse(users);

    const exportsDir = path.join(__dirname, '..', 'exports');
    if (!fs.existsSync(exportsDir)) {
      fs.mkdirSync(exportsDir);
    }

    const filePath = path.join(exportsDir, 'users.csv');
    fs.writeFileSync(filePath, csv);

    // Enviar o arquivo CSV para a API
    const formData = new FormData();
    formData.append('file', fs.createReadStream(filePath));

    try {
      const response = await axios.post(
        'https://pinplaces-upload-files-api.jtiiho.easypanel.host/file',
        formData,
        {
          headers: {
            ...formData.getHeaders(),
          },
        },
      );

      if (response.status !== 201) {
        throw new Error('Failed to upload file');
      }

      return 'https://' + response.data.url;
    } catch (error) {
      throw new Error(`Failed to upload file: ${error.message}`);
    }
  }

  async findOne(id: string): Promise<GetUserResponseDto> {
    const user = await this.userModel.findById(id).lean().exec();
    if (!user) {
      throw new NotFoundException(`User com id ${id} não encontrado`);
    }
    const userIdString = id;
    let identifierField: 'email' | 'phone' | 'document';
    let identifierValue: string;
    if (user.email) {
      identifierField = 'email';
      identifierValue = user.email;
    } else if (user.phone) {
      identifierField = 'phone';
      identifierValue = user.phone;
    } else {
      identifierField = 'document';
      identifierValue = user.document;
    }
    const accesses = await this.getUserAccesses(
      user,
      userIdString,
      identifierField,
      identifierValue,
    );
    return {
      userId: userIdString,
      name: user.name,
      verifiedEmail: user.verifiedEmail,
      phone: user.phone,
      document: user.document,
      accesses,
    };
  }

  private async getUserAccesses(
    user: any & { _id: Types.ObjectId },
    userIdString: string,
    loginIdentifierField: 'email' | 'phone' | 'document',
    loginIdentifierValue: string,
  ): Promise<OrganizationAccessFormatDto[]> {
    let primaryParticipants: any[] = [];
    let validatedSecondaryParticipants: any[] = [];

    // Passo 1: Busca Primária
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

    // Passo 2: Identificar Secundários
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

    // Passo 3: Busca Secundária
    let potentialSecondaryParticipants: any[] = [];
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

    // Passo 4: Validação Cruzada Simplificada
    for (const participant of potentialSecondaryParticipants) {
      let hasConflict = false;
      const matchedInfo = secondaryIdentifiersToCheck.find(
        (secId) => participant[secId.field] === secId.value,
      );
      if (!matchedInfo) {
        continue;
      }
      const matchedField = matchedInfo.field;
      if (
        matchedField !== 'email' &&
        user.email &&
        participant.email &&
        user.email !== participant.email
      ) {
        hasConflict = true;
      }
      if (
        !hasConflict &&
        matchedField !== 'phone' &&
        user.phone &&
        participant.phone &&
        user.phone !== participant.phone
      ) {
        hasConflict = true;
      }
      if (
        !hasConflict &&
        matchedField !== 'document' &&
        user.document &&
        participant.document &&
        user.document !== participant.document
      ) {
        hasConflict = true;
      }
      if (!hasConflict) {
        validatedSecondaryParticipants.push(participant);
      }
    }

    // Passo 5: Combinar
    const allValidParticipants = [
      ...primaryParticipants.map((p) => ({ ...p, organizationId: String(p.organizationId) })),
      ...validatedSecondaryParticipants.map((p) => ({ ...p, organizationId: String(p.organizationId) })),
    ];

    if (
      allValidParticipants.length === 0 &&
      !(await this.organizationModel.exists({ ownerId: userIdString }))
    ) {
      return [];
    }

    // Passo 6: Buscar Organizações
    const organizationIdsToSearch = allValidParticipants
      .map((r) => r.organizationId)
      .filter((id) => id);
    const findOrConditions: any[] = [{ ownerId: userIdString }];
    if (organizationIdsToSearch.length > 0) {
      findOrConditions.push({ _id: { $in: organizationIdsToSearch } });
    }
    const organizations = await this.organizationModel
      .find({ $or: findOrConditions })
      .select('id name externalId metadata createdAt updatedAt ownerId')
      .lean()
      .exec();

    // Passo 7: Formatar Acessos
    const organizationsWithRoles: OrganizationAccessFormatDto[] = organizations.map((organization) => {
      const orgIdString = String(organization._id);
      const relation = allValidParticipants.find(
        (p) => String(p.organizationId) === orgIdString,
      );
      let role: string;
      let participantId: string | undefined = undefined;
      let accessMetadata: Record<string, any> | undefined = undefined;
      if (relation) {
        role = relation.role || 'member';
        participantId = relation._id.toString();
        accessMetadata = {
          ...(relation.metadata || {}),
          createdAt: relation.createdAt,
          updatedAt: relation.updatedAt,
        };
      } else if (organization.ownerId === userIdString) {
        role = 'owner';
      } else {
        role = 'unknown';
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

  update() {
    return `This action updates a user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
