import { RouteVisit, OptimizedRoute, RouteStop, RouteLocation, RouteOptimizationSettings, RouteValidation, RouteStats } from './types';
import { calculateDistance } from './apis';

// Route optimization using nearest neighbor heuristic
export function optimizeRouteNearestNeighbor(
  visits: RouteVisit[],
  settings: RouteOptimizationSettings
): RouteStop[] {
  if (visits.length === 0) return [];
  if (visits.length === 1) {
    const visit = visits[0];
    return [{
      visitId: visit.id,
      visit,
      order: 1,
      travelTime: calculateTravelTime(settings.startLocation, { lat: visit.propertyLat, lng: visit.propertyLng }, settings.averageSpeedKmh),
      travelDistance: calculateDistance(settings.startLocation.lat, settings.startLocation.lng, visit.propertyLat, visit.propertyLng)
    }];
  }

  const unvisited = [...visits];
  const route: RouteStop[] = [];
  let currentLocation = settings.startLocation;
  let currentTime = parseTimeString(settings.startTime);

  // Apply traffic buffer if enabled
  const speedMultiplier = settings.includeTrafficBuffer 
    ? 1 - (settings.trafficBufferPercent / 100)
    : 1;
  const effectiveSpeed = settings.averageSpeedKmh * speedMultiplier;

  while (unvisited.length > 0) {
    let nextVisitIndex = 0;
    let minCost = Infinity;

    // Find the next best visit using a combination of distance and time window preference
    for (let i = 0; i < unvisited.length; i++) {
      const visit = unvisited[i];
      const distance = calculateDistance(
        currentLocation.lat, currentLocation.lng,
        visit.propertyLat, visit.propertyLng
      );
      
      let cost = distance;

      // If prioritizing time windows, adjust cost based on how well the visit fits the schedule
      if (settings.prioritizeTimeWindows) {
        const travelTime = calculateTravelTime(currentLocation, { lat: visit.propertyLat, lng: visit.propertyLng }, effectiveSpeed);
        const arrivalTime = currentTime + travelTime;
        const timeWindowCost = calculateTimeWindowCost(visit, arrivalTime);
        cost = (distance * 0.7) + (timeWindowCost * 0.3);
      }

      // Adjust cost based on priority
      const priorityMultiplier = visit.prioridad === 'alta' ? 0.8 : visit.prioridad === 'media' ? 1 : 1.2;
      cost *= priorityMultiplier;

      if (cost < minCost) {
        minCost = cost;
        nextVisitIndex = i;
      }
    }

    // Add the selected visit to the route
    const selectedVisit = unvisited[nextVisitIndex];
    const travelTime = calculateTravelTime(currentLocation, { lat: selectedVisit.propertyLat, lng: selectedVisit.propertyLng }, effectiveSpeed);
    const travelDistance = calculateDistance(
      currentLocation.lat, currentLocation.lng,
      selectedVisit.propertyLat, selectedVisit.propertyLng
    );

    currentTime += travelTime;
    const arrivalTime = new Date();
    arrivalTime.setHours(0, 0, 0, 0);
    arrivalTime.setMinutes(arrivalTime.getMinutes() + currentTime);

    const departureTime = new Date(arrivalTime);
    departureTime.setMinutes(departureTime.getMinutes() + selectedVisit.tiempoEstimado);

    route.push({
      visitId: selectedVisit.id,
      visit: selectedVisit,
      order: route.length + 1,
      estimatedArrival: arrivalTime.toISOString(),
      estimatedDeparture: departureTime.toISOString(),
      travelTime: Math.round(travelTime),
      travelDistance: Math.round(travelDistance * 10) / 10
    });

    // Update current location and time
    currentLocation = { lat: selectedVisit.propertyLat, lng: selectedVisit.propertyLng };
    currentTime += selectedVisit.tiempoEstimado;

    // Remove the selected visit from unvisited
    unvisited.splice(nextVisitIndex, 1);
  }

  return route;
}

// Calculate travel time in minutes
export function calculateTravelTime(from: RouteLocation, to: RouteLocation, speedKmh: number): number {
  const distance = calculateDistance(from.lat, from.lng, to.lat, to.lng);
  const timeHours = distance / speedKmh;
  return Math.round(timeHours * 60);
}

// Calculate cost based on time window compliance
function calculateTimeWindowCost(visit: RouteVisit, estimatedArrivalMinutes: number): number {
  const [startTime, endTime] = visit.ventanaHoraria.split(' - ').map(parseTimeString);
  
  if (estimatedArrivalMinutes >= startTime && estimatedArrivalMinutes <= endTime) {
    return 0; // Perfect timing
  } else if (estimatedArrivalMinutes < startTime) {
    return (startTime - estimatedArrivalMinutes) / 60; // Cost for being early
  } else {
    return Math.pow((estimatedArrivalMinutes - endTime) / 60, 2); // Exponential cost for being late
  }
}

