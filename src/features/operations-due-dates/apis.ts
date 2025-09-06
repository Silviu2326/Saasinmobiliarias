import { 
  DueDateItem, 
  DueDateFilters, 
  DueDateKPIs, 
  ReminderSettings, 
  EscalationRule, 
  AuditEvent,
  DueType,
  Priority,
  DueStatus,
  SLAState
} from './types';

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "/api";

// Mock data generators
const generateMockDueDates = (count: number = 50): DueDateItem[] => {
  const types: DueType[] = ["OFERTA", "RESERVA", "CONTRATO", "DUE_DILIGENCE", "PAGO", "DOCUMENTO", "TAREA"];
  const priorities: Priority[] = ["BAJA", "MEDIA", "ALTA", "CRITICA"];
  const statuses: DueStatus[] = ["PENDIENTE", "COMPLETADO", "POSPUESTO", "VENCIDO"];
  const slaStates: SLAState[] = ["ON_TIME", "AT_RISK", "LATE"];
  
  const offices = ["Madrid Centro", "Barcelona", "Valencia", "Sevilla"];
  const teams = ["Ventas", "Legal", "Administración", "Due Diligence"];
  const agents = ["Juan Pérez", "María García", "Carlos López", "Ana Martín", "Luis Rodríguez"];

  const items: DueDateItem[] = [];
  
  for (let i = 0; i < count; i++) {
    const now = new Date();
    const randomDays = Math.floor(Math.random() * 60) - 30; // -30 to +30 days
    const date = new Date(now.getTime() + randomDays * 24 * 60 * 60 * 1000);
    
    const type = types[Math.floor(Math.random() * types.length)];
    const priority = priorities[Math.floor(Math.random() * priorities.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    
    // Calculate SLA based on date and status
    let sla: SLAState = "ON_TIME";
    const hoursUntilDue = (date.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    if (status === "PENDIENTE") {
      if (hoursUntilDue < 0) {
        sla = "LATE";
      } else if (hoursUntilDue < 24) {
        sla = "AT_RISK";
      }
    }

    items.push({
      id: `due-${i + 1}`,
      type,
      title: `${type} - ${getRandomTitle(type)}`,
      description: `Descripción detallada para ${type} #${i + 1}`,
      date: date.toISOString(),
      priority,
      status,
      sla,
      officeId: offices[Math.floor(Math.random() * offices.length)],
      teamId: teams[Math.floor(Math.random() * teams.length)],
      assigneeId: `agent-${Math.floor(Math.random() * agents.length) + 1}`,
      assigneeName: agents[Math.floor(Math.random() * agents.length)],
      entity: {
        kind: getLinkedEntityKind(type),
        id: `entity-${Math.floor(Math.random() * 1000) + 1}`,
        ref: `REF-${Math.random().toString(36).substr(2, 6).toUpperCase()}`
      },
      createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - Math.random() * 5 * 24 * 60 * 60 * 1000).toISOString(),
      reminders: Math.random() > 0.5 ? [
        { offset: 24, unit: "hours", channel: "EMAIL" },
        { offset: 4, unit: "hours", channel: "WHATSAPP" }
      ] : undefined,
      attachments: Math.random() > 0.7 ? [`document-${i}.pdf`, `anexo-${i}.docx`] : undefined
    });
  }
  
  return items;
};

const getRandomTitle = (type: DueType): string => {
  const titles = {
    OFERTA: ["Revisión propuesta", "Presentación cliente", "Negociación términos"],
    RESERVA: ["Confirmación reserva", "Documentación", "Pago señal"],
    CONTRATO: ["Firma contrato", "Revisión legal", "Aprobación dirección"],
    DUE_DILIGENCE: ["Inspección técnica", "Revisión documental", "Informe final"],
    PAGO: ["Facturación", "Cobro pendiente", "Reconciliación"],
    DOCUMENTO: ["Entrega escrituras", "Registro propiedad", "Certificados"],
    TAREA: ["Llamada seguimiento", "Reunión equipo", "Actualización datos"]
  };
  
  const typesTitles = titles[type] || ["Tarea genérica"];
  return typesTitles[Math.floor(Math.random() * typesTitles.length)];
};

const getLinkedEntityKind = (type: DueType) => {
  const mapping = {
    OFERTA: "OFFER",
    RESERVA: "RESERVATION", 
    CONTRATO: "CONTRACT",
    DUE_DILIGENCE: "DOC",
    PAGO: "INVOICE",
    DOCUMENTO: "DOC",
    TAREA: "TASK"
  };
  return mapping[type] as any;
};

// Mock data
let mockDueDates = generateMockDueDates(100);

// API functions
export const getDueDates = async (filters: DueDateFilters = {}): Promise<{ items: DueDateItem[]; total: number }> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  let filtered = [...mockDueDates];
  
  // Apply filters
  if (filters.from) {
    const fromDate = new Date(filters.from);
    filtered = filtered.filter(item => new Date(item.date) >= fromDate);
  }
  
  if (filters.to) {
    const toDate = new Date(filters.to);
    filtered = filtered.filter(item => new Date(item.date) <= toDate);
  }
  
  if (filters.tipo) {
    filtered = filtered.filter(item => item.type === filters.tipo);
  }
  
  if (filters.estado) {
    filtered = filtered.filter(item => item.status === filters.estado);
  }
  
  if (filters.prioridad) {
    filtered = filtered.filter(item => item.priority === filters.prioridad);
  }
  
  if (filters.oficina) {
    filtered = filtered.filter(item => item.officeId === filters.oficina);
  }
  
  if (filters.agente) {
    filtered = filtered.filter(item => item.assigneeId === filters.agente);
  }
  
  if (filters.sla) {
    filtered = filtered.filter(item => item.sla === filters.sla);
  }
  
  if (filters.q) {
    const query = filters.q.toLowerCase();
    filtered = filtered.filter(item => 
      item.title.toLowerCase().includes(query) ||
      item.description?.toLowerCase().includes(query) ||
      item.assigneeName?.toLowerCase().includes(query)
    );
  }
  
  // Sorting
  if (filters.sort) {
    const [field, order] = filters.sort.split(':');
    filtered.sort((a, b) => {
      let aValue = (a as any)[field];
      let bValue = (b as any)[field];
      
      if (field === 'date') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }
      
      const comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      return order === 'desc' ? -comparison : comparison;
    });
  }
  
  // Pagination
  const page = filters.page || 0;
  const size = filters.size || 25;
  const total = filtered.length;
  const items = filtered.slice(page * size, (page + 1) * size);
  
  return { items, total };
};

