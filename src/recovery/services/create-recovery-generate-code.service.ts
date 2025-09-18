import { Injectable, Inject, NotFoundException, InternalServerErrorException } from "@nestjs/common";
import { randomInt } from "crypto";
import { CreateRecoveryDto } from "../dto/create-recovery.dto";
import { UserRepositoryInterface } from "../../auth/repositories/user.repository.interface";

@Injectable()
export class CreateRecoveryGenerateCodeService {
    constructor(
        @Inject('user-repository')
        private readonly userRepository: UserRepositoryInterface,
    ) { }

    async execute(createRecoveryDto: CreateRecoveryDto) {
        const token = randomInt(100000, 1000000).toString();
        // Busca usuário pelo e-mail
        const user = await this.userRepository.findByEmail(createRecoveryDto.email);
        if (!user) {
            throw new NotFoundException('Usuário não encontrado');
        }
        // Atualiza o token de recuperação de senha
        const userId = (user as any)._id || (user as any).id;
        await this.userRepository.update(userId, { passwordToken: token });

        // Monta o corpo da requisição para envio de e-mail
        const emailPayload = {
            data: { passwordToken: token, name: user.name, subject: 'Recuperação de Senha' },
            email: createRecoveryDto.email, 
            template: "recovery-password-code"
        };

        // URL do serviço de envio de e-mail, obtida da variável de ambiente
        const emailServiceUrl = `${process.env.EMAIL_VERIFICATION_SENDER_URL}/emails`;

        try {
            // Realiza a requisição HTTP POST usando fetch nativo
            const response = await fetch(emailServiceUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(emailPayload)
            });

            // Se a resposta não for bem-sucedida, lança exceção
            if (!response.ok) {
                throw new Error(`Erro ao enviar e-mail: ${response.statusText}`);
            }
        } catch (error) {
            throw new InternalServerErrorException('Falha ao enviar e-mail de recuperação de senha ');

        }
    }
}