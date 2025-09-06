// Basic validation functions for settlements
export const validateWizardStep1 = (data: any): string[] => {
  const errors: string[] = [];
  
  if (!data.period || data.period.trim() === '') {
    errors.push("Period is required");
  }
  
  if (!data.scope) {
    errors.push("Scope is required");
  }
  
  if (!data.scopeId || data.scopeId.trim() === '') {
    errors.push("Scope ID is required");
  }
  
  return errors;
};

export const validateWizardStep2 = (data: any): string[] => {
  const errors: string[] = [];
  
  if (!Array.isArray(data.selectedCommissionIds) || data.selectedCommissionIds.length === 0) {
    errors.push("At least one eligible commission must be selected");
  }
  
  return errors;
};

export const validateWizardStep4 = (data: any): string[] => {
  const errors: string[] = [];
  
  if (!data.name || data.name.trim() === '') {
    errors.push("Settlement name is required");
  }
  
  if (data.name && data.name.length > 100) {
    errors.push("Settlement name must be less than 100 characters");
  }
  
  return errors;
};

export const validateSettlementAdjustment = (adjustment: any): string[] => {
  const errors: string[] = [];
  
  if (!adjustment.lineId) {
    errors.push("Line ID is required");
  }
  
  // Either delta or percent must be provided, but not both
  if (!adjustment.delta && !adjustment.percent) {
    errors.push("Either delta or percent adjustment is required");
  }
  
  if (adjustment.delta && adjustment.percent) {
    errors.push("Cannot specify both delta and percent adjustment");
  }
  
  if (adjustment.percent && (adjustment.percent < -100 || adjustment.percent > 100)) {
    errors.push("Percent adjustment must be between -100 and 100");
  }
  
  if (!adjustment.reason || adjustment.reason.trim() === '') {
    errors.push("Reason for adjustment is required");
  }
  
  if (adjustment.file && adjustment.file.size > 10 * 1024 * 1024) {
    errors.push("File must be less than 10MB");
  }
  
  return errors;
};

export const validateClosePeriod = (data: any): string[] => {
  const errors: string[] = [];
  
  if (!data.settlementId) {
    errors.push("Settlement ID is required");
  }
  
  if (typeof data.createAccountingEntry !== 'boolean') {
    errors.push("Accounting entry flag must be specified");
  }
  
  return errors;
};

export const validatePayoutUpdate = (data: any): string[] => {
  const errors: string[] = [];
  
  if (data.status === "ENVIADO" && !data.paidAt) {
    errors.push("Paid at date is required when status is ENVIADO");
  }
  
  if (data.method && !["TRANSFER", "CASH", "OTHER"].includes(data.method)) {
    errors.push("Invalid payment method");
  }
  
  return errors;
};

export const validateSettlementFilters = (filters: any): string[] => {
  const errors: string[] = [];
  
  if (filters.page && (typeof filters.page !== 'number' || filters.page < 1)) {
    errors.push("Page must be a positive number");
  }
  
  if (filters.size && (typeof filters.size !== 'number' || filters.size < 10 || filters.size > 100)) {
    errors.push("Size must be between 10 and 100");
  }
  
  if (filters.from && filters.to && new Date(filters.from) > new Date(filters.to)) {
    errors.push("From date must be before to date");
  }
  
  return errors;
};

export const validateImportCsv = (file: File): string[] => {
  const errors: string[] = [];
  
  if (!file.type.includes('csv') && !file.name.endsWith('.csv')) {
    errors.push("File must be a CSV");
  }
  
  if (file.size > 5 * 1024 * 1024) {
    errors.push("File must be less than 5MB");
  }
  
  return errors;
};

// Aliases to match import expectations
export const validateAdjustment = validateSettlementAdjustment;
export const validatePayout = validatePayoutUpdate;