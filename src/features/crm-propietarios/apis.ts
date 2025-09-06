const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '/api';

export interface Propietario {
  id: string;
  nombre: string;
  email: string;
  telefono: string;
  tieneExclusiva: boolean;
  fechaFinExclusiva?: string;
  honorarios?: number;
  tipoHonorarios?: 'porcentaje' | 'fijo';
  preferenciaPrecio?: string;
  inmueblesAsociados: string[];
  numeroInmuebles: number;
  agente?: string;
  ndaFirmado: boolean;
  consentimientoRGPD: boolean;
  documentos: string[];
  interesDeVenta: 'alto' | 'medio' | 'bajo';
  createdAt: string;
  updatedAt: string;
}

export interface PropietarioFilters {
  q?: string;
  tieneExclusiva?: boolean;
  agente?: string;
  fechaDesde?: string;
  fechaHasta?: string;
  page?: number;
  limit?: number;
  orderBy?: string;
}

export interface InmuebleAsociado {
  id: string;
  referencia: string;
  direccion: string;
  precio: number;
  visitas: number;
  guardados: number;
  ultimaVisita?: string;
  estadoVenta: 'activo' | 'reservado' | 'vendido';
  imagen?: string;
}

export interface InformePropietario {
  periodo: string;
  visitas: number;
  guardados: number;
  consultas: number;
  comparables: any[];
  feedback: string[];
  pricingSugerido?: number;
  proximoPaso: string;
}

export async function getPropietarios(filters: PropietarioFilters = {}) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      params.append(key, String(value));
    }
  });
  
  const response = await fetch(`${API_BASE}/crm/propietarios?${params}`);
  if (!response.ok) throw new Error('Error al obtener propietarios');
  return response.json();
}

export async function getPropietario(id: string) {
  const response = await fetch(`${API_BASE}/crm/propietarios/${id}`);
  if (!response.ok) throw new Error('Error al obtener propietario');
  return response.json();
}

export async function createPropietario(data: Partial<Propietario>) {
  const response = await fetch(`${API_BASE}/crm/propietarios`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!response.ok) throw new Error('Error al crear propietario');
  return response.json();
}

export async function updatePropietario(id: string, data: Partial<Propietario>) {
  const response = await fetch(`${API_BASE}/crm/propietarios/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!response.ok) throw new Error('Error al actualizar propietario');
  return response.json();
}

export async function deletePropietario(id: string) {
  const response = await fetch(`${API_BASE}/crm/propietarios/${id}`, {
    method: 'DELETE'
  });
  if (!response.ok) throw new Error('Error al eliminar propietario');
  return response.json();
}

export async function getInmueblesPropietario(propietarioId: string) {
  const response = await fetch(`${API_BASE}/crm/propietarios/${propietarioId}/inmuebles`);
  if (!response.ok) throw new Error('Error al obtener inmuebles');
  return response.json();
}

export async function generarInforme(propietarioId: string) {
  const response = await fetch(`${API_BASE}/crm/propietarios/${propietarioId}/informe`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'generar' })
  });
  if (!response.ok) throw new Error('Error al generar informe');
  return response.json();
}

export async function programarInforme(propietarioId: string, frecuencia: 'semanal' | 'quincenal' | 'mensual') {
  const response = await fetch(`${API_BASE}/crm/propietarios/${propietarioId}/informe`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'programar', frecuencia })
  });
  if (!response.ok) throw new Error('Error al programar informe');
  return response.json();
}

export async function importPropietarios(file: File) {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch(`${API_BASE}/crm/propietarios/import`, {
    method: 'POST',
    body: formData
  });
  if (!response.ok) throw new Error('Error al importar propietarios');
  return response.json();
}

export async function exportPropietarios(filters: PropietarioFilters = {}) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      params.append(key, String(value));
    }
  });
  
  const response = await fetch(`${API_BASE}/crm/propietarios/export?${params}`);
  if (!response.ok) throw new Error('Error al exportar propietarios');
  
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `propietarios-${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  window.URL.revokeObjectURL(url);
}

export function checkExclusivaProximaVencer(propietarios: Propietario[]): Propietario[] {
  const treintaDias = 30 * 24 * 60 * 60 * 1000;
  const ahora = Date.now();
  
  return propietarios.filter(p => {
    if (!p.tieneExclusiva || !p.fechaFinExclusiva) return false;
    const fechaFin = new Date(p.fechaFinExclusiva).getTime();
    const diferencia = fechaFin - ahora;
    return diferencia > 0 && diferencia < treintaDias;
  });
}

export function calculateRendimiento(inmuebles: InmuebleAsociado[]): {
  totalVisitas: number;
  totalGuardados: number;
  promedioDias: number;
  conversionRate: number;
} {
  const totalVisitas = inmuebles.reduce((sum, i) => sum + i.visitas, 0);
  const totalGuardados = inmuebles.reduce((sum, i) => sum + i.guardados, 0);
  const vendidos = inmuebles.filter(i => i.estadoVenta === 'vendido');
  
  let promedioDias = 0;
  if (vendidos.length > 0) {
    promedioDias = 90;
  }
  
  const conversionRate = inmuebles.length > 0 
    ? (vendidos.length / inmuebles.length) * 100
    : 0;
  
  return {
    totalVisitas,
    totalGuardados,
    promedioDias,
    conversionRate
  };
}