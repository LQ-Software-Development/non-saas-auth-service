import { Inject, Injectable } from '@nestjs/common';
import { UserRepositoryInterface } from 'src/apps/auth/repositories/user.repository.interface';
import { Result } from 'src/core/application/result';
import {
  RequestResetEmailDto,
  ResponseResetEmailDto,
} from './request-reset-email.dto';
import { NotFoundException } from 'src/core/exceptions';
import { JwtService } from '@nestjs/jwt';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class RequestResetEmailUseCase {
  constructor(
    @Inject('user-repository')
    private readonly userRepository: UserRepositoryInterface,
    @Inject('jwt-service')
    private readonly jwtService: JwtService,
    @Inject('email-provider') private readonly mailerService: MailerService,
  ) {}

  async requestResetEmail(
    email: string,
  ): Promise<Result<ResponseResetEmailDto>> {
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      return Result.fail(new NotFoundException('User not found'));
    }

    const token = this.jwtService.sign(
      {
        sub: user.id,
      },
      {
        expiresIn: '30m',
      },
    );

    const url = `Hi, Please follow this link to reset your password. This is valid for 10 minutes. <a href="http://localhost:${process.env.AUTH_URL}/reset-password/${token}">Click here</a>`;
    const data = {
      to: email,
      text: "Hey User",
      from: 'Hey <abc@gmail.com>',
      subject: "Forgot Password Link",
      html: url,
    };
    console.log(data);
    await this.mailerService.sendMail(data);

    return Result.ok<ResponseResetEmailDto>({ token: token });
  }
}
