import { Result } from '../../../../../core/application/result';
import { RegisterDto } from './register-user.dto';
import { User } from '../../../../../apps/auth/database/providers/schema/user.schema';
import { UserRepositoryInterface } from '../../../../../apps/auth/repositories/user.repository.interface';
export declare class RegisterUserUseCase {
    private readonly userRepository;
    constructor(userRepository: UserRepositoryInterface);
    register(data: RegisterDto): Promise<Result<User>>;
}
