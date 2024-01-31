"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Result = void 0;
class Result {
    constructor(isSuccess, error, value) {
        if (isSuccess && error)
            throw new Error('Internal Error');
        if (!isSuccess && !error)
            throw new Error('Internal Error');
        this.isSuccess = isSuccess;
        this.isFailure = !isSuccess;
        this.error = error;
        this._value = value;
    }
    get value() {
        return this._getValue();
    }
    static ok(value) {
        return new Result(true, undefined, value);
    }
    static fail(error) {
        return new Result(false, error);
    }
    _getValue() {
        if (!this.isSuccess) {
            throw new Error('Cant return value from a failure result');
        }
        return this._value;
    }
}
exports.Result = Result;
//# sourceMappingURL=result.js.map