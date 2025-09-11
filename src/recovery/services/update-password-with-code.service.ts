
import { Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { UpdateRecoveryDto } from "../dto/update-recovery.dto";
import { UserRepositoryInterface } from "src/auth/repositories/user.repository.interface";
import * as bcrypt from 'bcrypt';

@Injectable()
export class UpdatePasswordWithCodeService {
    constructor(
        @Inject('user-repository')
        private readonly userRepository: UserRepositoryInterface,
    ) { }

    async execute(updateRecoveryDto: UpdateRecoveryDto) {
        const { email, token, newPassword } = updateRecoveryDto;

        // Busca usuário pelo e-mail
        const user = await this.userRepository.findByEmail(email);
        if (!user) {
            throw new UnauthorizedException('Usuário não encontrado');
        }

        // Compara o token recebido com o salvo no banco
        const savedToken = (user as any).passwordToken;
        if (savedToken !== token) {
            throw new UnauthorizedException('Token inválido');
        }

        // Atualiza a senha do usuário
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Atualiza a senha e remove o token
        // Tenta usar _id ou id, conforme interface
        const userId = (user as any)._id || (user as any).id;
        await this.userRepository.update(userId, {
            password: hashedPassword,
            passwordToken: null,
        });

        return { success: true, message: 'Senha atualizada com sucesso' };
    }
}