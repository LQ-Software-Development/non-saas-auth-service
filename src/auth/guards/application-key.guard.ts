import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Request } from 'express';
import {
  Organization,
  OrganizationDocument,
} from '../../organizations/entities/organization.schema';

@Injectable()
export class ApplicationKeyGuard implements CanActivate {
  constructor(
    @InjectModel(Organization.name)
    private readonly organizationModel: Model<OrganizationDocument>,
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const applicationKey = request.headers['application-key'] as string;

    if (!applicationKey) {
      throw new ForbiddenException('Forbidden Resource');
    }

    // Compatibilidade retroativa: se APPLICATION_KEY env var estiver preenchida,
    // aceita a chave global (usado pelas rotas admin existentes)
    if (
      process.env.APPLICATION_KEY &&
      applicationKey === process.env.APPLICATION_KEY
    ) {
      return true;
    }

    // Busca a organização pela application-key no banco
    const organization = await this.organizationModel.findOne({
      applicationKey,
      active: true,
    });

    if (!organization) {
      throw new ForbiddenException('Forbidden Resource');
    }

    // Injeta os dados da organização na request para uso downstream
    request['organizationId'] = organization._id.toString();
    request['organization'] = organization;

    return true;
  }
}
