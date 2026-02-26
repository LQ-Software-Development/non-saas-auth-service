import { Injectable, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { User } from "src/auth/database/providers/schema/user.schema";
import { Organization } from "src/organizations/entities/organization.schema";
import { Participant } from "src/organizations/participants/entities/participant.entity";
import * as bcrypt from 'bcrypt';
import { SendCustomerAccessEmailService } from "src/emails/services/send-customer-access-email.service";
import { randomBytes } from "crypto";

@Injectable()
export class UpsertCustomerUserService {
    private readonly logger = new Logger(UpsertCustomerUserService.name);

    constructor(
        @InjectModel(User.name)
        private userModel: Model<User>,
        @InjectModel(Organization.name)
        private organizationModel: Model<Organization>,
        @InjectModel(Participant.name)
        private participantModel: Model<Participant>,
        private readonly sendCustomerAccessEmailService: SendCustomerAccessEmailService,
    ) { }

    async execute(customerData: any) {
        if (process.env.CUSTOMER_USER_INTEGRATION_ENABLED !== 'true') {
            return;
        }

        const { email, name, phone, document, customerId, metadata, externalId: organizationId } = customerData;

        if (!organizationId) {
            this.logger.warn('ID da organizacao (externalId) nao informado no payload do cliente.', {
                customerId,
            });
            return;
        }

        const organization = await this.organizationModel.findById(organizationId).lean();
        if (!organization) {
            this.logger.warn('Organizacao nao encontrada para criar usuario de cliente.', {
                organizationId,
                customerId,
            });
            return;
        }

        const branding = (organization as any).branding;

        if (!(organization as any).customerUserIntegrationEnabled) {
            this.logger.log('Integracao de usuario cliente desabilitada para organizacao.', {
                organizationId,
                customerId,
            });
            return;
        }

        if (!email) {
            this.logger.warn('Email nao informado para criar usuario de cliente.', {
                organizationId,
                customerId,
            });
            return;
        }

        const queries = [];

        if (customerId)
            queries.push({ 'metadata.customerId': customerId });
        if (email)
            queries.push({ email });
        if (phone)
            queries.push({ phone });
        if (document)
            queries.push({ document });

        if (queries.length === 0) {
            this.logger.error('Nenhum dado valido fornecido para localizar ou criar o usuario do cliente.');
            return;
        }

        let user = await this.userModel.findOne({ $or: queries }).exec();
        const isNewUser = !user;
        let plainPassword: string | undefined;
        const safeMetadata = { ...(metadata || {}) };
        if (safeMetadata.password) {
            delete safeMetadata.password;
        }

        if (user) {
            // Atualiza o usuário existente
            user.name = name || user.name;
            user.phone = phone || user.phone;
            user.document = document || user.document;
            user.metadata = { ...user.metadata, ...safeMetadata, customerId: customerId || user.metadata.customerId };

            if (metadata?.password) {
                user.password = bcrypt.hashSync(metadata.password, 10);
            }

            this.logger.log(`Usuario atualizado para o cliente ID: ${customerId}`);
        } else {
            plainPassword = metadata?.password || this.generatePassword();

            user = new this.userModel({
                email,
                name,
                phone,
                document,
                password: bcrypt.hashSync(plainPassword, 10),
                verifiedEmail: true,
                metadata: { ...safeMetadata, customerId },
            });
            this.logger.log(`Novo usuario criado para o cliente ID: ${customerId}`);
        }

        const savedUser = await user.save();

        await this.ensureCustomerParticipant({
            organizationId,
            userId: savedUser._id?.toString?.(),
            name: savedUser.name,
            email: savedUser.email,
            phone: savedUser.phone,
            document: savedUser.document,
            customerId,
        });

        if (isNewUser && plainPassword) {
            await this.sendCustomerAccessEmailService.sendCustomerAccessEmail(
                savedUser,
                plainPassword,
                branding,
            );
        }

        return savedUser;

    }

    private async ensureCustomerParticipant(params: {
        organizationId: string;
        userId?: string;
        name?: string;
        email?: string;
        phone?: string;
        document?: string;
        customerId?: string;
    }) {
        const { organizationId, userId, name, email, phone, document, customerId } = params;

        const participantQuery: any = {
            organizationId,
            $or: [
                ...(userId ? [{ userId }] : []),
                ...(email ? [{ email }] : []),
                ...(document ? [{ document }] : []),
                ...(customerId ? [{ 'metadata.customerId': customerId }] : []),
            ],
        };

        if (!participantQuery.$or.length) {
            return;
        }

        const existing = await this.participantModel.findOne(participantQuery).lean();
        if (existing) {
            return;
        }

        await this.participantModel.create({
            organizationId,
            userId,
            name,
            email,
            phone,
            document,
            role: 'customer',
            metadata: {
                ...(customerId ? { customerId } : {}),
            },
        });
    }

    private generatePassword() {
        return randomBytes(9).toString('base64url');
    }

}
