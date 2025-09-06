import { 
  DueDateItem, 
  DueDateFilters, 
  SLAState, 
  BoardBucket, 
  CalendarEvent,
  DueType,
  Priority
} from './types';

export const computeSLA = (date: string, now: Date, status: string): SLAState => {
  if (status === 'COMPLETADO') return 'ON_TIME';
  
  const dueDate = new Date(date);
  const hoursUntilDue = (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60);
  
  if (hoursUntilDue < 0) return 'LATE';
  if (hoursUntilDue < 24) return 'AT_RISK';
  return 'ON_TIME';
};

export const bucketFor = (date: string, now: Date): string => {
  const itemDate = new Date(date);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
  const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
  
  if (itemDate < today) return 'VENCIDOS';
  if (itemDate < tomorrow) return 'HOY';
  if (itemDate < weekFromNow) return 'SEMANA';
  return 'PROXIMOS';
};

export const addOffset = (date: string, offset: number, unit: 'minutes' | 'hours' | 'days'): Date => {
  const baseDate = new Date(date);
  const multiplier = unit === 'minutes' ? 60 * 1000 : unit === 'hours' ? 60 * 60 * 1000 : 24 * 60 * 60 * 1000;
  return new Date(baseDate.getTime() + offset * multiplier);
};

export const formatDateTime = (date: string, includeTime: boolean = true): string => {
  const d = new Date(date);
  const dateStr = d.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
  
  if (!includeTime) return dateStr;
  
  const timeStr = d.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit'
  });
  
  return `${dateStr} ${timeStr}`;
};

export const formatRelative = (date: string): string => {
  const d = new Date(date);
  const now = new Date();
  const diffMs = d.getTime() - now.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  
  if (Math.abs(diffHours) < 1) {
    const minutes = Math.round(diffMs / (1000 * 60));
    return minutes > 0 ? `en ${minutes}m` : `hace ${Math.abs(minutes)}m`;
  }
  
  if (Math.abs(diffHours) < 24) {
    const hours = Math.round(diffHours);
    return hours > 0 ? `en ${hours}h` : `hace ${Math.abs(hours)}h`;
  }
  
  const days = Math.round(diffDays);
  return days > 0 ? `en ${days}d` : `hace ${Math.abs(days)}d`;
};

