import { OfferFormData, CounterOfferFormData } from './types';

export interface ValidationError {
  field: string;
  message: string;
}

export function validateOfferForm(data: Partial<OfferFormData>): ValidationError[] {
  const errors: ValidationError[] = [];

  // Cliente requerido
  if (!data.clienteId || data.clienteId.trim() === '') {
    errors.push({ field: 'clienteId', message: 'Cliente es requerido' });
  }

  // Propiedad requerida
  if (!data.propertyId || data.propertyId.trim() === '') {
    errors.push({ field: 'propertyId', message: 'Propiedad es requerida' });
  }

  // Importe requerido y válido
  if (!data.importe || data.importe <= 0) {
    errors.push({ field: 'importe', message: 'El importe debe ser mayor a 0' });
  } else if (data.importe > 999999999) {
    errors.push({ field: 'importe', message: 'El importe es demasiado alto' });
  }

  // Condiciones requeridas
  if (!data.condiciones || data.condiciones.trim() === '') {
    errors.push({ field: 'condiciones', message: 'Condiciones son requeridas' });
  } else if (data.condiciones.trim().length < 10) {
    errors.push({ field: 'condiciones', message: 'Las condiciones deben tener al menos 10 caracteres' });
  } else if (data.condiciones.length > 1000) {
    errors.push({ field: 'condiciones', message: 'Las condiciones no pueden exceder 1000 caracteres' });
  }

  // Fecha de vencimiento requerida y válida
  if (!data.venceEl) {
    errors.push({ field: 'venceEl', message: 'Fecha de vencimiento es requerida' });
  } else {
    const vencimiento = new Date(data.venceEl);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    if (vencimiento < hoy) {
      errors.push({ field: 'venceEl', message: 'La fecha de vencimiento debe ser hoy o posterior' });
    }
    
    // No más de 1 año en el futuro
    const maxDate = new Date();
    maxDate.setFullYear(maxDate.getFullYear() + 1);
    if (vencimiento > maxDate) {
      errors.push({ field: 'venceEl', message: 'La fecha de vencimiento no puede ser más de 1 año en el futuro' });
    }
  }

  // Notas opcionales pero con límite
  if (data.notas && data.notas.length > 500) {
    errors.push({ field: 'notas', message: 'Las notas no pueden exceder 500 caracteres' });
  }

  return errors;
}

export function validateCounterOfferForm(data: Partial<CounterOfferFormData>): ValidationError[] {
  const errors: ValidationError[] = [];

  // Importe requerido y válido
  if (!data.importe || data.importe <= 0) {
    errors.push({ field: 'importe', message: 'El importe debe ser mayor a 0' });
  } else if (data.importe > 999999999) {
    errors.push({ field: 'importe', message: 'El importe es demasiado alto' });
  }

  // Condiciones requeridas
  if (!data.condiciones || data.condiciones.trim() === '') {
    errors.push({ field: 'condiciones', message: 'Condiciones son requeridas' });
  } else if (data.condiciones.trim().length < 10) {
    errors.push({ field: 'condiciones', message: 'Las condiciones deben tener al menos 10 caracteres' });
  } else if (data.condiciones.length > 1000) {
    errors.push({ field: 'condiciones', message: 'Las condiciones no pueden exceder 1000 caracteres' });
  }

  // Notas opcionales pero con límite
  if (data.notas && data.notas.length > 500) {
    errors.push({ field: 'notas', message: 'Las notas no pueden exceder 500 caracteres' });
  }

  return errors;
}

export function validateOfferState(currentState: string, targetState: string): ValidationError[] {
  const errors: ValidationError[] = [];
  
  const validTransitions: Record<string, string[]> = {
    'abierta': ['counter', 'aceptada', 'rechazada', 'expirada'],
    'counter': ['aceptada', 'rechazada', 'expirada', 'counter'],
    'aceptada': [], // Estado final
    'rechazada': [], // Estado final
    'expirada': ['abierta'] // Solo se puede reabrir
  };

  if (!validTransitions[currentState]?.includes(targetState)) {
    errors.push({ 
      field: 'estado', 
      message: `No se puede cambiar de ${currentState} a ${targetState}` 
    });
  }

  return errors;
}

export function sanitizeOfferData(data: Partial<OfferFormData>): Partial<OfferFormData> {
  return {
    ...data,
    clienteId: data.clienteId?.trim(),
    propertyId: data.propertyId?.trim(),
    importe: data.importe ? Math.round(data.importe * 100) / 100 : undefined, // Redondear a 2 decimales
    condiciones: data.condiciones?.trim(),
    notas: data.notas?.trim() || undefined
  };
}

export function sanitizeCounterOfferData(data: Partial<CounterOfferFormData>): Partial<CounterOfferFormData> {
  return {
    ...data,
    importe: data.importe ? Math.round(data.importe * 100) / 100 : undefined, // Redondear a 2 decimales
    condiciones: data.condiciones?.trim(),
    notas: data.notas?.trim() || undefined
  };
}

export const OFFER_ESTADOS = [
  { value: 'all', label: 'Todos los estados', color: 'text-gray-800 bg-gray-100' },
  { value: 'abierta', label: 'Abierta', color: 'text-blue-800 bg-blue-100' },
  { value: 'counter', label: 'Contraoferta', color: 'text-yellow-800 bg-yellow-100' },
  { value: 'aceptada', label: 'Aceptada', color: 'text-green-800 bg-green-100' },
  { value: 'rechazada', label: 'Rechazada', color: 'text-red-800 bg-red-100' },
  { value: 'expirada', label: 'Expirada', color: 'text-gray-800 bg-gray-200' }
] as const;

export const VENCIMIENTO_OPTIONS = [
  { value: 'all', label: 'Todos' },
  { value: 'proximas', label: 'Próximas a vencer (7 días)' },
  { value: 'vencidas', label: 'Vencidas' }
] as const;

export const SORT_OPTIONS = [
  { value: 'createdAt', label: 'Fecha de creación' },
  { value: 'updatedAt', label: 'Última actualización' },
  { value: 'venceEl', label: 'Fecha de vencimiento' },
  { value: 'importe', label: 'Importe' },
  { value: 'clienteNombre', label: 'Cliente' },
  { value: 'propertyTitle', label: 'Propiedad' }
] as const;