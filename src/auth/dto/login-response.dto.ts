import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Types } from 'mongoose';

// Interface interna (pode ser removida ou mantida para referência)
// interface OrganizationAccessFormat {
//   id: string;
//   name: string;
//   externalId?: string;
//   metadata?: Record<string, any>;
//   createdAt: Date;
//   updatedAt: Date;
//   participantId?: Types.ObjectId;
//   role: string;
//   accessMetadata?: Record<string, any>;
// }

// DTO para representar um item na lista de acessos
class AccessDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiPropertyOptional()
  externalId?: string;

  @ApiPropertyOptional()
  metadata?: Record<string, any>;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiPropertyOptional({ type: String }) // ObjectId serializado como string
  participantId?: Types.ObjectId;

  @ApiProperty()
  role: string;

  @ApiPropertyOptional()
  accessMetadata?: Record<string, any>;
}

// DTO para a resposta completa do login bem-sucedido
export class LoginResponseDto {
  @ApiProperty({ description: 'Token JWT de acesso' })
  token: string;

  @ApiProperty({ description: 'ID do usuário logado' })
  userId: string;

  @ApiProperty({ description: 'Nome do usuário logado' })
  name: string;

  @ApiProperty({ description: 'Status de verificação do e-mail' })
  verifiedEmail: boolean;

  @ApiPropertyOptional({ description: 'Telefone do usuário' })
  phone?: string;

  @ApiPropertyOptional({ description: 'Documento do usuário' })
  document?: string;

  @ApiProperty({ type: [AccessDto], description: 'Lista de acessos a organizações' })
  accesses: AccessDto[];
} 