import { Inject, Injectable } from '@nestjs/common';
import { ChangePasswordDto } from './change-user-password.dto';
import { UserRepositoryInterface } from '../../../repositories/user.repository.interface';
import { Result } from '../../../../core/application/result';
import { ForbiddenException } from '../../../../core/exceptions';
import * as bcrypt from 'bcrypt';
import { User } from 'src/auth/database/providers/schema/user.schema';

@Injectable()
export class ChangeUserPassowrdUseCase {
  constructor(
    @Inject('user-repository')
    private readonly userRepository: UserRepositoryInterface,
  ) {}

  async changePassword(data: ChangePasswordDto): Promise<any> {
    const user = (await this.userRepository.findByEmail(data.email)) as User & {
      id: string;
    };

    if (!user) {
      return Result.fail(new ForbiddenException('User existent'));
    }

    if (!bcrypt.compareSync(data.oldPassword, user.password)) {
      return Result.fail(new ForbiddenException('User of password incorrect'));
    }

    const newPasswordHash = bcrypt.hashSync(data.newPassword, 10);
    user.password = newPasswordHash;
    user.updatedAt = new Date();
    await this.userRepository.update(user.id, user);

    return Result.ok({
      message: 'Password changed successfully',
    });
  }
}
