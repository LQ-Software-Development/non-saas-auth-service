import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class GenerateApplicationKeyDto {
    @ApiProperty({ description: 'ID da organização para gerar a application-key' })
    @IsString()
    @IsNotEmpty()
    organizationId: string;
}
