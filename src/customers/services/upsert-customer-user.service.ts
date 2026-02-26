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
        this.logger.log('Inicio do upsert de usuario cliente.', {
            customerId: customerData.customerId,
            externalId: customerData.externalId,
            email: customerData.email,
            hasMetadata: !!customerData.metadata,
        });

        if (process.env.CUSTOMER_USER_INTEGRATION_ENABLED !== 'true') {
            this.logger.warn('Integracao de usuario cliente desabilitada via variavel de ambiente CUSTOMER_USER_INTEGRATION_ENABLED.');
            return;
        }

        const { email, name, phone, document, customerId, metadata, externalId } = customerData;

        this.logger.debug('Buscando organizacao pelo externalId.', { externalId });
        const organization = await this.organizationModel.findOne({ externalId }).lean();
        if (!organization) {
            this.logger.warn('Organizacao nao encontrada para criar usuario de cliente.', {
                externalId,
                customerId,
            });
            return;
        }

        const organizationId = String((organization as any)._id);
        const branding = (organization as any).branding;
        this.logger.debug('Organizacao encontrada.', {
            organizationId,
            externalId,
            hasBranding: !!branding,
            customerUserIntegrationEnabled: (organization as any).customerUserIntegrationEnabled,
        });

        if (!(organization as any).customerUserIntegrationEnabled) {
            this.logger.log('Integracao de usuario cliente desabilitada para organizacao.', {
                organizationId,
                externalId: organization.externalId,
                customerId,
            });
            return;
        }

        if (!email) {
            this.logger.warn('Email nao informado para criar usuario de cliente.', {
                organizationId,
                externalId,
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

        this.logger.debug('Criterios de busca do usuario montados.', {
            organizationId,
            customerId,
            queryCount: queries.length,
            queryFields: queries.map(q => Object.keys(q)[0]),
        });

        if (queries.length === 0) {
            this.logger.error('Nenhum dado valido fornecido para localizar ou criar o usuario do cliente.', {
                organizationId,
                customerId,
                externalId,
            });
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
            this.logger.log('Usuario existente encontrado. Atualizando dados.', {
                userId: user._id?.toString(),
                customerId,
                organizationId,
                fieldsToUpdate: {
                    name: !!name && name !== user.name,
                    phone: !!phone && phone !== user.phone,
                    document: !!document && document !== user.document,
                    password: !!metadata?.password,
                    metadata: Object.keys(safeMetadata),
                },
            });

            user.name = name || user.name;
            user.phone = phone || user.phone;
            user.document = document || user.document;
            user.metadata = { ...user.metadata, ...safeMetadata, customerId: customerId || user.metadata.customerId };

            if (metadata?.password) {
                user.password = bcrypt.hashSync(metadata.password, 10);
                this.logger.debug('Senha do usuario atualizada via metadata.', {
                    userId: user._id?.toString(),
                    customerId,
                });
            }

            this.logger.log('Usuario atualizado com sucesso.', {
                userId: user._id?.toString(),
                customerId,
                organizationId,
            });
        } else {
            const isPasswordFromMetadata = !!metadata?.password;
            plainPassword = metadata?.password || this.generatePassword();

            this.logger.log('Usuario nao encontrado. Criando novo usuario.', {
                email,
                customerId,
                organizationId,
                senhaOrigem: isPasswordFromMetadata ? 'metadata' : 'gerada_automaticamente',
            });

            user = new this.userModel({
                email,
                name,
                phone,
                document,
                password: bcrypt.hashSync(plainPassword, 10),
                verifiedEmail: true,
                metadata: { ...safeMetadata, customerId },
            });
            this.logger.log('Novo usuario instanciado com sucesso.', {
                email,
                customerId,
                organizationId,
            });
        }

        const savedUser = await user.save();
        this.logger.log('Usuario salvo no banco de dados.', {
            userId: savedUser._id?.toString(),
            customerId,
            organizationId,
            isNewUser,
        });

        this.logger.debug('Verificando participante do cliente na organizacao.', {
            organizationId,
            userId: savedUser._id?.toString(),
            customerId,
        });
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
            this.logger.log('Enviando email de acesso para novo usuario cliente.', {
                userId: savedUser._id?.toString(),
                email: savedUser.email,
                customerId,
                organizationId,
                hasBranding: !!branding,
            });
            await this.sendCustomerAccessEmailService.sendCustomerAccessEmail(
                savedUser,
                plainPassword,
                branding,
            );
            this.logger.log('Email de acesso enviado com sucesso.', {
                userId: savedUser._id?.toString(),
                email: savedUser.email,
                customerId,
            });
        } else if (isNewUser) {
            this.logger.warn('Novo usuario criado mas sem senha para enviar email de acesso.', {
                userId: savedUser._id?.toString(),
                customerId,
                organizationId,
            });
        }

        this.logger.log('Upsert de usuario cliente finalizado com sucesso.', {
            userId: savedUser._id?.toString(),
            customerId,
            organizationId,
            isNewUser,
        });

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
            this.logger.warn('Nenhum criterio valido para buscar participante. Pulando criacao.', {
                organizationId,
                customerId,
            });
            return;
        }

        const existing = await this.participantModel.findOne(participantQuery).lean();
        if (existing) {
            this.logger.debug('Participante ja existe na organizacao. Pulando criacao.', {
                organizationId,
                participantId: (existing as any)._id?.toString(),
                userId,
                customerId,
            });
            return;
        }

        this.logger.log('Criando novo participante na organizacao.', {
            organizationId,
            userId,
            email,
            customerId,
            role: 'customer',
        });

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

        this.logger.log('Participante criado com sucesso.', {
            organizationId,
            userId,
            customerId,
        });
    }

    private generatePassword() {
        return randomBytes(9).toString('base64url');
    }

}