export const getDueDate = async (id: string): Promise<DueDateItem | null> => {
  await new Promise(resolve => setTimeout(resolve, 200));
  return mockDueDates.find(item => item.id === id) || null;
};

export const createDueDate = async (data: Partial<DueDateItem>): Promise<DueDateItem> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const newItem: DueDateItem = {
    id: `due-${Date.now()}`,
    type: data.type!,
    title: data.title!,
    description: data.description,
    date: data.date!,
    endDate: data.endDate,
    allDay: data.allDay || false,
    reminders: data.reminders || [],
    priority: data.priority || "MEDIA",
    status: "PENDIENTE",
    sla: "ON_TIME",
    officeId: data.officeId,
    teamId: data.teamId,
    assigneeId: data.assigneeId,
    assigneeName: data.assigneeName,
    entity: data.entity,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    attachments: data.attachments || [],
    recurrence: data.recurrence
  };
  
  mockDueDates.unshift(newItem);
  return newItem;
};

export const updateDueDate = async (id: string, data: Partial<DueDateItem>): Promise<DueDateItem> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const index = mockDueDates.findIndex(item => item.id === id);
  if (index === -1) throw new Error('Item not found');
  
  mockDueDates[index] = {
    ...mockDueDates[index],
    ...data,
    updatedAt: new Date().toISOString()
  };
  
  return mockDueDates[index];
};

