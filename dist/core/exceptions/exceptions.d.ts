import { ExceptionBase } from './exception.base';
export declare class ArgumentInvalidException extends ExceptionBase {
    readonly code = "GENERIC.ARGUMENT_INVALID";
}
export declare class ArgumentNotProvidedException extends ExceptionBase {
    readonly code = "GENERIC.ARGUMENT_NOT_PROVIDED";
}
export declare class ArgumentOutOfRangeException extends ExceptionBase {
    readonly code = "GENERIC.ARGUMENT_OUT_OF_RANGE";
}
export declare class ConflictException extends ExceptionBase {
    readonly code = "GENERIC.CONFLICT";
}
export declare class NotFoundException extends ExceptionBase {
    static readonly message = "Not found";
    readonly code = "GENERIC.NOT_FOUND";
    constructor(message?: string);
}
export declare class ForbiddenException extends ExceptionBase {
    static readonly message = "Forbidden";
    readonly code = "GENERIC.UNAUTHORIZED";
    constructor(message?: string);
}
export declare class InternalServerErrorException extends ExceptionBase {
    static readonly message = "Internal server error";
    readonly code = "GENERIC.INTERNAL_SERVER_ERROR";
    constructor(error: any);
}
