import { RouteVisit, OptimizedRoute, RoutePlannerFilters, RouteOptimizationSettings, RouteStats } from './types';

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '/api';

// Route Planner API
export async function getVisitsForRouting(filters: RoutePlannerFilters = {}): Promise<RouteVisit[]> {
  const params = new URLSearchParams();
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== '' && value !== 'all') {
      params.append(key, String(value));
    }
  });

  const response = await fetch(`${API_BASE}/visits/for-routing?${params}`);
  if (!response.ok) {
    throw new Error(`Error ${response.status}: ${response.statusText}`);
  }
  
  return response.json();
}

export async function optimizeRoute(
  visits: RouteVisit[],
  settings: RouteOptimizationSettings
): Promise<OptimizedRoute> {
  const response = await fetch(`${API_BASE}/routes/optimize`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      visits,
      settings
    }),
  });
  
  if (!response.ok) {
    throw new Error(`Error ${response.status}: ${response.statusText}`);
  }
  
  return response.json();
}

export async function saveRoute(route: OptimizedRoute): Promise<OptimizedRoute> {
  const response = await fetch(`${API_BASE}/routes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(route),
  });
  
  if (!response.ok) {
    throw new Error(`Error ${response.status}: ${response.statusText}`);
  }
  
  return response.json();
}

export async function getRoutes(agenteId?: string): Promise<OptimizedRoute[]> {
  const params = new URLSearchParams();
  if (agenteId) {
    params.append('agente', agenteId);
  }

  const response = await fetch(`${API_BASE}/routes?${params}`);
  if (!response.ok) {
    throw new Error(`Error ${response.status}: ${response.statusText}`);
  }
  
  return response.json();
}

export async function deleteRoute(routeId: string): Promise<void> {
  const response = await fetch(`${API_BASE}/routes/${routeId}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    throw new Error(`Error ${response.status}: ${response.statusText}`);
  }
}

export async function getRouteStats(routeId: string): Promise<RouteStats> {
  const response = await fetch(`${API_BASE}/routes/${routeId}/stats`);
  if (!response.ok) {
    throw new Error(`Error ${response.status}: ${response.statusText}`);
  }
  
  return response.json();
}

// Calculate distance between two points (Haversine formula)
export function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Mock data generation
export function generateMockRoutingVisits(count: number = 12): RouteVisit[] {
  const clientes = [
    { id: 'client-1', nombre: 'Ana García', telefono: '666123456' },
    { id: 'client-2', nombre: 'Carlos López', telefono: '666234567' },
    { id: 'client-3', nombre: 'María Rodríguez', telefono: '666345678' },
    { id: 'client-4', nombre: 'José Martín', telefono: '666456789' },
    { id: 'client-5', nombre: 'Laura Sánchez', telefono: '666567890' },
    { id: 'client-6', nombre: 'Pedro Ruiz', telefono: '666678901' },
    { id: 'client-7', nombre: 'Carmen Vega', telefono: '666789012' },
    { id: 'client-8', nombre: 'Antonio Silva', telefono: '666890123' },
  ];

  const properties = [
    { 
      id: 'prop-1', 
      title: 'Piso en Malasaña', 
      address: 'Calle Fuencarral 45, Madrid',
      lat: 40.4255,
      lng: -3.7025
    },
    { 
      id: 'prop-2', 
      title: 'Ático en Salamanca', 
      address: 'Calle Serrano 123, Madrid',
      lat: 40.4312,
      lng: -3.6838
    },
    { 
      id: 'prop-3', 
      title: 'Casa en Las Rozas', 
      address: 'Urbanización Monte Rozas, Las Rozas',
      lat: 40.4921,
      lng: -3.8736
    },
    { 
      id: 'prop-4', 
      title: 'Loft en Chueca', 
      address: 'Calle Hortaleza 67, Madrid',
      lat: 40.4215,
      lng: -3.6985
    },
    { 
      id: 'prop-5', 
      title: 'Dúplex en Chamberí', 
      address: 'Calle Almagro 34, Madrid',
      lat: 40.4378,
      lng: -3.6952
    },
    { 
      id: 'prop-6', 
      title: 'Estudio en Sol', 
      address: 'Plaza del Sol 12, Madrid',
      lat: 40.4168,
      lng: -3.7038
    },
    { 
      id: 'prop-7', 
      title: 'Casa en Pozuelo', 
      address: 'Avenida de Europa 28, Pozuelo',
      lat: 40.4247,
      lng: -3.8106
    },
    { 
      id: 'prop-8', 
      title: 'Piso en Retiro', 
      address: 'Calle Alfonso XII 56, Madrid',
      lat: 40.4153,
      lng: -3.6844
    },
    { 
      id: 'prop-9', 
      title: 'Apartamento en Lavapies', 
      address: 'Calle Embajadores 89, Madrid',
      lat: 40.4088,
      lng: -3.7021
    },
    { 
      id: 'prop-10', 
      title: 'Casa en Majadahonda', 
      address: 'Calle Real 45, Majadahonda',
      lat: 40.4738,
      lng: -3.8707
    },
  ];

  const agentes = [
    { id: 'agent-1', nombre: 'Pedro Ruiz' },
    { id: 'agent-2', nombre: 'Carmen Vega' },
    { id: 'agent-3', nombre: 'Antonio Silva' },
    { id: 'agent-4', nombre: 'Isabel Torres' },
  ];

  const estados = ['pendiente', 'confirmada'] as const;
  const prioridades = ['alta', 'media', 'baja'] as const;
  const ventanasHorarias = [
    '09:00 - 10:00',
    '10:00 - 11:00',
    '11:00 - 12:00',
    '12:00 - 13:00',
    '16:00 - 17:00',
    '17:00 - 18:00',
    '18:00 - 19:00',
    '19:00 - 20:00'
  ];

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  // Base location for distance calculation (Madrid center)
  const baseLocation = { lat: 40.4168, lng: -3.7038 };

  return Array.from({ length: count }, (_, index) => {
    const cliente = clientes[index % clientes.length];
    const property = properties[index % properties.length];
    const agente = agentes[index % agentes.length];
    const estado = estados[Math.floor(Math.random() * estados.length)];
    const prioridad = prioridades[Math.floor(Math.random() * prioridades.length)];
    
    // Calculate distance from base location
    const distanciaEstimada = calculateDistance(
      baseLocation.lat, baseLocation.lng,
      property.lat, property.lng
    );

    // Estimate visit time based on priority and property type
    let tiempoEstimado = 60; // base 60 minutes
    if (prioridad === 'alta') tiempoEstimado = 90;
    if (prioridad === 'baja') tiempoEstimado = 45;
    if (property.title.includes('Casa')) tiempoEstimado += 15;
    if (property.title.includes('Ático')) tiempoEstimado += 10;

    return {
      id: `route-visit-${index + 1}`,
      clienteId: cliente.id,
      clienteNombre: cliente.nombre,
      clienteTelefono: cliente.telefono,
      propertyId: property.id,
      propertyTitle: property.title,
      propertyAddress: property.address,
      propertyLat: property.lat,
      propertyLng: property.lng,
      agenteId: agente.id,
      agenteNombre: agente.nombre,
      fecha: tomorrowStr,
      ventanaHoraria: ventanasHorarias[index % ventanasHorarias.length],
      estado,
      confirmado: estado === 'confirmada',
      notas: Math.random() > 0.7 ? 'Visita importante para cierre' : undefined,
      distanciaEstimada: Math.round(distanciaEstimada * 10) / 10,
      prioridad,
      tiempoEstimado
    };
  });
}

