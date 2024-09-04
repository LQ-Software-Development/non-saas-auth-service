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

  @ApiProperty({ type: Object, default: {} })
  metadata: Record<string, any>;
}
