import { JwtService } from '@nestjs/jwt';
import { UserRepositoryInterface } from '../../../../../apps/auth/repositories/user.repository.interface';
import { LoginUserDto } from './login-user.dto';
import { Result } from '../../../../../core/application/result';
export declare class LoginUserUseCase {
    private readonly userRepository;
    private readonly jwtService;
    constructor(userRepository: UserRepositoryInterface, jwtService: JwtService);
    login(data: LoginUserDto): Promise<Result<{
        token: string;
        userId: string;
    }>>;
}
