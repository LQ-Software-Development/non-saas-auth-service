import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateParticipantDto {
  @ApiProperty({
    description: 'Internal name of the participant',
    example: 'John Doe',
  })
  name: string;

  @ApiProperty({
    description: 'Role of the participant',
    example: 'admin',
  })
  role: string;

  @ApiPropertyOptional({
    description: 'Document of the participant',
    example: '12345678900',
  })
  document: string;

  @ApiPropertyOptional({
    description: 'Email of the participant',
    example: 'johndoe@dev.com',
  })
  email: string;

  organizationId: string;

  @ApiPropertyOptional({
    description: 'ID do cargo (Position) vinculado ao participante',
    example: '507f1f77bcf86cd799439011',
  })
  positionId?: string;

  @ApiPropertyOptional({
    description: 'Metadata of the participant',
    example: { key: 'value' },
  })
  metadata: Record<string, any>;
}
