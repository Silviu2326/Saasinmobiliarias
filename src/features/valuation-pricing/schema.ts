import { z } from 'zod';

// Basic schemas
export const goalSchema = z.enum(['RAPIDEZ', 'EQUILIBRIO', 'MAX_PRECIO']);
export const confidenceSchema = z.enum(['LOW', 'MEDIUM', 'HIGH']);
export const roundingModeSchema = z.enum(['99', '95', '000', 'NONE']);
export const currencySchema = z.enum(['EUR', 'USD', 'GBP']);
export const waterfallKindSchema = z.enum(['fee', 'tax', 'cost', 'net']);
export const scenarioTypeSchema = z.enum(['BASELINE', 'OPTIMISTA', 'AGRESIVO', 'PERSONALIZADO']);

// Subject schema
export const subjectSchema = z.object({
  id: z.string(),
  address: z.string().min(10, 'Dirección debe tener al menos 10 caracteres'),
  area: z.number().min(20, 'Área mínima: 20 m²').max(2000, 'Área máxima: 2000 m²'),
  rooms: z.number().min(0).max(20),
  bathrooms: z.number().min(1).max(10),
  propertyType: z.string().min(1),
  condition: z.string().min(1),
  buildingYear: z.number()
    .min(1800, 'Año mínimo: 1800')
    .max(new Date().getFullYear() + 2, 'Año no puede ser futuro'),
  coordinates: z.tuple([z.number(), z.number()]).optional(),
  neighborhood: z.string().optional(),
  postalCode: z.string().regex(/^\d{5}$/, 'Código postal debe tener 5 dígitos').optional(),
  city: z.string().optional(),
  province: z.string().optional(),
  features: z.array(z.string()).default([]),
  avmValue: z.number().min(0).optional(),
  avmRange: z.object({
    low: z.number().min(0),
    high: z.number().min(0),
    confidence: z.number().min(0).max(1)
  }).refine(data => data.low <= data.high, {
    message: 'El valor mínimo debe ser menor o igual al máximo'
  }).optional(),
  lastUpdated: z.string().optional()
});

// Constraints schema with business rules
export const constraintsSchema = z.object({
  minOwner: z.number().min(0, 'Mínimo del propietario debe ser positivo'),
  bankAppraisal: z.number().min(0).optional(),
  pendingMortgage: z.number().min(0).optional(),
  legalWindowDays: z.number().min(1).max(365).optional(),
  channelLimits: z.record(z.any()).optional(),
  ownerDeadline: z.string().optional(),
  maxDiscountPct: z.number().min(0).max(50, 'Descuento máximo: 50%').optional(),
  minNetProceeds: z.number().min(0).optional()
}).refine(data => {
  if (data.bankAppraisal && data.minOwner > data.bankAppraisal * 1.2) {
    return false;
  }
  return true;
}, {
  message: 'Precio mínimo no puede superar 120% de la tasación bancaria',
  path: ['minOwner']
});

// Recommendation schema
export const recommendationSchema = z.object({
  id: z.string(),
  listPrice: z.number().min(1000, 'Precio mínimo: €1.000'),
  anchorPrice: z.number().min(1000),
  minAcceptable: z.number().min(1000),
  confidence: confidenceSchema,
  reasons: z.array(z.string()).min(1, 'Al menos una razón requerida'),
  domP50: z.number().min(0),
  closeProb30d: z.number().min(0).max(1),
  closeProb60d: z.number().min(0).max(1),
  closeProb90d: z.number().min(0).max(1),
  expectedNetOwner: z.number().min(0),
  elasticityScore: z.number().optional(),
  competitivePosition: z.enum(['ABOVE', 'AT', 'BELOW']).optional(),
  riskFactors: z.array(z.string()).optional()
}).refine(data => {
  // anchorPrice >= listPrice >= minAcceptable
  return data.anchorPrice >= data.listPrice && data.listPrice >= data.minAcceptable;
}, {
  message: 'Precio ancla ≥ Precio lista ≥ Mínimo aceptable',
  path: ['listPrice']
}).refine(data => {
  // Probabilities should increase over time
  return data.closeProb30d <= data.closeProb60d && data.closeProb60d <= data.closeProb90d;
}, {
  message: 'Las probabilidades deben aumentar con el tiempo',
  path: ['closeProb60d']
});

