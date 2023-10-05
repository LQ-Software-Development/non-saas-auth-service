import { Inject, Injectable } from '@nestjs/common';
import { UserRepositoryInterface } from '../user.repository..interface';
import { Result } from 'src/core/application/result';
import {
  User,
  UserSchemaInterface,
} from '../../database/providers/schema/user.schema';
import { Model } from 'mongoose';

@Injectable()
export class UserRepository implements UserRepositoryInterface {
  constructor(
    @Inject('AUTH_USER_MODEL')
    private readonly userModel: Model<UserSchemaInterface>,
  ) {}

  async create(data: User): Promise<Result<User>> {
    const user = (await this.userModel.create(data)).toObject();
    return Result.ok(user);
  }
  async findByEmail(email: string): Promise<User> {
    const user = await this.userModel.findOne({ email: email });
    return user;
  }
  async findByDocument(document: string): Promise<User> {
    const user = await this.userModel.findOne({ document: document });
    if (!user) return null;
    return user;
  }
  async update(data: User, id: string): Promise<Result<User>> {
    const user = await this.userModel.findByIdAndUpdate(id, data, {
      new: true,
    });
    return Result.ok(user);
  }
}
