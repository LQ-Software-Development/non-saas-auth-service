export enum CommissionType {
  PERCENTAGE = 'percentage',
  FIXED = 'fixed',
}

export enum CalculationBase {
  PAID_SALE = 'paid_sale',
  TOTAL_SALE = 'total_sale',
}

export interface CommissionRules {
  calculationBase: CalculationBase;
  deductAsaasFees: boolean;
  transferClientAfterInactivation: boolean;
  notifyBeforeInactivation: boolean;
}

export interface PaymentInfo {
  account: string;
  gateway: string;
}

export interface CommissionConfig {
  type: CommissionType;
  baseCommission: number;
  newClientCommission: number;
  rules: CommissionRules;
  paymentInfo?: PaymentInfo;
  penalties?: number;
}
