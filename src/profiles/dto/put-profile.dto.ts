import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class PutProfileDto {
    @ApiProperty()
    name: string;
    @ApiPropertyOptional()
    metadata: Record<string, any>;

    // Headers
    userId: string;
    organizationId?: string;

    // Fields to exclude
    permissions?: Record<string, any>;
    role?: string;
}
