import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserRepositoryInterface } from '../../../../repositories/user.repository.interface';
import { Result } from '../../../../../core/application/result';
import { NotFoundException } from '../../../../../core/exceptions';
import { User } from 'src/auth/database/providers/schema/user.schema';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class RequestResetEmailUseCase {
  constructor(
    @Inject('user-repository')
    private readonly userRepository: UserRepositoryInterface,
    @Inject('jwt-service')
    private readonly jwtService: JwtService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async requestResetEmail(email: string): Promise<Result<any>> {
    const user = (await this.userRepository.findByEmail(email)) as User & {
      id: string;
    };

    if (!user) {
      return Result.fail(new NotFoundException('User not found'));
    }

    const token = this.jwtService.sign(
      {
        sub: user.id,
      },
      {
        expiresIn: '15m',
      },
    );

    this.eventEmitter.emit('users.request-password-reset', { user, token });

    return Result.ok<any>({
      message: 'Token send to email successfully',
    });
  }
}
