import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { randomUUID } from 'crypto';

export class CreateOrganizationDto {
  @ApiProperty({ example: 'ACME Corp.' })
  name: string;

  @ApiProperty({
    example: {
      companyAvatar: 'https://example.com/avatar.jpg',
      companyBanner: 'https://example.com/banner.jpg',
      otherValue: 'otherValue',
    },
  })
  metadata: Record<string, any>;

  @ApiPropertyOptional({ default: true })
  active?: boolean;

  ownerId?: string;
}
