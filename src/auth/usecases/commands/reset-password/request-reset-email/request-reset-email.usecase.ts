import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserRepositoryInterface } from '../../../../repositories/user.repository.interface';
import { Result } from '../../../../../core/application/result';
import { NotFoundException } from '../../../../../core/exceptions';
import { ResponseResetEmailDto } from './request-reset-email.dto';
import { emailProvider } from '../../../../providers/mailer/email.provider';
import { emailProviderInterface } from '../../../../providers/mailer/email.provider.interface';
import { User } from 'src/auth/database/providers/schema/user.schema';

@Injectable()
export class RequestResetEmailUseCase {
  constructor(
    @Inject('user-repository')
    private readonly userRepository: UserRepositoryInterface,
    @Inject('jwt-service')
    private readonly jwtService: JwtService,
    @Inject('email-provider')
    private readonly emailProvider: emailProviderInterface,
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

    const url = `Hi, Please follow this link to reset your password. This is valid for 10 minutes. <a href="http://localhost:${process.env.AUTH_URL}/reset-password/${token}">Click here</a>`;
    const data = {
      to: user.email,
      text: 'Hey User',
      from: 'Hey <abc@gmail.com>',
      subject: 'Forgot Password Link',
      html: url,
    };

    await this.emailProvider.sendMail(data);

    return Result.ok<any>({
      message: 'Token send to email successfully',
    });
  }
}
