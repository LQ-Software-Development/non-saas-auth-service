import { ApiProperty } from '@nestjs/swagger';
import { OrganizationAccessFormatDto } from './organization-access-format.dto';

export class GetUserResponseDto {
  @ApiProperty({ description: 'ID do usuário' })
  userId: string;

  @ApiProperty({ description: 'Nome do usuário' })
  name: string;

  @ApiProperty({ description: 'Indica se o e-mail foi verificado' })
  verifiedEmail: boolean;

  @ApiProperty({ description: 'Número de telefone do usuário', required: false })
  phone?: string;

  @ApiProperty({ description: 'Documento do usuário', required: false })
  document?: string;

  @ApiProperty({ description: 'Índice sequencial do usuário', required: false })
  index?: number;

  @ApiProperty({ type: [OrganizationAccessFormatDto], description: 'Acessos do usuário às organizações' })
  accesses: OrganizationAccessFormatDto[];
} 