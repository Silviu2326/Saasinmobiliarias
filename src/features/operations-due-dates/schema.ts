import { z } from 'zod';
import { DueType, Priority, DueStatus } from './types';

export const DueTypeSchema = z.enum(['OFERTA', 'RESERVA', 'CONTRATO', 'DUE_DILIGENCE', 'PAGO', 'DOCUMENTO', 'TAREA']);
export const PrioritySchema = z.enum(['BAJA', 'MEDIA', 'ALTA', 'CRITICA']);
export const DueStatusSchema = z.enum(['PENDIENTE', 'COMPLETADO', 'POSPUESTO', 'VENCIDO']);
export const ReminderChannelSchema = z.enum(['EMAIL', 'WHATSAPP', 'CALL']);
export const RecurrenceFreqSchema = z.enum(['DAILY', 'WEEKLY', 'MONTHLY']);

export const LinkedEntitySchema = z.object({
  kind: z.enum(['OFFER', 'RESERVATION', 'CONTRACT', 'INVOICE', 'DOC', 'TASK']),
  id: z.string().min(1),
  ref: z.string().optional(),
});

export const ReminderSchema = z.object({
  offset: z.number().min(1),
  unit: z.enum(['minutes', 'hours', 'days']),
  channel: ReminderChannelSchema,
});

export const RecurrenceSchema = z.object({
  freq: RecurrenceFreqSchema,
  interval: z.number().min(1).optional().default(1),
  count: z.number().min(1).optional(),
  until: z.string().optional(),
});

export const CreateDueDateSchema = z.object({
  type: DueTypeSchema,
  title: z.string().min(1, 'El título es obligatorio'),
  description: z.string().optional(),
  date: z.string().refine((date) => {
    const parsed = new Date(date);
    return !isNaN(parsed.getTime());
  }, 'Fecha inválida'),
  endDate: z.string().optional(),
  allDay: z.boolean().optional().default(false),
  reminders: z.array(ReminderSchema).optional().default([]),
  priority: PrioritySchema.default('MEDIA'),
  officeId: z.string().optional(),
  teamId: z.string().optional(),
  assigneeId: z.string().optional(),
  entity: LinkedEntitySchema.optional(),
  attachments: z.array(z.string()).optional().default([]),
  recurrence: RecurrenceSchema.optional(),
}).refine((data) => {
  if (data.endDate) {
    const start = new Date(data.date);
    const end = new Date(data.endDate);
    return end >= start;
  }
  return true;
}, {
  message: 'La fecha de fin debe ser posterior a la fecha de inicio',
  path: ['endDate'],
});

export const UpdateDueDateSchema = CreateDueDateSchema.partial().extend({
  id: z.string().min(1),
});

export const UpdateStatusSchema = z.object({
  status: DueStatusSchema,
  reason: z.string().optional(),
});

export const UpdateScheduleSchema = z.object({
  date: z.string().refine((date) => {
    const parsed = new Date(date);
    return !isNaN(parsed.getTime());
  }, 'Fecha inválida'),
  endDate: z.string().optional(),
});

export const UpdateAssigneeSchema = z.object({
  assigneeId: z.string().min(1, 'El responsable es obligatorio'),
});

export const ReminderSettingsSchema = z.object({
  type: DueTypeSchema,
  offsets: z.array(z.number().min(1)),
  unit: z.enum(['minutes', 'hours', 'days']),
  channels: z.array(ReminderChannelSchema),
  businessHoursOnly: z.boolean().optional().default(true),
});

export const EscalationRuleSchema = z.object({
  condition: z.object({
    lateHours: z.number().min(1).optional(),
    priorityAtRisk: z.boolean().optional(),
  }),
  notifyRoles: z.array(z.string().min(1)),
  repeatEveryHours: z.number().min(1).optional(),
});

export const DueDateFiltersSchema = z.object({
  from: z.string().optional(),
  to: z.string().optional(),
  tipo: DueTypeSchema.optional(),
  estado: DueStatusSchema.optional(),
  prioridad: PrioritySchema.optional(),
  oficina: z.string().optional(),
  equipo: z.string().optional(),
  agente: z.string().optional(),
  entidad: z.string().optional(),
  sla: z.enum(['ON_TIME', 'AT_RISK', 'LATE']).optional(),
  q: z.string().optional(),
  page: z.number().min(0).optional().default(0),
  size: z.number().min(1).max(100).optional().default(25),
  sort: z.string().optional().default('date:asc'),
});

export const BulkActionSchema = z.object({
  action: z.enum(['complete', 'postpone', 'reassign', 'priority', 'export']),
  itemIds: z.array(z.string().min(1)).min(1, 'Debe seleccionar al menos un elemento'),
  params: z.object({
    postponeDays: z.number().min(1).optional(),
    assigneeId: z.string().optional(),
    priority: PrioritySchema.optional(),
    format: z.enum(['csv', 'json', 'ical']).optional(),
  }).optional(),
}).refine((data) => {
  if (data.action === 'postpone' && !data.params?.postponeDays) {
    return false;
  }
  if (data.action === 'reassign' && !data.params?.assigneeId) {
    return false;
  }
  if (data.action === 'priority' && !data.params?.priority) {
    return false;
  }
  if (data.action === 'export' && !data.params?.format) {
    return false;
  }
  return true;
}, {
  message: 'Parámetros requeridos para la acción seleccionada',
  path: ['params'],
});

export const ImportCSVSchema = z.object({
  title: z.string().min(1),
  type: DueTypeSchema,
  date: z.string(),
  priority: PrioritySchema,
  status: DueStatusSchema,
  description: z.string().optional(),
  assigneeId: z.string().optional(),
  officeId: z.string().optional(),
});

export type CreateDueDateInput = z.infer<typeof CreateDueDateSchema>;
export type UpdateDueDateInput = z.infer<typeof UpdateDueDateSchema>;
export type UpdateStatusInput = z.infer<typeof UpdateStatusSchema>;
export type UpdateScheduleInput = z.infer<typeof UpdateScheduleSchema>;
export type UpdateAssigneeInput = z.infer<typeof UpdateAssigneeSchema>;
export type ReminderSettingsInput = z.infer<typeof ReminderSettingsSchema>;
export type EscalationRuleInput = z.infer<typeof EscalationRuleSchema>;
export type DueDateFiltersInput = z.infer<typeof DueDateFiltersSchema>;
export type BulkActionInput = z.infer<typeof BulkActionSchema>;
export type ImportCSVInput = z.infer<typeof ImportCSVSchema>;