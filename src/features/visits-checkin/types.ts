export interface CheckinVisit {
  id: string;
  clienteId: string;
  clienteNombre: string;
  clienteTelefono?: string;
  propertyId: string;
  propertyTitle: string;
  propertyAddress: string;
  propertyLat?: number;
  propertyLng?: number;
  agenteId: string;
  agenteNombre: string;
  fecha: string;
  ventanaHoraria: string;
  estado: 'pendiente' | 'confirmada' | 'cancelada' | 'hecha';
  confirmado: boolean;
  notas?: string;
  checkinRecord?: CheckinRecord;
  checkoutRecord?: CheckinRecord;
  distanciaEstimada?: number; // km
}

export interface CheckinRecord {
  id: string;
  visitId: string;
  agenteId: string;
  type: 'in' | 'out';
  lat: number;
  lng: number;
  at: string;
  notes?: string;
  feedback?: CheckinFeedback;
}

export interface CheckinFeedback {
  score: 1 | 2 | 3 | 4 | 5;
  comentario?: string;
}

export interface CheckinFormData {
  visitId: string;
  type: 'in' | 'out';
  lat: number;
  lng: number;
  notes?: string;
  feedback?: CheckinFeedback;
}

export interface TodayVisitsFilters {
  agente?: string;
  includeCompleted?: boolean;
}

export interface CheckinStats {
  totalVisits: number;
  checkedIn: number;
  completed: number;
  pending: number;
  avgDistance: number;
  avgDuration: number; // minutes
}