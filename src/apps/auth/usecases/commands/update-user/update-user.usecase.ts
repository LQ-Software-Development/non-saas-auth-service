import { Inject, Injectable } from '@nestjs/common';
import { User } from 'src/apps/auth/database/providers/schema/user.schema';
import { UserRepositoryInterface } from 'src/apps/auth/repositories/user.repository.interface';
import { Result } from 'src/core/application/result';
import { ForbiddenException } from 'src/core/exceptions';
import { UpdateUserDto } from './update-user.dto';

@Injectable()
export class UpdateUserUseCase {
  constructor(
    @Inject('user-repository')
    private readonly userRepository: UserRepositoryInterface,
  ) {}

  async update(id: string, data: UpdateUserDto): Promise<Result<User>> {
    let user = (await this.userRepository.findById(id)).value;
    if (!user) {
      return Result.fail(new ForbiddenException('User not found'));
    }
    user = {
      ...user,
      ...data,
    };
    const updatedUserOrError = await this.userRepository.update(user, id);
    if (updatedUserOrError.isFailure) {
      return Result.fail(updatedUserOrError.error);
    }
    return Result.ok(updatedUserOrError).value;
  }
}
