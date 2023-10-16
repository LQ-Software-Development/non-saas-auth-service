export type Primitives = string | number | boolean;
export interface DomainPrimitive<T extends Primitives | Date> {
    value: T;
}
type ValueObjectProps<T> = T extends Primitives | Date ? DomainPrimitive<T> : T;
export declare abstract class ValueObject<T> {
    protected readonly props: ValueObjectProps<T>;
    constructor(props: ValueObjectProps<T>);
    static isValueObject(obj: unknown): obj is ValueObject<unknown>;
    equals(vo?: ValueObject<T>): boolean;
    unpack(): T;
    protected abstract validate(props: ValueObjectProps<T>): void;
    private checkIfEmpty;
    private isDomainPrimitive;
}
export {};