export const updateDueDateStatus = async (id: string, status: DueStatus, reason?: string): Promise<DueDateItem> => {
  await new Promise(resolve => setTimeout(resolve, 200));
  
  const index = mockDueDates.findIndex(item => item.id === id);
  if (index === -1) throw new Error('Item not found');
  
  mockDueDates[index] = {
    ...mockDueDates[index],
    status,
    updatedAt: new Date().toISOString()
  };
  
  return mockDueDates[index];
};

export const updateDueDateSchedule = async (id: string, date: string, endDate?: string): Promise<DueDateItem> => {
  return updateDueDate(id, { date, endDate });
};

export const updateDueDateAssignee = async (id: string, assigneeId: string, assigneeName?: string): Promise<DueDateItem> => {
  return updateDueDate(id, { assigneeId, assigneeName });
};

export const deleteDueDate = async (id: string): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 200));
  
  const index = mockDueDates.findIndex(item => item.id === id);
  if (index === -1) throw new Error('Item not found');
  
  mockDueDates.splice(index, 1);
};

export const getDueDateKPIs = async (filters: DueDateFilters = {}): Promise<DueDateKPIs> => {
  const { items } = await getDueDates(filters);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
  
  return {
    total: items.length,
    vencidos: items.filter(item => item.sla === "LATE").length,
    hoy: items.filter(item => {
      const itemDate = new Date(item.date);
      return itemDate >= today && itemDate < new Date(today.getTime() + 24 * 60 * 60 * 1000);
    }).length,
    semana: items.filter(item => {
      const itemDate = new Date(item.date);
      return itemDate >= today && itemDate < weekFromNow;
    }).length,
    atRisk: items.filter(item => item.sla === "AT_RISK").length,
    completados: items.filter(item => item.status === "COMPLETADO").length
  };
};

// Bulk actions
export const bulkUpdateStatus = async (itemIds: string[], status: DueStatus): Promise<DueDateItem[]> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const updatedItems: DueDateItem[] = [];
  for (const id of itemIds) {
    const item = await updateDueDateStatus(id, status);
    updatedItems.push(item);
  }
  
  return updatedItems;
};

export const bulkPostpone = async (itemIds: string[], days: number): Promise<DueDateItem[]> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const updatedItems: DueDateItem[] = [];
  for (const id of itemIds) {
    const item = mockDueDates.find(i => i.id === id);
    if (item) {
      const newDate = new Date(new Date(item.date).getTime() + days * 24 * 60 * 60 * 1000);
      const updated = await updateDueDateSchedule(id, newDate.toISOString());
      updatedItems.push(updated);
    }
  }
  
  return updatedItems;
};

export const bulkReassign = async (itemIds: string[], assigneeId: string): Promise<DueDateItem[]> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const updatedItems: DueDateItem[] = [];
  for (const id of itemIds) {
    const updated = await updateDueDateAssignee(id, assigneeId);
    updatedItems.push(updated);
  }
  
  return updatedItems;
};

// Settings
export const getReminderSettings = async (): Promise<ReminderSettings[]> => {
  await new Promise(resolve => setTimeout(resolve, 200));
  
  // Mock reminder settings
  return [
    { type: "OFERTA", offsets: [48, 4], unit: "hours", channels: ["EMAIL", "WHATSAPP"] },
    { type: "RESERVA", offsets: [72, 24], unit: "hours", channels: ["EMAIL", "WHATSAPP"] },
    { type: "CONTRATO", offsets: [7, 1], unit: "days", channels: ["EMAIL"] },
    { type: "PAGO", offsets: [5, 1], unit: "days", channels: ["EMAIL", "WHATSAPP"] },
    { type: "DOCUMENTO", offsets: [3], unit: "days", channels: ["EMAIL"] },
    { type: "TAREA", offsets: [1], unit: "days", channels: ["EMAIL"] }
  ];
};

export const updateReminderSettings = async (settings: ReminderSettings[]): Promise<ReminderSettings[]> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return settings; // In real app, would save to backend
};

