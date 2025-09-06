import { Campana } from '../index';

const API_BASE_URL = '/api/campanas';

export interface CreateCampanaRequest {
  nombre: string;
  tipo: 'email' | 'sms' | 'portales' | 'rpa';
  fechaInicio: string;
  fechaFin: string;
  presupuesto: number;
  segmentacion: string[];
  estado?: 'activa' | 'pausada' | 'finalizada' | 'borrador';
}

export interface UpdateCampanaRequest extends Partial<CreateCampanaRequest> {
  id: string;
}

export interface CampanasFilters {
  estado?: string;
  tipo?: string;
  fechaDesde?: string;
  fechaHasta?: string;
  search?: string;
}

export interface CampanasResponse {
  data: Campana[];
  total: number;
  page: number;
  limit: number;
}

export interface CampanaStats {
  total: number;
  activas: number;
  pausadas: number;
  finalizadas: number;
  borradores: number;
  nuevas: number;
  roiPromedio: number;
  presupuestoTotal: number;
  gastado: number;
}

class CampanasService {
  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
    }
    return response.json();
  }

  private async makeRequest<T>(url: string, options?: RequestInit): Promise<T> {
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        ...options,
      });
      return this.handleResponse<T>(response);
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Error de conexión con el servidor');
    }
  }

  // Obtener todas las campañas con filtros opcionales
  async getCampanas(filters?: CampanasFilters, page = 1, limit = 50): Promise<CampanasResponse> {
    const params = new URLSearchParams();
    
    if (filters?.estado) params.append('estado', filters.estado);
    if (filters?.tipo) params.append('tipo', filters.tipo);
    if (filters?.fechaDesde) params.append('fechaDesde', filters.fechaDesde);
    if (filters?.fechaHasta) params.append('fechaHasta', filters.fechaHasta);
    if (filters?.search) params.append('search', filters.search);
    
    params.append('page', page.toString());
    params.append('limit', limit.toString());

    const queryString = params.toString();
    const url = queryString ? `${API_BASE_URL}?${queryString}` : API_BASE_URL;

    return this.makeRequest<CampanasResponse>(url);
  }

  // Obtener una campaña específica por ID
  async getCampana(id: string): Promise<Campana> {
    return this.makeRequest<Campana>(`${API_BASE_URL}/${id}`);
  }

  // Crear nueva campaña
  async createCampana(data: CreateCampanaRequest): Promise<Campana> {
    return this.makeRequest<Campana>(API_BASE_URL, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Actualizar campaña existente
  async updateCampana(id: string, data: Partial<CreateCampanaRequest>): Promise<Campana> {
    return this.makeRequest<Campana>(`${API_BASE_URL}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Eliminar campaña
  async deleteCampana(id: string): Promise<void> {
    await this.makeRequest<void>(`${API_BASE_URL}/${id}`, {
      method: 'DELETE',
    });
  }

  // Duplicar campaña
  async duplicateCampana(id: string, newName?: string): Promise<Campana> {
    return this.makeRequest<Campana>(`${API_BASE_URL}/${id}/duplicate`, {
      method: 'POST',
      body: JSON.stringify({ newName }),
    });
  }

  // Cambiar estado de campaña
  async toggleCampanaStatus(id: string, estado: 'activa' | 'pausada'): Promise<Campana> {
    return this.makeRequest<Campana>(`${API_BASE_URL}/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ estado }),
    });
  }

  // Obtener estadísticas generales
  async getStats(): Promise<CampanaStats> {
    return this.makeRequest<CampanaStats>(`${API_BASE_URL}/stats`);
  }

  // Obtener métricas de una campaña específica
  async getCampanaMetrics(id: string, dateRange?: { from: string; to: string }) {
    const params = new URLSearchParams();
    if (dateRange) {
      params.append('from', dateRange.from);
      params.append('to', dateRange.to);
    }

    const queryString = params.toString();
    const url = queryString 
      ? `${API_BASE_URL}/${id}/metrics?${queryString}` 
      : `${API_BASE_URL}/${id}/metrics`;

    return this.makeRequest<{
      impresiones: number;
      clicks: number;
      conversiones: number;
      ctr: number;
      roi: number;
      gastado: number;
      timeline: Array<{
        fecha: string;
        impresiones: number;
        clicks: number;
        conversiones: number;
        gastado: number;
      }>;
    }>(url);
  }

  // Exportar campañas a CSV/Excel
  async exportCampanas(filters?: CampanasFilters, format: 'csv' | 'excel' = 'csv'): Promise<Blob> {
    const params = new URLSearchParams();
    
    if (filters?.estado) params.append('estado', filters.estado);
    if (filters?.tipo) params.append('tipo', filters.tipo);
    if (filters?.fechaDesde) params.append('fechaDesde', filters.fechaDesde);
    if (filters?.fechaHasta) params.append('fechaHasta', filters.fechaHasta);
    if (filters?.search) params.append('search', filters.search);
    
    params.append('format', format);

    const response = await fetch(`${API_BASE_URL}/export?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Accept': format === 'csv' ? 'text/csv' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      },
    });

    if (!response.ok) {
      throw new Error('Error al exportar campañas');
    }

    return response.blob();
  }

  // Obtener plantillas de campaña
  async getCampanaTemplates(): Promise<Array<{
    id: string;
    nombre: string;
    tipo: string;
    descripcion: string;
    configuracion: any;
  }>> {
    return this.makeRequest<Array<{
      id: string;
      nombre: string;
      tipo: string;
      descripcion: string;
      configuracion: any;
    }>>(`${API_BASE_URL}/templates`);
  }

  // Crear campaña desde plantilla
  async createFromTemplate(templateId: string, data: Partial<CreateCampanaRequest>): Promise<Campana> {
    return this.makeRequest<Campana>(`${API_BASE_URL}/templates/${templateId}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Obtener segmentos disponibles
  async getSegmentos(): Promise<Array<{
    id: string;
    nombre: string;
    descripcion: string;
    criterios: any;
    audiencia: number;
  }>> {
    return this.makeRequest<Array<{
      id: string;
      nombre: string;
      descripcion: string;
      criterios: any;
      audiencia: number;
    }>>('/api/segmentos');
  }

  // Validar campaña antes de crear/actualizar
  async validateCampana(data: Partial<CreateCampanaRequest>): Promise<{
    valid: boolean;
    errors: Record<string, string>;
    warnings: Record<string, string>;
  }> {
    return this.makeRequest<{
      valid: boolean;
      errors: Record<string, string>;
      warnings: Record<string, string>;
    }>(`${API_BASE_URL}/validate`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Previsualizar campaña
  async previewCampana(id: string): Promise<{
    preview: string;
    estimatedReach: number;
    estimatedCost: number;
  }> {
    return this.makeRequest<{
      preview: string;
      estimatedReach: number;
      estimatedCost: number;
    }>(`${API_BASE_URL}/${id}/preview`);
  }
}

// Mock data para desarrollo local
const mockCampanas: Campana[] = [
  {
    id: '1',
    nombre: 'Campaña Verano 2024 - Propiedades de Lujo',
    tipo: 'email',
    estado: 'activa',
    fechaInicio: '2024-01-15T00:00:00Z',
    fechaFin: '2024-03-15T00:00:00Z',
    presupuesto: 15000,
    gastado: 8500,
    segmentacion: ['Compradores potenciales', 'Lujo', 'Inversores'],
    metricas: {
      impresiones: 45000,
      clicks: 1800,
      conversiones: 72,
      ctr: 4.0,
      roi: 285
    },
    fechaCreacion: '2024-01-10T00:00:00Z',
    fechaModificacion: '2024-01-15T00:00:00Z'
  },
  {
    id: '2',
    nombre: 'SMS Alertas Nuevas Propiedades',
    tipo: 'sms',
    estado: 'activa',
    fechaInicio: '2024-01-01T00:00:00Z',
    fechaFin: '2024-12-31T00:00:00Z',
    presupuesto: 5000,
    gastado: 1200,
    segmentacion: ['Leads calientes', 'Primera vivienda'],
    metricas: {
      impresiones: 12000,
      clicks: 960,
      conversiones: 48,
      ctr: 8.0,
      roi: 320
    },
    fechaCreacion: '2023-12-28T00:00:00Z',
    fechaModificacion: '2024-01-10T00:00:00Z'
  },
  {
    id: '3',
    nombre: 'Portales Premium - Q1 2024',
    tipo: 'portales',
    estado: 'pausada',
    fechaInicio: '2024-01-01T00:00:00Z',
    fechaFin: '2024-03-31T00:00:00Z',
    presupuesto: 25000,
    gastado: 18000,
    segmentacion: ['Vendedores', 'Comercial', 'Alquiler'],
    metricas: {
      impresiones: 125000,
      clicks: 3750,
      conversiones: 187,
      ctr: 3.0,
      roi: 240
    },
    fechaCreacion: '2023-12-15T00:00:00Z',
    fechaModificacion: '2024-01-12T00:00:00Z'
  },
  {
    id: '4',
    nombre: 'Automatización RPA - Leads Qualification',
    tipo: 'rpa',
    estado: 'activa',
    fechaInicio: '2024-01-08T00:00:00Z',
    fechaFin: '2024-06-08T00:00:00Z',
    presupuesto: 8000,
    gastado: 2400,
    segmentacion: ['Leads calientes', 'Clientes recurrentes'],
    metricas: {
      impresiones: 8500,
      clicks: 680,
      conversiones: 85,
      ctr: 8.0,
      roi: 425
    },
    fechaCreacion: '2024-01-05T00:00:00Z',
    fechaModificacion: '2024-01-14T00:00:00Z'
  },
  {
    id: '5',
    nombre: 'Newsletter Mensual - Market Update',
    tipo: 'email',
    estado: 'finalizada',
    fechaInicio: '2023-12-01T00:00:00Z',
    fechaFin: '2023-12-31T00:00:00Z',
    presupuesto: 3000,
    gastado: 2800,
    segmentacion: ['Compradores potenciales', 'Inversores'],
    metricas: {
      impresiones: 22000,
      clicks: 1100,
      conversiones: 33,
      ctr: 5.0,
      roi: 165
    },
    fechaCreacion: '2023-11-25T00:00:00Z',
    fechaModificacion: '2023-12-31T00:00:00Z'
  }
];

// Mock service para desarrollo
class MockCampanasService extends CampanasService {
  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  async getCampanas(filters?: CampanasFilters): Promise<CampanasResponse> {
    await new Promise(resolve => setTimeout(resolve, 500)); // Simular delay de red
    
    let filteredCampanas = [...mockCampanas];

    if (filters?.estado && filters.estado !== 'todos') {
      filteredCampanas = filteredCampanas.filter(c => c.estado === filters.estado);
    }
    
    if (filters?.tipo && filters.tipo !== 'todos') {
      filteredCampanas = filteredCampanas.filter(c => c.tipo === filters.tipo);
    }

    if (filters?.search) {
      const search = filters.search.toLowerCase();
      filteredCampanas = filteredCampanas.filter(c => 
        c.nombre.toLowerCase().includes(search) || 
        c.tipo.toLowerCase().includes(search)
      );
    }

    return {
      data: filteredCampanas,
      total: filteredCampanas.length,
      page: 1,
      limit: 50
    };
  }

  async createCampana(data: CreateCampanaRequest): Promise<Campana> {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const newCampana: Campana = {
      id: this.generateId(),
      nombre: data.nombre,
      tipo: data.tipo,
      estado: data.estado || 'borrador',
      fechaInicio: data.fechaInicio,
      fechaFin: data.fechaFin,
      presupuesto: data.presupuesto,
      gastado: 0,
      segmentacion: data.segmentacion,
      metricas: {
        impresiones: 0,
        clicks: 0,
        conversiones: 0,
        ctr: 0,
        roi: 0
      },
      fechaCreacion: new Date().toISOString(),
      fechaModificacion: new Date().toISOString()
    };

    mockCampanas.push(newCampana);
    return newCampana;
  }

  async updateCampana(id: string, data: Partial<CreateCampanaRequest>): Promise<Campana> {
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const index = mockCampanas.findIndex(c => c.id === id);
    if (index === -1) {
      throw new Error('Campaña no encontrada');
    }

    mockCampanas[index] = {
      ...mockCampanas[index],
      ...data,
      fechaModificacion: new Date().toISOString()
    };

    return mockCampanas[index];
  }

  async deleteCampana(id: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const index = mockCampanas.findIndex(c => c.id === id);
    if (index === -1) {
      throw new Error('Campaña no encontrada');
    }

    mockCampanas.splice(index, 1);
  }

  async duplicateCampana(id: string, newName?: string): Promise<Campana> {
    await new Promise(resolve => setTimeout(resolve, 700));
    
    const original = mockCampanas.find(c => c.id === id);
    if (!original) {
      throw new Error('Campaña no encontrada');
    }

    const duplicated: Campana = {
      ...original,
      id: this.generateId(),
      nombre: newName || `${original.nombre} (Copia)`,
      estado: 'borrador',
      gastado: 0,
      metricas: {
        impresiones: 0,
        clicks: 0,
        conversiones: 0,
        ctr: 0,
        roi: 0
      },
      fechaCreacion: new Date().toISOString(),
      fechaModificacion: new Date().toISOString()
    };

    mockCampanas.push(duplicated);
    return duplicated;
  }

  async getStats(): Promise<CampanaStats> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const stats = mockCampanas.reduce(
      (acc, campana) => {
        acc.total++;
        acc[campana.estado as keyof CampanaStats]++;
        acc.presupuestoTotal += campana.presupuesto;
        acc.gastado += campana.gastado;
        return acc;
      },
      {
        total: 0,
        activas: 0,
        pausadas: 0,
        finalizadas: 0,
        borradores: 0,
        nuevas: 2,
        roiPromedio: 0,
        presupuestoTotal: 0,
        gastado: 0
      }
    );

    stats.roiPromedio = mockCampanas.reduce((sum, c) => sum + c.metricas.roi, 0) / (mockCampanas.length || 1);

    return stats;
  }
}

// Determinar si usar mock o servicio real basado en environment
const isDevelopment = process.env.NODE_ENV === 'development';
export const campanasService = isDevelopment ? new MockCampanasService() : new CampanasService();

export { CampanasService, MockCampanasService };