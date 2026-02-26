import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Organization } from '../entities/organization.schema';

/**
 * UpdateSetupProgressService — Atualiza o progresso de setup de uma organization.
 *
 * Salva no campo metadata.setupProgress como Record<string, boolean>.
 * O primeiro passo "account_created" é sempre true (Endowed Progress — P6).
 */
@Injectable()
export class UpdateSetupProgressService {
  private readonly logger = new Logger(UpdateSetupProgressService.name);

  constructor(
    @InjectModel(Organization.name)
    private organizationModel: Model<Organization>,
  ) {}

  async execute(
    organizationId: string,
    stepKey: string,
    completed = true,
  ): Promise<Record<string, boolean>> {
    const org = await this.organizationModel.findById(organizationId).exec();

    if (!org) {
      this.logger.warn(`Organization ${organizationId} não encontrada`);
      return { account_created: true };
    }

    const currentProgress: Record<string, boolean> = {
      account_created: true, // Always true — Endowed Progress (P6)
      ...(org.metadata?.setupProgress || {}),
    };

    currentProgress[stepKey] = completed;

    await this.organizationModel.findByIdAndUpdate(
      organizationId,
      {
        $set: { 'metadata.setupProgress': currentProgress },
      },
      { new: true },
    );

    this.logger.log(
      `Setup progress atualizado: ${organizationId} → ${stepKey}=${completed}`,
    );

    return currentProgress;
  }
}