// Parse time string (HH:MM) to minutes since midnight
function parseTimeString(timeStr: string): number {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
}

// Format minutes since midnight to HH:MM
export function formatTimeFromMinutes(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

// Calculate route statistics
export function calculateRouteStats(route: OptimizedRoute): RouteStats {
  const stops = route.stops;
  
  if (stops.length === 0) {
    return {
      totalVisits: 0,
      totalDistance: 0,
      totalTime: 0,
      averageVisitDuration: 0,
      furthestDistance: 0,
      efficiency: 0
    };
  }

  const totalDistance = stops.reduce((sum, stop) => sum + (stop.travelDistance || 0), 0);
  const totalTime = stops.reduce((sum, stop) => sum + (stop.travelTime || 0) + stop.visit.tiempoEstimado, 0);
  const averageVisitDuration = stops.reduce((sum, stop) => sum + stop.visit.tiempoEstimado, 0) / stops.length;
  const furthestDistance = Math.max(...stops.map(stop => stop.travelDistance || 0));
  
  // Calculate efficiency as a score based on distance per visit and time per visit
  const avgDistancePerVisit = totalDistance / stops.length;
  const avgTimePerVisit = totalTime / stops.length;
  
  // Efficiency score (0-100): lower distance and time per visit = higher efficiency
  const distanceEfficiency = Math.max(0, 100 - (avgDistancePerVisit * 5));
  const timeEfficiency = Math.max(0, 100 - (avgTimePerVisit / 2));
  const efficiency = Math.round((distanceEfficiency + timeEfficiency) / 2);

  return {
    totalVisits: stops.length,
    totalDistance: Math.round(totalDistance * 10) / 10,
    totalTime: Math.round(totalTime),
    averageVisitDuration: Math.round(averageVisitDuration),
    furthestDistance: Math.round(furthestDistance * 10) / 10,
    efficiency: Math.min(100, Math.max(0, efficiency))
  };
}

// Validate route
export function validateRoute(route: OptimizedRoute, settings: RouteOptimizationSettings): RouteValidation {
  const errors: string[] = [];
  const warnings: string[] = [];
  const suggestions: string[] = [];

  // Check basic requirements
  if (route.stops.length === 0) {
    errors.push('La ruta debe tener al menos una visita');
  }

  // Check distance and time limits
  if (settings.maxRouteDistance && route.totalDistance > settings.maxRouteDistance) {
    errors.push(`La ruta excede la distancia máxima (${route.totalDistance}km > ${settings.maxRouteDistance}km)`);
  }

  if (settings.maxRouteTime && route.totalTime > settings.maxRouteTime * 60) {
    errors.push(`La ruta excede el tiempo máximo (${Math.round(route.totalTime/60)}h > ${settings.maxRouteTime}h)`);
  }

  // Check for time window violations
  route.stops.forEach((stop, index) => {
    if (stop.estimatedArrival) {
      const arrivalTime = new Date(stop.estimatedArrival);
      const [startTime, endTime] = stop.visit.ventanaHoraria.split(' - ');
      
      const arrivalMinutes = arrivalTime.getHours() * 60 + arrivalTime.getMinutes();
      const windowStart = parseTimeString(startTime);
      const windowEnd = parseTimeString(endTime);

      if (arrivalMinutes < windowStart) {
        warnings.push(`Visita ${index + 1}: Llegada temprana (${formatTimeFromMinutes(arrivalMinutes)} < ${startTime})`);
      } else if (arrivalMinutes > windowEnd) {
        warnings.push(`Visita ${index + 1}: Llegada tardía (${formatTimeFromMinutes(arrivalMinutes)} > ${endTime})`);
      }
    }
  });

  // Check for efficiency issues
  const stats = calculateRouteStats(route);
  if (stats.efficiency < 60) {
    suggestions.push('Considere reordenar las visitas para mejorar la eficiencia de la ruta');
  }

  if (stats.furthestDistance > 20) {
    suggestions.push('La visita más lejana está a más de 20km. Considere dividir en múltiples rutas');
  }

  // Check for priority distribution
  const highPriorityCount = route.stops.filter(stop => stop.visit.prioridad === 'alta').length;
  const totalStops = route.stops.length;
  
  if (highPriorityCount > totalStops * 0.7) {
    warnings.push('La mayoría de visitas son de alta prioridad. Considere redistribuir');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    suggestions
  };
}

// Get priority color
export function getPriorityColor(prioridad: 'alta' | 'media' | 'baja'): string {
  switch (prioridad) {
    case 'alta':
      return 'text-red-800 bg-red-100';
    case 'media':
      return 'text-yellow-800 bg-yellow-100';
    case 'baja':
      return 'text-green-800 bg-green-100';
    default:
      return 'text-gray-800 bg-gray-100';
  }
}

// Get route status color
export function getRouteStatusColor(status: 'draft' | 'active' | 'completed'): string {
  switch (status) {
    case 'draft':
      return 'text-gray-800 bg-gray-100';
    case 'active':
      return 'text-blue-800 bg-blue-100';
    case 'completed':
      return 'text-green-800 bg-green-100';
    default:
      return 'text-gray-800 bg-gray-100';
  }
}

// Get route status label
export function getRouteStatusLabel(status: 'draft' | 'active' | 'completed'): string {
  switch (status) {
    case 'draft':
      return 'Borrador';
    case 'active':
      return 'Activa';
    case 'completed':
      return 'Completada';
    default:
      return status;
  }
}

// Format duration
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}min`;
  } else {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}min` : `${hours}h`;
  }
}