export const buildICal = (items: DueDateItem[]): string => {
  const events = items.map(item => `
BEGIN:VEVENT
UID:${item.id}
DTSTART:${new Date(item.date).toISOString().replace(/[-:]/g, '').split('.')[0]}Z
SUMMARY:${item.title}
DESCRIPTION:${item.description || ''}
PRIORITY:${getPriorityNumber(item.priority)}
STATUS:${item.status === 'COMPLETADO' ? 'CONFIRMED' : 'TENTATIVE'}
END:VEVENT`).join('\n');
  
  return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Due Dates Manager//ES
${events}
END:VCALENDAR`;
};

const getPriorityNumber = (priority: Priority): number => {
  const mapping = { BAJA: 9, MEDIA: 5, ALTA: 3, CRITICA: 1 };
  return mapping[priority];
};

export const filtersToQueryString = (filters: DueDateFilters): string => {
  const params = new URLSearchParams();
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== '' && value !== null) {
      params.append(key, String(value));
    }
  });
  
  return params.toString();
};

export const queryStringToFilters = (queryString: string): DueDateFilters => {
  const params = new URLSearchParams(queryString);
  const filters: DueDateFilters = {};
  
  // String fields
  const stringFields = ['from', 'to', 'tipo', 'estado', 'prioridad', 'oficina', 'equipo', 'agente', 'entidad', 'sla', 'q', 'sort'];
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
};

export const getDueTypeColor = (type: DueType): string => {
  const colors = {
    OFERTA: '#3B82F6', // blue
    RESERVA: '#10B981', // green
    CONTRATO: '#8B5CF6', // purple
    DUE_DILIGENCE: '#F59E0B', // amber
    PAGO: '#EF4444', // red
    DOCUMENTO: '#6B7280', // gray
    TAREA: '#06B6D4' // cyan
  };
  return colors[type];
};

export const getPriorityColor = (priority: Priority): string => {
  const colors = {
    BAJA: '#10B981', // green
    MEDIA: '#F59E0B', // amber
    ALTA: '#F97316', // orange
    CRITICA: '#EF4444' // red
  };
  return colors[priority];
};

export const getSLAColor = (sla: SLAState): string => {
  const colors = {
    ON_TIME: '#10B981', // green
    AT_RISK: '#F59E0B', // amber
    LATE: '#EF4444' // red
  };
  return colors[sla];
};

export const getStatusColor = (status: string): string => {
  const colors = {
    PENDIENTE: '#6B7280', // gray
    COMPLETADO: '#10B981', // green
    POSPUESTO: '#F59E0B', // amber
    VENCIDO: '#EF4444' // red
  };
  return colors[status] || '#6B7280';
};

export const getDueTypeIcon = (type: DueType): string => {
  const icons = {
    OFERTA: '💼',
    RESERVA: '📋',
    CONTRATO: '📝',
    DUE_DILIGENCE: '🔍',
    PAGO: '💰',
    DOCUMENTO: '📄',
    TAREA: '✅'
  };
  return icons[type];
};

export const createBoardBuckets = (items: DueDateItem[]): BoardBucket[] => {
  const now = new Date();
  
  const buckets: BoardBucket[] = [
    { id: 'VENCIDOS', title: 'Vencidos', items: [], count: 0, color: '#EF4444' },
    { id: 'HOY', title: 'Hoy', items: [], count: 0, color: '#F59E0B' },
    { id: 'SEMANA', title: 'Esta Semana', items: [], count: 0, color: '#3B82F6' },
    { id: 'PROXIMOS', title: 'Próximos', items: [], count: 0, color: '#6B7280' }
  ];
  
  items.forEach(item => {
    const bucket = bucketFor(item.date, now);
    const bucketIndex = buckets.findIndex(b => b.id === bucket);
    if (bucketIndex !== -1) {
      buckets[bucketIndex].items.push(item);
      buckets[bucketIndex].count++;
    }
  });
  
  return buckets;
};

export const itemsToCalendarEvents = (items: DueDateItem[]): CalendarEvent[] => {
  return items.map(item => ({
    id: item.id,
    title: item.title,
    start: item.date,
    end: item.endDate,
    allDay: item.allDay || false,
    color: getDueTypeColor(item.type),
    type: item.type,
    priority: item.priority,
    sla: item.sla
  }));
};

export const generateTimeSlots = (startHour: number = 8, endHour: number = 20): string[] => {
  const slots: string[] = [];
  for (let hour = startHour; hour < endHour; hour++) {
    slots.push(`${hour.toString().padStart(2, '0')}:00`);
    slots.push(`${hour.toString().padStart(2, '0')}:30`);
  }
  return slots;
};

export const getWeekDays = (date: Date): Date[] => {
  const startOfWeek = new Date(date);
  const day = startOfWeek.getDay();
  const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // Monday as first day
  startOfWeek.setDate(diff);
  
  const days: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const day = new Date(startOfWeek);
    day.setDate(startOfWeek.getDate() + i);
    days.push(day);
  }
  
  return days;
};

export const getMonthCalendar = (year: number, month: number): Date[][] => {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDate = new Date(firstDay);
  
  // Start from Monday
  const dayOfWeek = firstDay.getDay();
  const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  startDate.setDate(firstDay.getDate() - diff);
  
  const weeks: Date[][] = [];
  let currentWeek: Date[] = [];
  
  for (let date = new Date(startDate); date <= lastDay || currentWeek.length < 7; date.setDate(date.getDate() + 1)) {
    currentWeek.push(new Date(date));
    
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
      
      if (date > lastDay) break;
    }
  }
  
  return weeks;
};

export const isToday = (date: Date): boolean => {
  const today = new Date();
  return date.getDate() === today.getDate() &&
         date.getMonth() === today.getMonth() &&
         date.getFullYear() === today.getFullYear();
};

export const isSameMonth = (date1: Date, date2: Date): boolean => {
  return date1.getMonth() === date2.getMonth() && 
         date1.getFullYear() === date2.getFullYear();
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const validateDateRange = (start: string, end?: string): boolean => {
  if (!end) return true;
  
  const startDate = new Date(start);
  const endDate = new Date(end);
  
  return endDate >= startDate;
};

export const generateCronExpression = (recurrence: { freq: string; interval?: number }): string => {
  const { freq, interval = 1 } = recurrence;
  
  switch (freq) {
    case 'DAILY':
      return `0 9 */${interval} * *`; // Every N days at 9 AM
    case 'WEEKLY':
      return `0 9 * * ${interval === 1 ? 1 : `*/${interval}`}`; // Every N weeks on Monday at 9 AM
    case 'MONTHLY':
      return `0 9 1 */${interval} *`; // Every N months on 1st at 9 AM
    default:
      return '0 9 * * *'; // Daily at 9 AM
  }
};

export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void => {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void => {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};