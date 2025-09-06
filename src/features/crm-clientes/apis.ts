const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '/api';

export interface Cliente {
  id: string;
  nombre: string;
  email: string;
  telefono: string;
  tipo: 'comprador' | 'inquilino';
  presupuestoMin?: number;
  presupuestoMax?: number;
  zonasInteres: string[];
  tipologias: string[];
  requisitos: {
    m2Min?: number;
    habitaciones?: number;
    banos?: number;
    garaje?: boolean;
    ascensor?: boolean;
    terraza?: boolean;
    piscina?: boolean;
  };
  preferenciaEstado: 'reformar' | 'entrar_vivir' | 'indiferente';
  agente?: string;
  etiquetas: string[];
  estadoRelacion: 'activo' | 'en_pausa' | 'ganado' | 'perdido';
  ultimaActividad: string;
  createdAt: string;
  updatedAt: string;
}

export interface ClienteFilters {
  q?: string;
  tipo?: string;
  presupuestoMin?: number;
  presupuestoMax?: number;
  zonas?: string;
  agente?: string;
  estado?: string;
  page?: number;
  limit?: number;
  orderBy?: string;
}

export interface Match {
  inmuebleId: string;
  score: number;
  titulo: string;
  precio: number;
  zona: string;
  m2: number;
  habitaciones: number;
  imagen?: string;
}

export async function getClientes(filters: ClienteFilters = {}) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      params.append(key, String(value));
    }
  });
  
  const response = await fetch(`${API_BASE}/crm/clientes?${params}`);
  if (!response.ok) throw new Error('Error al obtener clientes');
  return response.json();
}

export async function getCliente(id: string) {
  const response = await fetch(`${API_BASE}/crm/clientes/${id}`);
  if (!response.ok) throw new Error('Error al obtener cliente');
  return response.json();
}

export async function createCliente(data: Partial<Cliente>) {
  const response = await fetch(`${API_BASE}/crm/clientes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!response.ok) throw new Error('Error al crear cliente');
  return response.json();
}

export async function updateCliente(id: string, data: Partial<Cliente>) {
  const response = await fetch(`${API_BASE}/crm/clientes/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!response.ok) throw new Error('Error al actualizar cliente');
  return response.json();
}

export async function deleteCliente(id: string) {
  const response = await fetch(`${API_BASE}/crm/clientes/${id}`, {
    method: 'DELETE'
  });
  if (!response.ok) throw new Error('Error al eliminar cliente');
  return response.json();
}

export async function getMatches(clienteId: string) {
  const response = await fetch(`${API_BASE}/crm/clientes/${clienteId}/matches`);
  if (!response.ok) throw new Error('Error al obtener matches');
  return response.json();
}

export async function addToWishlist(clienteId: string, inmuebleId: string) {
  const response = await fetch(`${API_BASE}/crm/clientes/${clienteId}/wishlist`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ inmuebleId, action: 'add' })
  });
  if (!response.ok) throw new Error('Error al añadir a wishlist');
  return response.json();
}

export async function removeFromWishlist(clienteId: string, inmuebleId: string) {
  const response = await fetch(`${API_BASE}/crm/clientes/${clienteId}/wishlist`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ inmuebleId, action: 'remove' })
  });
  if (!response.ok) throw new Error('Error al eliminar de wishlist');
  return response.json();
}

export async function importClientes(file: File) {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch(`${API_BASE}/crm/clientes/import`, {
    method: 'POST',
    body: formData
  });
  if (!response.ok) throw new Error('Error al importar clientes');
  return response.json();
}

export async function exportClientes(filters: ClienteFilters = {}) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      params.append(key, String(value));
    }
  });
  
  const response = await fetch(`${API_BASE}/crm/clientes/export?${params}`);
  if (!response.ok) throw new Error('Error al exportar clientes');
  
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `clientes-${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  window.URL.revokeObjectURL(url);
}

export function calculateMatchScore(cliente: Cliente, inmueble: any): number {
  let score = 0;
  let factors = 0;

  if (inmueble.precio >= cliente.presupuestoMin && inmueble.precio <= cliente.presupuestoMax) {
    score += 30;
  } else if (inmueble.precio < cliente.presupuestoMin) {
    score += 20;
  }
  factors++;

  if (cliente.zonasInteres.some(zona => inmueble.zona?.toLowerCase().includes(zona.toLowerCase()))) {
    score += 25;
  }
  factors++;

  if (cliente.tipologias.includes(inmueble.tipologia)) {
    score += 15;
  }
  factors++;

  if (cliente.requisitos.m2Min && inmueble.m2 >= cliente.requisitos.m2Min) {
    score += 10;
  }
  factors++;

  if (cliente.requisitos.habitaciones && inmueble.habitaciones >= cliente.requisitos.habitaciones) {
    score += 10;
  }
  factors++;

  const matchRequisitos = ['garaje', 'ascensor', 'terraza', 'piscina'];
  matchRequisitos.forEach(req => {
    if (cliente.requisitos[req as keyof typeof cliente.requisitos] && inmueble[req]) {
      score += 5;
    }
    factors++;
  });

  return Math.min(100, Math.round((score / (factors * 10)) * 100));
}