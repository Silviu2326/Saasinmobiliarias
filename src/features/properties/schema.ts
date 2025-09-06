import { PropertyFormData } from './types';

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export function validateProperty(data: Partial<PropertyFormData>): ValidationResult {
  const errors: Record<string, string> = {};

  // Campos requeridos
  if (!data.titulo?.trim()) {
    errors.titulo = 'El título es requerido';
  }

  if (!data.direccion?.trim()) {
    errors.direccion = 'La dirección es requerida';
  }

  if (!data.ciudad?.trim()) {
    errors.ciudad = 'La ciudad es requerida';
  }

  if (!data.tipo) {
    errors.tipo = 'El tipo de propiedad es requerido';
  }

  // Validaciones numéricas
  if (data.precio !== undefined && data.precio < 0) {
    errors.precio = 'El precio debe ser mayor o igual a 0';
  }

  if (data.m2 !== undefined && data.m2 <= 0) {
    errors.m2 = 'Los m² deben ser mayor a 0';
  }

  if (data.habitaciones !== undefined && data.habitaciones < 0) {
    errors.habitaciones = 'El número de habitaciones debe ser mayor o igual a 0';
  }

  if (data.banos !== undefined && data.banos < 0) {
    errors.banos = 'El número de baños debe ser mayor o igual a 0';
  }

  // Validación de coordenadas si se proporcionan
  if (data.coordenadas) {
    if (data.coordenadas.lat < -90 || data.coordenadas.lat > 90) {
      errors.coordenadas = 'La latitud debe estar entre -90 y 90';
    }
    if (data.coordenadas.lng < -180 || data.coordenadas.lng > 180) {
      errors.coordenadas = 'La longitud debe estar entre -180 y 180';
    }
  }

  // Validaciones de longitud de texto
  if (data.titulo && data.titulo.length > 200) {
    errors.titulo = 'El título no puede tener más de 200 caracteres';
  }

  if (data.descripcion && data.descripcion.length > 2000) {
    errors.descripcion = 'La descripción no puede tener más de 2000 caracteres';
  }

  // Validación de características
  if (data.caracteristicas && data.caracteristicas.length > 20) {
    errors.caracteristicas = 'No se pueden tener más de 20 características';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

export function validatePropertyField(field: string, value: any): string | null {
  const data = { [field]: value } as Partial<PropertyFormData>;
  const result = validateProperty(data);
  return result.errors[field] || null;
}

export function sanitizePropertyData(data: Partial<PropertyFormData>): Partial<PropertyFormData> {
  return {
    ...data,
    titulo: data.titulo?.trim(),
    direccion: data.direccion?.trim(),
    ciudad: data.ciudad?.trim(),
    agente: data.agente?.trim() || undefined,
    descripcion: data.descripcion?.trim() || undefined,
    caracteristicas: data.caracteristicas?.filter(c => c.trim().length > 0) || []
  };
}