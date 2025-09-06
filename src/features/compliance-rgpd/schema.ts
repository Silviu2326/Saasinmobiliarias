export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateDsrRequest = (data: any): ValidationResult => {
  const errors: string[] = [];
  
  if (!data.subject || data.subject.trim() === '') {
    errors.push('El sujeto es obligatorio');
  }
  
  if (data.email && !validateEmail(data.email)) {
    errors.push('Email inválido');
  }
  
  if (!['access', 'rectification', 'erasure', 'portability', 'restriction', 'objection'].includes(data.type)) {
    errors.push('Tipo de solicitud inválido');
  }
  
  if (data.dueAt && new Date(data.dueAt) < new Date()) {
    errors.push('La fecha límite debe ser futura');
  }
  
  return { valid: errors.length === 0, errors };
};

export const validateConsent = (data: any): ValidationResult => {
  const errors: string[] = [];
  
  if (!data.subject || data.subject.trim() === '') {
    errors.push('El sujeto es obligatorio');
  }
  
  if (data.email && !validateEmail(data.email)) {
    errors.push('Email inválido');
  }
  
  if (!data.purpose || data.purpose.trim() === '') {
    errors.push('La finalidad es obligatoria');
  }
  
  if (typeof data.granted !== 'boolean') {
    errors.push('El consentimiento debe ser verdadero o falso');
  }
  
  return { valid: errors.length === 0, errors };
};

export const validateActivityRecord = (data: any): ValidationResult => {
  const errors: string[] = [];
  
  if (!data.name || data.name.trim() === '') {
    errors.push('El nombre es obligatorio');
  }
  
  if (!data.purpose || data.purpose.trim() === '') {
    errors.push('La finalidad es obligatoria');
  }
  
  if (!data.legalBase || data.legalBase.trim() === '') {
    errors.push('La base jurídica es obligatoria');
  }
  
  if (!Array.isArray(data.dataCategories) || data.dataCategories.length === 0) {
    errors.push('Al menos una categoría de datos es obligatoria');
  }
  
  if (!Array.isArray(data.dataSubjects) || data.dataSubjects.length === 0) {
    errors.push('Al menos un tipo de interesado es obligatorio');
  }
  
  if (!data.retention || data.retention.trim() === '') {
    errors.push('El período de retención es obligatorio');
  }
  
  return { valid: errors.length === 0, errors };
};

export const validatePrivacyNotice = (data: any): ValidationResult => {
  const errors: string[] = [];
  
  if (!data.title || data.title.trim() === '') {
    errors.push('El título es obligatorio');
  }
  
  if (!data.content || data.content.trim() === '') {
    errors.push('El contenido es obligatorio');
  }
  
  if (!['website', 'form', 'contract', 'email'].includes(data.type)) {
    errors.push('Tipo de aviso inválido');
  }
  
  return { valid: errors.length === 0, errors };
};

export const validateCookieItem = (data: any): ValidationResult => {
  const errors: string[] = [];
  
  if (!data.name || data.name.trim() === '') {
    errors.push('El nombre de la cookie es obligatorio');
  }
  
  if (!data.provider || data.provider.trim() === '') {
    errors.push('El proveedor es obligatorio');
  }
  
  if (!data.purpose || data.purpose.trim() === '') {
    errors.push('La finalidad es obligatoria');
  }
  
  if (!data.duration || data.duration.trim() === '') {
    errors.push('La duración es obligatoria');
  }
  
  if (!['necessary', 'analytics', 'marketing', 'other'].includes(data.category)) {
    errors.push('Categoría de cookie inválida');
  }
  
  return { valid: errors.length === 0, errors };
};

export const validateRetentionRule = (data: any): ValidationResult => {
  const errors: string[] = [];
  
  if (!data.entity || data.entity.trim() === '') {
    errors.push('La entidad es obligatoria');
  }
  
  if (!['anonymize', 'delete'].includes(data.action)) {
    errors.push('Acción inválida');
  }
  
  if (!data.afterDays || typeof data.afterDays !== 'number' || data.afterDays <= 0) {
    errors.push('Los días deben ser positivos');
  }
  
  return { valid: errors.length === 0, errors };
};

export const validateBreach = (data: any): ValidationResult => {
  const errors: string[] = [];
  
  if (!data.date || new Date(data.date) > new Date()) {
    errors.push('La fecha del incidente no puede ser futura');
  }
  
  if (!data.discoveryDate) {
    errors.push('La fecha de descubrimiento es obligatoria');
  }
  
  if (!Array.isArray(data.systems) || data.systems.length === 0) {
    errors.push('Al menos un sistema afectado es obligatorio');
  }
  
  if (!Array.isArray(data.dataCategories) || data.dataCategories.length === 0) {
    errors.push('Al menos una categoría de datos es obligatoria');
  }
  
  if (typeof data.affected !== 'number' || data.affected < 0) {
    errors.push('El número de afectados debe ser 0 o más');
  }
  
  if (!['low', 'medium', 'high'].includes(data.risk)) {
    errors.push('Nivel de riesgo inválido');
  }
  
  if (!data.description || data.description.trim() === '') {
    errors.push('La descripción es obligatoria');
  }
  
  if (data.risk === 'high') {
    if (data.notifiedAEPD === undefined || data.notifiedSubjects === undefined) {
      errors.push('Para riesgo alto, debe especificar si se ha notificado a AEPD e interesados');
    }
  }
  
  return { valid: errors.length === 0, errors };
};

export const validateDataMapEntry = (data: any): ValidationResult => {
  const errors: string[] = [];
  
  if (!data.system || data.system.trim() === '') {
    errors.push('El sistema es obligatorio');
  }
  
  if (!Array.isArray(data.dataCategories) || data.dataCategories.length === 0) {
    errors.push('Al menos una categoría de datos es obligatoria');
  }
  
  if (!Array.isArray(data.purposes) || data.purposes.length === 0) {
    errors.push('Al menos una finalidad es obligatoria');
  }
  
  return { valid: errors.length === 0, errors };
};

// Mantener compatibilidad con las exportaciones originales
export const dsrRequestSchema = { validate: validateDsrRequest };
export const consentSchema = { validate: validateConsent };
export const activityRecordSchema = { validate: validateActivityRecord };
export const privacyNoticeSchema = { validate: validatePrivacyNotice };
export const cookieItemSchema = { validate: validateCookieItem };
export const retentionRuleSchema = { validate: validateRetentionRule };
export const breachSchema = { validate: validateBreach };
export const dataMapEntrySchema = { validate: validateDataMapEntry };