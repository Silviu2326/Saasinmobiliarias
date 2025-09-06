import { z } from 'zod';

export const kpiCategorySchema = z.object({
  name: z.string().min(1, 'El nombre de la categoría es requerido'),
  description: z.string().optional(),
  color: z.string().min(1, 'El color es requerido'),
  icon: z.string().min(1, 'El icono es requerido'),
  isActive: z.boolean()
});

export const kpiMetricSchema = z.object({
  categoryId: z.string().min(1, 'La categoría es requerida'),
  name: z.string().min(1, 'El nombre del KPI es requerido'),
  description: z.string().optional(),
  formula: z.string().min(1, 'La fórmula es requerida'),
  unit: z.string().min(1, 'La unidad es requerida'),
  target: z.number().optional(),
  frequency: z.enum(['daily', 'weekly', 'monthly', 'quarterly', 'yearly'], {
    required_error: 'La frecuencia es requerida'
  })
});

export const kpiGoalSchema = z.object({
  metricId: z.string().min(1, 'El KPI es requerido'),
  name: z.string().min(1, 'El nombre del objetivo es requerido'),
  description: z.string().optional(),
  targetValue: z.number().positive('El valor objetivo debe ser positivo'),
  startDate: z.string().min(1, 'La fecha de inicio es requerida'),
  endDate: z.string().min(1, 'La fecha de fin es requerida'),
  priority: z.enum(['low', 'medium', 'high', 'critical'], {
    required_error: 'La prioridad es requerida'
  }),
  assignedTo: z.string().optional()
});

export const kpiDashboardSchema = z.object({
  name: z.string().min(1, 'El nombre del dashboard es requerido'),
  description: z.string().optional(),
  categoryIds: z.array(z.string()).min(1, 'Al menos una categoría es requerida'),
  isPublic: z.boolean()
});

export const kpiFilterSchema = z.object({
  categoryIds: z.array(z.string()).optional(),
  timeRange: z.object({
    start: z.string(),
    end: z.string()
  }).optional(),
  frequency: z.enum(['daily', 'weekly', 'monthly', 'quarterly', 'yearly']).optional(),
  status: z.enum(['excellent', 'good', 'warning', 'critical']).optional(),
  trend: z.enum(['up', 'down', 'stable']).optional(),
  search: z.string().optional()
});

export const kpiTimeRangeSchema = z.object({
  name: z.string().min(1, 'El nombre del rango de tiempo es requerido'),
  startDate: z.string().min(1, 'La fecha de inicio es requerida'),
  endDate: z.string().min(1, 'La fecha de fin es requerida'),
  isCustom: z.boolean(),
  isDefault: z.boolean()
});

export const kpiNotificationSchema = z.object({
  metricId: z.string().min(1, 'El KPI es requerido'),
  type: z.enum(['threshold', 'trend', 'anomaly', 'goal'], {
    required_error: 'El tipo de notificación es requerido'
  }),
  title: z.string().min(1, 'El título es requerido'),
  message: z.string().min(1, 'El mensaje es requerido'),
  severity: z.enum(['info', 'warning', 'error', 'critical'], {
    required_error: 'La severidad es requerida'
  }),
  expiresAt: z.string().optional()
});

export const kpiBenchmarkSchema = z.object({
  metricId: z.string().min(1, 'El KPI es requerido'),
  industry: z.string().min(1, 'La industria es requerida'),
  companySize: z.string().min(1, 'El tamaño de la empresa es requerido'),
  region: z.string().min(1, 'La región es requerida'),
  benchmarkValue: z.number().positive('El valor del benchmark debe ser positivo'),
  percentile: z.number().min(0).max(100, 'El percentil debe estar entre 0 y 100'),
  dataSource: z.string().min(1, 'La fuente de datos es requerida')
});

export const kpiAnalysisSchema = z.object({
  metricId: z.string().min(1, 'El KPI es requerido'),
  period: z.string().min(1, 'El período es requerido'),
  insights: z.array(z.object({
    type: z.enum(['trend', 'anomaly', 'correlation', 'forecast']),
    title: z.string().min(1, 'El título es requerido'),
    description: z.string().min(1, 'La descripción es requerida'),
    confidence: z.number().min(0).max(100, 'La confianza debe estar entre 0 y 100'),
    impact: z.enum(['low', 'medium', 'high']),
    data: z.record(z.any())
  })),
  recommendations: z.array(z.object({
    title: z.string().min(1, 'El título es requerido'),
    description: z.string().min(1, 'La descripción es requerida'),
    action: z.string().min(1, 'La acción es requerida'),
    expectedImpact: z.number(),
    effort: z.enum(['low', 'medium', 'high']),
    priority: z.enum(['low', 'medium', 'high', 'critical']),
    deadline: z.string().optional()
  })),
  riskFactors: z.array(z.object({
    name: z.string().min(1, 'El nombre es requerido'),
    description: z.string().min(1, 'La descripción es requerida'),
    probability: z.number().min(0).max(100, 'La probabilidad debe estar entre 0 y 100'),
    impact: z.enum(['low', 'medium', 'high', 'critical']),
    mitigation: z.string().min(1, 'La mitigación es requerida'),
    status: z.enum(['active', 'mitigated', 'monitoring'])
  }))
});

export const kpiMetricFormSchema = kpiMetricSchema;
export const kpiGoalFormSchema = kpiGoalSchema;
export const kpiDashboardFormSchema = kpiDashboardSchema;
export const kpiTimeRangeFormSchema = kpiTimeRangeSchema;
export const kpiNotificationFormSchema = kpiNotificationSchema;
export const kpiBenchmarkFormSchema = kpiBenchmarkSchema;
export const kpiAnalysisFormSchema = kpiAnalysisSchema;


