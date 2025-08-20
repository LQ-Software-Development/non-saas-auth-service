import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateUserDto {
    @ApiProperty()
    name: string;

    @ApiPropertyOptional()
    email?: string;

    @ApiPropertyOptional()
    document?: string;

    @ApiPropertyOptional()
    phone?: string;

    @ApiProperty()
    password: string;

    @ApiProperty()
    metadata: Record<string, any>;

    @ApiPropertyOptional()
    organizationId?: string;
}
