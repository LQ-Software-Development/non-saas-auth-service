import {
  CommissionType,
  CalculationBase,
  CommissionConfig,
} from '../interfaces/commission-config.interface';

export function applyCommissionDefaults(
  metadata?: Record<string, any>,
): Record<string, any> | undefined {
  if (!metadata) {
    return undefined;
  }

  if (!metadata.commissionConfig) {
    return metadata;
  }

  const commissionConfig = metadata.commissionConfig;

  const defaultedConfig: Partial<CommissionConfig> = {
    type: commissionConfig.type ?? CommissionType.PERCENTAGE,
    baseCommission: commissionConfig.baseCommission,
    newClientCommission: commissionConfig.newClientCommission,
    rules: {
      calculationBase:
        commissionConfig.rules?.calculationBase ?? CalculationBase.PAID_SALE,
      deductAsaasFees: commissionConfig.rules?.deductAsaasFees ?? false,
      transferClientAfterInactivation:
        commissionConfig.rules?.transferClientAfterInactivation ?? true,
      notifyBeforeInactivation:
        commissionConfig.rules?.notifyBeforeInactivation ?? false,
    },
    paymentInfo: commissionConfig.paymentInfo
      ? {
        account: commissionConfig.paymentInfo.account,
        gateway: commissionConfig.paymentInfo.gateway,
      }
      : undefined,
    penalties: commissionConfig.penalties,
  };

  return {
    ...metadata,
    commissionConfig: defaultedConfig,
  };
}

export function mergeMetadata(
  existingMetadata?: Record<string, any>,
  newMetadata?: Record<string, any>,
): Record<string, any> | undefined {
  if (!newMetadata) {
    return existingMetadata;
  }

  if (!existingMetadata) {
    return applyCommissionDefaults(newMetadata);
  }

  if (newMetadata.commissionConfig) {
    const mergedCommissionConfig = {
      ...existingMetadata.commissionConfig,
      ...newMetadata.commissionConfig,
      rules: {
        ...existingMetadata.commissionConfig?.rules,
        ...newMetadata.commissionConfig.rules,
      },
      paymentInfo: newMetadata.commissionConfig.paymentInfo
        ? {
          ...existingMetadata.commissionConfig?.paymentInfo,
          ...newMetadata.commissionConfig.paymentInfo,
        }
        : existingMetadata.commissionConfig?.paymentInfo,
    };

    return applyCommissionDefaults({
      ...existingMetadata,
      ...newMetadata,
      commissionConfig: mergedCommissionConfig,
    });
  }

  return {
    ...existingMetadata,
    ...newMetadata,
  };
}
