// Basic validation functions without zod
export const validateCommissionRule = (rule: any): string[] => {
  const errors: string[] = [];
  
  if (typeof rule.rate !== 'number' || rule.rate < 0 || rule.rate > 100) {
    errors.push("Rate must be between 0 and 100");
  }
  
  if (rule.min !== undefined && rule.max !== undefined && rule.min >= rule.max) {
    errors.push("Min must be less than max");
  }
  
  return errors;
};

export const validateCommissionSplit = (split: any): string[] => {
  const errors: string[] = [];
  
  if (typeof split.agent !== 'number' || split.agent < 0 || split.agent > 100) {
    errors.push("Agent percentage must be between 0 and 100");
  }
  
  const total = split.agent + (split.office || 0) + (split.team || 0);
  if (total > 100) {
    errors.push("Total split cannot exceed 100%");
  }
  
  return errors;
};

export const validateCommissionPlan = (plan: any): string[] => {
  const errors: string[] = [];
  
  if (!plan.name || plan.name.trim() === '') {
    errors.push("Name is required");
  }
  
  if (!plan.scope) {
    errors.push("Scope is required");
  }
  
  if (!Array.isArray(plan.rules) || plan.rules.length === 0) {
    errors.push("At least one rule is required");
  }
  
  if (plan.rules) {
    plan.rules.forEach((rule: any, index: number) => {
      const ruleErrors = validateCommissionRule(rule);
      ruleErrors.forEach(error => errors.push(`Rule ${index + 1}: ${error}`));
    });
  }
  
  if (plan.split) {
    const splitErrors = validateCommissionSplit(plan.split);
    splitErrors.forEach(error => errors.push(error));
  }
  
  if (plan.validFrom && plan.validTo) {
    if (new Date(plan.validFrom) >= new Date(plan.validTo)) {
      errors.push("Valid from date must be before valid to date");
    }
  }
  
  return errors;
};

export const validateCommissionAdjustment = (adjustment: any): string[] => {
  const errors: string[] = [];
  
  if (!adjustment.itemId) {
    errors.push("Item ID is required");
  }
  
  if (typeof adjustment.delta !== 'number' || adjustment.delta === 0) {
    errors.push("Delta must be a non-zero number");
  }
  
  if (!adjustment.reason || adjustment.reason.trim() === '') {
    errors.push("Reason is required");
  }
  
  if (adjustment.file && adjustment.file.size > 10 * 1024 * 1024) {
    errors.push("File must be less than 10MB");
  }
  
  return errors;
};

export const validatePayoutUpdate = (data: any): string[] => {
  const errors: string[] = [];
  
  if (data.status === "ENVIADO" && !data.paidAt) {
    errors.push("Paid at date is required when status is ENVIADO");
  }
  
  return errors;
};

export const validateSettlement = (settlement: any): string[] => {
  const errors: string[] = [];
  
  if (!settlement.period) {
    errors.push("Period is required");
  }
  
  if (!Array.isArray(settlement.itemIds) || settlement.itemIds.length === 0) {
    errors.push("At least one item must be selected");
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