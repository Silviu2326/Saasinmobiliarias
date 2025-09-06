import { Visit, VisitFilters, VisitFormData, VisitFeedbackData, BulkActionData, VisitStats } from './types';

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '/api';

// Visits API
export async function getVisits(filters: VisitFilters = {}): Promise<{ data: Visit[]; total: number; page: number; size: number }> {
  const params = new URLSearchParams();
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      params.append(key, String(value));
    }
  });

  const response = await fetch(`${API_BASE}/visits?${params}`);
  if (!response.ok) {
    throw new Error(`Error ${response.status}: ${response.statusText}`);
  }
  
  return response.json();
}

export async function getVisit(id: string): Promise<Visit> {
  const response = await fetch(`${API_BASE}/visits/${id}`);
  if (!response.ok) {
    throw new Error(`Error ${response.status}: ${response.statusText}`);
  }
  
  return response.json();
}

export async function createVisit(data: VisitFormData): Promise<Visit> {
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

export async function updateVisit(id: string, data: Partial<VisitFormData>): Promise<Visit> {
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

export async function deleteVisit(id: string): Promise<void> {
  const response = await fetch(`${API_BASE}/visits/${id}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    throw new Error(`Error ${response.status}: ${response.statusText}`);
  }
}

export async function confirmVisit(id: string): Promise<Visit> {
  const response = await fetch(`${API_BASE}/visits/${id}/confirm`, {
    method: 'POST',
  });
  
  if (!response.ok) {
    throw new Error(`Error ${response.status}: ${response.statusText}`);
  }
  
  return response.json();
}

export async function cancelVisit(id: string, reason?: string): Promise<Visit> {
  const response = await fetch(`${API_BASE}/visits/${id}/cancel`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ reason }),
  });
  
  if (!response.ok) {
    throw new Error(`Error ${response.status}: ${response.statusText}`);
  }
  
  return response.json();
}

export async function addVisitFeedback(data: VisitFeedbackData): Promise<Visit> {
  const response = await fetch(`${API_BASE}/visits/${data.visitId}/feedback`, {
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

export async function bulkActionVisits(data: BulkActionData): Promise<void> {
  const response = await fetch(`${API_BASE}/visits/bulk-action`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    throw new Error(`Error ${response.status}: ${response.statusText}`);
  }
}

export async function getVisitStats(): Promise<VisitStats> {
  const response = await fetch(`${API_BASE}/visits/stats`);
  if (!response.ok) {
    throw new Error(`Error ${response.status}: ${response.statusText}`);
  }
  
  return response.json();
}

// Export function
export async function exportVisits(filters: VisitFilters = {}): Promise<void> {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      params.append(key, String(value));
    }
  });

  const response = await fetch(`${API_BASE}/visits/export?${params}`);
  if (!response.ok) {
    throw new Error(`Error ${response.status}: ${response.statusText}`);
  }

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `visitas-${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}

// Mock data generation
export function generateMockVisits(count: number = 40): Visit[] {
  const clientes = [
    { id: 'client-1', nombre: 'Ana García', email: 'ana.garcia@email.com', telefono: '666123456' },
    { id: 'client-2', nombre: 'Carlos López', email: 'carlos.lopez@email.com', telefono: '666234567' },
    { id: 'client-3', nombre: 'María Rodríguez', email: 'maria.rodriguez@email.com', telefono: '666345678' },
    { id: 'client-4', nombre: 'José Martín', email: 'jose.martin@email.com', telefono: '666456789' },
    { id: 'client-5', nombre: 'Laura Sánchez', email: 'laura.sanchez@email.com', telefono: '666567890' },
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

  const feedbackComments = [
    'Excelente atención, muy profesional',
    'La propiedad cumplió todas las expectativas',
    'El agente fue muy puntual y resolvió todas mis dudas',
    'Me gustó mucho la zona y el inmueble',
    'Buena experiencia en general',
    'El proceso fue muy fluido'
  ];

  return Array.from({ length: count }, (_, index) => {
    const cliente = clientes[index % clientes.length];
    const property = properties[index % properties.length];
    const agente = agentes[index % agentes.length];
    const estado = estados[Math.floor(Math.random() * estados.length)];
    
    // Generate visit date (past 30 days to future 30 days)
    const visitDate = new Date();
    visitDate.setDate(visitDate.getDate() + Math.floor(Math.random() * 60) - 30);
    
    const createdDate = new Date();
    createdDate.setDate(createdDate.getDate() - Math.floor(Math.random() * 60));

    let feedback = undefined;
    if (estado === 'hecha' && Math.random() > 0.4) {
      feedback = {
        score: (Math.floor(Math.random() * 5) + 1) as 1 | 2 | 3 | 4 | 5,
        comentario: Math.random() > 0.5 ? feedbackComments[Math.floor(Math.random() * feedbackComments.length)] : undefined,
        fechaFeedback: new Date(visitDate.getTime() + 24 * 60 * 60 * 1000).toISOString()
      };
    }

    return {
      id: `visit-${index + 1}`,
      clienteId: cliente.id,
      clienteNombre: cliente.nombre,
      clienteEmail: cliente.email,
      clienteTelefono: cliente.telefono,
      propertyId: property.id,
      propertyTitle: property.title,
      propertyAddress: property.address,
      agenteId: agente.id,
      agenteNombre: agente.nombre,
      fecha: visitDate.toISOString().split('T')[0],
      ventanaHoraria: ventanasHorarias[Math.floor(Math.random() * ventanasHorarias.length)],
      estado,
      confirmado: estado === 'confirmada' || estado === 'hecha',
      notas: Math.random() > 0.7 ? 'Notas adicionales sobre la visita programada' : undefined,
      feedback,
      createdAt: createdDate.toISOString(),
      updatedAt: createdDate.toISOString()
    };
  });
}