import { ChangePasswordDto } from './change-user-password.dto';
import { UserRepositoryInterface } from 'src/apps/auth/repositories/user.repository..interface';
export declare class ChangeUserPassowrdUseCase {
    private readonly userRepository;
    constructor(userRepository: UserRepositoryInterface);
    changePassword(data: ChangePasswordDto): Promise<any>;
}
