import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsBoolean,
    IsNotEmpty,
    IsNumber,
    IsObject,
    IsOptional,
    IsString,
    Min,
} from 'class-validator';
import { ParticipantPermissions } from '../../participants/types/permissions.type';

export class CreatePositionDto {
    @ApiProperty({
        description: 'Nome do cargo',
        example: 'Vendedor',
    })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiPropertyOptional({
        description: 'Descrição do cargo',
        example: 'Responsável por vendas e atendimento ao cliente',
    })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiPropertyOptional({
        description: 'Permissões do cargo',
        example: {
            participants: { read: true },
            organization: { read: true },
        },
    })
    @IsObject()
    @IsOptional()
    permissions?: ParticipantPermissions;

    @ApiPropertyOptional({
        description: 'Nível hierárquico (1 = mais alto)',
        example: 3,
        default: 1,
    })
    @IsNumber()
    @Min(1)
    @IsOptional()
    hierarchyLevel?: number;

    @ApiPropertyOptional({
        description: 'ID do cargo superior na hierarquia',
        example: '507f1f77bcf86cd799439011',
    })
    @IsString()
    @IsOptional()
    parentPositionId?: string;

    @ApiPropertyOptional({
        description: 'Se o cargo está ativo',
        example: true,
        default: true,
    })
    @IsBoolean()
    @IsOptional()
    active?: boolean;

    @ApiPropertyOptional({
        description: 'Metadados adicionais',
        example: { department: 'Comercial' },
    })
    @IsObject()
    @IsOptional()
    metadata?: Record<string, any>;

    /** Preenchido automaticamente pelo controller */
    organizationId?: string;
}