// Pricing strategy validation
export const pricingPhaseSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  order: z.number().min(1),
  listPrice: z.number().min(1000),
  duration: z.number().min(1).max(365, 'Duración máxima: 365 días'),
  objective: z.string().min(5),
  triggers: z.object({
    domGt: z.number().min(0).optional(),
    visitsLt: z.number().min(0).optional(),
    leadsLt: z.number().min(0).optional(),
    offersLt: z.number().min(0).optional(),
    dateAfter: z.string().optional()
  }),
  actions: z.array(z.string()),
  active: z.boolean()
});

export const priceTriggerSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  condition: z.object({
    type: z.enum(['DOM', 'VISITS', 'LEADS', 'OFFERS', 'DATE', 'COMPETITOR']),
    operator: z.enum(['GT', 'LT', 'EQ', 'GTE', 'LTE']),
    value: z.union([z.number(), z.string()]),
    timeframe: z.number().min(1).optional()
  }),
  action: z.object({
    type: z.enum(['PRICE_CHANGE', 'ALERT', 'CHANNEL_UPDATE', 'CONTACT_OWNER']),
    parameters: z.record(z.any())
  }),
  active: z.boolean(),
  lastTriggered: z.string().optional()
});

// Scenario validation with comprehensive business rules
export const scenarioSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(3, 'Nombre debe tener al menos 3 caracteres'),
  type: scenarioTypeSchema,
  goal: goalSchema,
  constraints: constraintsSchema,
  listPrice: z.number().min(1000, 'Precio lista mínimo: €1.000'),
  anchorPrice: z.number().min(1000),
  minAcceptable: z.number().min(1000),
  strategy: z.object({
    phases: z.array(pricingPhaseSchema).min(1),
    triggers: z.array(priceTriggerSchema),
    channelMapping: z.record(z.number().min(0)),
    negotiationRules: z.object({
      maxDiscount: z.number().min(0).max(50),
      counterOfferSteps: z.array(z.number().min(1000)),
      autoAcceptThreshold: z.number().min(0).optional()
    })
  }).optional(),
  expectedOutcome: z.object({
    domP50: z.number().min(0),
    closeProb60d: z.number().min(0).max(1),
    netOwner: z.number().min(0),
    totalRevenue: z.number().min(0)
  }),
  createdBy: z.string().min(1),
  isBaseline: z.boolean().optional()
}).refine(data => {
  // Price hierarchy validation
  return data.anchorPrice >= data.listPrice && data.listPrice >= data.minAcceptable;
}, {
  message: 'Precio ancla ≥ Precio lista ≥ Mínimo aceptable',
  path: ['listPrice']
}).refine(data => {
  // Ensure list price respects owner constraints
  return data.listPrice >= data.constraints.minOwner;
}, {
  message: 'Precio lista debe ser ≥ mínimo del propietario',
  path: ['listPrice']
}).refine(data => {
  // Check bank appraisal limit if exists
  if (data.constraints.bankAppraisal) {
    return data.listPrice <= data.constraints.bankAppraisal * 1.25;
  }
  return true;
}, {
  message: 'Precio lista no puede superar 125% de tasación bancaria',
  path: ['listPrice']
});

// Channel and pricing rules
export const channelRuleSchema = z.object({
  channel: z.string().min(1),
  name: z.string().min(1),
  rounding: roundingModeSchema,
  marginPct: z.number().min(-10).max(10).optional(),
  currency: currencySchema,
  minStep: z.number().min(1).optional(),
  maxPhotos: z.number().min(1).max(50).optional(),
  requiresDescription: z.boolean().optional(),
  feeStructure: z.object({
    listingFee: z.number().min(0).optional(),
    successFee: z.number().min(0).max(20).optional(),
    monthlyFee: z.number().min(0).optional()
  }).optional(),
  restrictions: z.array(z.string()).optional(),
  active: z.boolean()
});

