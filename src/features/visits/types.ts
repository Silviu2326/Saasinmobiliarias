export interface Visit {
  id: string;
  clienteId: string;
  clienteNombre: string;
  clienteEmail?: string;
  clienteTelefono?: string;
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
  feedback?: VisitFeedback;
  createdAt: string;
  updatedAt: string;
}

export interface VisitFeedback {
  score: 1 | 2 | 3 | 4 | 5;
  comentario?: string;
  fechaFeedback: string;
}

export interface VisitFilters {
  q?: string;
  agente?: string;
  cliente?: string;
  property?: string;
  estado?: string;
  from?: string;
  to?: string;
  page?: number;
  size?: number;
  sort?: string;
}

export interface VisitFormData {
  clienteId: string;
  propertyId: string;
  agenteId: string;
  fecha: string;
  ventanaHoraria: string;
  notas?: string;
}

export interface VisitFeedbackData {
  visitId: string;
  score: 1 | 2 | 3 | 4 | 5;
  comentario?: string;
}

export interface BulkActionData {
  visitIds: string[];
  action: 'confirm' | 'cancel';
  reason?: string;
}

export interface VisitStats {
  total: number;
  pendiente: number;
  confirmada: number;
  cancelada: number;
  hecha: number;
  avgFeedback: number;
  completionRate: number;
}