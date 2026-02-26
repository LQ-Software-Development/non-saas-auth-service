import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Organization } from '../entities/organization.schema';

/**
 * GetSetupProgressService — Retorna o progresso de setup de uma organization.
 * Sempre inclui account_created: true (Endowed Progress — P6).
 */
@Injectable()
export class GetSetupProgressService {
  private readonly logger = new Logger(GetSetupProgressService.name);

  constructor(
    @InjectModel(Organization.name)
    private organizationModel: Model<Organization>,
  ) {}

  async execute(
    organizationId: string,
  ): Promise<Record<string, boolean>> {
    const org = await this.organizationModel.findById(organizationId).exec();

    if (!org) {
      this.logger.warn(`Organization ${organizationId} não encontrada`);
      return { account_created: true };
    }

    return {
      account_created: true,
      ...(org.metadata?.setupProgress || {}),
    };
  }
}