// Price plan validation
export const priceStepSchema = z.object({
  at: z.string().refine(date => {
    const stepDate = new Date(date);
    const now = new Date();
    return stepDate >= now;
  }, 'Fecha debe ser presente o futura'),
  listPrice: z.number().min(1000),
  reason: z.string().optional(),
  trigger: z.object({
    domGt: z.number().min(0).optional(),
    visitsLt: z.number().min(0).optional(),
    leadsLt: z.number().min(0).optional(),
    competitorAction: z.string().optional()
  }).optional(),
  executed: z.boolean().optional(),
  executedAt: z.string().optional(),
  executedBy: z.string().optional()
});

export const pricePlanSchema = z.object({
  id: z.string().optional(),
  propertyId: z.string().min(1),
  scenarioId: z.string().min(1),
  steps: z.array(priceStepSchema).min(1, 'Al menos un paso requerido'),
  currentStep: z.number().min(0),
  nextReviewDate: z.string(),
  autoExecute: z.boolean(),
  notifications: z.object({
    email: z.boolean(),
    sms: z.boolean(),
    dashboard: z.boolean()
  }),
}).refine(data => {
  // Validate price steps are in descending order (typical for price drops)
  for (let i = 1; i < data.steps.length; i++) {
    if (data.steps[i].listPrice > data.steps[i - 1].listPrice) {
      return false;
    }
  }
  return true;
}, {
  message: 'Los pasos de precio deben seguir orden descendente',
  path: ['steps']
}).refine(data => {
  // Current step should be within bounds
  return data.currentStep < data.steps.length;
}, {
  message: 'Paso actual fuera de rango',
  path: ['currentStep']
});

// Elasticity data validation
export const elasticityPointSchema = z.object({
  price: z.number().min(0),
  demand: z.number().min(0),
  demandLow: z.number().min(0).optional(),
  demandHigh: z.number().min(0).optional(),
  visits: z.number().min(0).optional(),
  leads: z.number().min(0).optional(),
  offers: z.number().min(0).optional()
}).refine(data => {
  if (data.demandLow !== undefined && data.demandHigh !== undefined) {
    return data.demandLow <= data.demand && data.demand <= data.demandHigh;
  }
  return true;
}, {
  message: 'Demanda debe estar dentro del intervalo de confianza',
  path: ['demand']
});

export const elasticityAnalysisSchema = z.object({
  points: z.array(elasticityPointSchema).min(3, 'Mínimo 3 puntos para análisis'),
  elasticityCoeff: z.number(),
  optimalPrice: z.number().min(0).optional(),
  confidenceInterval: z.object({
    low: z.number().min(0).max(1),
    high: z.number().min(0).max(1)
  }).refine(data => data.low <= data.high, {
    message: 'Intervalo de confianza inválido'
  }),
  r2Score: z.number().min(0).max(1),
  lastUpdated: z.string()
});

// Offer simulation validation
export const offerSimulationSchema = z.object({
  price: z.number().min(1000),
  probAboveMin: z.number().min(0).max(1),
  probClose30: z.number().min(0).max(1),
  probClose60: z.number().min(0).max(1),
  probClose90: z.number().min(0).max(1),
  expectedDiscountPct: z.number().min(0).max(100),
  expectedOffers: z.number().min(0),
  offerDistribution: z.array(z.object({
    range: z.string(),
    probability: z.number().min(0).max(1),
    avgAmount: z.number().min(0)
  })),
  negotiationRounds: z.number().min(0).max(10).optional(),
  timeToDecision: z.number().min(0).optional()
}).refine(data => {
  // Probabilities should be consistent over time
  return data.probClose30 <= data.probClose60 && data.probClose60 <= data.probClose90;
}, {
  message: 'Probabilidades deben ser consistentes temporalmente',
  path: ['probClose60']
}).refine(data => {
  // Offer distribution probabilities should sum to ~1
  const totalProb = data.offerDistribution.reduce((sum, dist) => sum + dist.probability, 0);
  return Math.abs(totalProb - 1.0) < 0.05; // 5% tolerance
}, {
  message: 'Probabilidades de distribución deben sumar ~100%',
  path: ['offerDistribution']
});

// Waterfall validation
export const waterfallItemSchema = z.object({
  label: z.string().min(1),
  amount: z.number(),
  percentage: z.number().min(0).max(100).optional(),
  kind: waterfallKindSchema,
  description: z.string().optional(),
  optional: z.boolean().optional()
});

