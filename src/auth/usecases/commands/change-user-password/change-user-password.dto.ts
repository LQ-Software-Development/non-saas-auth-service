import { ApiProperty } from '@nestjs/swagger';

export class ChangePasswordDto {
  @ApiProperty({
    description: 'Email do Usuário',
    example: 'jhondoe@dev.com',
  })
  email: string;
  @ApiProperty({
    description: 'Senha antiga do Usuário',
    example: '123456',
  })
  oldPassword: string;
  @ApiProperty({
    description: 'Nova senha do Usuário',
    example: 'Aa.123456',
  })
  newPassword: string;
}
