import { ApiProperty } from '@nestjs/swagger';

export class RequestResetPasswordDto {
  @ApiProperty({
    description: 'Nova senha do Usuário',
    example: 'Aa.123456',
  })
  newPassword: string;
}
