export interface PropertyIncident {
  id: string;
  propertyId: string;
  propertyTitle: string;
  propertyAddress: string;
  title: string;
  description: string;
  category: 'mantenimiento' | 'seguridad' | 'climatizacion' | 'fontaneria' | 'electricidad' | 'estructura' | 'otros';
  priority: 'baja' | 'media' | 'alta' | 'critica';
  status: 'abierta' | 'en_progreso' | 'pendiente_repuestos' | 'cerrada' | 'cancelada';
  reportedBy: string;
  reportedDate: string;
  assignedTo?: string;
  assignedDate?: string;
  dueDate?: string;
  resolvedDate?: string;
  resolution?: string;
  cost?: number;
  contractor?: string;
  contractorPhone?: string;
  images?: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IncidentComment {
  id: string;
  incidentId: string;
  author: string;
  content: string;
  createdAt: string;
}

export interface IncidentFilters {
  q?: string;
  propertyId?: string;
  category?: string;
  priority?: string;
  status?: string;
  assignedTo?: string;
  reportedBy?: string;
  dateFrom?: string;
  dateTo?: string;
  dueDateFrom?: string;
  dueDateTo?: string;
}

export interface IncidentFormData {
  propertyId: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  reportedBy: string;
  assignedTo?: string;
  dueDate?: string;
  cost?: number;
  contractor?: string;
  contractorPhone?: string;
  notes?: string;
}

export interface IncidentCommentFormData {
  incidentId: string;
  content: string;
}

export interface IncidentStats {
  total: number;
  open: number;
  inProgress: number;
  closed: number;
  overdue: number;
  averageResolutionTime: number;
  totalCost: number;
}