import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ChangeParticipantPasswordDto {
    @ApiProperty({ description: 'ID do usuário (participant) cuja senha será alterada' })
    @IsString()
    @IsNotEmpty()
    userId: string;

    @ApiProperty({ description: 'Nova senha do participante', minLength: 6 })
    @IsString()
    @IsNotEmpty()
    @MinLength(6)
    newPassword: string;
}
