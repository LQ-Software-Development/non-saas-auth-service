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

  @ApiPropertyOptional({
    description: 'Configuracoes de marca para emails e comunicacao.',
    example: {
      appName: 'Villa Joias',
      logoUrl: 'https://example.com/logo.png',
      primaryColor: '#111111',
      backgroundColor: '#FFFFFF',
      footerText: 'Equipe Villa Joias',
    },
  })
  branding?: {
    appName?: string;
    logoUrl?: string;
    primaryColor?: string;
    backgroundColor?: string;
    footerText?: string;
  };

  @ApiPropertyOptional({
    description: 'Habilita criacao automatica de usuario customer via eventos.',
    default: false,
  })
  customerUserIntegrationEnabled?: boolean;

  @ApiPropertyOptional({ default: true })
  active?: boolean;

  ownerId?: string;
}
