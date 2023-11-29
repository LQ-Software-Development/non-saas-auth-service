import { ControllerBase } from '../../../../../core/application/controller.base';
import { RegisterUserUseCase } from './register-user.usecase';
import { RegisterDto } from './register-user.dto';
export declare class RegisterUserController extends ControllerBase {
    private readonly registerUserUseCase;
    constructor(registerUserUseCase: RegisterUserUseCase);
    register(data: RegisterDto): Promise<void | import("../../../database/providers/schema/user.schema").User>;
}
