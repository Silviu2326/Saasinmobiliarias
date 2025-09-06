import type { Severity, Result, AuditEvent, AuditQuery, AuditDiff } from './types';

export function formatSeverity(severity: Severity): {
  label: string;
  color: string;
  bgColor: string;
} {
  const map = {
    low: {
      label: 'Bajo',
      color: 'text-green-700',
      bgColor: 'bg-green-100',
    },
    med: {
      label: 'Medio',
      color: 'text-yellow-700',
      bgColor: 'bg-yellow-100',
    },
    high: {
      label: 'Alto',
      color: 'text-red-700',
      bgColor: 'bg-red-100',
    },
  };
  
  return map[severity];
}

export function formatResult(result: Result): {
  label: string;
  color: string;
  bgColor: string;
} {
  const map = {
    ok: {
      label: 'Exitoso',
      color: 'text-green-700',
      bgColor: 'bg-green-100',
    },
    error: {
      label: 'Error',
      color: 'text-red-700',
      bgColor: 'bg-red-100',
    },
  };
  
  return map[result];
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(date);
}

export function formatShortDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;
  
  if (diffMs < minute) {
    return 'Hace menos de 1 minuto';
  } else if (diffMs < hour) {
    const minutes = Math.floor(diffMs / minute);
    return `Hace ${minutes} minuto${minutes !== 1 ? 's' : ''}`;
  } else if (diffMs < day) {
    const hours = Math.floor(diffMs / hour);
    return `Hace ${hours} hora${hours !== 1 ? 's' : ''}`;
  } else {
    const days = Math.floor(diffMs / day);
    return `Hace ${days} día${days !== 1 ? 's' : ''}`;
  }
}

export function buildCsv(events: AuditEvent[]): string {
  const headers = [
    'Fecha/Hora',
    'Actor',
    'Rol',
    'Origen',
    'Entidad',
    'Referencia',
    'Acción',
    'Severidad',
    'Resultado',
    'IP',
    'Descripción',
  ];
  
  const rows = events.map(event => [
    formatDate(event.at),
    event.actor,
    event.role || '',
    event.origin,
    event.entity,
    event.ref || '',
    event.action,
    formatSeverity(event.severity).label,
    formatResult(event.result).label,
    event.ip || '',
    event.description || '',
  ]);
  
  const csvContent = [
    headers.join(','),
    ...rows.map(row => 
      row.map(cell => 
        typeof cell === 'string' && (cell.includes(',') || cell.includes('"'))
          ? `"${cell.replace(/"/g, '""')}"` 
          : cell
      ).join(',')
    ),
  ].join('\n');
  
  return csvContent;
}

export function buildJson(events: AuditEvent[]): string {
  const exportData = {
    exportedAt: new Date().toISOString(),
    totalEvents: events.length,
    events,
    metadata: {
      generator: 'Compliance Auditoría',
      version: '1.0',
    },
  };
  
  return JSON.stringify(exportData, null, 2);
}

export function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// Funciones simuladas de verificación de integridad
export function verifyHash(event: AuditEvent): boolean {
  // Simulación: verificar que el hash sea válido
  if (!event.hash) return false;
  
  // En una implementación real, recalcularíamos el hash
  return event.hash.startsWith('sha256:') && event.hash.length > 10;
}

export function verifyChain(chainHash?: string): boolean {
  // Simulación: verificar integridad de la cadena
  if (!chainHash) return false;
  
  return chainHash.startsWith('chain:') && chainHash.length > 8;
}

export function calculateDiff(before: any, after: any): AuditDiff[] {
  if (!before || !after) return [];
  
  const diffs: AuditDiff[] = [];
  const allKeys = new Set([...Object.keys(before), ...Object.keys(after)]);
  
  for (const key of allKeys) {
    const beforeValue = before[key];
    const afterValue = after[key];
    
    if (!(key in before)) {
      diffs.push({
        field: key,
        before: undefined,
        after: afterValue,
        type: 'added',
      });
    } else if (!(key in after)) {
      diffs.push({
        field: key,
        before: beforeValue,
        after: undefined,
        type: 'removed',
      });
    } else if (JSON.stringify(beforeValue) !== JSON.stringify(afterValue)) {
      diffs.push({
        field: key,
        before: beforeValue,
        after: afterValue,
        type: 'modified',
      });
    }
  }
  
  return diffs;
}

export function obfuscatePayload(payload: any): any {
  if (!payload || typeof payload !== 'object') return payload;
  
  const sensitiveFields = ['email', 'iban', 'dni', 'nie', 'password', 'token', 'ssn', 'phone'];
  const result = { ...payload };
  
  function obfuscateValue(value: string): string {
    if (value.length <= 4) return '***';
    return `${value.substring(0, 2)}${'*'.repeat(Math.min(value.length - 4, 6))}${value.substring(value.length - 2)}`;
  }
  
  function processObject(obj: any): any {
    if (Array.isArray(obj)) {
      return obj.map(processObject);
    }
    
    if (obj && typeof obj === 'object') {
      const processed: any = {};
      
      for (const [key, value] of Object.entries(obj)) {
        const keyLower = key.toLowerCase();
        
        if (sensitiveFields.some(field => keyLower.includes(field))) {
          if (typeof value === 'string') {
            processed[key] = obfuscateValue(value);
          } else {
            processed[key] = '***';
          }
        } else {
          processed[key] = processObject(value);
        }
      }
      
      return processed;
    }
    
    return obj;
  }
  
  return processObject(result);
}

export function queryToUrlParams(query: AuditQuery): URLSearchParams {
  const params = new URLSearchParams();
  
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.set(key, String(value));
    }
  });
  
  return params;
}

export function urlParamsToQuery(params: URLSearchParams): AuditQuery {
  const query: AuditQuery = {};
  
  for (const [key, value] of params.entries()) {
    switch (key) {
      case 'page':
      case 'size':
        const numValue = parseInt(value, 10);
        if (!isNaN(numValue)) {
          query[key as 'page' | 'size'] = numValue;
        }
        break;
      case 'severity':
        if (['low', 'med', 'high'].includes(value)) {
          query.severity = value as Severity;
        }
        break;
      case 'result':
        if (['ok', 'error'].includes(value)) {
          query.result = value as Result;
        }
        break;
      case 'origin':
        if (['web', 'api', 'task'].includes(value)) {
          query.origin = value as 'web' | 'api' | 'task';
        }
        break;
      default:
        (query as any)[key] = value;
    }
  }
  
  return query;
}

export function getQuickDateRanges() {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  return {
    today: {
      label: 'Hoy',
      from: today.toISOString(),
      to: now.toISOString(),
    },
    last7days: {
      label: 'Últimos 7 días',
      from: new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000).toISOString(),
      to: now.toISOString(),
    },
    last30days: {
      label: 'Últimos 30 días',
      from: new Date(today.getTime() - 29 * 24 * 60 * 60 * 1000).toISOString(),
      to: now.toISOString(),
    },
    lastMonth: {
      label: 'Mes pasado',
      from: new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString(),
      to: new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59).toISOString(),
    },
  };
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function formatCronDescription(cron: string): string {
  // Descripción básica de expresiones cron comunes
  const descriptions: Record<string, string> = {
    '0 0 * * *': 'Diariamente a medianoche',
    '0 9 * * *': 'Diariamente a las 9:00',
    '0 9 * * 1': 'Semanalmente los lunes a las 9:00',
    '0 9 1 * *': 'Mensualmente el día 1 a las 9:00',
    '0 0 1 1 *': 'Anualmente el 1 de enero a medianoche',
  };
  
  return descriptions[cron] || `Programado: ${cron}`;
}