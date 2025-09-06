export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export const validateDateRange = (from?: string, to?: string): ValidationResult => {
  const errors: string[] = [];
  
  if (from && to) {
    const fromDate = new Date(from);
    const toDate = new Date(to);
    
    if (fromDate > toDate) {
      errors.push('La fecha "desde" debe ser anterior a la fecha "hasta"');
    }
    
    const maxRange = 365 * 24 * 60 * 60 * 1000; // 1 año
    if (toDate.getTime() - fromDate.getTime() > maxRange) {
      errors.push('El rango de fechas no puede exceder 1 año');
    }
  }
  
  return { valid: errors.length === 0, errors };
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateEmails = (emails: string[]): ValidationResult => {
  const errors: string[] = [];
  const unique = new Set();
  
  if (emails.length === 0) {
    errors.push('Al menos un email es requerido');
  }
  
  for (const email of emails) {
    if (!validateEmail(email)) {
      errors.push(`Email inválido: ${email}`);
    }
    
    if (unique.has(email.toLowerCase())) {
      errors.push(`Email duplicado: ${email}`);
    }
    unique.add(email.toLowerCase());
  }
  
  if (emails.length > 10) {
    errors.push('Máximo 10 emails permitidos');
  }
  
  return { valid: errors.length === 0, errors };
};

export const validatePageSize = (size: number): ValidationResult => {
  const errors: string[] = [];
  
  if (size < 10 || size > 200) {
    errors.push('El tamaño de página debe estar entre 10 y 200');
  }
  
  return { valid: errors.length === 0, errors };
};

export const validateExportRequest = (data: any): ValidationResult => {
  const errors: string[] = [];
  
  if (!data.format || !['csv', 'json'].includes(data.format)) {
    errors.push('Formato de exportación requerido (csv o json)');
  }
  
  // Validar filtros si están presentes
  if (data.filters) {
    const dateValidation = validateDateRange(data.filters.from, data.filters.to);
    if (!dateValidation.valid) {
      errors.push(...dateValidation.errors);
    }
  }
  
  return { valid: errors.length === 0, errors };
};

export const validateSchedule = (data: any): ValidationResult => {
  const errors: string[] = [];
  
  if (!data.name || data.name.trim().length < 3) {
    errors.push('Nombre requerido (mínimo 3 caracteres)');
  }
  
  if (!data.cron || data.cron.trim() === '') {
    errors.push('Expresión cron requerida');
  }
  
  if (!Array.isArray(data.emails) || data.emails.length === 0) {
    errors.push('Al menos un email destinatario es requerido');
  } else {
    const emailValidation = validateEmails(data.emails);
    if (!emailValidation.valid) {
      errors.push(...emailValidation.errors);
    }
  }
  
  if (!data.format || !['csv', 'json'].includes(data.format)) {
    errors.push('Formato requerido (csv o json)');
  }
  
  return { valid: errors.length === 0, errors };
};

export const validateCronExpression = (cron: string): ValidationResult => {
  const errors: string[] = [];
  
  // Validación básica de expresión cron (5 campos)
  const parts = cron.trim().split(/\s+/);
  
  if (parts.length !== 5) {
    errors.push('Expresión cron debe tener 5 campos (minuto hora día mes día_semana)');
  } else {
    const [minute, hour, day, month, dayOfWeek] = parts;
    
    // Validaciones básicas
    if (!isValidCronField(minute, 0, 59)) {
      errors.push('Minuto inválido (0-59)');
    }
    
    if (!isValidCronField(hour, 0, 23)) {
      errors.push('Hora inválida (0-23)');
    }
    
    if (!isValidCronField(day, 1, 31)) {
      errors.push('Día inválido (1-31)');
    }
    
    if (!isValidCronField(month, 1, 12)) {
      errors.push('Mes inválido (1-12)');
    }
    
    if (!isValidCronField(dayOfWeek, 0, 6)) {
      errors.push('Día de semana inválido (0-6)');
    }
  }
  
  return { valid: errors.length === 0, errors };
};

const isValidCronField = (field: string, min: number, max: number): boolean => {
  if (field === '*') return true;
  
  // Manejo básico de rangos (ej: 1-5)
  if (field.includes('-')) {
    const [start, end] = field.split('-').map(Number);
    return start >= min && end <= max && start <= end;
  }
  
  // Manejo básico de listas (ej: 1,3,5)
  if (field.includes(',')) {
    const values = field.split(',').map(Number);
    return values.every(v => v >= min && v <= max && !isNaN(v));
  }
  
  // Manejo básico de incrementos (ej: */5)
  if (field.includes('/')) {
    const [base, increment] = field.split('/');
    const incValue = Number(increment);
    return !isNaN(incValue) && incValue > 0 && (base === '*' || isValidCronField(base, min, max));
  }
  
  // Valor simple
  const value = Number(field);
  return !isNaN(value) && value >= min && value <= max;
};

export const validateAuditQuery = (query: any): ValidationResult => {
  const errors: string[] = [];
  
  const dateValidation = validateDateRange(query.from, query.to);
  if (!dateValidation.valid) {
    errors.push(...dateValidation.errors);
  }
  
  if (query.page && (typeof query.page !== 'number' || query.page < 1)) {
    errors.push('Número de página debe ser mayor a 0');
  }
  
  if (query.size) {
    const sizeValidation = validatePageSize(query.size);
    if (!sizeValidation.valid) {
      errors.push(...sizeValidation.errors);
    }
  }
  
  if (query.severity && !['low', 'med', 'high'].includes(query.severity)) {
    errors.push('Severidad inválida');
  }
  
  if (query.result && !['ok', 'error'].includes(query.result)) {
    errors.push('Resultado inválido');
  }
  
  if (query.origin && !['web', 'api', 'task'].includes(query.origin)) {
    errors.push('Origen inválido');
  }
  
  return { valid: errors.length === 0, errors };
};