export function generateMockOptimizedRoutes(count: number = 3): OptimizedRoute[] {
  const agentes = [
    { id: 'agent-1', nombre: 'Pedro Ruiz' },
    { id: 'agent-2', nombre: 'Carmen Vega' },
    { id: 'agent-3', nombre: 'Antonio Silva' },
  ];

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  return Array.from({ length: count }, (_, index) => {
    const agente = agentes[index];
    const visits = generateMockRoutingVisits(5 + Math.floor(Math.random() * 3));
    
    // Create stops with estimated times
    let currentTime = new Date(`${tomorrowStr}T09:00:00`);
    const stops = visits.slice(0, 5 + Math.floor(Math.random() * 3)).map((visit, stopIndex) => {
      const travelTime = stopIndex === 0 ? 0 : 15 + Math.floor(Math.random() * 20);
      const travelDistance = stopIndex === 0 ? 0 : visit.distanciaEstimada || 0;
      
      if (stopIndex > 0) {
        currentTime = new Date(currentTime.getTime() + travelTime * 60000);
      }
      
      const estimatedArrival = currentTime.toISOString();
      currentTime = new Date(currentTime.getTime() + visit.tiempoEstimado * 60000);
      const estimatedDeparture = currentTime.toISOString();
      
      return {
        visitId: visit.id,
        visit,
        order: stopIndex + 1,
        estimatedArrival,
        estimatedDeparture,
        travelTime,
        travelDistance
      };
    });

    const totalDistance = stops.reduce((sum, stop) => sum + (stop.travelDistance || 0), 0);
    const totalTime = stops.reduce((sum, stop) => sum + (stop.travelTime || 0) + stop.visit.tiempoEstimado, 0);

    return {
      id: `route-${index + 1}`,
      agenteId: agente.id,
      agenteNombre: agente.nombre,
      fecha: tomorrowStr,
      stops,
      totalDistance: Math.round(totalDistance * 10) / 10,
      totalTime,
      totalVisits: stops.length,
      startLocation: {
        lat: 40.4168,
        lng: -3.7038,
        address: 'Oficina Central, Madrid',
        name: 'Oficina'
      },
      optimizationMethod: 'nearest-neighbor' as const,
      createdAt: new Date().toISOString(),
      status: index === 0 ? 'active' : 'draft' as const
    };
  });
}