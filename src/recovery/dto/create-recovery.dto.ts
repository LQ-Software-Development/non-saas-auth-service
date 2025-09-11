import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty } from "class-validator";

export class CreateRecoveryDto {
    @ApiProperty()
    @IsNotEmpty()
    @IsEmail()
    email: string;
}
