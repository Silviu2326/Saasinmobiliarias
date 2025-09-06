import { PropertyMapPoint, MapFilters } from './types';

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '/api';

export async function getMapProperties(filters: MapFilters = {}): Promise<PropertyMapPoint[]> {
  const params = new URLSearchParams();
  
  // Add basic filters
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== '' && key !== 'bounds') {
      params.append(key, String(value));
    }
  });

  // Add bounds filter if present
  if (filters.bounds) {
    params.append('bounds', JSON.stringify(filters.bounds));
  }

  // Request only geo and basic fields for map performance
  params.append('fields', 'geo,basic');
  
  const response = await fetch(`${API_BASE}/properties?${params}`);
  if (!response.ok) {
    throw new Error(`Error ${response.status}: ${response.statusText}`);
  }
  
  return response.json();
}

// City coordinates for centering map
export const CITY_COORDINATES: Record<string, { lat: number; lng: number; zoom: number }> = {
  Madrid: { lat: 40.4168, lng: -3.7038, zoom: 11 },
  Barcelona: { lat: 41.3851, lng: 2.1734, zoom: 11 },
  Valencia: { lat: 39.4699, lng: -0.3763, zoom: 11 },
  Sevilla: { lat: 37.3886, lng: -5.9823, zoom: 11 },
  Bilbao: { lat: 43.2627, lng: -2.9253, zoom: 11 },
  Málaga: { lat: 36.7213, lng: -4.4214, zoom: 11 },
  Zaragoza: { lat: 41.6488, lng: -0.8891, zoom: 11 },
  Murcia: { lat: 37.9922, lng: -1.1307, zoom: 11 },
};

export function generateMockMapProperties(count: number = 30): PropertyMapPoint[] {
  const cities = Object.keys(CITY_COORDINATES);
  const tipos = ['piso', 'atico', 'duplex', 'casa', 'chalet', 'estudio', 'loft'] as const;
  const estados = ['borrador', 'activo', 'vendido', 'alquilado'] as const;

  return Array.from({ length: count }, (_, index) => {
    const city = cities[index % cities.length];
    const cityCoords = CITY_COORDINATES[city];
    
    // Add some random offset to spread properties around the city
    const latOffset = (Math.random() - 0.5) * 0.1; // ~5km radius
    const lngOffset = (Math.random() - 0.5) * 0.1;
    
    const tipo = tipos[Math.floor(Math.random() * tipos.length)];
    const estado = estados[Math.floor(Math.random() * estados.length)];
    const precio = Math.floor(Math.random() * 800000) + 100000;
    const m2 = Math.floor(Math.random() * 200) + 50;
    const habitaciones = Math.floor(Math.random() * 5) + 1;

    return {
      id: `map-prop-${index + 1}`,
      title: `${tipo.charAt(0).toUpperCase() + tipo.slice(1)} en ${city}`,
      lat: cityCoords.lat + latOffset,
      lng: cityCoords.lng + lngOffset,
      price: precio,
      status: estado,
      type: tipo,
      address: `Calle Ejemplo ${Math.floor(Math.random() * 100) + 1}`,
      city,
      m2,
      habitaciones
    };
  });
}