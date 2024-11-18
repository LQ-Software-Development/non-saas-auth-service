import { Controller, Post, Request, UseGuards } from '@nestjs/common';
import { RefreshTokenInfoService } from './services/refresh-token-info.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Autenticação')
@ApiBearerAuth()
@Controller('auth')
export class AuthController {
  constructor(
    private readonly refreshTokenInfoService: RefreshTokenInfoService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post('refresh-token-info')
  async refreshTokenInfo(@Request() req: any) {
    return this.refreshTokenInfoService.execute(req.user.sub);
  }
}
