import { PropertyMapPoint, MapFilters } from './types';
import { Property } from '../properties/types';

export function normalizeToMapPoint(property: Property): PropertyMapPoint {
  return {
    id: property.id,
    title: property.titulo,
    lat: property.coordenadas?.lat || 0,
    lng: property.coordenadas?.lng || 0,
    price: property.precio,
    status: property.estado,
    type: property.tipo,
    address: property.direccion,
    city: property.ciudad,
    m2: property.m2,
    habitaciones: property.habitaciones
  };
}

export function mapFiltersToQueryString(filters: MapFilters): string {
  const params = new URLSearchParams();
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== '' && value !== null && key !== 'bounds') {
      params.append(key, String(value));
    }
  });

  if (filters.bounds) {
    params.append('bounds', JSON.stringify(filters.bounds));
  }
  
  return params.toString();
}

export function queryStringToMapFilters(queryString: string): MapFilters {
  const params = new URLSearchParams(queryString);
  const filters: MapFilters = {};
  
  // String fields
  const stringFields = ['q', 'ciudad', 'tipo', 'estado'];
  stringFields.forEach(field => {
    const value = params.get(field);
    if (value) {
      (filters as any)[field] = value;
    }
  });
  
  // Number fields
  const numberFields = ['priceMin', 'priceMax', 'habitaciones'];
  numberFields.forEach(field => {
    const value = params.get(field);
    if (value && !isNaN(Number(value))) {
      (filters as any)[field] = Number(value);
    }
  });

  // Bounds
  const boundsStr = params.get('bounds');
  if (boundsStr) {
    try {
      filters.bounds = JSON.parse(boundsStr);
    } catch (e) {
      // Ignore invalid bounds
    }
  }
  
  return filters;
}

export function formatMapPrice(price: number): string {
  if (price >= 1000000) {
    return `${(price / 1000000).toFixed(1)}M€`;
  } else if (price >= 1000) {
    return `${Math.round(price / 1000)}K€`;
  }
  return `${price}€`;
}

export function getPropertyStatusColor(status: string): string {
  switch (status) {
    case 'activo':
      return '#10B981'; // green-500
    case 'vendido':
      return '#3B82F6'; // blue-500
    case 'alquilado':
      return '#8B5CF6'; // violet-500
    case 'borrador':
      return '#6B7280'; // gray-500
    default:
      return '#6B7280';
  }
}

export function getPropertyTypeIcon(type: string): string {
  const icons: Record<string, string> = {
    piso: '🏠',
    atico: '🏢',
    duplex: '🏘️',
    casa: '🏡',
    chalet: '🏰',
    estudio: '🏢',
    loft: '🏭',
    local: '🏪',
    oficina: '🏢',
  };
  return icons[type] || '🏠';
}

export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

export function isWithinRadius(
  centerLat: number,
  centerLng: number,
  pointLat: number,
  pointLng: number,
  radiusKm: number
): boolean {
  const distance = calculateDistance(centerLat, centerLng, pointLat, pointLng);
  return distance <= radiusKm;
}

export function getBoundsFromProperties(properties: PropertyMapPoint[]) {
  if (properties.length === 0) {
    return null;
  }

  const lats = properties.map(p => p.lat);
  const lngs = properties.map(p => p.lng);

  return {
    north: Math.max(...lats),
    south: Math.min(...lats),
    east: Math.max(...lngs),
    west: Math.min(...lngs)
  };
}

export function clusterProperties(
  properties: PropertyMapPoint[],
  zoomLevel: number
): Array<{
  lat: number;
  lng: number;
  properties: PropertyMapPoint[];
  isCluster: boolean;
}> {
  if (zoomLevel > 14) {
    // At high zoom, show individual properties
    return properties.map(prop => ({
      lat: prop.lat,
      lng: prop.lng,
      properties: [prop],
      isCluster: false
    }));
  }

  // Simple clustering algorithm based on distance
  const clusters: Array<{
    lat: number;
    lng: number;
    properties: PropertyMapPoint[];
    isCluster: boolean;
  }> = [];

  const clusterRadius = zoomLevel > 12 ? 0.005 : zoomLevel > 10 ? 0.01 : 0.02;

  properties.forEach(property => {
    let addedToCluster = false;

    for (const cluster of clusters) {
      const distance = calculateDistance(
        cluster.lat,
        cluster.lng,
        property.lat,
        property.lng
      );

      if (distance <= clusterRadius) {
        cluster.properties.push(property);
        // Recalculate center
        const avgLat = cluster.properties.reduce((sum, p) => sum + p.lat, 0) / cluster.properties.length;
        const avgLng = cluster.properties.reduce((sum, p) => sum + p.lng, 0) / cluster.properties.length;
        cluster.lat = avgLat;
        cluster.lng = avgLng;
        cluster.isCluster = cluster.properties.length > 1;
        addedToCluster = true;
        break;
      }
    }

    if (!addedToCluster) {
      clusters.push({
        lat: property.lat,
        lng: property.lng,
        properties: [property],
        isCluster: false
      });
    }
  });

  return clusters;
}