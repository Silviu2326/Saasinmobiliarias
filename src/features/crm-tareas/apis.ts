const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '/api';

export interface Tarea {
  id: string;
  titulo: string;
  descripcion?: string;
  asignadoA?: string;
  entidadVinculada?: {
    tipo: 'lead' | 'cliente' | 'propietario' | 'inmueble';
    id: string;
    nombre?: string;
  };
  prioridad: 'baja' | 'media' | 'alta';
  estado: 'pendiente' | 'en_progreso' | 'hecha';
  fechaVencimiento: string;
  recordatorioAt?: string;
  createdAt: string;
  updatedAt: string;
  completadaAt?: string;
}

export interface TareaFilters {
  q?: string;
  asignadoA?: string;
  estado?: string;
  prioridad?: string;
  vencimiento?: 'hoy' | 'semana' | 'atrasadas' | 'todas';
  entidadTipo?: string;
  page?: number;
  limit?: number;
  orderBy?: string;
}

export interface TareaStats {
  total: number;
  pendientes: number;
  enProgreso: number;
  completadas: number;
  atrasadas: number;
  vencenHoy: number;
  vencenSemana: number;
}

export async function getTareas(filters: TareaFilters = {}) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      params.append(key, String(value));
    }
  });
  
  const response = await fetch(`${API_BASE}/crm/tareas?${params}`);
  if (!response.ok) throw new Error('Error al obtener tareas');
  return response.json();
}

export async function getTarea(id: string) {
  const response = await fetch(`${API_BASE}/crm/tareas/${id}`);
  if (!response.ok) throw new Error('Error al obtener tarea');
  return response.json();
}

export async function createTarea(data: Partial<Tarea>) {
  const response = await fetch(`${API_BASE}/crm/tareas`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!response.ok) throw new Error('Error al crear tarea');
  return response.json();
}

export async function updateTarea(id: string, data: Partial<Tarea>) {
  const response = await fetch(`${API_BASE}/crm/tareas/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!response.ok) throw new Error('Error al actualizar tarea');
  return response.json();
}

export async function deleteTarea(id: string) {
  const response = await fetch(`${API_BASE}/crm/tareas/${id}`, {
    method: 'DELETE'
  });
  if (!response.ok) throw new Error('Error al eliminar tarea');
  return response.json();
}

export async function bulkUpdateTareas(tareaIds: string[], updates: Partial<Tarea>) {
  const response = await fetch(`${API_BASE}/crm/tareas/bulk`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tareaIds, updates })
  });
  if (!response.ok) throw new Error('Error al actualizar tareas');
  return response.json();
}

export async function importTareas(file: File) {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch(`${API_BASE}/crm/tareas/import`, {
    method: 'POST',
    body: formData
  });
  if (!response.ok) throw new Error('Error al importar tareas');
  return response.json();
}

export async function exportTareas(filters: TareaFilters = {}) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      params.append(key, String(value));
    }
  });
  
  const response = await fetch(`${API_BASE}/crm/tareas/export?${params}`);
  if (!response.ok) throw new Error('Error al exportar tareas');
  
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `tareas-${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  window.URL.revokeObjectURL(url);
}

export function calcularTareaStats(tareas: Tarea[]): TareaStats {
  const ahora = new Date();
  const hoy = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());
  const enUnaSemana = new Date(hoy.getTime() + 7 * 24 * 60 * 60 * 1000);

  const stats: TareaStats = {
    total: tareas.length,
    pendientes: 0,
    enProgreso: 0,
    completadas: 0,
    atrasadas: 0,
    vencenHoy: 0,
    vencenSemana: 0
  };

  tareas.forEach(tarea => {
    switch (tarea.estado) {
      case 'pendiente':
        stats.pendientes++;
        break;
      case 'en_progreso':
        stats.enProgreso++;
        break;
      case 'hecha':
        stats.completadas++;
        break;
    }

    if (tarea.estado !== 'hecha' && tarea.fechaVencimiento) {
      const vencimiento = new Date(tarea.fechaVencimiento);
      
      if (vencimiento < hoy) {
        stats.atrasadas++;
      } else if (vencimiento.toDateString() === hoy.toDateString()) {
        stats.vencenHoy++;
      } else if (vencimiento <= enUnaSemana) {
        stats.vencenSemana++;
      }
    }
  });

  return stats;
}

export function filtrarTareasAtrasadas(tareas: Tarea[]): Tarea[] {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  
  return tareas.filter(tarea => {
    if (tarea.estado === 'hecha') return false;
    if (!tarea.fechaVencimiento) return false;
    
    const vencimiento = new Date(tarea.fechaVencimiento);
    return vencimiento < hoy;
  });
}

export function filtrarTareasCriticas(tareas: Tarea[]): Tarea[] {
  const ahora = new Date();
  const en24h = new Date(ahora.getTime() + 24 * 60 * 60 * 1000);
  
  return tareas.filter(tarea => {
    if (tarea.estado === 'hecha') return false;
    if (tarea.prioridad !== 'alta') return false;
    if (!tarea.fechaVencimiento) return false;
    
    const vencimiento = new Date(tarea.fechaVencimiento);
    return vencimiento <= en24h;
  });
}

export function createTareaAutomatica(evento: string, entidad: any): Partial<Tarea> {
  const ahora = new Date();
  const manana = new Date(ahora.getTime() + 24 * 60 * 60 * 1000);
  
  switch (evento) {
    case 'nuevo_lead':
      return {
        titulo: `Llamar a lead: ${entidad.nombre}`,
        descripcion: `Contactar al lead ${entidad.nombre} - ${entidad.telefono}`,
        prioridad: 'alta',
        estado: 'pendiente',
        fechaVencimiento: manana.toISOString(),
        entidadVinculada: {
          tipo: 'lead',
          id: entidad.id,
          nombre: entidad.nombre
        }
      };
      
    case 'visita_agendada':
      return {
        titulo: `Confirmar visita con ${entidad.cliente}`,
        descripcion: `Confirmar asistencia a visita del inmueble ${entidad.inmueble}`,
        prioridad: 'media',
        estado: 'pendiente',
        fechaVencimiento: entidad.fechaVisita,
        entidadVinculada: {
          tipo: 'cliente',
          id: entidad.clienteId,
          nombre: entidad.cliente
        }
      };
      
    case 'exclusiva_vencimiento':
      return {
        titulo: `Renovar exclusiva: ${entidad.nombre}`,
        descripcion: `La exclusiva con ${entidad.nombre} vence en 30 días`,
        prioridad: 'alta',
        estado: 'pendiente',
        fechaVencimiento: manana.toISOString(),
        entidadVinculada: {
          tipo: 'propietario',
          id: entidad.id,
          nombre: entidad.nombre
        }
      };
      
    default:
      return {
        titulo: 'Nueva tarea',
        prioridad: 'media',
        estado: 'pendiente',
        fechaVencimiento: manana.toISOString()
      };
  }
}