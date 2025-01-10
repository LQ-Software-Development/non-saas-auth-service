import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';

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
}
