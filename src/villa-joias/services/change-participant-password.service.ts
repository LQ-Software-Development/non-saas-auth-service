import {
    Injectable,
    Inject,
    NotFoundException,
    BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { UserRepositoryInterface } from '../../auth/repositories/user.repository.interface';
import {
    Participant,
} from '../../organizations/participants/entities/participant.entity';
import { User } from '../../auth/database/providers/schema/user.schema';
import { ChangeParticipantPasswordDto } from '../dtos/change-participant-password.dto';

@Injectable()
export class ChangeParticipantPasswordService {
    constructor(
        @Inject('user-repository')
        private readonly userRepository: UserRepositoryInterface,
        @InjectModel(Participant.name)
        private readonly participantModel: Model<Participant>,
    ) { }

    async execute(organizationId: string, dto: ChangeParticipantPasswordDto) {
        // 1. Busca o usuário (participant) pelo userId informado no body
        const userResult = await this.userRepository.findById(dto.userId);
        const user = userResult.value as User & { _id: string; id: string };

        if (!user) {
            throw new NotFoundException('Usuário não encontrado');
        }

        // 2. Verifica se o usuário é um participant da organização autenticada pela application-key
        const participant = await this.participantModel.findOne({
            organizationId,
            $or: [
                { email: user.email },
                ...(user.document ? [{ document: user.document }] : []),
            ],
            deletedAt: null,
        });

        if (!participant) {
            throw new BadRequestException(
                'Usuário não é participante desta organização',
            );
        }

        // 3. Faz hash da nova senha e atualiza
        const newPasswordHash = bcrypt.hashSync(dto.newPassword, 10);

        await this.userRepository.update(user._id?.toString() || user.id, {
            password: newPasswordHash,
            updatedAt: new Date(),
        } as Partial<User>);

        return {
            message: 'Senha alterada com sucesso',
        };
    }
}
