import { PropertyKey, KeyMovement, KeyFilters, KeyFormData, KeyMovementFormData } from './types';

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '/api';

// Keys API
export async function getKeys(filters: KeyFilters = {}): Promise<PropertyKey[]> {
  const params = new URLSearchParams();
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      params.append(key, String(value));
    }
  });

  const response = await fetch(`${API_BASE}/properties/keys?${params}`);
  if (!response.ok) {
    throw new Error(`Error ${response.status}: ${response.statusText}`);
  }
  
  return response.json();
}

export async function getKey(id: string): Promise<PropertyKey> {
  const response = await fetch(`${API_BASE}/properties/keys/${id}`);
  if (!response.ok) {
    throw new Error(`Error ${response.status}: ${response.statusText}`);
  }
  
  return response.json();
}

export async function createKey(data: KeyFormData): Promise<PropertyKey> {
  const response = await fetch(`${API_BASE}/properties/keys`, {
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

export async function updateKey(id: string, data: Partial<KeyFormData>): Promise<PropertyKey> {
  const response = await fetch(`${API_BASE}/properties/keys/${id}`, {
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

export async function deleteKey(id: string): Promise<void> {
  const response = await fetch(`${API_BASE}/properties/keys/${id}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    throw new Error(`Error ${response.status}: ${response.statusText}`);
  }
}

export async function bulkDeleteKeys(ids: string[]): Promise<void> {
  const response = await fetch(`${API_BASE}/properties/keys/bulk-delete`, {
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

export async function duplicateKey(id: string, data: { description?: string; assignedTo?: string }): Promise<PropertyKey> {
  const response = await fetch(`${API_BASE}/properties/keys/${id}/duplicate`, {
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

// Key movements API
export async function getKeyMovements(keyId?: string): Promise<KeyMovement[]> {
  const params = new URLSearchParams();
  if (keyId) {
    params.append('keyId', keyId);
  }

  const response = await fetch(`${API_BASE}/properties/keys/movements?${params}`);
  if (!response.ok) {
    throw new Error(`Error ${response.status}: ${response.statusText}`);
  }
  
  return response.json();
}

export async function createKeyMovement(data: KeyMovementFormData): Promise<KeyMovement> {
  const response = await fetch(`${API_BASE}/properties/keys/movements`, {
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

// Export functions
export async function exportKeys(filters: KeyFilters = {}): Promise<void> {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      params.append(key, String(value));
    }
  });

  const response = await fetch(`${API_BASE}/properties/keys/export?${params}`);
  if (!response.ok) {
    throw new Error(`Error ${response.status}: ${response.statusText}`);
  }

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `llaves-${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}

// Mock data generation
export function generateMockKeys(count: number = 30): PropertyKey[] {
  const locations = ['oficina', 'inmobiliaria', 'propietario', 'inquilino', 'agente', 'otro'] as const;
  const statuses = ['disponible', 'entregada', 'perdida', 'duplicada', 'retirada'] as const;
  
  const properties = [
    { id: 'prop-1', title: 'Piso en Malasaña', address: 'Calle Fuencarral 45, Madrid' },
    { id: 'prop-2', title: 'Ático en Salamanca', address: 'Calle Serrano 123, Madrid' },
    { id: 'prop-3', title: 'Casa en Las Rozas', address: 'Urbanización Monte Rozas, Las Rozas' },
    { id: 'prop-4', title: 'Loft en Chueca', address: 'Calle Hortaleza 67, Madrid' },
    { id: 'prop-5', title: 'Dúplex en Chamberí', address: 'Calle Almagro 34, Madrid' },
  ];

  const agents = ['Ana García', 'Carlos López', 'María Rodríguez', 'José Martín', 'Laura Sánchez'];

  return Array.from({ length: count }, (_, index) => {
    const property = properties[index % properties.length];
    const location = locations[Math.floor(Math.random() * locations.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    
    const createdDate = new Date();
    createdDate.setDate(createdDate.getDate() - Math.floor(Math.random() * 180));
    
    const key: PropertyKey = {
      id: `key-${index + 1}`,
      propertyId: property.id,
      propertyTitle: property.title,
      propertyAddress: property.address,
      keyCode: `K${String(index + 1).padStart(4, '0')}`,
      description: Math.random() > 0.5 ? `Llave ${index % 2 === 0 ? 'original' : 'copia'} de ${property.title}` : undefined,
      location,
      locationDetail: location === 'oficina' ? 'Caja fuerte principal' : location === 'agente' ? agents[Math.floor(Math.random() * agents.length)] : undefined,
      status,
      assignedTo: status === 'entregada' ? agents[Math.floor(Math.random() * agents.length)] : undefined,
      assignedDate: status === 'entregada' ? createdDate.toISOString() : undefined,
      returnDate: status === 'disponible' && Math.random() > 0.7 ? new Date(createdDate.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString() : undefined,
      notes: Math.random() > 0.7 ? 'Observaciones adicionales sobre esta llave' : undefined,
      createdAt: createdDate.toISOString(),
      updatedAt: createdDate.toISOString()
    };

    return key;
  });
}

export function generateMockKeyMovements(count: number = 50): KeyMovement[] {
  const types = ['entrega', 'devolucion', 'traslado', 'duplicacion', 'perdida'] as const;
  const locations = ['Oficina Central', 'Inmobiliaria Norte', 'Agente Campo', 'Cliente', 'Propietario'];
  const agents = ['Ana García', 'Carlos López', 'María Rodríguez', 'José Martín', 'Laura Sánchez'];
  const reasons = [
    'Visita programada',
    'Tasación inmueble',
    'Mantenimiento',
    'Entrega a inquilino',
    'Devolución tras visita',
    'Cambio de responsable',
    'Duplicación solicitada',
    'Extravío reportado'
  ];

  return Array.from({ length: count }, (_, index) => {
    const type = types[Math.floor(Math.random() * types.length)];
    const createdDate = new Date();
    createdDate.setDate(createdDate.getDate() - Math.floor(Math.random() * 90));

    return {
      id: `movement-${index + 1}`,
      keyId: `key-${Math.floor(Math.random() * 30) + 1}`,
      type,
      fromLocation: locations[Math.floor(Math.random() * locations.length)],
      toLocation: locations[Math.floor(Math.random() * locations.length)],
      fromPerson: Math.random() > 0.5 ? agents[Math.floor(Math.random() * agents.length)] : undefined,
      toPerson: Math.random() > 0.5 ? agents[Math.floor(Math.random() * agents.length)] : undefined,
      reason: reasons[Math.floor(Math.random() * reasons.length)],
      notes: Math.random() > 0.7 ? 'Notas adicionales del movimiento' : undefined,
      createdBy: agents[Math.floor(Math.random() * agents.length)],
      createdAt: createdDate.toISOString()
    };
  });
}