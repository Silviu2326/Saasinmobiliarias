export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export const validateEmail = (email: string): ValidationResult => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailRegex.test(email)) {
    return { valid: false, errors: ['Email inválido'] };
  }
  return { valid: true, errors: [] };
};

export const validateDsrRequest = (data: any): ValidationResult => {
  const errors: string[] = [];
  
  if (!data.subject || data.subject.trim() === '') {
    errors.push('Identificador del sujeto obligatorio');
  }
  
  if (!['access', 'rectification', 'erasure', 'portability', 'restriction', 'objection'].includes(data.type)) {
    errors.push('Tipo de solicitud inválido');
  }
  
  if (data.contactEmail && !validateEmail(data.contactEmail).valid) {
    errors.push('Email de contacto inválido');
  }
  
  return { valid: errors.length === 0, errors };
};

export const validateConsent = (data: any): ValidationResult => {
  const errors: string[] = [];
  
  if (!data.subject || data.subject.trim() === '') {
    errors.push('Identificador del sujeto obligatorio');
  }
  
  if (!['marketing', 'whatsapp', 'email', 'portales'].includes(data.purpose)) {
    errors.push('Propósito inválido');
  }
  
  if (typeof data.granted !== 'boolean') {
    errors.push('Estado de consentimiento requerido');
  }
  
  if (data.granted === false && (!data.reason || data.reason.trim() === '')) {
    errors.push('Motivo requerido si no se concede consentimiento');
  }
  
  return { valid: errors.length === 0, errors };
};

export const validateKycCheck = (data: any): ValidationResult => {
  const errors: string[] = [];
  
  if (!data.fullName || data.fullName.trim().length < 2) {
    errors.push('Nombre completo requerido (mínimo 2 caracteres)');
  }
  
  if (!data.docId || data.docId.trim().length < 8) {
    errors.push('Documento de identidad inválido (mínimo 8 caracteres)');
  }
  
  if (!['dni', 'nie', 'passport'].includes(data.docType)) {
    errors.push('Tipo de documento inválido');
  }
  
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!data.birthDate || !dateRegex.test(data.birthDate)) {
    errors.push('Fecha inválida (formato YYYY-MM-DD)');
  }
  
  if (!data.country || data.country.trim().length < 2) {
    errors.push('País requerido');
  }
  
  if (typeof data.isPep !== 'boolean') {
    errors.push('Campo PEP requerido');
  }
  
  return { valid: errors.length === 0, errors };
};

export const validateChecklistUpdate = (data: any): ValidationResult => {
  const errors: string[] = [];
  
  if (!Array.isArray(data.items)) {
    errors.push('Lista de items requerida');
    return { valid: false, errors };
  }
  
  for (const item of data.items) {
    if (!item.id) {
      errors.push('ID de item requerido');
      continue;
    }
    
    if (typeof item.done !== 'boolean') {
      errors.push(`Item ${item.id}: estado requerido`);
    }
  }
  
  const requiredIncomplete = data.items.filter(
    (item: any) => item.required && item.done === false && !item.evidence
  );
  
  if (requiredIncomplete.length > 0) {
    errors.push('Items obligatorios necesitan evidencia');
  }
  
  return { valid: errors.length === 0, errors };
};

export const validateLegalDocument = (data: any): ValidationResult => {
  const errors: string[] = [];
  
  if (!['mandate', 'dpa', 'privacy_clauses', 'assignment'].includes(data.template)) {
    errors.push('Plantilla inválida');
  }
  
  if (!data.variables || typeof data.variables !== 'object') {
    errors.push('Variables requeridas');
    return { valid: false, errors };
  }
  
  const required = ['client_name', 'agency_name', 'date'];
  const missingVars = required.filter(key => !data.variables[key] || data.variables[key].trim() === '');
  
  if (missingVars.length > 0) {
    errors.push(`Faltan variables obligatorias: ${missingVars.join(', ')}`);
  }
  
  return { valid: errors.length === 0, errors };
};

export const validateDpia = (data: any): ValidationResult => {
  const errors: string[] = [];
  
  if (!data.scope || data.scope.trim().length < 10) {
    errors.push('Alcance demasiado breve (mínimo 10 caracteres)');
  }
  
  if (!data.context || data.context.trim().length < 10) {
    errors.push('Contexto requerido (mínimo 10 caracteres)');
  }
  
  if (!Array.isArray(data.risks) || data.risks.length === 0) {
    errors.push('Al menos un riesgo debe ser evaluado');
  } else {
    for (let i = 0; i < data.risks.length; i++) {
      const risk = data.risks[i];
      
      if (!['legal', 'security', 'operational'].includes(risk.category)) {
        errors.push(`Riesgo ${i + 1}: categoría inválida`);
      }
      
      if (!risk.description || risk.description.trim().length < 5) {
        errors.push(`Riesgo ${i + 1}: descripción demasiado breve`);
      }
      
      if (typeof risk.score !== 'number' || risk.score < 1 || risk.score > 5) {
        errors.push(`Riesgo ${i + 1}: puntuación debe estar entre 1 y 5`);
      }
    }
  }
  
  if (!Array.isArray(data.measures) || data.measures.length === 0) {
    errors.push('Al menos una medida de mitigación es requerida');
  }
  
  if (!data.responsible || data.responsible.trim().length < 2) {
    errors.push('Responsable requerido (mínimo 2 caracteres)');
  }
  
  return { valid: errors.length === 0, errors };
};

export const validateAuditFilters = (data: any): ValidationResult => {
  const errors: string[] = [];
  
  if (data.severity && !['low', 'medium', 'high'].includes(data.severity)) {
    errors.push('Severidad inválida');
  }
  
  if (data.page && (typeof data.page !== 'number' || data.page < 1)) {
    errors.push('Página debe ser un número mayor a 0');
  }
  
  if (data.limit && (typeof data.limit !== 'number' || data.limit < 1 || data.limit > 100)) {
    errors.push('Límite debe estar entre 1 y 100');
  }
  
  return { valid: errors.length === 0, errors };
};