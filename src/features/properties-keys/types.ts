export interface PropertyKey {
  id: string;
  propertyId: string;
  propertyTitle: string;
  propertyAddress: string;
  keyCode: string;
  description?: string;
  location: 'oficina' | 'inmobiliaria' | 'propietario' | 'inquilino' | 'agente' | 'otro';
  locationDetail?: string;
  status: 'disponible' | 'entregada' | 'perdida' | 'duplicada' | 'retirada';
  assignedTo?: string;
  assignedDate?: string;
  returnDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface KeyMovement {
  id: string;
  keyId: string;
  type: 'entrega' | 'devolucion' | 'traslado' | 'duplicacion' | 'perdida';
  fromLocation: string;
  toLocation: string;
  fromPerson?: string;
  toPerson?: string;
  reason: string;
  notes?: string;
  createdBy: string;
  createdAt: string;
}

export interface KeyFilters {
  q?: string;
  propertyId?: string;
  keyCode?: string;
  location?: string;
  status?: string;
  assignedTo?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface KeyFormData {
  propertyId: string;
  keyCode: string;
  description?: string;
  location: string;
  locationDetail?: string;
  status: string;
  assignedTo?: string;
  notes?: string;
}

export interface KeyMovementFormData {
  keyId: string;
  type: string;
  fromLocation: string;
  toLocation: string;
  fromPerson?: string;
  toPerson?: string;
  reason: string;
  notes?: string;
}