// Format distance
export function formatDistance(km: number): string {
  if (km < 1) {
    return `${Math.round(km * 1000)}m`;
  } else {
    return `${Math.round(km * 10) / 10}km`;
  }
}

// Sort visits by priority and time
export function sortVisitsByPriority(visits: RouteVisit[]): RouteVisit[] {
  return [...visits].sort((a, b) => {
    const priorityOrder = { alta: 3, media: 2, baja: 1 };
    const priorityDiff = priorityOrder[b.prioridad] - priorityOrder[a.prioridad];
    
    if (priorityDiff !== 0) {
      return priorityDiff;
    }
    
    // If same priority, sort by time window
    const timeA = parseTimeString(a.ventanaHoraria.split(' - ')[0]);
    const timeB = parseTimeString(b.ventanaHoraria.split(' - ')[0]);
    
    return timeA - timeB;
  });
}

// Group visits by agent
export function groupVisitsByAgent(visits: RouteVisit[]): Record<string, RouteVisit[]> {
  return visits.reduce((groups, visit) => {
    if (!groups[visit.agenteId]) {
      groups[visit.agenteId] = [];
    }
    groups[visit.agenteId].push(visit);
    return groups;
  }, {} as Record<string, RouteVisit[]>);
}

// Check if two routes overlap in time
export function checkRouteTimeOverlap(route1: OptimizedRoute, route2: OptimizedRoute): boolean {
  if (route1.fecha !== route2.fecha || route1.agenteId !== route2.agenteId) {
    return false;
  }

  const route1Start = route1.stops[0]?.estimatedArrival;
  const route1End = route1.stops[route1.stops.length - 1]?.estimatedDeparture;
  const route2Start = route2.stops[0]?.estimatedArrival;
  const route2End = route2.stops[route2.stops.length - 1]?.estimatedDeparture;

  if (!route1Start || !route1End || !route2Start || !route2End) {
    return false;
  }

  const start1 = new Date(route1Start).getTime();
  const end1 = new Date(route1End).getTime();
  const start2 = new Date(route2Start).getTime();
  const end2 = new Date(route2End).getTime();

  return !(end1 <= start2 || start1 >= end2);
}

// Generate route export data
export function generateRouteExport(route: OptimizedRoute): string {
  const headers = [
    'Orden',
    'Cliente',
    'Propiedad',
    'Dirección',
    'Ventana Horaria',
    'Llegada Estimada',
    'Salida Estimada',
    'Tiempo de Viaje',
    'Distancia',
    'Prioridad',
    'Duración Estimada',
    'Notas'
  ];

  const rows = route.stops.map(stop => [
    stop.order,
    stop.visit.clienteNombre,
    stop.visit.propertyTitle,
    stop.visit.propertyAddress,
    stop.visit.ventanaHoraria,
    stop.estimatedArrival ? new Date(stop.estimatedArrival).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) : '',
    stop.estimatedDeparture ? new Date(stop.estimatedDeparture).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) : '',
    formatDuration(stop.travelTime || 0),
    formatDistance(stop.travelDistance || 0),
    stop.visit.prioridad,
    formatDuration(stop.visit.tiempoEstimado),
    stop.visit.notas || ''
  ]);

  const csvContent = [headers, ...rows]
    .map(row => row.map(cell => `"${cell}"`).join(','))
    .join('\n');

  return csvContent;
}

// Debounce function for search/filter inputs
export function debounce<T extends (...args: any[]) => void>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}