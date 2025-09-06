import type {
  DsrRequest,
  Consent,
  ChecklistItem,
  AuditEvent,
} from './types';

export function statusToBadge(status: DsrRequest['status']) {
  const map = {
    open: { color: 'bg-blue-100 text-blue-800', label: 'Abierto' },
    in_progress: { color: 'bg-yellow-100 text-yellow-800', label: 'En proceso' },
    done: { color: 'bg-green-100 text-green-800', label: 'Completado' },
    rejected: { color: 'bg-red-100 text-red-800', label: 'Rechazado' },
  };
  return map[status];
}

export function dsrTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    access: 'Acceso',
    rectification: 'Rectificación',
    erasure: 'Supresión',
    portability: 'Portabilidad',
    restriction: 'Limitación',
    objection: 'Oposición',
  };
  return labels[type] || type;
}

export function severityToColor(severity: AuditEvent['severity']) {
  const map = {
    low: 'bg-gray-100 text-gray-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-red-100 text-red-800',
  };
  return map[severity];
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function formatShortDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

export function getDaysUntilDeadline(dueDate: string): number {
  const due = new Date(dueDate);
  const now = new Date();
  const diff = due.getTime() - now.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

export function buildCompliancePack(ref: string, data: {
  dsr?: DsrRequest[];
  consents?: Consent[];
  checklist?: ChecklistItem[];
  audit?: AuditEvent[];
}): string {
  const pack = {
    reference: ref,
    generatedAt: new Date().toISOString(),
    summary: {
      totalDsr: data.dsr?.length || 0,
      totalConsents: data.consents?.length || 0,
      checklistCompletion: calculateChecklistProgress(data.checklist || []),
      auditEvents: data.audit?.length || 0,
    },
    data,
  };

  return JSON.stringify(pack, null, 2);
}

export function calculateChecklistProgress(items: ChecklistItem[]): {
  completed: number;
  total: number;
  percentage: number;
  hasBlockers: boolean;
} {
  const total = items.length;
  const completed = items.filter(item => item.done).length;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  const hasBlockers = items.some(item => item.blocker && !item.done);

  return { completed, total, percentage, hasBlockers };
}

export function generateDsrSla(type: string): { days: number; description: string } {
  const slas: Record<string, { days: number; description: string }> = {
    access: { days: 30, description: 'Derecho de acceso - 30 días' },
    rectification: { days: 30, description: 'Derecho de rectificación - 30 días' },
    erasure: { days: 30, description: 'Derecho de supresión - 30 días' },
    portability: { days: 30, description: 'Derecho de portabilidad - 30 días' },
    restriction: { days: 15, description: 'Derecho de limitación - 15 días' },
    objection: { days: 30, description: 'Derecho de oposición - 30 días' },
  };
  return slas[type] || { days: 30, description: 'Plazo estándar - 30 días' };
}

export function exportToCSV(data: any[], filename: string): void {
  if (!data.length) return;

  const headers = Object.keys(data[0]);
  const csv = [
    headers.join(','),
    ...data.map(row =>
      headers.map(field => {
        const value = row[field];
        return typeof value === 'string' && value.includes(',')
          ? `"${value}"`
          : value;
      }).join(',')
    ),
  ].join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}

export function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  if (!domain) return email;
  
  const maskedLocal = local.length > 2
    ? `${local[0]}${'*'.repeat(Math.min(local.length - 2, 5))}${local[local.length - 1]}`
    : '***';
    
  return `${maskedLocal}@${domain}`;
}

export function maskDocId(docId: string): string {
  if (docId.length <= 4) return '****';
  return `${docId.substring(0, 2)}${'*'.repeat(Math.min(docId.length - 4, 6))}${docId.substring(docId.length - 2)}`;
}

export function getComplianceStatusColor(status: 'ok' | 'warning' | 'critical'): string {
  const colors = {
    ok: 'bg-green-500',
    warning: 'bg-yellow-500',
    critical: 'bg-red-500',
  };
  return colors[status];
}

export function getComplianceStatusText(status: 'ok' | 'warning' | 'critical'): string {
  const texts = {
    ok: 'Cumplimiento OK',
    warning: 'Atención requerida',
    critical: 'Acción urgente',
  };
  return texts[status];
}