export const netWaterfallSchema = z.object({
  price: z.number().min(1000),
  grossAmount: z.number().min(0),
  items: z.array(waterfallItemSchema).min(1),
  netOwner: z.number().min(0),
  effectiveYield: z.number().min(0).max(1),
  breakdownByCategory: z.record(waterfallKindSchema, z.number()),
  lastUpdated: z.string()
}).refine(data => {
  // Net owner should be gross minus all deductions
  const totalDeductions = data.items
    .filter(item => item.kind !== 'net')
    .reduce((sum, item) => sum + Math.abs(item.amount), 0);
  const expectedNet = data.grossAmount - totalDeductions;
  return Math.abs(data.netOwner - expectedNet) < 1; // €1 tolerance for rounding
}, {
  message: 'Cálculo de neto incorrecto',
  path: ['netOwner']
});

// Competitor validation
export const competitorRecordSchema = z.object({
  id: z.string(),
  title: z.string().optional(),
  address: z.string().min(5),
  distance: z.number().min(0).max(50000), // max 50km
  price: z.number().min(1000),
  ppsqm: z.number().min(100).max(50000), // €100-50k per m²
  area: z.number().min(10).max(2000),
  rooms: z.number().min(0).max(20),
  dom: z.number().min(0).max(2000), // max ~5.5 years
  lastPriceChange: z.object({
    date: z.string(),
    oldPrice: z.number().min(0),
    newPrice: z.number().min(0),
    changePercent: z.number()
  }).optional(),
  visits: z.number().min(0).optional(),
  leads: z.number().min(0).optional(),
  status: z.enum(['ACTIVE', 'UNDER_OFFER', 'SOLD', 'WITHDRAWN']),
  url: z.string().url().optional(),
  source: z.enum(['IDEALISTA', 'FOTOCASA', 'HABITACLIA', 'YAENCONTRE', 'INTERNAL']),
  similarity: z.number().min(0).max(1).optional(),
  photos: z.number().min(0).max(100).optional(),
  lastSeen: z.string()
});

// Export options validation
export const exportOptionsSchema = z.object({
  format: z.enum(['CSV', 'JSON', 'PDF', 'XLSX']),
  sections: z.object({
    subject: z.boolean(),
    recommendations: z.boolean(),
    scenarios: z.boolean(),
    competitors: z.boolean(),
    audit: z.boolean(),
    metrics: z.boolean()
  }).refine(data => {
    // At least one section must be selected
    return Object.values(data).some(selected => selected);
  }, {
    message: 'Al menos una sección debe estar seleccionada'
  }),
  timeframe: z.object({
    from: z.string(),
    to: z.string()
  }).refine(data => new Date(data.from) <= new Date(data.to), {
    message: 'Fecha desde debe ser anterior a fecha hasta'
  }).optional(),
  includeCharts: z.boolean(),
  includeRawData: z.boolean()
});

// Settings validation
export const pricingSettingsSchema = z.object({
  defaultGoal: goalSchema,
  defaultMarginPct: z.number().min(-10).max(10),
  autoPublishChannels: z.array(z.string()),
  alertThresholds: z.object({
    domExceeded: z.number().min(1).max(365),
    visitsBelow: z.number().min(0),
    leadsBelow: z.number().min(0),
    priceDeviationPct: z.number().min(5).max(50)
  }),
  roundingRules: z.object({
    default: roundingModeSchema,
    byPriceRange: z.record(z.string(), roundingModeSchema)
  }),
  negotiationDefaults: z.object({
    maxDiscountPct: z.number().min(0).max(50),
    counterOfferSteps: z.array(z.number().min(1000)),
    timeToDecision: z.number().min(1).max(168) // max 1 week
  }),
  integrations: z.object({
    channels: z.record(z.string(), z.boolean()),
    crm: z.boolean(),
    notifications: z.boolean()
  }),
  permissions: z.object({
    canModifyConstraints: z.boolean(),
    canPublishToChannels: z.boolean(),
    canApproveScenarios: z.boolean(),
    canViewAudit: z.boolean()
  })
});

