import { CheckinVisit, CheckinRecord, CheckinFormData, TodayVisitsFilters, CheckinStats } from './types';

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '/api';

// Checkin API
export async function getTodayVisits(filters: TodayVisitsFilters = {}): Promise<CheckinVisit[]> {
  const params = new URLSearchParams();
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      params.append(key, String(value));
    }
  });

  const response = await fetch(`${API_BASE}/visits/today?${params}`);
  if (!response.ok) {
    throw new Error(`Error ${response.status}: ${response.statusText}`);
  }
  
  return response.json();
}

export async function checkin(data: CheckinFormData): Promise<CheckinRecord> {
  const response = await fetch(`${API_BASE}/visits/${data.visitId}/checkin`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      lat: data.lat,
      lng: data.lng,
      at: new Date().toISOString(),
      notes: data.notes
    }),
  });
  
  if (!response.ok) {
    throw new Error(`Error ${response.status}: ${response.statusText}`);
  }
  
  return response.json();
}

export async function checkout(data: CheckinFormData): Promise<CheckinRecord> {
  const response = await fetch(`${API_BASE}/visits/${data.visitId}/checkout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      lat: data.lat,
      lng: data.lng,
      at: new Date().toISOString(),
      notes: data.notes,
      feedback: data.feedback
    }),
  });
  
  if (!response.ok) {
    throw new Error(`Error ${response.status}: ${response.statusText}`);
  }
  
  return response.json();
}

export async function getCheckinHistory(agenteId: string, limit: number = 10): Promise<CheckinRecord[]> {
  const response = await fetch(`${API_BASE}/visits/checkin-history?agente=${agenteId}&limit=${limit}`);
  if (!response.ok) {
    throw new Error(`Error ${response.status}: ${response.statusText}`);
  }
  
  return response.json();
}

export async function getCheckinStats(agenteId?: string): Promise<CheckinStats> {
  const params = new URLSearchParams();
  if (agenteId) {
    params.append('agente', agenteId);
  }

  const response = await fetch(`${API_BASE}/visits/checkin-stats?${params}`);
  if (!response.ok) {
    throw new Error(`Error ${response.status}: ${response.statusText}`);
  }
  
  return response.json();
}

// Mock geolocation
export function simulateGeolocation(): Promise<{ lat: number; lng: number }> {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Simulate Madrid area coordinates
      const lat = 40.4168 + (Math.random() - 0.5) * 0.1;
      const lng = -3.7038 + (Math.random() - 0.5) * 0.1;
      resolve({ lat, lng });
    }, 1000);
  });
}

// Mock data generation
export function generateMockTodayVisits(count: number = 8): CheckinVisit[] {
  const clientes = [
    { id: 'client-1', nombre: 'Ana García', telefono: '666123456' },
    { id: 'client-2', nombre: 'Carlos López', telefono: '666234567' },
    { id: 'client-3', nombre: 'María Rodríguez', telefono: '666345678' },
    { id: 'client-4', nombre: 'José Martín', telefono: '666456789' },
    { id: 'client-5', nombre: 'Laura Sánchez', telefono: '666567890' },
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
  ];

  const agentes = [
    { id: 'agent-1', nombre: 'Pedro Ruiz' },
    { id: 'agent-2', nombre: 'Carmen Vega' },
    { id: 'agent-3', nombre: 'Antonio Silva' },
    { id: 'agent-4', nombre: 'Isabel Torres' },
    { id: 'agent-5', nombre: 'Manuel Jiménez' },
  ];

  const estados = ['pendiente', 'confirmada'] as const;
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

  const today = new Date().toISOString().split('T')[0];

  // Base location for distance calculation (Madrid center)
  const baseLocation = { lat: 40.4168, lng: -3.7038 };

  return Array.from({ length: count }, (_, index) => {
    const cliente = clientes[index % clientes.length];
    const property = properties[index % properties.length];
    const agente = agentes[index % agentes.length];
    const estado = estados[Math.floor(Math.random() * estados.length)];
    
    // Calculate distance from base location
    const distanciaEstimada = Math.sqrt(
      Math.pow(property.lat - baseLocation.lat, 2) + 
      Math.pow(property.lng - baseLocation.lng, 2)
    ) * 111; // Rough km conversion

    const hasCheckin = Math.random() > 0.6;
    const hasCheckout = hasCheckin && Math.random() > 0.5;

    let checkinRecord: CheckinRecord | undefined;
    let checkoutRecord: CheckinRecord | undefined;

    if (hasCheckin) {
      const checkinTime = new Date();
      checkinTime.setHours(9 + Math.floor(Math.random() * 8), Math.floor(Math.random() * 60));
      
      checkinRecord = {
        id: `checkin-${index + 1}`,
        visitId: `today-visit-${index + 1}`,
        agenteId: agente.id,
        type: 'in',
        lat: property.lat + (Math.random() - 0.5) * 0.001,
        lng: property.lng + (Math.random() - 0.5) * 0.001,
        at: checkinTime.toISOString(),
        notes: Math.random() > 0.7 ? 'Llegada puntual' : undefined
      };

      if (hasCheckout) {
        const checkoutTime = new Date(checkinTime);
        checkoutTime.setMinutes(checkinTime.getMinutes() + 30 + Math.floor(Math.random() * 60));
        
        checkoutRecord = {
          id: `checkout-${index + 1}`,
          visitId: `today-visit-${index + 1}`,
          agenteId: agente.id,
          type: 'out',
          lat: property.lat + (Math.random() - 0.5) * 0.001,
          lng: property.lng + (Math.random() - 0.5) * 0.001,
          at: checkoutTime.toISOString(),
          notes: Math.random() > 0.7 ? 'Visita completada satisfactoriamente' : undefined,
          feedback: Math.random() > 0.5 ? {
            score: (Math.floor(Math.random() * 5) + 1) as 1 | 2 | 3 | 4 | 5,
            comentario: 'Cliente muy interesado en la propiedad'
          } : undefined
        };
      }
    }

    return {
      id: `today-visit-${index + 1}`,
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
      fecha: today,
      ventanaHoraria: ventanasHorarias[index % ventanasHorarias.length],
      estado,
      confirmado: estado === 'confirmada',
      notas: Math.random() > 0.7 ? 'Notas importantes sobre la visita' : undefined,
      checkinRecord,
      checkoutRecord,
      distanciaEstimada: Math.round(distanciaEstimada * 10) / 10
    };
  });
}

export function generateMockCheckinHistory(count: number = 15): CheckinRecord[] {
  const agentes = ['agent-1', 'agent-2', 'agent-3', 'agent-4', 'agent-5'];
  const types = ['in', 'out'] as const;
  const notes = [
    'Llegada puntual',
    'Cliente esperando',
    'Visita completada',
    'Sin incidencias',
    'Todo correcto',
    'Cliente muy interesado',
    'Seguimiento necesario'
  ];

  return Array.from({ length: count }, (_, index) => {
    const recordDate = new Date();
    recordDate.setDate(recordDate.getDate() - Math.floor(Math.random() * 7));
    recordDate.setHours(9 + Math.floor(Math.random() * 8), Math.floor(Math.random() * 60));

    const type = types[index % types.length];

    return {
      id: `history-record-${index + 1}`,
      visitId: `visit-${index + 1}`,
      agenteId: agentes[Math.floor(Math.random() * agentes.length)],
      type,
      lat: 40.4168 + (Math.random() - 0.5) * 0.1,
      lng: -3.7038 + (Math.random() - 0.5) * 0.1,
      at: recordDate.toISOString(),
      notes: Math.random() > 0.5 ? notes[Math.floor(Math.random() * notes.length)] : undefined,
      feedback: type === 'out' && Math.random() > 0.7 ? {
        score: (Math.floor(Math.random() * 5) + 1) as 1 | 2 | 3 | 4 | 5,
        comentario: 'Feedback sobre la visita realizada'
      } : undefined
    };
  });
}