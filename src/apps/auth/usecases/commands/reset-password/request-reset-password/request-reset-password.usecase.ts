import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserRepositoryInterface } from 'src/apps/auth/repositories/user.repository.interface';
import { Result } from 'src/core/application/result';
import { ForbiddenException, NotFoundException } from 'src/core/exceptions';
import { RequestResetPasswordDto } from './request-reset-password.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class RequestResetPasswordUseCase {
  constructor(
    @Inject('user-repository')
    private readonly userRepository: UserRepositoryInterface,
    @Inject('jwt-service')
    private readonly jwtService: JwtService,
  ) {}

  async resetPassword(data: RequestResetPasswordDto, token: string) {
    try {
      await this.jwtService.verify(token).exp;
      const userId = await this.jwtService.decode(token).sub;
      const user = (await this.userRepository.findById(userId)).value;

      if (!user) {
        return Result.fail(new NotFoundException('User existent'));
      }

      const newPasswordHash = bcrypt.hashSync(data.newPassword, 10);
      user.password = newPasswordHash;
      user.updatedAt = new Date();

      await this.userRepository.update(user.id, user);

      return Result.ok({
        message: 'Password changed successfully',
      });
    } catch (error) {
      console.error(error);
      return Result.fail(new ForbiddenException('Token invalid or expired.'))
        .error.message;
    }
  }
}