// Filters validation
export const pricingFiltersSchema = z.object({
  priceRange: z.object({
    min: z.number().min(0),
    max: z.number().min(0)
  }).refine(data => data.min <= data.max, {
    message: 'Precio mínimo debe ser ≤ máximo'
  }).optional(),
  domRange: z.object({
    min: z.number().min(0),
    max: z.number().min(0).max(2000)
  }).refine(data => data.min <= data.max, {
    message: 'DOM mínimo debe ser ≤ máximo'
  }).optional(),
  distance: z.number().min(0.1).max(50).optional(),
  propertyTypes: z.array(z.string()).optional(),
  conditions: z.array(z.string()).optional(),
  sources: z.array(z.string()).optional(),
  activeOnly: z.boolean().optional(),
  dateRange: z.object({
    from: z.string(),
    to: z.string()
  }).refine(data => new Date(data.from) <= new Date(data.to), {
    message: 'Rango de fechas inválido'
  }).optional()
});

// Audit validation
export const auditEventSchema = z.object({
  id: z.string().optional(),
  at: z.string(),
  user: z.string().min(1),
  userName: z.string().optional(),
  action: z.string().min(3),
  category: z.enum(['PRICE_CHANGE', 'SCENARIO', 'CHANNEL', 'SIMULATION', 'NEGOTIATION']),
  payload: z.record(z.any()).optional(),
  oldValue: z.any().optional(),
  newValue: z.any().optional(),
  reason: z.string().optional(),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional()
});

// Alert validation
export const alertSchema = z.object({
  id: z.string().optional(),
  type: z.enum(['WARNING', 'ERROR', 'INFO', 'SUCCESS']),
  category: z.enum(['LEGAL', 'FINANCIAL', 'MARKET', 'TECHNICAL', 'RGPD']),
  title: z.string().min(1).max(100),
  message: z.string().min(1).max(500),
  details: z.string().max(2000).optional(),
  actions: z.array(z.object({
    label: z.string().min(1),
    action: z.string().min(1),
    primary: z.boolean().optional()
  })).optional(),
  dismissible: z.boolean(),
  expiresAt: z.string().optional(),
  acknowledged: z.boolean().optional(),
  acknowledgedBy: z.string().optional(),
  acknowledgedAt: z.string().optional()
});

// Form validation helpers
export const validatePriceStep = (price: number, minStep: number = 1000): boolean => {
  return price >= minStep && price % minStep === 0;
};

export const validateFilterCliffs = (price: number): { isCliff: boolean; suggestion?: number } => {
  const cliffs = [50000, 100000, 150000, 200000, 250000, 300000, 400000, 500000];
  
  for (const cliff of cliffs) {
    if (price > cliff && price < cliff + 5000) {
      return {
        isCliff: true,
        suggestion: cliff - 1000
      };
    }
  }
  
  return { isCliff: false };
};

export const validateBankAppraisalLimit = (listPrice: number, bankAppraisal?: number): boolean => {
  if (!bankAppraisal) return true;
  return listPrice <= bankAppraisal * 1.25; // 25% over appraisal max
};

export const validateOwnerConstraints = (
  listPrice: number,
  minAcceptable: number,
  constraints: { minOwner: number; minNetProceeds?: number }
): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (minAcceptable < constraints.minOwner) {
    errors.push('Precio mínimo aceptable debe ser ≥ mínimo del propietario');
  }
  
  if (constraints.minNetProceeds && minAcceptable < constraints.minNetProceeds) {
    errors.push('Precio mínimo no garantiza ingresos netos requeridos');
  }
  
  if (listPrice < constraints.minOwner) {
    errors.push('Precio de lista debe ser ≥ mínimo del propietario');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
};

// Type exports for form data
export type SubjectFormData = z.infer<typeof subjectSchema>;
export type ConstraintsFormData = z.infer<typeof constraintsSchema>;
export type RecommendationData = z.infer<typeof recommendationSchema>;
export type ScenarioFormData = z.infer<typeof scenarioSchema>;
export type PricePlanFormData = z.infer<typeof pricePlanSchema>;
export type ChannelRuleData = z.infer<typeof channelRuleSchema>;
export type ExportOptionsData = z.infer<typeof exportOptionsSchema>;
export type PricingSettingsData = z.infer<typeof pricingSettingsSchema>;
export type PricingFiltersData = z.infer<typeof pricingFiltersSchema>;
export type AuditEventData = z.infer<typeof auditEventSchema>;
export type AlertData = z.infer<typeof alertSchema>;