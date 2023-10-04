import { Injectable, Inject } from '@nestjs/common';
import { Result } from 'src/core/application/result';
import { ForbiddenException } from 'src/core/exceptions';
import { RegisterDto } from './register-user.dto';
import { User } from 'src/apps/auth/database/providers/schema/user.schema';
import { UserRepositoryInterface } from 'src/apps/auth/repositories/user.repository..interface';
import * as bcrypt from 'bcrypt';

@Injectable()
export class RegisterUserUseCase {
  constructor(
    @Inject('user-repository')
    private readonly userRepository: UserRepositoryInterface,
  ) {}

  async register(data: RegisterDto): Promise<Result<User>> {
    const userExists = await this.userRepository.findByDocument(data.document);

    if (userExists) {
      return Result.fail(new ForbiddenException('User existent'));
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
