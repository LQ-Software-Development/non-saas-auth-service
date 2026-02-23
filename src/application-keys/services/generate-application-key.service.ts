import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { randomBytes } from 'crypto';
import {
    Organization,
    OrganizationDocument,
} from '../../organizations/entities/organization.schema';

@Injectable()
export class GenerateApplicationKeyService {
    constructor(
        @InjectModel(Organization.name)
        private readonly organizationModel: Model<OrganizationDocument>,
    ) { }

    async execute(organizationId: string) {
        const organization = await this.organizationModel.findById(organizationId);

        if (!organization) {
            throw new NotFoundException('Organização não encontrada');
        }

        const applicationKey = randomBytes(32).toString('hex');

        await this.organizationModel.findByIdAndUpdate(organizationId, {
            applicationKey,
            updatedAt: new Date(),
        });

        return {
            organizationId,
            applicationKey,
            message: organization.applicationKey
                ? 'Application-key substituída com sucesso. Guarde-a em local seguro, ela não será exibida novamente.'
                : 'Application-key gerada com sucesso. Guarde-a em local seguro, ela não será exibida novamente.',
        };
    }
}
