import { Inject, Injectable } from "@nestjs/common";
import { UserRepositoryInterface } from "src/apps/auth/repositories/user.repository.interface";
import { Result } from "src/core/application/result";
import { RequestResetEmailDto, ResponseResetEmailDto } from "./request-reset-email.dto";
import { NotFoundException } from "src/core/exceptions";
import { JwtService } from "@nestjs/jwt";
import exp from "constants";

@Injectable()
export class RequestResetEmailUseCase {
  constructor(
    @Inject('user-repository')
    private readonly userRepository: UserRepositoryInterface,
    @Inject('jwt-service')
    private readonly jwtService: JwtService
  ) {}

  async requestResetEmail(email: string): Promise<Result<ResponseResetEmailDto>> {
    let user = await this.userRepository.findByEmail(email);

    if(!user){
      return Result.fail(new NotFoundException('User not found'))
    }

    const token = this.jwtService.sign(
      {
        sub: user.id
      },
      {
        expiresIn: '30m'
      }
    );

    console.log('SEND EMAIL');

    return Result.ok<ResponseResetEmailDto>({ token: token })


  }
}