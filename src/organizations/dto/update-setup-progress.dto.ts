import { ApiProperty } from '@nestjs/swagger';
import { IsObject, IsString, IsBoolean, IsOptional } from 'class-validator';

export class UpdateSetupProgressDto {
  @ApiProperty({
    description: 'Chave do passo completado (ex: "first_client", "first_sale")',
  })
  @IsString()
  stepKey: string;

  @ApiProperty({ description: 'Se o passo foi completado', default: true })
  @IsBoolean()
  @IsOptional()
  completed?: boolean;
}
