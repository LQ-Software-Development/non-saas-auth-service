import { Result } from 'src/core/application/result';

export interface UserRepositoryInterface {
  create: (data: User) => Promise<Result<User>>;
  findByEmail: (email: string) => Promise<User>;
  findByDocument: (document: string) => Promise<User>;
  update: (data: User, id: string) => Promise<Result<User>>;
}

export interface User {
  name: string;
  email: string;
  document: string;
  password: string;
  id?: string;
}
