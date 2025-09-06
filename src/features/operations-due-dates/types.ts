export type DueType = "OFERTA" | "RESERVA" | "CONTRATO" | "DUE_DILIGENCE" | "PAGO" | "DOCUMENTO" | "TAREA";
export type DueStatus = "PENDIENTE" | "COMPLETADO" | "POSPUESTO" | "VENCIDO";
export type Priority = "BAJA" | "MEDIA" | "ALTA" | "CRITICA";
export type SLAState = "ON_TIME" | "AT_RISK" | "LATE";
export type ViewMode = "board" | "calendar" | "table";

export interface LinkedEntity {
  kind: "OFFER" | "RESERVATION" | "CONTRACT" | "INVOICE" | "DOC" | "TASK";
  id: string;
  ref?: string;
}

export interface Reminder {
  offset: number;
  unit: "minutes" | "hours" | "days";
  channel: "EMAIL" | "WHATSAPP" | "CALL";
}

export interface Recurrence {
  freq: "DAILY" | "WEEKLY" | "MONTHLY";
  interval?: number;
  count?: number;
  until?: string;
}

export interface DueDateItem {
  id: string;
  type: DueType;
  title: string;
  description?: string;
  date: string;
  endDate?: string;
  allDay?: boolean;
  reminders?: Reminder[];
  priority: Priority;
  status: DueStatus;
  sla: SLAState;
  officeId?: string;
  teamId?: string;
  assigneeId?: string;
  assigneeName?: string;
  entity?: LinkedEntity;
  createdAt: string;
  updatedAt: string;
  attachments?: string[];
  recurrence?: Recurrence;
}

export interface ReminderSettings {
  type: DueType;
  offsets: number[];
  unit: "minutes" | "hours" | "days";
  channels: ("EMAIL" | "WHATSAPP" | "CALL")[];
  businessHoursOnly?: boolean;
}

export interface EscalationRule {
  condition: {
    lateHours?: number;
    priorityAtRisk?: boolean;
  };
  notifyRoles: string[];
  repeatEveryHours?: number;
}

export interface AuditEvent {
  id: string;
  at: string;
  action: string;
  user: string;
  itemId: string;
  payload?: Record<string, any>;
}

export interface DueDateFilters {
  from?: string;
  to?: string;
  tipo?: DueType;
  estado?: DueStatus;
  prioridad?: Priority;
  oficina?: string;
  equipo?: string;
  agente?: string;
  entidad?: string;
  sla?: SLAState;
  q?: string;
  page?: number;
  size?: number;
  sort?: string;
}

export interface DueDateKPIs {
  total: number;
  vencidos: number;
  hoy: number;
  semana: number;
  atRisk: number;
  completados: number;
}

export interface BoardBucket {
  id: string;
  title: string;
  items: DueDateItem[];
  count: number;
  color: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end?: string;
  allDay?: boolean;
  color: string;
  type: DueType;
  priority: Priority;
  sla: SLAState;
}

export interface BulkAction {
  action: "complete" | "postpone" | "reassign" | "priority" | "export";
  itemIds: string[];
  params?: {
    postponeDays?: number;
    assigneeId?: string;
    priority?: Priority;
    format?: "csv" | "json" | "ical";
  };
}