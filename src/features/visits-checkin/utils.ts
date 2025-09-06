import { CheckinVisit, CheckinRecord } from './types';

export function getVisitStatus(visit: CheckinVisit): 'not-started' | 'checked-in' | 'completed' {
  if (visit.checkoutRecord) return 'completed';
  if (visit.checkinRecord) return 'checked-in';
  return 'not-started';
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'not-started':
      return 'text-gray-800 bg-gray-100';
    case 'checked-in':
      return 'text-blue-800 bg-blue-100';
    case 'completed':
      return 'text-green-800 bg-green-100';
    default:
      return 'text-gray-800 bg-gray-100';
  }
}

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    'not-started': 'Por iniciar',
    'checked-in': 'En curso',
    'completed': 'Completada'
  };
  return labels[status] || status;
}

export function getStatusIcon(status: string): string {
  switch (status) {
    case 'not-started':
      return '⏳';
    case 'checked-in':
      return '🏃‍♂️';
    case 'completed':
      return '✅';
    default:
      return '⚪';
  }
}

export function formatTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return '';
  }
}

export function formatDateTime(dateString: string): string {
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

export function formatDistance(distance: number | undefined): string {
  if (!distance) return '-';
  
  if (distance < 1) {
    return `${Math.round(distance * 1000)}m`;
  } else {
    return `${Math.round(distance * 10) / 10}km`;
  }
}

export function calculateVisitDuration(checkinTime: string, checkoutTime?: string): number | null {
  if (!checkoutTime) return null;
  
  try {
    const checkin = new Date(checkinTime);
    const checkout = new Date(checkoutTime);
    const diffMs = checkout.getTime() - checkin.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    return diffMinutes;
  } catch {
    return null;
  }
}

export function formatDuration(minutes: number | null): string {
  if (!minutes) return '-';
  
  if (minutes < 60) {
    return `${minutes}min`;
  } else {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}min`;
  }
}

export function isVisitOverdue(visit: CheckinVisit): boolean {
  const now = new Date();
  const [endTime] = visit.ventanaHoraria.split(' - ')[1]?.split(':') || [];
  
  if (!endTime) return false;
  
  try {
    const visitDate = new Date(visit.fecha);
    const [hours, minutes] = endTime.split(':').map(Number);
    visitDate.setHours(hours, minutes);
    
    return now > visitDate && !visit.checkoutRecord;
  } catch {
    return false;
  }
}

export function getTimeUntilVisit(visit: CheckinVisit): number {
  const now = new Date();
  const [startTime] = visit.ventanaHoraria.split(' - ');
  
  if (!startTime) return 0;
  
  try {
    const visitDate = new Date(visit.fecha);
    const [hours, minutes] = startTime.split(':').map(Number);
    visitDate.setHours(hours, minutes);
    
    const diffMs = visitDate.getTime() - now.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    
    return diffMinutes;
  } catch {
    return 0;
  }
}

export function getVisitUrgency(visit: CheckinVisit): 'high' | 'medium' | 'low' {
  if (visit.checkinRecord && !visit.checkoutRecord) {
    // Already checked in, should complete soon
    return 'high';
  }
  
  const minutesUntil = getTimeUntilVisit(visit);
  
  if (minutesUntil < 0) {
    // Past due
    return 'high';
  } else if (minutesUntil <= 30) {
    // Within 30 minutes
    return 'high';
  } else if (minutesUntil <= 120) {
    // Within 2 hours
    return 'medium';
  } else {
    return 'low';
  }
}

export function canCheckin(visit: CheckinVisit): boolean {
  // Can checkin if not already checked in and visit time is within window
  if (visit.checkinRecord) return false;
  
  const minutesUntil = getTimeUntilVisit(visit);
  // Allow checkin 15 minutes before scheduled time
  return minutesUntil <= 15;
}

export function canCheckout(visit: CheckinVisit): boolean {
  // Can checkout if checked in but not checked out
  return !!visit.checkinRecord && !visit.checkoutRecord;
}

export function formatCoordinates(lat: number, lng: number): string {
  return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
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

export function sortVisitsByUrgency(visits: CheckinVisit[]): CheckinVisit[] {
  return [...visits].sort((a, b) => {
    const urgencyA = getVisitUrgency(a);
    const urgencyB = getVisitUrgency(b);
    
    const urgencyValues = { high: 3, medium: 2, low: 1 };
    
    if (urgencyValues[urgencyA] !== urgencyValues[urgencyB]) {
      return urgencyValues[urgencyB] - urgencyValues[urgencyA];
    }
    
    // If same urgency, sort by time
    const timeA = getTimeUntilVisit(a);
    const timeB = getTimeUntilVisit(b);
    
    return timeA - timeB;
  });
}

export function groupVisitsByStatus(visits: CheckinVisit[]): {
  notStarted: CheckinVisit[];
  checkedIn: CheckinVisit[];
  completed: CheckinVisit[];
} {
  return visits.reduce(
    (groups, visit) => {
      const status = getVisitStatus(visit);
      switch (status) {
        case 'not-started':
          groups.notStarted.push(visit);
          break;
        case 'checked-in':
          groups.checkedIn.push(visit);
          break;
        case 'completed':
          groups.completed.push(visit);
          break;
      }
      return groups;
    },
    {
      notStarted: [] as CheckinVisit[],
      checkedIn: [] as CheckinVisit[],
      completed: [] as CheckinVisit[]
    }
  );
}

export function validateCheckinData(data: any): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!data.visitId) errors.visitId = 'ID de visita requerido';
  if (!data.type) errors.type = 'Tipo de acción requerido';
  if (data.lat === undefined || data.lat === null) errors.lat = 'Latitud requerida';
  if (data.lng === undefined || data.lng === null) errors.lng = 'Longitud requerida';

  // Validate coordinates are reasonable (Spain bounds)
  if (data.lat && (data.lat < 35 || data.lat > 44)) {
    errors.lat = 'Coordenadas fuera del rango válido';
  }
  if (data.lng && (data.lng < -10 || data.lng > 5)) {
    errors.lng = 'Coordenadas fuera del rango válido';
  }

  // Validate feedback if provided
  if (data.feedback) {
    if (!data.feedback.score || data.feedback.score < 1 || data.feedback.score > 5) {
      errors['feedback.score'] = 'Puntuación debe ser entre 1 y 5';
    }
  }

  return errors;
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