import { Inject, Injectable } from '@nestjs/common';
import { User } from 'src/auth/database/providers/schema/user.schema';
import { UserRepositoryInterface } from 'src/auth/repositories/user.repository.interface';
import { Result } from 'src/core/application/result';
import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from 'src/core/exceptions';

@Injectable()
export class VerifyUserEmailUseCase {
  constructor(
    @Inject('user-repository')
    private readonly userRepository: UserRepositoryInterface,
  ) {}

  async execute(userId: string, emailToken: string): Promise<Result<User>> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      return Result.fail<User>(new NotFoundException('User not found'));
    }

    if (user.value.verifiedEmail) {
      return Result.fail<User>(
        new ConflictException('User email already verified'),
      );
    }

    if (user.value.emailToken !== emailToken) {
      return Result.fail<User>(
        new ForbiddenException('User email token incorrect'),
      );
    }

    return this.userRepository.update(userId, {
      verifiedEmail: true,
    });
  }
}
