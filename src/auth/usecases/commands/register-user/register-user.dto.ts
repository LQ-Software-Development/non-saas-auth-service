import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsPhoneNumber } from 'class-validator';

export class RegisterDto {
  @ApiProperty({
    description: 'CPF ou CNPJ do Usuário',
    example: '12345678900',
  })
  document: string;
  @ApiProperty({
    description: 'Nome do Usuário',
    example: 'John Doe',
  })
  name: string;
  @ApiProperty({
    description: 'Email do Usuário',
    example: 'jhondoe@dev.com',
  })
  email: string;
  @ApiProperty({
    description: 'Senha do Usuário',
    example: '123456',
  })
  password: string;

  @ApiProperty({
    description: 'Telefone do Usuário',
    example: '62999999999',
  })
  @IsPhoneNumber('BR')
  @IsOptional()
  phone: string;

  @ApiProperty({
    description: 'Metadados do Usuário',
    example: '{}',
  })
  @IsOptional()
  metadata: any;
}
