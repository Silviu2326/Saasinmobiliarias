import type {
  AuditEvent,
  AuditQuery,
  AuditResponse,
  ExportJob,
  Schedule,
  RetentionInfo,
  IntegrityInfo,
  Evidence,
} from './types';

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '/api';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Datos simulados
const MOCK_EVENTS: AuditEvent[] = Array.from({ length: 150 }, (_, i) => {
  const date = new Date(Date.now() - (i * 2 * 60 * 60 * 1000)); // Cada 2 horas hacia atrás
  const entities = ['lead', 'cliente', 'propiedad', 'oferta', 'reserva', 'contrato', 'consent', 'dsr', 'kyc'];
  const actions = ['create', 'update', 'delete', 'export', 'sign', 'login', 'download', 'access', 'approve'];
  const actors = ['admin@ejemplo.com', 'comercial1@ejemplo.com', 'legal@ejemplo.com', 'sistema'];
  const severities: ('low' | 'med' | 'high')[] = ['low', 'low', 'low', 'med', 'med', 'high'];
  const results: ('ok' | 'error')[] = ['ok', 'ok', 'ok', 'ok', 'error'];
  const origins: ('web' | 'api' | 'task')[] = ['web', 'web', 'api', 'task'];

  return {
    id: `audit-${i + 1000}`,
    at: date.toISOString(),
    actor: actors[i % actors.length],
    role: i % 3 === 0 ? 'admin' : i % 3 === 1 ? 'comercial' : 'legal',
    origin: origins[i % origins.length],
    entity: entities[i % entities.length],
    ref: `REF-${1000 + i}`,
    action: actions[i % actions.length],
    severity: severities[i % severities.length],
    result: results[i % results.length],
    ip: `192.168.1.${(i % 50) + 100}`,
    userAgent: i % 2 === 0 ? 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' : 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    payload: {
      operation: `${actions[i % actions.length]}_${entities[i % entities.length]}`,
      duration: Math.floor(Math.random() * 5000),
      bytes: Math.floor(Math.random() * 50000),
    },
    before: i % 5 === 0 ? { status: 'draft', value: 100 } : undefined,
    after: i % 5 === 0 ? { status: 'active', value: 150 } : undefined,
    hash: `sha256:${Math.random().toString(36).substring(2, 15)}`,
    chainHash: `chain:${Math.random().toString(36).substring(2, 10)}`,
    description: `${actions[i % actions.length]} operation on ${entities[i % entities.length]}`,
    sessionId: `sess-${Math.random().toString(36).substring(2, 8)}`,
    evidence: i % 8 === 0 ? [`evidence-${i}.json`, `screenshot-${i}.png`] : undefined,
  };
});

