import { ControllerBase } from '../../../../../core/application/controller.base';
import { UpdateUserUseCase } from './update-user.usecase';
import { UpdateUserDto } from './update-user.dto';
export declare class UpdateUserController extends ControllerBase {
    private readonly userUpdateUseCase;
    constructor(userUpdateUseCase: UpdateUserUseCase);
    update(id: string, data: UpdateUserDto): Promise<void | import("../../../repositories/user.repository.interface").User>;
}
