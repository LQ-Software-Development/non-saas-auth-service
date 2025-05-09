import { ApiProperty } from '@nestjs/swagger';

export class OrganizationAccessFormatDto {
  @ApiProperty({ description: 'ID da organização' })
  id: string;

  @ApiProperty({ description: 'Nome da organização' })
  name: string;

  @ApiProperty({ description: 'External ID da organização', required: false })
  externalId?: string;

  @ApiProperty({ type: Object, description: 'Metadata da organização', required: false })
  metadata?: Record<string, any>;

  @ApiProperty({ description: 'Data de criação da organização' })
  createdAt: Date;

  @ApiProperty({ description: 'Data de atualização da organização' })
  updatedAt: Date;

  @ApiProperty({ description: 'ID do participante', required: false })
  participantId?: string;

  @ApiProperty({ description: 'Papel do usuário na organização' })
  role: string;

  @ApiProperty({ type: Object, description: 'Metadata de acesso do participante', required: false })
  accessMetadata?: Record<string, any>;
} 