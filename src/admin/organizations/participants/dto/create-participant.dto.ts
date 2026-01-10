import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsObject } from 'class-validator';

export class CreateParticipantDto {
  @ApiProperty({
    description: 'The name of the participant',
    example: 'John Doe',
  })
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'The email of the participant',
    example: 'john.doe@example.com',
  })
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'The phone of the participant',
    example: '62999913545',
  })
  @IsNotEmpty()
  phone: string;

  @ApiProperty({
    description: 'The organization id of the participant',
    example: '1234567890',
  })
  @IsNotEmpty()
  organizationId: string;

  @ApiProperty({
    description: 'The document of the participant',
    example: '94113541060',
  })
  @IsNotEmpty()
  document: string;

  @ApiProperty({
    description: 'The role of the participant',
    example: 'admin',
  })
  @IsOptional()
  role: string;

  @ApiPropertyOptional({
    description: 'Metadata of the participant, including optional commission configuration',
    example: {
      commissionConfig: {
        type: 'percentage',
        baseCommission: 12,
        newClientCommission: 15,
        rules: {
          calculationBase: 'paid_sale',
          deductAsaasFees: false,
          transferClientAfterInactivation: true,
          notifyBeforeInactivation: false,
        },
        paymentInfo: {
          account: '12345678900',
          gateway: 'asaas',
        },
      },
    },
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
