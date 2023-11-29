export type AggregateID = string | number;
export interface BaseEntityProps {
    id: AggregateID;
    createdAt: Date;
    updatedAt: Date;
}
export interface CreateEntityProps<T> {
    id: AggregateID;
    props: T;
    createdAt?: Date;
    updatedAt?: Date;
}
export declare abstract class Entity<EntityProps> {
    protected readonly props: EntityProps;
    private readonly _createdAt;
    constructor({ id, createdAt, updatedAt, props, }: CreateEntityProps<EntityProps>);
    private _updatedAt;
    get updatedAt(): Date;
    set updatedAt(value: Date);
    protected abstract _id: AggregateID;
    get id(): AggregateID;
    get createdAt(): Date;
    static isEntity(entity: unknown): entity is Entity<unknown>;
    equals(object?: Entity<EntityProps>): boolean;
    getPropsCopy(): EntityProps & BaseEntityProps;
    abstract validate(): void;
    private setId;
    private validateProps;
}
