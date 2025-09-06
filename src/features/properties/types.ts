export interface Property {
  id: string;
  titulo: string;
  direccion: string;
  ciudad: string;
  coordenadas?: {
    lat: number;
    lng: number;
  };
  tipo: 'piso' | 'atico' | 'duplex' | 'casa' | 'chalet' | 'estudio' | 'loft' | 'local' | 'oficina';
  precio: number;
  m2: number;
  habitaciones: number;
  banos: number;
  estado: 'borrador' | 'activo' | 'vendido' | 'alquilado';
  exclusiva: boolean;
  agente?: string;
  descripcion?: string;
  caracteristicas?: string[];
  fotos?: string[];
  documentos?: string[];
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  portalSync?: {
    idealista?: boolean;
    fotocasa?: boolean;
    pisos?: boolean;
    habitaclia?: boolean;
  };
  actividad?: {
    visitas: number;
    consultas: number;
    guardados: number;
  };
  pricing?: {
    precioOriginal: number;
    ultimoCambio?: string;
    historialPrecios?: Array<{
      precio: number;
      fecha: string;
      motivo?: string;
    }>;
  };
}

export interface PropertyFilters {
  q?: string;
  estado?: Property['estado'];
  tipo?: Property['tipo'];
  ciudad?: string;
  priceMin?: number;
  priceMax?: number;
  habitaciones?: number;
  exclusiva?: boolean;
  agente?: string;
  portalSync?: boolean;
  page?: number;
  size?: number;
  sort?: string;
}

export interface PropertyFormData {
  titulo: string;
  direccion: string;
  ciudad: string;
  coordenadas?: {
    lat: number;
    lng: number;
  };
  tipo: Property['tipo'];
  precio: number;
  m2: number;
  habitaciones: number;
  banos: number;
  estado: Property['estado'];
  exclusiva: boolean;
  agente?: string;
  descripcion?: string;
  caracteristicas?: string[];
}

export interface PropertiesResponse {
  data: Property[];
  total: number;
  page: number;
  size: number;
  totalPages: number;
}

export interface PropertyStats {
  total: number;
  activos: number;
  vendidos: number;
  alquilados: number;
  borradores: number;
  exclusivas: number;
  valorTotal: number;
  precioMedio: number;
}