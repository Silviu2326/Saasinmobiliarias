import { SupplierFormData } from './types';

export function validateSupplier(data: SupplierFormData): Record<string, string> {
  const errors: Record<string, string> = {};

  // Required fields
  if (!data.nombre || data.nombre.trim().length < 2) {
    errors.nombre = 'El nombre debe tener al menos 2 caracteres';
  }

  if (!data.email || data.email.trim().length === 0) {
    errors.email = 'El email es requerido';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = 'El email no tiene un formato válido';
  }

  if (!data.telefono || data.telefono.trim().length === 0) {
    errors.telefono = 'El teléfono es requerido';
  } else if (!/^\d{9}$/.test(data.telefono.replace(/\s/g, ''))) {
    errors.telefono = 'El teléfono debe tener 9 dígitos';
  }

  if (!data.categorias || data.categorias.length === 0) {
    errors.categorias = 'Debe seleccionar al menos una categoría';
  }

  if (!data.zonas || data.zonas.length === 0) {
    errors.zonas = 'Debe especificar al menos una zona de trabajo';
  }

  // Optional field validations
  if (data.tarifaBase !== undefined && (isNaN(data.tarifaBase) || data.tarifaBase < 0)) {
    errors.tarifaBase = 'La tarifa base debe ser un número positivo';
  }

  if (data.notas && data.notas.length > 1000) {
    errors.notas = 'Las notas no pueden exceder 1000 caracteres';
  }

  return errors;
}

export function sanitizeSupplierData(data: SupplierFormData): SupplierFormData {
  return {
    nombre: data.nombre?.trim() || '',
    email: data.email?.trim().toLowerCase() || '',
    telefono: data.telefono?.replace(/\s/g, '') || '',
    categorias: data.categorias || [],
    zonas: data.zonas?.map(z => z.trim()).filter(z => z) || [],
    tarifaBase: data.tarifaBase ? Math.round(data.tarifaBase * 100) / 100 : undefined,
    notas: data.notas?.trim() || undefined,
    estado: data.estado || 'activo'
  };
}