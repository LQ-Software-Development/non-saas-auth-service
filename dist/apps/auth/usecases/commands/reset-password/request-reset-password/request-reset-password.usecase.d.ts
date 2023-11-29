import { JwtService } from '@nestjs/jwt';
import { UserRepositoryInterface } from '../../../../../../apps/auth/repositories/user.repository.interface';
import { Result } from '../../../../../../core/application/result';
import { RequestResetPasswordDto } from './request-reset-password.dto';
export declare class RequestResetPasswordUseCase {
    private readonly userRepository;
    private readonly jwtService;
    constructor(userRepository: UserRepositoryInterface, jwtService: JwtService);
    resetPassword(data: RequestResetPasswordDto, token: string): Promise<string | Result<unknown>>;
}
