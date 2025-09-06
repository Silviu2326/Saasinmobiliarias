const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '/api';

export interface InmuebleCartera {
  id: string;
  referencia: string;
  titulo: string;
  direccion: string;
  zona: string;
  tipologia: 'piso' | 'atico' | 'duplex' | 'casa' | 'chalet' | 'estudio' | 'loft' | 'planta_baja' | 'local' | 'oficina';
  operacion: 'venta' | 'alquiler' | 'venta_alquiler';
  precio: number;
  precioOriginal: number;
  m2: number;
  habitaciones: number;
  banos: number;
  planta?: number;
  
  // Estado y exclusividad
  estado: 'activo' | 'reservado' | 'vendido' | 'retirado' | 'en_proceso';
  exclusiva: boolean;
  fechaFinExclusiva?: string;
  
  // Propietario
  propietarioId: string;
  propietarioNombre: string;
  propietarioTelefono: string;
  propietarioEmail: string;
  
  // Agente y equipo
  agenteCaptacion?: string;
  agenteComercial?: string;
  equipo?: string;
  
  // Características adicionales
  caracteristicas: {
    garaje?: boolean;
    ascensor?: boolean;
    terraza?: boolean;
    balcon?: boolean;
    piscina?: boolean;
    jardin?: boolean;
    trastero?: boolean;
    aireAcondicionado?: boolean;
    calefaccion?: boolean;
    amueblado?: boolean;
    reformado?: boolean;
  };
  
  // Marketing y visibilidad
  publicado: boolean;
  portales: string[];
  fechaPublicacion?: string;
  destacado: boolean;
  
  // Rendimiento
  visitas: number;
  guardados: number;
  consultas: number;
  visitasFisicas: number;
  ultimaVisita?: string;
  
  // Fotos y documentación
  fotos: string[];
  fotoPrincipal?: string;
  documentos: string[];
  certificadoEnergetico?: string;
  cedula?: string;
  
  // Fechas
  fechaCaptacion: string;
  fechaActualizacion: string;
  diasEnCartera: number;
  
  // Métricas y análisis
  score: number;
  probabilidadVenta: number;
  precioM2: number;
  competencia: number;
  
  // Notas y observaciones
  notas?: string;
  notasInternas?: string;
  
  // Coordenadas para mapa
  latitud?: number;
  longitud?: number;
}

export interface CarteraFilters {
  q?: string;
  zona?: string;
  tipologia?: string;
  operacion?: string;
  estado?: string;
  precioMin?: number;
  precioMax?: number;
  habitaciones?: number;
  exclusiva?: boolean;
  publicado?: boolean;
  agenteCaptacion?: string;
  agenteComercial?: string;
  equipo?: string;
  diasEnCartera?: 'nuevos' | 'recientes' | 'antiguos';
  rendimiento?: 'alto' | 'medio' | 'bajo';
  page?: number;
  limit?: number;
  orderBy?: string;
}

export interface CarteraStats {
  total: number;
  activos: number;
  vendidos: number;
  reservados: number;
  enExclusiva: number;
  publicados: number;
  valorTotal: number;
  valorMedio: number;
  diasMediosEnCartera: number;
  tasaConversion: number;
  visitasTotales: number;
  consultasTotales: number;
}

export interface AnalisisComparativo {
  inmuebleId: string;
  comparables: {
    id: string;
    referencia: string;
    precio: number;
    m2: number;
    precioM2: number;
    distancia: number;
    estado: string;
  }[];
  precioSugerido: number;
  variacionMercado: number;
  indiceCompetitividad: number;
}

export async function getCartera(filters: CarteraFilters = {}) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      params.append(key, String(value));
    }
  });
  
  const response = await fetch(`${API_BASE}/crm/cartera?${params}`);
  if (!response.ok) throw new Error('Error al obtener cartera');
  return response.json();
}

export async function getInmueble(id: string) {
  const response = await fetch(`${API_BASE}/crm/cartera/${id}`);
  if (!response.ok) throw new Error('Error al obtener inmueble');
  return response.json();
}

export async function createInmueble(data: Partial<InmuebleCartera>) {
  const response = await fetch(`${API_BASE}/crm/cartera`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!response.ok) throw new Error('Error al crear inmueble');
  return response.json();
}

