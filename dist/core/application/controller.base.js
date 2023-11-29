"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ControllerBase = void 0;
const exceptions_1 = require("../exceptions");
const common_1 = require("@nestjs/common");
class ControllerBase {
    handleErrorResponse(exception) {
        switch (exception.code) {
            case exceptions_1.ARGUMENT_NOT_PROVIDED:
                throw new common_1.BadRequestException(exception.message);
            case exceptions_1.ARGUMENT_OUT_OF_RANGE:
                throw new common_1.BadRequestException(exception.message);
            case exceptions_1.ARGUMENT_INVALID:
                throw new common_1.BadRequestException(exception.message);
            case exceptions_1.NOT_FOUND:
                throw new common_1.NotFoundException(exception.message);
            case exceptions_1.UNAUTHORIZED:
                throw new common_1.ForbiddenException(exception.message);
            case exceptions_1.CONFLICT:
                throw new common_1.ConflictException(exception.message);
            default:
                throw new common_1.InternalServerErrorException(exception.message);
        }
    }
}
exports.ControllerBase = ControllerBase;
//# sourceMappingURL=controller.base.js.map