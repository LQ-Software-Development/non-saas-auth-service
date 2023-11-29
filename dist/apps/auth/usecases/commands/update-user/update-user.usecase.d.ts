import { User, UserRepositoryInterface } from '../../../../../apps/auth/repositories/user.repository.interface';
import { Result } from '../../../../../core/application/result';
import { UpdateUserDto } from './update-user.dto';
export declare class UpdateUserUseCase {
    private readonly userRepository;
    constructor(userRepository: UserRepositoryInterface);
    update(id: string, data: UpdateUserDto): Promise<Result<User>>;
}
