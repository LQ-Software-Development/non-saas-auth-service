import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

export enum DuplicateFields {
  PHONE = 'phone',
  DOCUMENT = 'document',
}

export class UpdateUserDto {
  @ApiProperty()
  name: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  phone?: string;

  @ApiProperty()
  document?: string;
}

export class UpdateUserOptionsDto {
  @IsEnum(DuplicateFields, { each: true })
  findDuplicates?: string;
}
