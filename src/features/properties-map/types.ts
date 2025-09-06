export interface PropertyMapPoint {
  id: string;
  title: string;
  lat: number;
  lng: number;
  price: number;
  status: 'borrador' | 'activo' | 'vendido' | 'alquilado';
  type: 'piso' | 'atico' | 'duplex' | 'casa' | 'chalet' | 'estudio' | 'loft' | 'local' | 'oficina';
  address?: string;
  city?: string;
  m2?: number;
  habitaciones?: number;
}

export interface MapFilters {
  q?: string;
  ciudad?: string;
  tipo?: string;
  priceMin?: number;
  priceMax?: number;
  habitaciones?: number;
  estado?: string;
  bounds?: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
}

export interface MapSettings {
  clusterEnabled: boolean;
  searchRadius: number; // in kilometers
  centerCity: string;
  zoom: number;
}

export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}