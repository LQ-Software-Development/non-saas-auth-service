import { Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { UserRepositoryInterface } from "src/auth/repositories/user.repository.interface";
import { ValidateCodeDto } from "../dto/validate-code.dto";

@Injectable()
export class PostRecoveryValidateCodeService {
    constructor(
        @Inject('user-repository')
        private readonly userRepository: UserRepositoryInterface,
    ) { }

    async execute(validateCodeDto: ValidateCodeDto) {
        // Busca usuário pelo e-mail
        const user = await this.userRepository.findByEmail(validateCodeDto.email);
        if (!user) {
            throw new UnauthorizedException('Usuário não encontrado');
        }

        // Compara o token recebido com o salvo no banco
        const savedToken = (user as any).passwordToken;
        if (savedToken !== validateCodeDto.token) {
            throw new UnauthorizedException('Token inválido');
        }

        // Token válido
        return { success: true };
    }
}