export const getEscalationRules = async (): Promise<EscalationRule[]> => {
  await new Promise(resolve => setTimeout(resolve, 200));
  
  return [
    { 
      condition: { lateHours: 24 }, 
      notifyRoles: ["manager"], 
      repeatEveryHours: 24 
    },
    { 
      condition: { lateHours: 72 }, 
      notifyRoles: ["director"], 
      repeatEveryHours: 48 
    },
    { 
      condition: { priorityAtRisk: true }, 
      notifyRoles: ["team_lead"], 
      repeatEveryHours: 12 
    }
  ];
};

export const updateEscalationRules = async (rules: EscalationRule[]): Promise<EscalationRule[]> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return rules;
};

// Export/Import
export const exportDueDates = async (itemIds: string[], format: 'csv' | 'json' | 'ical'): Promise<Blob> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const items = mockDueDates.filter(item => itemIds.includes(item.id));
  
  if (format === 'csv') {
    const headers = ['ID', 'Tipo', 'Título', 'Fecha', 'Prioridad', 'Estado', 'Responsable', 'Oficina'];
    const rows = items.map(item => [
      item.id,
      item.type,
      item.title,
      new Date(item.date).toLocaleDateString(),
      item.priority,
      item.status,
      item.assigneeName || '',
      item.officeId || ''
    ]);
    
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    return new Blob([csvContent], { type: 'text/csv' });
  }
  
  if (format === 'json') {
    return new Blob([JSON.stringify(items, null, 2)], { type: 'application/json' });
  }
  
  // iCal format (simplified)
  const icalContent = items.map(item => `
BEGIN:VEVENT
UID:${item.id}
DTSTART:${new Date(item.date).toISOString().replace(/[-:]/g, '').split('.')[0]}Z
SUMMARY:${item.title}
DESCRIPTION:${item.description || ''}
PRIORITY:${item.priority}
END:VEVENT`).join('\n');
  
  const icalFile = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Due Dates//ES
${icalContent}
END:VCALENDAR`;
  
  return new Blob([icalFile], { type: 'text/calendar' });
};

export const importDueDates = async (file: File): Promise<DueDateItem[]> => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Mock CSV import
  const text = await file.text();
  const lines = text.split('\n');
  const headers = lines[0].split(',');
  
  const imported: DueDateItem[] = [];
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim()) {
      const values = lines[i].split(',');
      const item = await createDueDate({
        type: values[1] as DueType,
        title: values[2],
        date: new Date(values[3]).toISOString(),
        priority: values[4] as Priority,
        status: values[5] as DueStatus,
        assigneeName: values[6] || undefined,
        officeId: values[7] || undefined
      });
      imported.push(item);
    }
  }
  
  return imported;
};

// Audit trail
export const getAuditEvents = async (itemId?: string): Promise<AuditEvent[]> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // Mock audit events
  const events: AuditEvent[] = [];
  const actions = ['created', 'updated', 'completed', 'postponed', 'reassigned', 'reminder_sent'];
  const users = ['Juan Pérez', 'María García', 'Carlos López'];
  
  for (let i = 0; i < 20; i++) {
    events.push({
      id: `audit-${i + 1}`,
      at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      action: actions[Math.floor(Math.random() * actions.length)],
      user: users[Math.floor(Math.random() * users.length)],
      itemId: itemId || `due-${Math.floor(Math.random() * 100) + 1}`,
      payload: { reason: 'Cambio solicitado por el cliente' }
    });
  }
  
  return events.filter(e => !itemId || e.itemId === itemId);
};

export const recalculateSLA = async (): Promise<{ updated: number }> => {
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  let updated = 0;
  const now = new Date();
  
  for (const item of mockDueDates) {
    if (item.status === "PENDIENTE") {
      const hoursUntilDue = (new Date(item.date).getTime() - now.getTime()) / (1000 * 60 * 60);
      let newSLA: SLAState = "ON_TIME";
      
      if (hoursUntilDue < 0) {
        newSLA = "LATE";
        item.status = "VENCIDO";
      } else if (hoursUntilDue < 24) {
        newSLA = "AT_RISK";
      }
      
      if (item.sla !== newSLA) {
        item.sla = newSLA;
        updated++;
      }
    }
  }
  
  return { updated };
};