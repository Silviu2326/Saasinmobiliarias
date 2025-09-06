import { IncidentFilters } from './types';

export function getPriorityColor(priority: string): string {
  switch (priority) {
    case 'baja':
      return 'text-green-800 bg-green-100';
    case 'media':
      return 'text-yellow-800 bg-yellow-100';
    case 'alta':
      return 'text-orange-800 bg-orange-100';
    case 'critica':
      return 'text-red-800 bg-red-100';
    default:
      return 'text-gray-800 bg-gray-100';
  }
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'abierta':
      return 'text-red-800 bg-red-100';
    case 'en_progreso':
      return 'text-blue-800 bg-blue-100';
    case 'pendiente_repuestos':
      return 'text-yellow-800 bg-yellow-100';
    case 'cerrada':
      return 'text-green-800 bg-green-100';
    case 'cancelada':
      return 'text-gray-800 bg-gray-100';
    default:
      return 'text-gray-800 bg-gray-100';
  }
}

export function getCategoryIcon(category: string): string {
  switch (category) {
    case 'mantenimiento':
      return '🔧';
    case 'seguridad':
      return '🔒';
    case 'climatizacion':
      return '❄️';
    case 'fontaneria':
      return '🚿';
    case 'electricidad':
      return '⚡';
    case 'estructura':
      return '🏗️';
    case 'otros':
      return '📋';
    default:
      return '📋';
  }
}

export function getPriorityIcon(priority: string): string {
  switch (priority) {
    case 'baja':
      return '🟢';
    case 'media':
      return '🟡';
    case 'alta':
      return '🟠';
    case 'critica':
      return '🔴';
    default:
      return '⚪';
  }
}

export function getStatusIcon(status: string): string {
  switch (status) {
    case 'abierta':
      return '🔴';
    case 'en_progreso':
      return '🔵';
    case 'pendiente_repuestos':
      return '🟡';
    case 'cerrada':
      return '🟢';
    case 'cancelada':
      return '⚪';
    default:
      return '⚪';
  }
}

export function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    mantenimiento: 'Mantenimiento',
    seguridad: 'Seguridad',
    climatizacion: 'Climatización',
    fontaneria: 'Fontanería',
    electricidad: 'Electricidad',
    estructura: 'Estructura',
    otros: 'Otros'
  };
  return labels[category] || category;
}

export function getPriorityLabel(priority: string): string {
  const labels: Record<string, string> = {
    baja: 'Baja',
    media: 'Media',
    alta: 'Alta',
    critica: 'Crítica'
  };
  return labels[priority] || priority;
}

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    abierta: 'Abierta',
    en_progreso: 'En progreso',
    pendiente_repuestos: 'Pendiente repuestos',
    cerrada: 'Cerrada',
    cancelada: 'Cancelada'
  };
  return labels[status] || status;
}

export function filtersToQueryString(filters: IncidentFilters): string {
  const params = new URLSearchParams();
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== '' && value !== null) {
      params.append(key, String(value));
    }
  });
  
  return params.toString();
}

export function queryStringToFilters(queryString: string): IncidentFilters {
  const params = new URLSearchParams(queryString);
  const filters: IncidentFilters = {};
  
  // String fields
  const stringFields = ['q', 'propertyId', 'category', 'priority', 'status', 'assignedTo', 'reportedBy', 'dateFrom', 'dateTo', 'dueDateFrom', 'dueDateTo'];
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

export function formatCurrency(amount: number | undefined): string {
  if (amount === undefined || amount === null) return '';
  
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(amount);
}

export function isIncidentOverdue(incident: { dueDate?: string; status: string }): boolean {
  if (!incident.dueDate || incident.status === 'cerrada' || incident.status === 'cancelada') {
    return false;
  }
  
  try {
    const dueDate = new Date(incident.dueDate);
    const now = new Date();
    return dueDate < now;
  } catch {
    return false;
  }
}

export function getDaysUntilDue(dueDate: string | undefined): number | null {
  if (!dueDate) return null;
  
  try {
    const due = new Date(dueDate);
    const now = new Date();
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  } catch {
    return null;
  }
}

export function getResolutionTime(reportedDate: string, resolvedDate?: string): number | null {
  if (!resolvedDate) return null;
  
  try {
    const reported = new Date(reportedDate);
    const resolved = new Date(resolvedDate);
    const diffTime = resolved.getTime() - reported.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  } catch {
    return null;
  }
}

export function validateIncidentForm(data: any): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!data.propertyId) errors.propertyId = 'La propiedad es requerida';
  if (!data.title) errors.title = 'El título es requerido';
  if (data.title && data.title.length < 5) errors.title = 'El título debe tener al menos 5 caracteres';
  if (!data.description) errors.description = 'La descripción es requerida';
  if (data.description && data.description.length < 10) errors.description = 'La descripción debe tener al menos 10 caracteres';
  if (!data.category) errors.category = 'La categoría es requerida';
  if (!data.priority) errors.priority = 'La prioridad es requerida';
  if (!data.reportedBy) errors.reportedBy = 'El reportador es requerido';

  if (data.cost && (isNaN(data.cost) || data.cost < 0)) {
    errors.cost = 'El coste debe ser un número positivo';
  }

  if (data.contractorPhone && !/^\d{9}$/.test(data.contractorPhone.replace(/\s/g, ''))) {
    errors.contractorPhone = 'El teléfono debe tener 9 dígitos';
  }

  if (data.dueDate) {
    const dueDate = new Date(data.dueDate);
    const now = new Date();
    if (dueDate < now) {
      errors.dueDate = 'La fecha límite no puede ser anterior a hoy';
    }
  }

  return errors;
}

export function getIncidentSeverityScore(incident: any): number {
  let score = 0;
  
  // Priority weight
  switch (incident.priority) {
    case 'critica': score += 40; break;
    case 'alta': score += 30; break;
    case 'media': score += 20; break;
    case 'baja': score += 10; break;
  }
  
  // Category weight
  switch (incident.category) {
    case 'seguridad': score += 20; break;
    case 'electricidad': score += 15; break;
    case 'estructura': score += 15; break;
    case 'fontaneria': score += 10; break;
    case 'climatizacion': score += 8; break;
    case 'mantenimiento': score += 5; break;
    case 'otros': score += 3; break;
  }
  
  // Overdue penalty
  if (isIncidentOverdue(incident)) {
    score += 20;
  }
  
  return Math.min(score, 100);
}

export function sortIncidentsBySeverity(incidents: any[]): any[] {
  return incidents.sort((a, b) => {
    const scoreA = getIncidentSeverityScore(a);
    const scoreB = getIncidentSeverityScore(b);
    return scoreB - scoreA;
  });
}