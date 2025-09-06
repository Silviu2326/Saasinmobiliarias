import { CalendarVisit, CalendarFilters, CreateVisitData } from './types';

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '/api';

// Calendar API
export async function getCalendarVisits(filters: CalendarFilters = {}): Promise<CalendarVisit[]> {
  const params = new URLSearchParams();
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      params.append(key, String(value));
    }
  });

  const response = await fetch(`${API_BASE}/visits/calendar?${params}`);
  if (!response.ok) {
    throw new Error(`Error ${response.status}: ${response.statusText}`);
  }
  
  return response.json();
}

export async function createVisitFromCalendar(data: CreateVisitData): Promise<CalendarVisit> {
  const response = await fetch(`${API_BASE}/visits`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    throw new Error(`Error ${response.status}: ${response.statusText}`);
  }
  
  return response.json();
}

export async function rescheduleVisit(id: string, data: { fecha: string; ventanaHoraria: string }): Promise<CalendarVisit> {
  const response = await fetch(`${API_BASE}/visits/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    throw new Error(`Error ${response.status}: ${response.statusText}`);
  }
  
  return response.json();
}

// Mock data generation
export function generateMockCalendarVisits(count: number = 20, dateRange: { from: string; to: string }): CalendarVisit[] {
  const clientes = [
    { id: 'client-1', nombre: 'Ana García' },
    { id: 'client-2', nombre: 'Carlos López' },
    { id: 'client-3', nombre: 'María Rodríguez' },
    { id: 'client-4', nombre: 'José Martín' },
    { id: 'client-5', nombre: 'Laura Sánchez' },
  ];

  const properties = [
    { id: 'prop-1', title: 'Piso en Malasaña', address: 'Calle Fuencarral 45, Madrid' },
    { id: 'prop-2', title: 'Ático en Salamanca', address: 'Calle Serrano 123, Madrid' },
    { id: 'prop-3', title: 'Casa en Las Rozas', address: 'Urbanización Monte Rozas, Las Rozas' },
    { id: 'prop-4', title: 'Loft en Chueca', address: 'Calle Hortaleza 67, Madrid' },
    { id: 'prop-5', title: 'Dúplex en Chamberí', address: 'Calle Almagro 34, Madrid' },
  ];

  const agentes = [
    { id: 'agent-1', nombre: 'Pedro Ruiz' },
    { id: 'agent-2', nombre: 'Carmen Vega' },
    { id: 'agent-3', nombre: 'Antonio Silva' },
    { id: 'agent-4', nombre: 'Isabel Torres' },
    { id: 'agent-5', nombre: 'Manuel Jiménez' },
  ];

  const estados = ['pendiente', 'confirmada', 'cancelada', 'hecha'] as const;
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

  const fromDate = new Date(dateRange.from);
  const toDate = new Date(dateRange.to);
  const dateSpan = toDate.getTime() - fromDate.getTime();

  return Array.from({ length: count }, (_, index) => {
    const cliente = clientes[index % clientes.length];
    const property = properties[index % properties.length];
    const agente = agentes[index % agentes.length];
    const estado = estados[Math.floor(Math.random() * estados.length)];
    
    // Generate random date within range
    const randomTime = fromDate.getTime() + Math.random() * dateSpan;
    const visitDate = new Date(randomTime);
    
    return {
      id: `calendar-visit-${index + 1}`,
      clienteId: cliente.id,
      clienteNombre: cliente.nombre,
      propertyId: property.id,
      propertyTitle: property.title,
      propertyAddress: property.address,
      agenteId: agente.id,
      agenteNombre: agente.nombre,
      fecha: visitDate.toISOString().split('T')[0],
      ventanaHoraria: ventanasHorarias[Math.floor(Math.random() * ventanasHorarias.length)],
      estado,
      confirmado: estado === 'confirmada' || estado === 'hecha',
      notas: Math.random() > 0.7 ? 'Notas adicionales sobre la visita' : undefined,
    };
  });
}