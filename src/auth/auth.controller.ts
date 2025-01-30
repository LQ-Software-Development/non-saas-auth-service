import { Controller, Post, Put, Request, UseGuards } from '@nestjs/common';
import { RefreshTokenInfoService } from './services/refresh-token-info.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ResendEmailVerificationService } from './services/resend-email-verification.service';

@ApiTags('Autenticação')
@ApiBearerAuth()
@Controller('auth')
export class AuthController {
  constructor(
    private readonly refreshTokenInfoService: RefreshTokenInfoService,
    private readonly resendEmailVerificationService: ResendEmailVerificationService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post('refresh-token-info')
  async refreshTokenInfo(@Request() req: any) {
    return this.refreshTokenInfoService.execute(req.user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Put('email-verification')
  async resendEmailVerification(@Request() req: any) {
    return this.resendEmailVerificationService.execute(req.user.sub);
  }
}
