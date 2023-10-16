import { UserRepositoryInterface } from '../user.repository..interface';
import { Result } from 'src/core/application/result';
import { User, UserSchemaInterface } from '../../database/providers/schema/user.schema';
import { Model } from 'mongoose';
export declare class UserRepository implements UserRepositoryInterface {
    private readonly userModel;
    constructor(userModel: Model<UserSchemaInterface>);
    create(data: User): Promise<Result<User>>;
    findByEmail(email: string): Promise<User>;
    findByDocument(document: string): Promise<User>;
    update(data: User, id: string): Promise<Result<User>>;
}
