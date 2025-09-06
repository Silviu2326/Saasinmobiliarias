export interface Offer {
  id: string;
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
  importe: number;
  condiciones: string;
  estado: 'abierta' | 'counter' | 'aceptada' | 'rechazada' | 'expirada';
  venceEl: string;
  notas?: string;
  createdAt: string;
  updatedAt: string;
  counterOffers?: CounterOffer[];
  attachments?: OfferAttachment[];
}

export interface CounterOffer {
  id: string;
  offerId: string;
  importe: number;
  condiciones: string;
  notas?: string;
  createdBy: string;
  createdByName: string;
  createdAt: string;
}

export interface OfferEvent {
  id: string;
  offerId: string;
  type: 'create' | 'counter' | 'accept' | 'reject' | 'expire' | 'update';
  at: string;
  by: string;
  byName: string;
  notes?: string;
  data?: Record<string, any>;
}

export interface OfferAttachment {
  id: string;
  offerId: string;
  filename: string;
  size: number;
  type: string;
  uploadedBy: string;
  uploadedByName: string;
  uploadedAt: string;
  url?: string;
}

export interface OfferFormData {
  clienteId: string;
  propertyId: string;
  importe: number;
  condiciones: string;
  venceEl: string;
  notas?: string;
}

export interface CounterOfferFormData {
  importe: number;
  condiciones: string;
  notas?: string;
}

export interface OffersFilters {
  q?: string;
  propertyId?: string;
  clienteId?: string;
  estado?: 'all' | 'abierta' | 'counter' | 'aceptada' | 'rechazada' | 'expirada';
  precioMin?: number;
  precioMax?: number;
  agenteId?: string;
  fechaDesde?: string;
  fechaHasta?: string;
  vencimiento?: 'all' | 'proximas' | 'vencidas';
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface OffersResponse {
  offers: Offer[];
  total: number;
  page: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface OfferStats {
  total: number;
  abiertas: number;
  counter: number;
  aceptadas: number;
  rechazadas: number;
  expiradas: number;
  importeTotal: number;
  importePromedio: number;
  tasaAceptacion: number;
  tiempoPromedio: number; // días
}

export interface BulkAction {
  action: 'accept' | 'reject' | 'delete' | 'export';
  offerIds: string[];
  notes?: string;
}