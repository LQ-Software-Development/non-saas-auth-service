import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserRepositoryInterface } from '../../../repositories/user.repository.interface';
import { LoginUserDto } from './login-user.dto';
import { Result } from '../../../../core/application/result';
import { ForbiddenException } from '../../../../core/exceptions';
import * as bcrypt from 'bcrypt';

@Injectable()
export class LoginUserUseCase {
  constructor(
    @Inject('user-repository')
    private readonly userRepository: UserRepositoryInterface,
    @Inject('jwt-service') private readonly jwtService: JwtService,
  ) {}

  async login(
    data: LoginUserDto,
  ): Promise<Result<{ token: string; userId: string }>> {
    const { document, password, email } = data;

    if (email) {
      const userByEmail = await this.userRepository.findByEmail(email);
      if (!userByEmail) {
        return Result.fail(new ForbiddenException('User email incorrect'));
      }
      if (!bcrypt.compareSync(password, userByEmail.password)) {
        return Result.fail(
          new ForbiddenException('User or password incorrect'),
        );
      }
      const token = this.jwtService.sign({ sub: userByEmail.id });

      return Result.ok({ token, userId: userByEmail.id });
    } else {
      const user = await this.userRepository.findByDocument(document);
      if (!user) {
        return Result.fail(new ForbiddenException('User document incorrect'));
      }
      if (!bcrypt.compareSync(password, user.password)) {
        return Result.fail(
          new ForbiddenException('User or password incorrect'),
        );
      }
      const token = this.jwtService.sign({ sub: user.id });

      return Result.ok({ token, userId: user.id });
    }
  }
}
