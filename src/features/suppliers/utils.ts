import { SupplierFilters, SupplierCategory } from './types';

export function getCategoryColor(category: SupplierCategory): string {
  switch (category) {
    case 'foto':
      return 'text-purple-800 bg-purple-100';
    case 'reforma':
      return 'text-orange-800 bg-orange-100';
    case 'limpieza':
      return 'text-blue-800 bg-blue-100';
    case 'legales':
      return 'text-green-800 bg-green-100';
    case 'otros':
      return 'text-gray-800 bg-gray-100';
    default:
      return 'text-gray-800 bg-gray-100';
  }
}

export function getCategoryIcon(category: SupplierCategory): string {
  switch (category) {
    case 'foto':
      return '📸';
    case 'reforma':
      return '🔨';
    case 'limpieza':
      return '🧹';
    case 'legales':
      return '⚖️';
    case 'otros':
      return '🔧';
    default:
      return '🔧';
  }
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'activo':
      return 'text-green-800 bg-green-100';
    case 'inactivo':
      return 'text-red-800 bg-red-100';
    default:
      return 'text-gray-800 bg-gray-100';
  }
}

export function getCategoryLabel(category: SupplierCategory): string {
  const labels: Record<SupplierCategory, string> = {
    foto: 'Fotografía',
    reforma: 'Reformas',
    limpieza: 'Limpieza',
    legales: 'Legales',
    otros: 'Otros'
  };
  return labels[category] || category;
}

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    activo: 'Activo',
    inactivo: 'Inactivo'
  };
  return labels[status] || status;
}

export function formatRating(rating: number): string {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
  
  return '★'.repeat(fullStars) + 
         (hasHalfStar ? '☆' : '') + 
         '☆'.repeat(emptyStars);
}

export function formatPhone(phone: string): string {
  if (!phone) return '';
  
  // Remove any existing formatting
  const cleaned = phone.replace(/\D/g, '');
  
  // Format as Spanish phone number (XXX XXX XXX)
  if (cleaned.length === 9) {
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
  }
  
  return phone;
}

export function formatCurrency(amount: number | undefined): string {
  if (amount === undefined || amount === null) return '';
  
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(amount);
}

export function filtersToQueryString(filters: SupplierFilters): string {
  const params = new URLSearchParams();
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== '' && value !== null) {
      params.append(key, String(value));
    }
  });
  
  return params.toString();
}

export function queryStringToFilters(queryString: string): SupplierFilters {
  const params = new URLSearchParams(queryString);
  const filters: SupplierFilters = {};
  
  // String fields
  const stringFields = ['q', 'categoria', 'zona', 'estado', 'dateFrom', 'dateTo', 'sort'];
  stringFields.forEach(field => {
    const value = params.get(field);
    if (value) {
      (filters as any)[field] = value;
    }
  });

  // Number fields
  const numberFields = ['rating', 'page', 'size'];
  numberFields.forEach(field => {
    const value = params.get(field);
    if (value && !isNaN(Number(value))) {
      (filters as any)[field] = Number(value);
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

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePhone(phone: string): boolean {
  const phoneRegex = /^\d{9}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .join('')
    .slice(0, 2);
}

export function debounce<T extends (...args: any[]) => void>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

export function generateSupplierCode(name: string): string {
  const cleaned = name.toUpperCase().replace(/[^A-Z]/g, '');
  const prefix = cleaned.slice(0, 3).padEnd(3, 'X');
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${prefix}${random}`;
}

export function calculateAverageRating(ratings: number[]): number {
  if (ratings.length === 0) return 0;
  const sum = ratings.reduce((acc, rating) => acc + rating, 0);
  return Math.round((sum / ratings.length) * 10) / 10;
}

export function sortSuppliers(suppliers: any[], sortBy: string, sortOrder: 'asc' | 'desc') {
  return [...suppliers].sort((a, b) => {
    let aValue = a[sortBy];
    let bValue = b[sortBy];

    // Handle special cases
    if (sortBy === 'categorias') {
      aValue = a.categorias?.join(', ') || '';
      bValue = b.categorias?.join(', ') || '';
    } else if (sortBy === 'zonas') {
      aValue = a.zonas?.join(', ') || '';
      bValue = b.zonas?.join(', ') || '';
    }

    // Handle null/undefined values
    if (aValue == null && bValue == null) return 0;
    if (aValue == null) return sortOrder === 'asc' ? 1 : -1;
    if (bValue == null) return sortOrder === 'asc' ? -1 : 1;

    // Compare values
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortOrder === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }

    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
    }

    // Fallback to string comparison
    const aStr = String(aValue);
    const bStr = String(bValue);
    return sortOrder === 'asc' 
      ? aStr.localeCompare(bStr)
      : bStr.localeCompare(aStr);
  });
}