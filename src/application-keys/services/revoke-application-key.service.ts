import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
    Organization,
    OrganizationDocument,
} from '../../organizations/entities/organization.schema';

@Injectable()
export class RevokeApplicationKeyService {
    constructor(
        @InjectModel(Organization.name)
        private readonly organizationModel: Model<OrganizationDocument>,
    ) { }

    async execute(organizationId: string) {
        const organization = await this.organizationModel.findById(organizationId);

        if (!organization) {
            throw new NotFoundException('Organização não encontrada');
        }

        if (!organization.applicationKey) {
            throw new NotFoundException(
                'Esta organização não possui uma application-key ativa.',
            );
        }

        await this.organizationModel.findByIdAndUpdate(organizationId, {
            $unset: { applicationKey: 1 },
            updatedAt: new Date(),
        });

        return {
            organizationId,
            message: 'Application-key revogada com sucesso.',
        };
    }
}
