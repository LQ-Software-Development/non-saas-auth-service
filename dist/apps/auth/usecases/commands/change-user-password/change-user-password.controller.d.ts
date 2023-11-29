import { ControllerBase } from '../../../../../core/application/controller.base';
import { ChangePasswordDto } from './change-user-password.dto';
import { ChangeUserPassowrdUseCase } from './change-user-password.usecase';
export declare class ChangeUserPassowrdController extends ControllerBase {
    private readonly changeUserPasswordUseCase;
    constructor(changeUserPasswordUseCase: ChangeUserPassowrdUseCase);
    changeUserPassword(data: ChangePasswordDto): Promise<any>;
}
