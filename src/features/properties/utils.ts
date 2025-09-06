import { PropertyFilters } from './types';

export function filtersToQueryString(filters: PropertyFilters): string {
  const params = new URLSearchParams();
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== '' && value !== null) {
      params.append(key, String(value));
    }
  });
  
  return params.toString();
}

export function queryStringToFilters(queryString: string): PropertyFilters {
  const params = new URLSearchParams(queryString);
  const filters: PropertyFilters = {};
  
  // Strings
  const stringFields = ['q', 'estado', 'tipo', 'ciudad', 'agente', 'sort'];
  stringFields.forEach(field => {
    const value = params.get(field);
    if (value) {
      (filters as any)[field] = value;
    }
  });
  
  // Numbers
  const numberFields = ['priceMin', 'priceMax', 'habitaciones', 'page', 'size'];
  numberFields.forEach(field => {
    const value = params.get(field);
    if (value && !isNaN(Number(value))) {
      (filters as any)[field] = Number(value);
    }
  });
  
  // Booleans
  const booleanFields = ['exclusiva', 'portalSync'];
  booleanFields.forEach(field => {
    const value = params.get(field);
    if (value === 'true') {
      (filters as any)[field] = true;
    } else if (value === 'false') {
      (filters as any)[field] = false;
    }
  });
  
  return filters;
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

export function formatPriceCompact(price: number): string {
  if (price >= 1000000) {
    return `${(price / 1000000).toFixed(1)}M€`;
  } else if (price >= 1000) {
    return `${Math.round(price / 1000)}K€`;
  }
  return `${price}€`;
}

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('es-ES', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(d);
}

export function formatDateTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('es-ES', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

export function formatRelativeTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInMs = now.getTime() - d.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  
  if (diffInDays === 0) {
    return 'Hoy';
  } else if (diffInDays === 1) {
    return 'Ayer';
  } else if (diffInDays < 7) {
    return `Hace ${diffInDays} días`;
  } else if (diffInDays < 30) {
    const weeks = Math.floor(diffInDays / 7);
    return `Hace ${weeks} semana${weeks > 1 ? 's' : ''}`;
  } else if (diffInDays < 365) {
    const months = Math.floor(diffInDays / 30);
    return `Hace ${months} mes${months > 1 ? 'es' : ''}`;
  } else {
    const years = Math.floor(diffInDays / 365);
    return `Hace ${years} año${years > 1 ? 's' : ''}`;
  }
}

export function formatArea(m2: number): string {
  return `${m2} m²`;
}

export function formatRooms(habitaciones: number, banos?: number): string {
  let result = `${habitaciones} hab`;
  if (banos && banos > 0) {
    result += `, ${banos} baño${banos > 1 ? 's' : ''}`;
  }
  return result;
}

export function calculatePricePerM2(precio: number, m2: number): number {
  return Math.round(precio / m2);
}

export function getPropertyStatusColor(estado: string): string {
  switch (estado) {
    case 'activo':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'vendido':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'alquilado':
      return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'borrador':
      return 'bg-gray-100 text-gray-800 border-gray-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
}

export function getPropertyTypeIcon(tipo: string): string {
  const icons: Record<string, string> = {
    piso: '🏠',
    atico: '🏢',
    duplex: '🏘️',
    casa: '🏡',
    chalet: '🏰',
    estudio: '🏢',
    loft: '🏭',
    local: '🏪',
    oficina: '🏢',
  };
  return icons[tipo] || '🏠';
}

export function truncateText(text: string, maxLength: number = 100): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function generatePropertyUrl(property: { id: string; titulo: string }): string {
  const slug = property.titulo
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .substring(0, 50);
  return `/properties/${property.id}/${slug}`;
}

export function validateCoordinates(lat: number, lng: number): boolean {
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
}

export function sortProperties<T extends { [key: string]: any }>(
  properties: T[],
  sortBy: string = 'updatedAt',
  sortOrder: 'asc' | 'desc' = 'desc'
): T[] {
  return [...properties].sort((a, b) => {
    let aValue = a[sortBy];
    let bValue = b[sortBy];
    
    // Handle dates
    if (sortBy.includes('At') || sortBy.includes('fecha')) {
      aValue = new Date(aValue).getTime();
      bValue = new Date(bValue).getTime();
    }
    
    // Handle numbers
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
    }
    
    // Handle strings
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortOrder === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }
    
    return 0;
  });
}