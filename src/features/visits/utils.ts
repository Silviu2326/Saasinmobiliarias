import { VisitFilters } from './types';

export function getStatusColor(status: string): string {
  switch (status) {
    case 'pendiente':
      return 'text-yellow-800 bg-yellow-100';
    case 'confirmada':
      return 'text-blue-800 bg-blue-100';
    case 'cancelada':
      return 'text-red-800 bg-red-100';
    case 'hecha':
      return 'text-green-800 bg-green-100';
    default:
      return 'text-gray-800 bg-gray-100';
  }
}

export function getStatusIcon(status: string): string {
  switch (status) {
    case 'pendiente':
      return '🟡';
    case 'confirmada':
      return '🔵';
    case 'cancelada':
      return '🔴';
    case 'hecha':
      return '🟢';
    default:
      return '⚪';
  }
}

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    pendiente: 'Pendiente',
    confirmada: 'Confirmada',
    cancelada: 'Cancelada',
    hecha: 'Realizada'
  };
  return labels[status] || status;
}

export function formatVisitDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      weekday: 'short',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  } catch {
    return dateString;
  }
}

export function formatVisitDateTime(dateString: string, timeSlot: string): string {
  const date = formatVisitDate(dateString);
  return `${date} ${timeSlot}`;
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

export function isVisitToday(dateString: string): boolean {
  try {
    const visitDate = new Date(dateString);
    const today = new Date();
    
    return visitDate.toDateString() === today.toDateString();
  } catch {
    return false;
  }
}

export function isVisitTomorrow(dateString: string): boolean {
  try {
    const visitDate = new Date(dateString);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    return visitDate.toDateString() === tomorrow.toDateString();
  } catch {
    return false;
  }
}

export function isVisitPast(dateString: string): boolean {
  try {
    const visitDate = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return visitDate < today;
  } catch {
    return false;
  }
}

export function getVisitDaysFromNow(dateString: string): number {
  try {
    const visitDate = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    visitDate.setHours(0, 0, 0, 0);
    
    const diffTime = visitDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  } catch {
    return 0;
  }
}

export function formatFeedbackStars(score: number): string {
  const fullStars = '★'.repeat(score);
  const emptyStars = '☆'.repeat(5 - score);
  return fullStars + emptyStars;
}

export function getFeedbackColor(score: number): string {
  if (score >= 4) return 'text-green-600';
  if (score >= 3) return 'text-yellow-600';
  return 'text-red-600';
}

export function filtersToQueryString(filters: VisitFilters): string {
  const params = new URLSearchParams();
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== '' && value !== null) {
      params.append(key, String(value));
    }
  });
  
  return params.toString();
}

export function queryStringToFilters(queryString: string): VisitFilters {
  const params = new URLSearchParams(queryString);
  const filters: VisitFilters = {};
  
  // String fields
  const stringFields = ['q', 'agente', 'cliente', 'property', 'estado', 'from', 'to', 'sort'];
  stringFields.forEach(field => {
    const value = params.get(field);
    if (value) {
      (filters as any)[field] = value;
    }
  });

  // Number fields
  const numberFields = ['page', 'size'];
  numberFields.forEach(field => {
    const value = params.get(field);
    if (value && !isNaN(Number(value))) {
      (filters as any)[field] = Number(value);
    }
  });
  
  return filters;
}

export function validateVisitForm(data: any): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!data.clienteId) errors.clienteId = 'El cliente es requerido';
  if (!data.propertyId) errors.propertyId = 'La propiedad es requerida';
  if (!data.agenteId) errors.agenteId = 'El agente es requerido';
  if (!data.fecha) errors.fecha = 'La fecha es requerida';
  if (!data.ventanaHoraria) errors.ventanaHoraria = 'La ventana horaria es requerida';

  // Validate date is in the future
  if (data.fecha) {
    const visitDate = new Date(data.fecha);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (visitDate < today) {
      errors.fecha = 'La fecha no puede ser anterior a hoy';
    }
  }

  // Validate time slot format
  if (data.ventanaHoraria && !/^\d{2}:\d{2} - \d{2}:\d{2}$/.test(data.ventanaHoraria)) {
    errors.ventanaHoraria = 'Formato de ventana horaria inválido (HH:MM - HH:MM)';
  }

  return errors;
}

export function generateTimeSlots(): string[] {
  const slots = [];
  
  // Morning slots (9:00 - 13:00)
  for (let hour = 9; hour < 13; hour++) {
    slots.push(`${hour.toString().padStart(2, '0')}:00 - ${(hour + 1).toString().padStart(2, '0')}:00`);
  }
  
  // Afternoon slots (16:00 - 20:00)
  for (let hour = 16; hour < 20; hour++) {
    slots.push(`${hour.toString().padStart(2, '0')}:00 - ${(hour + 1).toString().padStart(2, '0')}:00`);
  }
  
  return slots;
}

export function getVisitUrgency(visit: any): 'high' | 'medium' | 'low' {
  const daysFromNow = getVisitDaysFromNow(visit.fecha);
  
  if (daysFromNow < 0) return 'high'; // Past due
  if (daysFromNow <= 1) return 'high'; // Today or tomorrow
  if (daysFromNow <= 7) return 'medium'; // This week
  return 'low'; // More than a week
}

export function sortVisits(visits: any[], sortBy: string, sortOrder: 'asc' | 'desc') {
  return [...visits].sort((a, b) => {
    let aValue = a[sortBy];
    let bValue = b[sortBy];

    // Handle special cases
    if (sortBy === 'fechaCompleta') {
      aValue = new Date(`${a.fecha}T${a.ventanaHoraria.split(' - ')[0]}:00`).getTime();
      bValue = new Date(`${b.fecha}T${b.ventanaHoraria.split(' - ')[0]}:00`).getTime();
    } else if (sortBy === 'feedback') {
      aValue = a.feedback?.score || 0;
      bValue = b.feedback?.score || 0;
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