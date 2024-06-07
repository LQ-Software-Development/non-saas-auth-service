import { Inject, Injectable } from '@nestjs/common';
import {
  User,
  UserRepositoryInterface,
} from '../../../repositories/user.repository.interface';
import { Result } from '../../../../core/application/result';
import { ForbiddenException } from '../../../../core/exceptions';
import { UpdateUserDto } from './update-user.dto';

@Injectable()
export class UpdateUserUseCase {
  constructor(
    @Inject('user-repository')
    private readonly userRepository: UserRepositoryInterface,
  ) {}

  async update(id: string, data: UpdateUserDto): Promise<Result<User>> {
    const user = (await this.userRepository.findById(id)).value;
    if (!user) {
      return Result.fail(new ForbiddenException('User not found'));
    }
    user.email = data.email;
    user.name = data.name;
    user.updatedAt = new Date();
    const updatedUserOrError = await this.userRepository.update(id, user);
    if (updatedUserOrError.isFailure) {
      return Result.fail(updatedUserOrError.error);
    }
    return Result.ok(updatedUserOrError).value;
  }
}
