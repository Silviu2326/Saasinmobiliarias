import { KeyFilters } from './types';

export function formatKeyCode(code: string): string {
  return code.toUpperCase().replace(/[^A-Z0-9]/g, '');
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'disponible':
      return 'text-green-800 bg-green-100';
    case 'entregada':
      return 'text-blue-800 bg-blue-100';
    case 'perdida':
      return 'text-red-800 bg-red-100';
    case 'duplicada':
      return 'text-yellow-800 bg-yellow-100';
    case 'retirada':
      return 'text-gray-800 bg-gray-100';
    default:
      return 'text-gray-800 bg-gray-100';
  }
}

export function getLocationIcon(location: string): string {
  switch (location) {
    case 'oficina':
      return '🏢';
    case 'inmobiliaria':
      return '🏪';
    case 'propietario':
      return '👤';
    case 'inquilino':
      return '🏠';
    case 'agente':
      return '👨‍💼';
    case 'otro':
      return '📍';
    default:
      return '📍';
  }
}

export function getMovementTypeColor(type: string): string {
  switch (type) {
    case 'entrega':
      return 'text-blue-600';
    case 'devolucion':
      return 'text-green-600';
    case 'traslado':
      return 'text-yellow-600';
    case 'duplicacion':
      return 'text-purple-600';
    case 'perdida':
      return 'text-red-600';
    default:
      return 'text-gray-600';
  }
}

export function getMovementTypeIcon(type: string): string {
  switch (type) {
    case 'entrega':
      return '📤';
    case 'devolucion':
      return '📥';
    case 'traslado':
      return '🔄';
    case 'duplicacion':
      return '📋';
    case 'perdida':
      return '❌';
    default:
      return '📋';
  }
}

export function filtersToQueryString(filters: KeyFilters): string {
  const params = new URLSearchParams();
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== '' && value !== null) {
      params.append(key, String(value));
    }
  });
  
  return params.toString();
}

export function queryStringToFilters(queryString: string): KeyFilters {
  const params = new URLSearchParams(queryString);
  const filters: KeyFilters = {};
  
  // String fields
  const stringFields = ['q', 'propertyId', 'keyCode', 'location', 'status', 'assignedTo', 'dateFrom', 'dateTo'];
  stringFields.forEach(field => {
    const value = params.get(field);
    if (value) {
      (filters as any)[field] = value;
    }
  });
  
  return filters;
}

export function formatDate(dateString: string | undefined): string {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch {
    return '';
  }
}

export function formatDateTime(dateString: string | undefined): string {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return '';
  }
}

export function isKeyOverdue(key: { returnDate?: string; status: string }): boolean {
  if (!key.returnDate || key.status !== 'entregada') return false;
  
  try {
    const returnDate = new Date(key.returnDate);
    const now = new Date();
    return returnDate < now;
  } catch {
    return false;
  }
}

export function getDaysUntilReturn(returnDate: string | undefined): number | null {
  if (!returnDate) return null;
  
  try {
    const return_date = new Date(returnDate);
    const now = new Date();
    const diffTime = return_date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  } catch {
    return null;
  }
}

export function validateKeyCode(keyCode: string): string | null {
  if (!keyCode) return 'El código de llave es requerido';
  if (keyCode.length < 3) return 'El código debe tener al menos 3 caracteres';
  if (keyCode.length > 20) return 'El código no puede tener más de 20 caracteres';
  if (!/^[A-Z0-9]+$/.test(keyCode)) return 'El código solo puede contener letras y números';
  return null;
}

export function getKeyStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    disponible: 'Disponible',
    entregada: 'Entregada',
    perdida: 'Perdida',
    duplicada: 'Duplicada',
    retirada: 'Retirada'
  };
  return labels[status] || status;
}

export function getLocationLabel(location: string): string {
  const labels: Record<string, string> = {
    oficina: 'Oficina',
    inmobiliaria: 'Inmobiliaria',
    propietario: 'Propietario',
    inquilino: 'Inquilino',
    agente: 'Agente',
    otro: 'Otro'
  };
  return labels[location] || location;
}

export function getMovementTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    entrega: 'Entrega',
    devolucion: 'Devolución',
    traslado: 'Traslado',
    duplicacion: 'Duplicación',
    perdida: 'Pérdida'
  };
  return labels[type] || type;
}