import { ApiProperty } from "@nestjs/swagger";

export class RequestResetEmailDto {
  @ApiProperty()
  email: string;
}

export class ResponseResetEmailDto {
  token: string;
}