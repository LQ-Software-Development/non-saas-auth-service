import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class LoginUserDto {
  @ApiProperty({
    description: 'Email do Usuário',
    example: 'example@gmail.com',
    required: false,
  })
  @IsOptional()
  @IsEmail()
  email?: string;
  
  @ApiProperty({
    description: 'CPF ou CNPJ do Usuário',
    example: '12345678900',
    required: false,
  })
  @IsOptional()
  @IsString()
  document?: string;

  @ApiProperty({
    example: 'master',
    required: false,
  })
  @IsOptional()
  @IsString()
  role?: string; // Role não é usado no login service atual, mas mantendo por enquanto

  @ApiProperty({
    description: 'Senha do Usuário',
    example: '123456',
    required: true,
  })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({
    description: 'Telefone do Usuário',
    example: '12345678900',
    required: false,
  })
  @IsOptional()
  @IsString()
  phone?: string;
} 