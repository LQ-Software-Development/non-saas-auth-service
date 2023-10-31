import { JwtService } from '@nestjs/jwt';
import { UserRepositoryInterface } from 'src/apps/auth/repositories/user.repository.interface';
import { Result } from 'src/core/application/result';
import { ResponseResetEmailDto } from './request-reset-email.dto';
import { emailProviderInterface } from 'src/apps/auth/providers/mailer/email.provider.interface';
export declare class RequestResetEmailUseCase {
    private readonly userRepository;
    private readonly jwtService;
    private readonly emailProvider;
    constructor(userRepository: UserRepositoryInterface, jwtService: JwtService, emailProvider: emailProviderInterface);
    requestResetEmail(email: string): Promise<Result<ResponseResetEmailDto>>;
}
