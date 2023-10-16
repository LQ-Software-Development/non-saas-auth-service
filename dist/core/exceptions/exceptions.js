"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InternalServerErrorException = exports.ForbiddenException = exports.NotFoundException = exports.ConflictException = exports.ArgumentOutOfRangeException = exports.ArgumentNotProvidedException = exports.ArgumentInvalidException = void 0;
const index_1 = require("./index");
const exception_base_1 = require("./exception.base");
class ArgumentInvalidException extends exception_base_1.ExceptionBase {
    constructor() {
        super(...arguments);
        this.code = index_1.ARGUMENT_INVALID;
    }
}
exports.ArgumentInvalidException = ArgumentInvalidException;
class ArgumentNotProvidedException extends exception_base_1.ExceptionBase {
    constructor() {
        super(...arguments);
        this.code = index_1.ARGUMENT_NOT_PROVIDED;
    }
}
exports.ArgumentNotProvidedException = ArgumentNotProvidedException;
class ArgumentOutOfRangeException extends exception_base_1.ExceptionBase {
    constructor() {
        super(...arguments);
        this.code = index_1.ARGUMENT_OUT_OF_RANGE;
    }
}
exports.ArgumentOutOfRangeException = ArgumentOutOfRangeException;
class ConflictException extends exception_base_1.ExceptionBase {
    constructor() {
        super(...arguments);
        this.code = index_1.CONFLICT;
    }
}
exports.ConflictException = ConflictException;
class NotFoundException extends exception_base_1.ExceptionBase {
    constructor(message = NotFoundException.message) {
        super(message);
        this.code = index_1.NOT_FOUND;
    }
}
exports.NotFoundException = NotFoundException;
NotFoundException.message = 'Not found';
class ForbiddenException extends exception_base_1.ExceptionBase {
    constructor(message = ForbiddenException.message) {
        super(message);
        this.code = index_1.UNAUTHORIZED;
    }
}
exports.ForbiddenException = ForbiddenException;
ForbiddenException.message = 'Forbidden';
class InternalServerErrorException extends exception_base_1.ExceptionBase {
    constructor(error) {
        super(InternalServerErrorException.message);
        this.code = index_1.INTERNAL_SERVER_ERROR;
        if (process.env.NODE_ENV === 'production')
            return;
        console.log(error);
    }
}
exports.InternalServerErrorException = InternalServerErrorException;
InternalServerErrorException.message = 'Internal server error';
//# sourceMappingURL=exceptions.js.map