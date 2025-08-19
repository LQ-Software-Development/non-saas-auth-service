import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
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
  
  @ApiPropertyOptional({
    description: 'CPF ou CNPJ do Usuário',
    example: '12345678900',
    required: false,
  })
  @IsOptional()
  @IsString()
  document?: string;

    @ApiPropertyOptional({
    description: 'Telefone do Usuário',
    example: '12345678900',
    required: false,
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({
    description: 'Senha do Usuário',
    example: '123456',
    required: true,
  })
  @IsString()
  @MinLength(6)
  password: string;



  @ApiPropertyOptional({
    description: 'Faz o login retornar sem metadados'
  })
  @IsOptional()
  noMetadataOnToken?: boolean;
}
