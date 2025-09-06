import { z } from 'zod';

export const GroupBySchema = z.enum(['day', 'week', 'month']);

export const ProductivityFiltersSchema = z.object({
  from: z.string().optional().refine((date) => {
    if (!date) return true;
    return !isNaN(Date.parse(date));
  }, 'Invalid from date'),
  
  to: z.string().optional().refine((date) => {
    if (!date) return true;
    return !isNaN(Date.parse(date));
  }, 'Invalid to date'),
  
  office: z.string().optional(),
  team: z.string().optional(),
  agent: z.string().optional(),
  
  canal: z.enum(['tel', 'email', 'whatsapp', 'visita']).optional(),
  tipo: z.enum(['venta', 'alquiler']).optional(),
  
  portal: z.string().optional(),
  campaña: z.string().optional(),
  
  dayStartHour: z.number().int().min(0).max(12).optional().default(8),
  
  groupBy: GroupBySchema.optional().default('day')
}).refine((data) => {
  // Validate date range
  if (data.from && data.to) {
    const fromDate = new Date(data.from);
    const toDate = new Date(data.to);
    
    if (fromDate > toDate) {
      return false;
    }
    
    // Maximum 12 months for daily grouping
    if (data.groupBy === 'day') {
      const diffMonths = (toDate.getFullYear() - fromDate.getFullYear()) * 12 + 
                        (toDate.getMonth() - fromDate.getMonth());
      return diffMonths <= 12;
    }
    
    // Maximum 24 months for weekly grouping  
    if (data.groupBy === 'week') {
      const diffMonths = (toDate.getFullYear() - fromDate.getFullYear()) * 12 + 
                        (toDate.getMonth() - fromDate.getMonth());
      return diffMonths <= 24;
    }
  }
  
  return true;
}, {
  message: 'Invalid date range or exceeds maximum allowed period',
  path: ['dateRange']
});

export const SlaFiltersSchema = ProductivityFiltersSchema.extend({
  xh: z.number().int().min(1).max(72).optional().default(4), // SLA hours for contact
  yd: z.number().int().min(1).max(14).optional().default(2)  // SLA days for follow-up
});

export const LeaderboardFiltersSchema = ProductivityFiltersSchema.extend({
  metric: z.enum(['activity', 'results']).optional().default('activity')
});

export const CapacityPlanSchema = z.object({
  demanda: z.number().positive(),
  objetivos: z.object({
    responseTimeHours: z.number().positive(),
    maxLeadsPerAgent: z.number().positive(),
    targetConversionRate: z.number().min(0).max(1)
  }),
  limites: z.object({
    minLeadsPerAgent: z.number().min(0),
    maxWorkloadHours: z.number().positive()
  })
});

export const ExportRequestSchema = z.object({
  format: z.enum(['CSV', 'JSON', 'PNG']),
  data: z.any(),
  filename: z.string().optional()
});

// Validation helpers
export const validateDateRange = (from?: string, to?: string) => {
  if (!from || !to) return true;
  
  const fromDate = new Date(from);
  const toDate = new Date(to);
  
  return fromDate <= toDate;
};

export const validateMaxRange = (from?: string, to?: string, groupBy: 'day' | 'week' | 'month' = 'day') => {
  if (!from || !to) return true;
  
  const fromDate = new Date(from);
  const toDate = new Date(to);
  
  const diffMonths = (toDate.getFullYear() - fromDate.getFullYear()) * 12 + 
                    (toDate.getMonth() - fromDate.getMonth());
  
  switch (groupBy) {
    case 'day':
      return diffMonths <= 12;
    case 'week':
      return diffMonths <= 24;
    case 'month':
      return diffMonths <= 60;
    default:
      return true;
  }
};

export const getValidationErrors = (filters: any) => {
  const errors: string[] = [];
  
  try {
    ProductivityFiltersSchema.parse(filters);
  } catch (error) {
    if (error instanceof z.ZodError) {
      errors.push(...error.errors.map(err => err.message));
    }
  }
  
  return errors;
};