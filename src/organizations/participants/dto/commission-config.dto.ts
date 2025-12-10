import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNumber,
  IsBoolean,
  IsString,
  IsObject,
  ValidateNested,
  ValidateIf,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  CommissionType,
  CalculationBase,
} from '../interfaces/commission-config.interface';

class CommissionRulesDto {
  @ApiPropertyOptional({
    description: 'Base for commission calculation',
    enum: CalculationBase,
    example: CalculationBase.PAID_SALE,
  })
  @ValidateIf((o) => o.calculationBase !== undefined)
  @IsEnum(CalculationBase)
  calculationBase?: CalculationBase;

  @ApiPropertyOptional({
    description: 'Whether to deduct Asaas fees from commission',
    example: false,
  })
  @ValidateIf((o) => o.deductAsaasFees !== undefined)
  @IsBoolean()
  deductAsaasFees?: boolean;

  @ApiPropertyOptional({
    description: 'Whether to transfer client after inactivation',
    example: true,
  })
  @ValidateIf((o) => o.transferClientAfterInactivation !== undefined)
  @IsBoolean()
  transferClientAfterInactivation?: boolean;

  @ApiPropertyOptional({
    description: 'Whether to notify before inactivation',
    example: false,
  })
  @ValidateIf((o) => o.notifyBeforeInactivation !== undefined)
  @IsBoolean()
  notifyBeforeInactivation?: boolean;
}

class PaymentInfoDto {
  @ApiPropertyOptional({
    description: 'Payment account identifier',
    example: '12345678900',
  })
  @ValidateIf((o) => o.account !== undefined)
  @IsString()
  account?: string;

  @ApiPropertyOptional({
    description: 'Payment gateway name',
    example: 'asaas',
  })
  @ValidateIf((o) => o.gateway !== undefined)
  @IsString()
  gateway?: string;
}

export class CommissionConfigDto {
  @ApiPropertyOptional({
    description: 'Type of commission (percentage or fixed)',
    enum: CommissionType,
    example: CommissionType.PERCENTAGE,
    default: CommissionType.PERCENTAGE,
  })
  @ValidateIf((o) => o.type !== undefined)
  @IsEnum(CommissionType)
  type?: CommissionType;

  @ApiPropertyOptional({
    description: 'Base commission value',
    example: 12,
  })
  @ValidateIf((o) => o.baseCommission !== undefined)
  @IsNumber()
  baseCommission?: number;

  @ApiPropertyOptional({
    description: 'Commission for new clients',
    example: 15,
  })
  @ValidateIf((o) => o.newClientCommission !== undefined)
  @IsNumber()
  newClientCommission?: number;

  @ApiPropertyOptional({
    description: 'Commission calculation rules',
    type: CommissionRulesDto,
  })
  @ValidateIf((o) => o.rules !== undefined)
  @IsObject()
  @ValidateNested()
  @Type(() => CommissionRulesDto)
  rules?: CommissionRulesDto;

  @ApiPropertyOptional({
    description: 'Payment information',
    type: PaymentInfoDto,
  })
  @ValidateIf((o) => o.paymentInfo !== undefined)
  @IsObject()
  @ValidateNested()
  @Type(() => PaymentInfoDto)
  paymentInfo?: PaymentInfoDto;

  @ApiPropertyOptional({
    description: 'Penalty amount',
    example: 100,
  })
  @ValidateIf((o) => o.penalties !== undefined)
  @IsNumber()
  penalties?: number;
}
