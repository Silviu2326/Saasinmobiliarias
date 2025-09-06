import { PropertyIncident, IncidentComment, IncidentFilters, IncidentFormData, IncidentCommentFormData, IncidentStats } from './types';

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '/api';

// Incidents API
export async function getIncidents(filters: IncidentFilters = {}): Promise<PropertyIncident[]> {
  const params = new URLSearchParams();
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      params.append(key, String(value));
    }
  });

  const response = await fetch(`${API_BASE}/properties/incidents?${params}`);
  if (!response.ok) {
    throw new Error(`Error ${response.status}: ${response.statusText}`);
  }
  
  return response.json();
}

export async function getIncident(id: string): Promise<PropertyIncident> {
  const response = await fetch(`${API_BASE}/properties/incidents/${id}`);
  if (!response.ok) {
    throw new Error(`Error ${response.status}: ${response.statusText}`);
  }
  
  return response.json();
}

export async function createIncident(data: IncidentFormData): Promise<PropertyIncident> {
  const response = await fetch(`${API_BASE}/properties/incidents`, {
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

export async function updateIncident(id: string, data: Partial<IncidentFormData>): Promise<PropertyIncident> {
  const response = await fetch(`${API_BASE}/properties/incidents/${id}`, {
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

export async function deleteIncident(id: string): Promise<void> {
  const response = await fetch(`${API_BASE}/properties/incidents/${id}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    throw new Error(`Error ${response.status}: ${response.statusText}`);
  }
}

export async function bulkDeleteIncidents(ids: string[]): Promise<void> {
  const response = await fetch(`${API_BASE}/properties/incidents/bulk-delete`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ ids }),
  });
  
  if (!response.ok) {
    throw new Error(`Error ${response.status}: ${response.statusText}`);
  }
}

export async function closeIncident(id: string, resolution: string): Promise<PropertyIncident> {
  const response = await fetch(`${API_BASE}/properties/incidents/${id}/close`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ resolution }),
  });
  
  if (!response.ok) {
    throw new Error(`Error ${response.status}: ${response.statusText}`);
  }
  
  return response.json();
}

export async function assignIncident(id: string, assignedTo: string): Promise<PropertyIncident> {
  const response = await fetch(`${API_BASE}/properties/incidents/${id}/assign`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ assignedTo }),
  });
  
  if (!response.ok) {
    throw new Error(`Error ${response.status}: ${response.statusText}`);
  }
  
  return response.json();
}

// Comments API
export async function getIncidentComments(incidentId: string): Promise<IncidentComment[]> {
  const response = await fetch(`${API_BASE}/properties/incidents/${incidentId}/comments`);
  if (!response.ok) {
    throw new Error(`Error ${response.status}: ${response.statusText}`);
  }
  
  return response.json();
}

export async function addIncidentComment(data: IncidentCommentFormData): Promise<IncidentComment> {
  const response = await fetch(`${API_BASE}/properties/incidents/${data.incidentId}/comments`, {
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

// Stats API
export async function getIncidentStats(): Promise<IncidentStats> {
  const response = await fetch(`${API_BASE}/properties/incidents/stats`);
  if (!response.ok) {
    throw new Error(`Error ${response.status}: ${response.statusText}`);
  }
  
  return response.json();
}

// Export function
export async function exportIncidents(filters: IncidentFilters = {}): Promise<void> {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      params.append(key, String(value));
    }
  });

  const response = await fetch(`${API_BASE}/properties/incidents/export?${params}`);
  if (!response.ok) {
    throw new Error(`Error ${response.status}: ${response.statusText}`);
  }

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `incidencias-${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}

// Mock data generation
export function generateMockIncidents(count: number = 40): PropertyIncident[] {
  const categories = ['mantenimiento', 'seguridad', 'climatizacion', 'fontaneria', 'electricidad', 'estructura', 'otros'] as const;
  const priorities = ['baja', 'media', 'alta', 'critica'] as const;
  const statuses = ['abierta', 'en_progreso', 'pendiente_repuestos', 'cerrada', 'cancelada'] as const;
  
  const properties = [
    { id: 'prop-1', title: 'Piso en Malasaña', address: 'Calle Fuencarral 45, Madrid' },
    { id: 'prop-2', title: 'Ático en Salamanca', address: 'Calle Serrano 123, Madrid' },
    { id: 'prop-3', title: 'Casa en Las Rozas', address: 'Urbanización Monte Rozas, Las Rozas' },
    { id: 'prop-4', title: 'Loft en Chueca', address: 'Calle Hortaleza 67, Madrid' },
    { id: 'prop-5', title: 'Dúplex en Chamberí', address: 'Calle Almagro 34, Madrid' },
  ];

  const reporters = ['Ana García', 'Carlos López', 'María Rodríguez', 'José Martín', 'Laura Sánchez'];
  const technicians = ['Pedro Ruiz', 'Carmen Vega', 'Antonio Silva', 'Isabel Torres', 'Manuel Jiménez'];
  const contractors = ['Fontanería García SL', 'Electricidad Madrid', 'Clima Confort', 'Mantenimientos Integrales'];

  const incidentTitles = {
    mantenimiento: ['Limpieza general necesaria', 'Pintura deteriorada', 'Revisión anual'],
    seguridad: ['Cerradura defectuosa', 'Alarma no funciona', 'Cristal roto'],
    climatizacion: ['Aire acondicionado no enfría', 'Calefacción no funciona', 'Fuga en radiador'],
    fontaneria: ['Grifo que gotea', 'Atasco en desagüe', 'Fuga de agua'],
    electricidad: ['Cortocircuito', 'Enchufe no funciona', 'Luz que parpadea'],
    estructura: ['Grieta en pared', 'Humedad en techo', 'Puerta no cierra bien'],
    otros: ['Ruidos molestos', 'Olor extraño', 'Problema con vecinos']
  };

  return Array.from({ length: count }, (_, index) => {
    const property = properties[index % properties.length];
    const category = categories[Math.floor(Math.random() * categories.length)];
    const priority = priorities[Math.floor(Math.random() * priorities.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    
    const createdDate = new Date();
    createdDate.setDate(createdDate.getDate() - Math.floor(Math.random() * 90));
    
    const title = incidentTitles[category][Math.floor(Math.random() * incidentTitles[category].length)];
    const reporter = reporters[Math.floor(Math.random() * reporters.length)];
    
    let assignedTo, assignedDate, dueDate, resolvedDate, resolution;
    
    if (status !== 'abierta') {
      assignedTo = technicians[Math.floor(Math.random() * technicians.length)];
      assignedDate = new Date(createdDate.getTime() + Math.random() * 2 * 24 * 60 * 60 * 1000).toISOString();
    }
    
    if (status !== 'abierta' && Math.random() > 0.3) {
      dueDate = new Date(createdDate.getTime() + Math.random() * 14 * 24 * 60 * 60 * 1000).toISOString();
    }
    
    if (status === 'cerrada') {
      resolvedDate = new Date(createdDate.getTime() + Math.random() * 10 * 24 * 60 * 60 * 1000).toISOString();
      resolution = 'Incidencia resuelta satisfactoriamente. Se ha procedido con la reparación necesaria.';
    }

    const incident: PropertyIncident = {
      id: `incident-${index + 1}`,
      propertyId: property.id,
      propertyTitle: property.title,
      propertyAddress: property.address,
      title,
      description: `Descripción detallada de la incidencia: ${title.toLowerCase()}. Se requiere atención por parte del equipo de mantenimiento.`,
      category,
      priority,
      status,
      reportedBy: reporter,
      reportedDate: createdDate.toISOString(),
      assignedTo,
      assignedDate,
      dueDate,
      resolvedDate,
      resolution,
      cost: status === 'cerrada' && Math.random() > 0.5 ? Math.floor(Math.random() * 500) + 50 : undefined,
      contractor: status === 'cerrada' && Math.random() > 0.6 ? contractors[Math.floor(Math.random() * contractors.length)] : undefined,
      contractorPhone: status === 'cerrada' && Math.random() > 0.7 ? `6${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}` : undefined,
      notes: Math.random() > 0.6 ? 'Notas adicionales sobre la incidencia y su resolución.' : undefined,
      createdAt: createdDate.toISOString(),
      updatedAt: resolvedDate || assignedDate || createdDate.toISOString()
    };

    return incident;
  });
}

export function generateMockIncidentComments(count: number = 60): IncidentComment[] {
  const authors = ['Ana García', 'Carlos López', 'María Rodríguez', 'José Martín', 'Laura Sánchez', 'Pedro Ruiz', 'Carmen Vega'];
  const comments = [
    'Se ha iniciado la revisión de la incidencia',
    'Contactando con el proveedor para solicitar presupuesto',
    'Incidencia escalada por alta prioridad',
    'Se requieren materiales adicionales',
    'Trabajo completado. Pendiente de validación',
    'Cliente notificado sobre el estado actual',
    'Se programa visita técnica para mañana',
    'Presupuesto aprobado. Iniciando trabajos',
    'Incidencia temporalmente suspendida',
    'Validación completada. Todo correcto'
  ];

  return Array.from({ length: count }, (_, index) => {
    const createdDate = new Date();
    createdDate.setDate(createdDate.getDate() - Math.floor(Math.random() * 30));

    return {
      id: `comment-${index + 1}`,
      incidentId: `incident-${Math.floor(Math.random() * 40) + 1}`,
      author: authors[Math.floor(Math.random() * authors.length)],
      content: comments[Math.floor(Math.random() * comments.length)],
      createdAt: createdDate.toISOString()
    };
  });
}