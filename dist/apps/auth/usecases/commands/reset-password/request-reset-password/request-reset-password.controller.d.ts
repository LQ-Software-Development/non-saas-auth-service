import { ControllerBase } from '../../../../../../core/application/controller.base';
import { RequestResetPasswordUseCase } from './request-reset-password.usecase';
import { RequestResetPasswordDto } from './request-reset-password.dto';
export declare class RequestResetPasswordController extends ControllerBase {
    private readonly requestResetPasswordUseCase;
    constructor(requestResetPasswordUseCase: RequestResetPasswordUseCase);
    resetPassword(token: string, data: RequestResetPasswordDto): Promise<string | import("../../../../../../core/application/result").Result<unknown>>;
}
