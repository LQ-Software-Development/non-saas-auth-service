import { ControllerBase } from "src/core/application/controller.base";
import { RequestResetEmailUseCase } from "./request-reset-email.usecase";
import { RequestResetEmailDto } from "./request-reset-email.dto";
export declare class RequestResetEmailController extends ControllerBase {
    private readonly requestResetEmailUseCase;
    constructor(requestResetEmailUseCase: RequestResetEmailUseCase);
    requestResetEmail(data: RequestResetEmailDto): Promise<any>;
}
