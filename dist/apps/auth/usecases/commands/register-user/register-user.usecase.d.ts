import { Result } from 'src/core/application/result';
import { RegisterDto } from './register-user.dto';
import { User } from 'src/apps/auth/database/providers/schema/user.schema';
import { UserRepositoryInterface } from 'src/apps/auth/repositories/user.repository..interface';
export declare class RegisterUserUseCase {
    private readonly userRepository;
    constructor(userRepository: UserRepositoryInterface);
    register(data: RegisterDto): Promise<Result<User>>;
}
