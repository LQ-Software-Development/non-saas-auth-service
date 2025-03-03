import { ApiProperty } from '@nestjs/swagger';

export class LoginUserDto {
  @ApiProperty({
    description: 'Email do Usuário',
    example: 'example@gmail.com',
  })
  email: string;
  
  @ApiProperty({
    description: 'CPF ou CNPJ do Usuário',
    example: '12345678900',
  })
  document: string;

  @ApiProperty({
    example: 'master',
  })
  role: string;

  @ApiProperty({
    description: 'Senha do Usuário',
    example: '123456',
  })
  password: string;

  @ApiProperty({
    description: 'Telefone do Usuário',
    example: '12345678900',
  })
  phone: string;
}