export const auditApi = {
  // Consulta de auditoría
  async getEvents(query: AuditQuery): Promise<AuditResponse> {
    await delay(600);
    
    let filteredEvents = [...MOCK_EVENTS];
    
    // Aplicar filtros
    if (query.q) {
      const q = query.q.toLowerCase();
      filteredEvents = filteredEvents.filter(event => 
        event.actor.toLowerCase().includes(q) ||
        event.entity.toLowerCase().includes(q) ||
        event.action.toLowerCase().includes(q) ||
        event.ref?.toLowerCase().includes(q) ||
        event.description?.toLowerCase().includes(q)
      );
    }
    
    if (query.from) {
      const fromDate = new Date(query.from);
      filteredEvents = filteredEvents.filter(event => new Date(event.at) >= fromDate);
    }
    
    if (query.to) {
      const toDate = new Date(query.to);
      filteredEvents = filteredEvents.filter(event => new Date(event.at) <= toDate);
    }
    
    if (query.actor) {
      filteredEvents = filteredEvents.filter(event => 
        event.actor.toLowerCase().includes(query.actor!.toLowerCase())
      );
    }
    
    if (query.role) {
      filteredEvents = filteredEvents.filter(event => event.role === query.role);
    }
    
    if (query.origin) {
      filteredEvents = filteredEvents.filter(event => event.origin === query.origin);
    }
    
    if (query.entity) {
      filteredEvents = filteredEvents.filter(event => event.entity === query.entity);
    }
    
    if (query.action) {
      filteredEvents = filteredEvents.filter(event => event.action === query.action);
    }
    
    if (query.severity) {
      filteredEvents = filteredEvents.filter(event => event.severity === query.severity);
    }
    
    if (query.result) {
      filteredEvents = filteredEvents.filter(event => event.result === query.result);
    }
    
    // Ordenar
    const sort = query.sort || '-at';
    const [field, direction] = sort.startsWith('-') ? [sort.substring(1), 'desc'] : [sort, 'asc'];
    
    filteredEvents.sort((a, b) => {
      let aVal = (a as any)[field];
      let bVal = (b as any)[field];
      
      if (field === 'at') {
        aVal = new Date(aVal).getTime();
        bVal = new Date(bVal).getTime();
      }
      
      const result = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      return direction === 'desc' ? -result : result;
    });
    
    // Paginación
    const page = query.page || 1;
    const size = query.size || 25;
    const startIndex = (page - 1) * size;
    const endIndex = startIndex + size;
    
    const items = filteredEvents.slice(startIndex, endIndex);
    const total = filteredEvents.length;
    const totalPages = Math.ceil(total / size);
    
    return {
      items,
      total,
      page,
      totalPages,
    };
  },

  async getEventById(id: string): Promise<AuditEvent | null> {
    await delay(300);
    return MOCK_EVENTS.find(event => event.id === id) || null;
  },

  // Exportaciones
  async createExport(filters: AuditQuery, format: 'csv' | 'json'): Promise<ExportJob> {
    await delay(800);
    
    const job: ExportJob = {
      id: `export-${Date.now()}`,
      status: 'queued',
      format,
      filters,
      createdAt: new Date().toISOString(),
      downloadCount: 0,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 días
    };
    
    // Simular procesamiento asíncrono
    setTimeout(() => {
      job.status = 'processing';
    }, 1000);
    
    setTimeout(() => {
      job.status = 'done';
      job.completedAt = new Date().toISOString();
      job.url = `/api/audit/export/${job.id}/download`;
    }, 3000);
    
    return job;
  },

  async getExportJob(jobId: string): Promise<ExportJob | null> {
    await delay(200);
    
    // Simular diferentes estados
    const statuses: ('queued' | 'processing' | 'done' | 'failed')[] = ['done', 'processing', 'queued', 'failed'];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    
    return {
      id: jobId,
      status,
      format: 'csv',
      filters: {},
      createdAt: new Date(Date.now() - 60000).toISOString(),
      completedAt: status === 'done' ? new Date().toISOString() : undefined,
      url: status === 'done' ? `/api/audit/export/${jobId}/download` : undefined,
      downloadCount: status === 'done' ? Math.floor(Math.random() * 5) : 0,
      expiresAt: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(),
    };
  },

  // Programación de informes
  async getSchedules(): Promise<Schedule[]> {
    await delay(400);
    
    return [
      {
        id: 'schedule-1',
        name: 'Informe Semanal RGPD',
        cron: '0 9 * * 1',
        emails: ['legal@ejemplo.com', 'compliance@ejemplo.com'],
        format: 'csv',
        filters: { entity: 'dsr', severity: 'high' },
        enabled: true,
        createdAt: '2024-01-15T10:00:00Z',
        createdBy: 'admin@ejemplo.com',
        lastRunAt: '2024-01-22T09:00:00Z',
        nextRunAt: '2024-01-29T09:00:00Z',
      },
      {
        id: 'schedule-2',
        name: 'Auditoría Mensual Completa',
        cron: '0 0 1 * *',
        emails: ['director@ejemplo.com'],
        format: 'json',
        filters: {},
        enabled: true,
        createdAt: '2024-01-10T15:30:00Z',
        createdBy: 'admin@ejemplo.com',
        lastRunAt: '2024-01-01T00:00:00Z',
        nextRunAt: '2024-02-01T00:00:00Z',
      },
    ];
  },

  async createSchedule(schedule: Partial<Schedule>): Promise<Schedule> {
    await delay(500);
    
    return {
      id: `schedule-${Date.now()}`,
      name: schedule.name || '',
      cron: schedule.cron || '',
      emails: schedule.emails || [],
      format: schedule.format || 'csv',
      filters: schedule.filters || {},
      enabled: schedule.enabled ?? true,
      createdAt: new Date().toISOString(),
      createdBy: 'current-user@ejemplo.com',
      nextRunAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    };
  },

  async updateSchedule(id: string, updates: Partial<Schedule>): Promise<Schedule> {
    await delay(400);
    
    // Simular actualización
    return {
      id,
      name: updates.name || 'Schedule Updated',
      cron: updates.cron || '0 9 * * 1',
      emails: updates.emails || ['user@ejemplo.com'],
      format: updates.format || 'csv',
      filters: updates.filters || {},
      enabled: updates.enabled ?? true,
      createdAt: '2024-01-15T10:00:00Z',
      createdBy: 'admin@ejemplo.com',
      nextRunAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    };
  },

  async deleteSchedule(id: string): Promise<{ success: boolean }> {
    await delay(300);
    return { success: true };
  },

  // Retención e integridad
  async getRetentionStatus(): Promise<RetentionInfo> {
    await delay(300);
    
    return {
      policy: 'Logs de auditoría: 540 días',
      retentionDays: 540,
      nextPurgeAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      itemsForPurge: 1247,
      legalHold: Math.random() > 0.8,
      legalHoldReason: Math.random() > 0.8 ? 'Investigación legal pendiente - Expediente JZ/2024/15' : undefined,
    };
  },

  async getIntegrityStatus(): Promise<IntegrityInfo> {
    await delay(400);
    
    const totalEvents = MOCK_EVENTS.length;
    const verifiedEvents = Math.floor(totalEvents * 0.95);
    
    return {
      chained: true,
      lastVerifiedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 horas atrás
      ok: Math.random() > 0.1, // 90% probabilidad de estar OK
      totalEvents,
      verifiedEvents,
      brokenChain: Math.random() > 0.9, // 10% probabilidad de cadena rota
      lastBlockHash: `block:${Math.random().toString(36).substring(2, 15)}`,
    };
  },

  async verifyIntegrity(): Promise<{ ok: boolean; checkedAt: string; details?: string }> {
    await delay(2000); // Simular verificación lenta
    
    const ok = Math.random() > 0.05; // 95% probabilidad de éxito
    
    return {
      ok,
      checkedAt: new Date().toISOString(),
      details: ok ? 'Verificación exitosa: cadena íntegra' : 'Error: hash inconsistente en evento audit-1045',
    };
  },

  // Evidencias
  async getEvidence(eventId: string, filename: string): Promise<Evidence | null> {
    await delay(300);
    
    const isImage = filename.match(/\.(jpg|jpeg|png|webp|gif)$/i);
    const isJson = filename.endsWith('.json');
    
    return {
      id: `evidence-${eventId}-${filename}`,
      filename,
      type: isImage ? 'image' : isJson ? 'json' : 'text',
      size: Math.floor(Math.random() * 500000), // hasta 500KB
      url: `/api/audit/events/${eventId}/evidence/${filename}`,
      content: isJson ? '{"example": "data", "timestamp": "2024-01-15T10:00:00Z"}' : 
               !isImage ? 'Contenido de texto de ejemplo para la evidencia' : undefined,
      hash: `sha256:${Math.random().toString(36).substring(2, 20)}`,
      uploadedAt: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
    };
  },
};