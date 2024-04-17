import { Injectable, Inject } from '@nestjs/common';
import { Result } from '../../../../../core/application/result';
import { ForbiddenException } from '../../../../../core/exceptions';
import { RegisterDto } from './register-user.dto';
import { User } from '../../../../../apps/auth/database/providers/schema/user.schema';
import { UserRepositoryInterface } from '../../../../../apps/auth/repositories/user.repository.interface';
import * as bcrypt from 'bcrypt';

@Injectable()
export class RegisterUserUseCase {
  constructor(
    @Inject('user-repository')
    private readonly userRepository: UserRepositoryInterface,
  ) {}

  async register(data: RegisterDto): Promise<Result<User>> {
    if (data.document) {
      const userExists = await this.userRepository.findByDocument(data.document);

      if (userExists) {
        return Result.fail(new ForbiddenException('User existent'));
      }
    }

    const passwordHash = bcrypt.hashSync(data.password, 10);

    const user = await this.userRepository.create({
      ...data,
      password: passwordHash,
    });

    if (user.isFailure) {
      return Result.fail(new ForbiddenException('User existent'));
    }

    return user;
  }
}
