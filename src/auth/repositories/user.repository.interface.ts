import { Result } from '../../core/application/result';
import { User } from '../database/providers/schema/user.schema';

export interface UserRepositoryInterface {
  create: (data: User) => Promise<Result<User>>;
  findByEmail: (email: string) => Promise<User>;
  findByDocument: (document: string) => Promise<User>;
  update: (id: string, data: Partial<User>) => Promise<Result<User>>;
  findById: (id: string) => Promise<Result<User>>;
}
