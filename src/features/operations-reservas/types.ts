export interface Reserva {
  id: string;
  ofertaId?: string;
  clienteId: string;
  clienteNombre: string;
  clienteEmail?: string;
  clienteTelefono?: string;
  propertyId: string;
  propertyTitle: string;
  propertyAddress: string;
  propertyPrice?: number;
  agenteId: string;
  agenteNombre: string;
  tipo: 'senal' | 'arras';
  importe: number;
  estado: 'borrador' | 'firmada' | 'cancelada';
  venceEl: string;
  condiciones: string;
  notas?: string;
  createdAt: string;
  updatedAt: string;
  cancelReason?: string;
  canceledAt?: string;
  canceledBy?: string;
  signedAt?: string;
  signedBy?: string;
  attachments?: ReservaAttachment[];
  payments?: ReservaPago[];
}

export interface ReservaPago {
  id: string;
  reservaId: string;
  concepto: string;
  importe: number;
  dueDate: string;
  paidAt?: string;
  paidBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReservaAttachment {
  id: string;
  reservaId: string;
  filename: string;
  size: number;
  type: string;
  uploadedBy: string;
  uploadedByName: string;
  uploadedAt: string;
  url?: string;
}

export interface ReservaEvent {
  id: string;
  reservaId: string;
  type: 'create' | 'sign' | 'cancel' | 'update' | 'payment';
  at: string;
  by: string;
  byName: string;
  notes?: string;
  data?: Record<string, any>;
}

export interface ReservaFormData {
  ofertaId?: string;
  clienteId: string;
  propertyId: string;
  tipo: 'senal' | 'arras';
  importe: number;
  venceEl: string;
  condiciones: string;
  notas?: string;
  attachments?: File[];
}

export interface ReservaSignData {
  notes?: string;
}

export interface ReservaCancelData {
  reason: string;
  notes?: string;
}

export interface ReservasFilters {
  q?: string;
  estado?: 'all' | 'borrador' | 'firmada' | 'cancelada';
  tipo?: 'all' | 'senal' | 'arras';
  propertyId?: string;
  clienteId?: string;
  agenteId?: string;
  fechaDesde?: string;
  fechaHasta?: string;
  vencimiento?: 'all' | 'proximas' | 'vencidas';
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ReservasResponse {
  reservas: Reserva[];
  total: number;
  page: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ReservaStats {
  total: number;
  borrador: number;
  firmada: number;
  cancelada: number;
  importeTotal: number;
  importePromedio: number;
  tasaConversion: number;
  tiempoPromedio: number; // días
}

export interface BulkReservaAction {
  action: 'sign' | 'cancel' | 'delete' | 'export';
  reservaIds: string[];
  notes?: string;
  reason?: string; // for cancel action
}