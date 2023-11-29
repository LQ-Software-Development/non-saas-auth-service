import { ExceptionBase } from '../exceptions';
export declare class Result<T> {
    isSuccess: boolean;
    isFailure: boolean;
    error: ExceptionBase;
    private readonly _value?;
    constructor(isSuccess: boolean, error: ExceptionBase, value?: T);
    get value(): T;
    static ok<U>(value?: U): Result<U>;
    static fail<U>(error: ExceptionBase): Result<U>;
    private _getValue;
}
