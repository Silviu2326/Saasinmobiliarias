export interface CalendarVisit {
  id: string;
  clienteId: string;
  clienteNombre: string;
  propertyId: string;
  propertyTitle: string;
  propertyAddress: string;
  agenteId: string;
  agenteNombre: string;
  fecha: string;
  ventanaHoraria: string;
  estado: 'pendiente' | 'confirmada' | 'cancelada' | 'hecha';
  confirmado: boolean;
  notas?: string;
}

export interface CalendarFilters {
  from?: string;
  to?: string;
  agente?: string;
  estado?: string;
}

export interface CalendarState {
  view: 'week' | 'day';
  weekStart?: string;
  day?: string;
  agente?: string;
}

export interface TimeSlot {
  hour: number;
  minute: number;
  label: string;
}

export interface CalendarDay {
  date: string;
  dayName: string;
  dayNumber: number;
  isToday: boolean;
  isPast: boolean;
  visits: CalendarVisit[];
}

export interface CalendarEvent {
  visit: CalendarVisit;
  startTime: { hour: number; minute: number };
  endTime: { hour: number; minute: number };
  top: number;
  height: number;
}

export interface CreateVisitData {
  date: string;
  timeSlot: string;
  clienteId?: string;
  propertyId?: string;
  agenteId?: string;
  notas?: string;
}