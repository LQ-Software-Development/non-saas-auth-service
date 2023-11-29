import { ControllerBase } from '../../../../../core/application/controller.base';
import { LoginUserUseCase } from './login-user.usecase';
import { LoginUserDto } from './login-user.dto';
export declare class LoginUserController extends ControllerBase {
    private readonly loginUserUseCase;
    constructor(loginUserUseCase: LoginUserUseCase);
    login(data: LoginUserDto): Promise<void | {
        token: string;
        userId: string;
    }>;
}
