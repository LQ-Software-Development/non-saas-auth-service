import { JwtService } from '@nestjs/jwt';
import { UserRepositoryInterface } from '../../../../../../apps/auth/repositories/user.repository.interface';
import { Result } from '../../../../../../core/application/result';
import { ResponseResetEmailDto } from './request-reset-email.dto';
import { emailProviderInterface } from '../../../../../../apps/auth/providers/mailer/email.provider.interface';
export declare class RequestResetEmailUseCase {
    private readonly userRepository;
    private readonly jwtService;
    private readonly emailProvider;
    constructor(userRepository: UserRepositoryInterface, jwtService: JwtService, emailProvider: emailProviderInterface);
    requestResetEmail(email: string): Promise<Result<ResponseResetEmailDto>>;
}
