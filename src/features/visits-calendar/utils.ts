import { CalendarVisit, CalendarDay, CalendarEvent, TimeSlot, CalendarState, CalendarFilters } from './types';

export function getWeekDays(weekStart: string): CalendarDay[] {
  const start = new Date(weekStart);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const days: CalendarDay[] = [];
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    
    const dateString = date.toISOString().split('T')[0];
    const isToday = date.getTime() === today.getTime();
    const isPast = date < today;
    
    days.push({
      date: dateString,
      dayName: date.toLocaleDateString('es-ES', { weekday: 'short' }),
      dayNumber: date.getDate(),
      isToday,
      isPast,
      visits: []
    });
  }
  
  return days;
}

export function getWeekStart(date: string): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Start on Monday
  const monday = new Date(d.setDate(diff));
  return monday.toISOString().split('T')[0];
}

export function getNextWeek(weekStart: string): string {
  const date = new Date(weekStart);
  date.setDate(date.getDate() + 7);
  return date.toISOString().split('T')[0];
}

export function getPrevWeek(weekStart: string): string {
  const date = new Date(weekStart);
  date.setDate(date.getDate() - 7);
  return date.toISOString().split('T')[0];
}

export function getNextDay(day: string): string {
  const date = new Date(day);
  date.setDate(date.getDate() + 1);
  return date.toISOString().split('T')[0];
}

export function getPrevDay(day: string): string {
  const date = new Date(day);
  date.setDate(date.getDate() - 1);
  return date.toISOString().split('T')[0];
}

export function getCurrentWeekStart(): string {
  return getWeekStart(new Date().toISOString().split('T')[0]);
}

export function getCurrentDay(): string {
  return new Date().toISOString().split('T')[0];
}

export function generateTimeSlots(): TimeSlot[] {
  const slots: TimeSlot[] = [];
  
  // Morning slots (9:00 - 13:00)
  for (let hour = 9; hour < 13; hour++) {
    slots.push({
      hour,
      minute: 0,
      label: `${hour.toString().padStart(2, '0')}:00`
    });
  }
  
  // Afternoon slots (16:00 - 20:00)
  for (let hour = 16; hour < 20; hour++) {
    slots.push({
      hour,
      minute: 0,
      label: `${hour.toString().padStart(2, '0')}:00`
    });
  }
  
  return slots;
}

export function parseTimeSlot(timeSlot: string): { start: TimeSlot; end: TimeSlot } {
  const [startTime, endTime] = timeSlot.split(' - ');
  const [startHour, startMinute] = startTime.split(':').map(Number);
  const [endHour, endMinute] = endTime.split(':').map(Number);
  
  return {
    start: { hour: startHour, minute: startMinute, label: startTime },
    end: { hour: endHour, minute: endMinute, label: endTime }
  };
}

export function createCalendarEvent(visit: CalendarVisit): CalendarEvent {
  const { start, end } = parseTimeSlot(visit.ventanaHoraria);
  
  // Calculate position (assuming 60px per hour)
  const startPosition = (start.hour - 9) * 60 + (start.minute / 60) * 60;
  const endPosition = (end.hour - 9) * 60 + (end.minute / 60) * 60;
  const height = endPosition - startPosition;
  
  return {
    visit,
    startTime: start,
    endTime: end,
    top: startPosition,
    height: Math.max(height, 40) // Minimum height
  };
}

export function groupVisitsByDate(visits: CalendarVisit[]): Record<string, CalendarVisit[]> {
  return visits.reduce((groups, visit) => {
    if (!groups[visit.fecha]) {
      groups[visit.fecha] = [];
    }
    groups[visit.fecha].push(visit);
    return groups;
  }, {} as Record<string, CalendarVisit[]>);
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'pendiente':
      return 'border-yellow-400 bg-yellow-50 text-yellow-800';
    case 'confirmada':
      return 'border-blue-400 bg-blue-50 text-blue-800';
    case 'cancelada':
      return 'border-red-400 bg-red-50 text-red-800';
    case 'hecha':
      return 'border-green-400 bg-green-50 text-green-800';
    default:
      return 'border-gray-400 bg-gray-50 text-gray-800';
  }
}

export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    });
  } catch {
    return dateString;
  }
}

export function formatShortDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit'
    });
  } catch {
    return dateString;
  }
}

export function filtersToQueryString(filters: CalendarFilters): string {
  const params = new URLSearchParams();
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== '' && value !== null) {
      params.append(key, String(value));
    }
  });
  
  return params.toString();
}

export function queryStringToFilters(queryString: string): CalendarFilters {
  const params = new URLSearchParams(queryString);
  const filters: CalendarFilters = {};
  
  const stringFields = ['from', 'to', 'agente', 'estado'];
  stringFields.forEach(field => {
    const value = params.get(field);
    if (value) {
      (filters as any)[field] = value;
    }
  });
  
  return filters;
}

export function stateToQueryString(state: CalendarState): string {
  const params = new URLSearchParams();
  
  Object.entries(state).forEach(([key, value]) => {
    if (value !== undefined && value !== '' && value !== null) {
      params.append(key, String(value));
    }
  });
  
  return params.toString();
}

export function queryStringToState(queryString: string): CalendarState {
  const params = new URLSearchParams(queryString);
  
  return {
    view: (params.get('view') as 'week' | 'day') || 'week',
    weekStart: params.get('weekStart') || undefined,
    day: params.get('day') || undefined,
    agente: params.get('agente') || undefined
  };
}

export function isTimeSlotAvailable(date: string, timeSlot: string, visits: CalendarVisit[], agenteId?: string): boolean {
  const dayVisits = visits.filter(v => 
    v.fecha === date && 
    (agenteId ? v.agenteId === agenteId : true) && 
    v.estado !== 'cancelada'
  );
  
  return !dayVisits.some(v => v.ventanaHoraria === timeSlot);
}

export function getAvailableTimeSlots(date: string, visits: CalendarVisit[], agenteId?: string): string[] {
  const allSlots = [
    '09:00 - 10:00',
    '10:00 - 11:00',
    '11:00 - 12:00',
    '12:00 - 13:00',
    '16:00 - 17:00',
    '17:00 - 18:00',
    '18:00 - 19:00',
    '19:00 - 20:00'
  ];
  
  return allSlots.filter(slot => isTimeSlotAvailable(date, slot, visits, agenteId));
}

export function canDropVisit(sourceDate: string, sourceTime: string, targetDate: string, targetTime: string, visits: CalendarVisit[], agenteId?: string): boolean {
  // Can't drop on same slot
  if (sourceDate === targetDate && sourceTime === targetTime) {
    return false;
  }
  
  // Check if target slot is available
  return isTimeSlotAvailable(targetDate, targetTime, visits, agenteId);
}

export function simulateVisitDrag(visitId: string, newDate: string, newTimeSlot: string): Promise<CalendarVisit> {
  // Simulate API call delay
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id: visitId,
        clienteId: 'client-1',
        clienteNombre: 'Cliente Simulado',
        propertyId: 'prop-1',
        propertyTitle: 'Propiedad Simulada',
        propertyAddress: 'Dirección Simulada',
        agenteId: 'agent-1',
        agenteNombre: 'Agente Simulado',
        fecha: newDate,
        ventanaHoraria: newTimeSlot,
        estado: 'pendiente',
        confirmado: false
      });
    }, 500);
  });
}