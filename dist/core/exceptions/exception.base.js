"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExceptionBase = void 0;
class ExceptionBase extends Error {
    constructor(message, cause, metadata) {
        super(message);
        this.message = message;
        this.cause = cause;
        this.metadata = metadata;
        Error.captureStackTrace(this, this.constructor);
    }
    toJSON() {
        return {
            message: this.message,
            code: this.code,
            stack: this.stack,
            cause: JSON.stringify(this.cause),
            metadata: this.metadata,
        };
    }
}
exports.ExceptionBase = ExceptionBase;
//# sourceMappingURL=exception.base.js.map