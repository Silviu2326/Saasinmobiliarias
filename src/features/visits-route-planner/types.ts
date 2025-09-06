export interface RouteVisit {
  id: string;
  clienteId: string;
  clienteNombre: string;
  clienteTelefono?: string;
  propertyId: string;
  propertyTitle: string;
  propertyAddress: string;
  propertyLat: number;
  propertyLng: number;
  agenteId: string;
  agenteNombre: string;
  fecha: string;
  ventanaHoraria: string;
  estado: 'pendiente' | 'confirmada' | 'cancelada' | 'hecha';
  confirmado: boolean;
  notas?: string;
  distanciaEstimada?: number; // km
  prioridad: 'alta' | 'media' | 'baja';
  tiempoEstimado: number; // minutes
}

export interface RouteStop {
  visitId: string;
  visit: RouteVisit;
  order: number;
  estimatedArrival?: string;
  estimatedDeparture?: string;
  travelTime?: number; // minutes from previous stop
  travelDistance?: number; // km from previous stop
}

export interface OptimizedRoute {
  id: string;
  agenteId: string;
  agenteNombre: string;
  fecha: string;
  stops: RouteStop[];
  totalDistance: number; // km
  totalTime: number; // minutes
  totalVisits: number;
  startLocation: RouteLocation;
  endLocation?: RouteLocation;
  optimizationMethod: 'nearest-neighbor' | 'manual';
  createdAt: string;
  status: 'draft' | 'active' | 'completed';
}

export interface RouteLocation {
  lat: number;
  lng: number;
  address?: string;
  name?: string;
}

export interface RouteOptimizationSettings {
  startLocation: RouteLocation;
  endLocation?: RouteLocation;
  startTime: string; // HH:MM format
  averageVisitDuration: number; // minutes
  averageSpeedKmh: number;
  includeTrafficBuffer: boolean;
  trafficBufferPercent: number;
  prioritizeTimeWindows: boolean;
  maxRouteDistance?: number; // km
  maxRouteTime?: number; // hours
}

export interface RoutePlannerFilters {
  fecha?: string;
  agente?: string;
  estado?: 'pendiente' | 'confirmada' | 'all';
  prioridad?: 'alta' | 'media' | 'baja' | 'all';
  zona?: string;
}

export interface RouteStats {
  totalVisits: number;
  totalDistance: number;
  totalTime: number;
  averageVisitDuration: number;
  furthestDistance: number;
  efficiency: number; // 0-100 score
}

export interface DragDropState {
  draggedItem: RouteStop | null;
  dropZone: 'unassigned' | 'route' | null;
  insertIndex?: number;
}

export interface RouteValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
}