export async function updateInmueble(id: string, data: Partial<InmuebleCartera>) {
  const response = await fetch(`${API_BASE}/crm/cartera/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!response.ok) throw new Error('Error al actualizar inmueble');
  return response.json();
}

export async function deleteInmueble(id: string) {
  const response = await fetch(`${API_BASE}/crm/cartera/${id}`, {
    method: 'DELETE'
  });
  if (!response.ok) throw new Error('Error al eliminar inmueble');
  return response.json();
}

export async function bulkUpdateInmuebles(inmuebleIds: string[], updates: Partial<InmuebleCartera>) {
  const response = await fetch(`${API_BASE}/crm/cartera/bulk`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ inmuebleIds, updates })
  });
  if (!response.ok) throw new Error('Error al actualizar inmuebles');
  return response.json();
}

export async function publicarEnPortales(inmuebleId: string, portales: string[]) {
  const response = await fetch(`${API_BASE}/crm/cartera/${inmuebleId}/publicar`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ portales })
  });
  if (!response.ok) throw new Error('Error al publicar en portales');
  return response.json();
}

export async function despublicarDePortales(inmuebleId: string, portales: string[]) {
  const response = await fetch(`${API_BASE}/crm/cartera/${inmuebleId}/despublicar`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ portales })
  });
  if (!response.ok) throw new Error('Error al despublicar de portales');
  return response.json();
}

export async function getAnalisisComparativo(inmuebleId: string): Promise<AnalisisComparativo> {
  const response = await fetch(`${API_BASE}/crm/cartera/${inmuebleId}/analisis-comparativo`);
  if (!response.ok) throw new Error('Error al obtener análisis comparativo');
  return response.json();
}

export async function ajustarPrecio(inmuebleId: string, nuevoPrecio: number, motivo: string) {
  const response = await fetch(`${API_BASE}/crm/cartera/${inmuebleId}/ajustar-precio`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nuevoPrecio, motivo })
  });
  if (!response.ok) throw new Error('Error al ajustar precio');
  return response.json();
}

export async function generarInformeCartera(filtros: CarteraFilters = {}) {
  const params = new URLSearchParams();
  Object.entries(filtros).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      params.append(key, String(value));
    }
  });
  
  const response = await fetch(`${API_BASE}/crm/cartera/informe?${params}`);
  if (!response.ok) throw new Error('Error al generar informe');
  
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `informe-cartera-${new Date().toISOString().split('T')[0]}.pdf`;
  a.click();
  window.URL.revokeObjectURL(url);
}

export async function importCartera(file: File) {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch(`${API_BASE}/crm/cartera/import`, {
    method: 'POST',
    body: formData
  });
  if (!response.ok) throw new Error('Error al importar cartera');
  return response.json();
}

export async function exportCartera(filters: CarteraFilters = {}) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      params.append(key, String(value));
    }
  });
  
  const response = await fetch(`${API_BASE}/crm/cartera/export?${params}`);
  if (!response.ok) throw new Error('Error al exportar cartera');
  
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `cartera-${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  window.URL.revokeObjectURL(url);
}

export function calcularCarteraStats(inmuebles: InmuebleCartera[]): CarteraStats {
  const total = inmuebles.length;
  const activos = inmuebles.filter(i => i.estado === 'activo').length;
  const vendidos = inmuebles.filter(i => i.estado === 'vendido').length;
  const reservados = inmuebles.filter(i => i.estado === 'reservado').length;
  const enExclusiva = inmuebles.filter(i => i.exclusiva).length;
  const publicados = inmuebles.filter(i => i.publicado).length;
  
  const valorTotal = inmuebles
    .filter(i => i.estado === 'activo')
    .reduce((sum, i) => sum + i.precio, 0);
  
  const valorMedio = activos > 0 ? valorTotal / activos : 0;
  
  const diasMediosEnCartera = inmuebles.length > 0 
    ? inmuebles.reduce((sum, i) => sum + i.diasEnCartera, 0) / inmuebles.length
    : 0;
    
  const tasaConversion = total > 0 ? (vendidos / total) * 100 : 0;
  
  const visitasTotales = inmuebles.reduce((sum, i) => sum + i.visitas, 0);
  const consultasTotales = inmuebles.reduce((sum, i) => sum + i.consultas, 0);
  
  return {
    total,
    activos,
    vendidos,
    reservados,
    enExclusiva,
    publicados,
    valorTotal,
    valorMedio,
    diasMediosEnCartera: Math.round(diasMediosEnCartera),
    tasaConversion: Math.round(tasaConversion * 100) / 100,
    visitasTotales,
    consultasTotales
  };
}

export function calcularScore(inmueble: InmuebleCartera): number {
  let score = 0;
  
  // Actividad online (30%)
  const visitasNormalizadas = Math.min(inmueble.visitas / 50, 1) * 30;
  score += visitasNormalizadas;
  
  // Engagement (20%)
  const guardadosNormalizados = Math.min(inmueble.guardados / 20, 1) * 10;
  const consultasNormalizadas = Math.min(inmueble.consultas / 10, 1) * 10;
  score += guardadosNormalizados + consultasNormalizadas;
  
  // Tiempo en cartera (25% - inverso)
  const diasPenalizacion = Math.min(inmueble.diasEnCartera / 180, 1) * 25;
  score += 25 - diasPenalizacion;
  
  // Competitividad precio (15%)
  const competitividadPrecio = inmueble.competencia ? (100 - inmueble.competencia) / 100 * 15 : 10;
  score += competitividadPrecio;
  
  // Estado y características (10%)
  let caracteristicasScore = 0;
  if (inmueble.exclusiva) caracteristicasScore += 3;
  if (inmueble.publicado) caracteristicasScore += 2;
  if (inmueble.destacado) caracteristicasScore += 2;
  if (inmueble.fotos.length >= 5) caracteristicasScore += 2;
  if (inmueble.certificadoEnergetico) caracteristicasScore += 1;
  score += caracteristicasScore;
  
  return Math.min(100, Math.round(score));
}

export function detectarOportunidades(inmuebles: InmuebleCartera[]): {
  bajaPrecio: InmuebleCartera[];
  pocaActividad: InmuebleCartera[];
  exclusivaVencimiento: InmuebleCartera[];
  altaProbabilidad: InmuebleCartera[];
} {
  const treintaDias = 30 * 24 * 60 * 60 * 1000;
  const ahora = Date.now();
  
  return {
    bajaPrecio: inmuebles.filter(i => 
      i.estado === 'activo' && 
      i.precio < i.precioOriginal * 0.85
    ),
    pocaActividad: inmuebles.filter(i => 
      i.estado === 'activo' && 
      i.diasEnCartera > 90 && 
      i.visitas < 10
    ),
    exclusivaVencimiento: inmuebles.filter(i => {
      if (!i.exclusiva || !i.fechaFinExclusiva) return false;
      const fechaFin = new Date(i.fechaFinExclusiva).getTime();
      const diferencia = fechaFin - ahora;
      return diferencia > 0 && diferencia < treintaDias;
    }),
    altaProbabilidad: inmuebles.filter(i => 
      i.estado === 'activo' && 
      i.probabilidadVenta > 75
    )
  };
}