import { Injectable, Inject } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

import * as bcrypt from 'bcrypt';

import { Result } from '../../../../core/application/result';
import { ForbiddenException } from '../../../../core/exceptions';
import { User } from '../../../database/providers/schema/user.schema';
import { UserRepositoryInterface } from '../../../repositories/user.repository.interface';
import { RegisterDto } from './register-user.dto';

@Injectable()
export class RegisterUserUseCase {
  constructor(
    @Inject('user-repository')
    private readonly userRepository: UserRepositoryInterface,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async register(data: RegisterDto): Promise<Result<User>> {
    if (data.document) {
      const userDocumentExists = await this.userRepository.findByDocument(
        data.document,
      );

      if (userDocumentExists) {
        return Result.fail(new ForbiddenException('User existent'));
      }
    }

    if (data.email) {
      const userEmailExists = await this.userRepository.findByEmail(data.email);

      if (userEmailExists) {
        return Result.fail(new ForbiddenException('User existent'));
      }
    }

    const passwordHash = bcrypt.hashSync(data.password, 10);

    const emailToken = Math.floor(100000 + Math.random() * 900000).toString();

    const user = await this.userRepository.create({
      ...data,
      emailToken,
      password: passwordHash,
    });

    if (user.isFailure) {
      return Result.fail(new ForbiddenException('User existent'));
    }

    this.eventEmitter.emit('users.created', user.value);

    return user;
  }
}
