import { z } from 'zod';

export const coordinatesSchema = z.tuple([z.number(), z.number()]);

export const subjectSchema = z.object({
  id: z.string().optional(),
  address: z.string().min(10, 'Dirección debe tener al menos 10 caracteres'),
  coordinates: coordinatesSchema.optional(),
  area: z.number().min(20, 'Área mínima: 20 m²').max(2000, 'Área máxima: 2000 m²'),
  buildingYear: z.number()
    .min(1800, 'Año mínimo: 1800')
    .max(new Date().getFullYear() + 2, 'Año no puede ser futuro'),
  rooms: z.number().min(0).max(20),
  bathrooms: z.number().min(1).max(10),
  parkingSpaces: z.number().min(0).max(5).default(0),
  condition: z.enum(['excellent', 'good', 'fair', 'poor']),
  floor: z.number().min(-2).max(50).optional(),
  elevator: z.boolean().optional(),
  terraceArea: z.number().min(0).max(500).optional(),
  energyRating: z.enum(['A', 'B', 'C', 'D', 'E', 'F', 'G']).optional(),
  propertyType: z.enum(['apartment', 'house', 'penthouse', 'studio', 'duplex']),
  neighborhood: z.string().min(2, 'Barrio requerido'),
  postalCode: z.string().regex(/^\d{5}$/, 'Código postal debe tener 5 dígitos'),
  city: z.string().min(2, 'Ciudad requerida'),
  province: z.string().min(2, 'Provincia requerida'),
  features: z.array(z.string()).default([]),
});

export const compSchema = z.object({
  id: z.string(),
  address: z.string().min(5),
  coordinates: coordinatesSchema,
  area: z.number().min(10).max(2000),
  buildingYear: z.number().min(1800).max(new Date().getFullYear() + 2),
  rooms: z.number().min(0).max(20),
  bathrooms: z.number().min(0).max(10),
  salePrice: z.number().min(10000, 'Precio mínimo: €10.000').max(50000000, 'Precio máximo: €50M'),
  pricePerM2: z.number().min(100).max(50000),
  saleDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha: YYYY-MM-DD'),
  daysOnMarket: z.number().min(0).max(2000),
  condition: z.enum(['excellent', 'good', 'fair', 'poor']),
  propertyType: z.enum(['apartment', 'house', 'penthouse', 'studio', 'duplex']),
  distanceToSubject: z.number().min(0),
  similarity: z.number().min(0).max(1),
  adjustments: z.object({
    area: z.number(),
    condition: z.number(),
    floor: z.number(),
    age: z.number(),
    features: z.number(),
    location: z.number(),
    total: z.number(),
  }),
  adjustedPrice: z.number().min(0),
  source: z.enum(['idealista', 'fotocasa', 'habitaclia', 'yaencontre', 'manual']),
  verified: z.boolean().default(false),
  reliability: z.number().min(0).max(1),
});

export const modelSpecSchema = z.object({
  id: z.string(),
  name: z.string().min(3, 'Nombre del modelo requerido'),
  type: z.enum(['xgboost', 'random_forest', 'knn', 'hedonic', 'dcf', 'ensemble']),
  version: z.string().min(1),
  accuracy: z.number().min(0).max(100),
  dataPoints: z.number().min(100),
  lastTrained: z.string(),
  features: z.array(z.string()).min(1, 'Al menos una característica requerida'),
  hyperparameters: z.record(z.any()).optional(),
  description: z.string().min(10),
  category: z.enum(['ml', 'statistical', 'hybrid']),
  complexity: z.enum(['low', 'medium', 'high']),
  executionTime: z.number().min(0),
  confidence: z.number().min(0).max(1),
});

export const valuationResultSchema = z.object({
  id: z.string(),
  subjectId: z.string(),
  modelId: z.string(),
  estimatedValue: z.number().min(0),
  confidence: z.number().min(0).max(1),
  confidenceRange: z.object({
    low: z.number().min(0),
    high: z.number().min(0),
    percentage: z.number().min(80).max(99),
  }),
  pricePerM2: z.number().min(0),
  marketPosition: z.enum(['below', 'at', 'above']),
  breakdown: z.object({
    baseValue: z.number(),
    locationAdjustment: z.number(),
    conditionAdjustment: z.number(),
    featureAdjustments: z.number(),
    marketAdjustment: z.number(),
    final: z.number(),
  }),
  comparables: z.object({
    used: z.number().min(0),
    total: z.number().min(0),
    avgPrice: z.number().min(0),
    avgPricePerM2: z.number().min(0),
  }),
  marketMetrics: z.object({
    medianPrice: z.number().min(0),
    avgDaysOnMarket: z.number().min(0),
    priceAppreciation: z.number(),
    liquidityIndex: z.number().min(0).max(1),
  }),
  riskFactors: z.array(z.object({
    factor: z.string(),
    impact: z.enum(['positive', 'negative', 'neutral']),
    severity: z.enum(['low', 'medium', 'high']),
    description: z.string(),
  })),
  executionTime: z.number().min(0),
  createdAt: z.string(),
  validUntil: z.string(),
});

export const marketTrendSchema = z.object({
  id: z.string(),
  area: z.string().min(2),
  period: z.string().regex(/^\d{4}-\d{2}$/, 'Formato período: YYYY-MM'),
  avgPrice: z.number().min(0),
  avgPricePerM2: z.number().min(0),
  medianPrice: z.number().min(0),
  transactions: z.number().min(0),
  inventory: z.number().min(0),
  avgDaysOnMarket: z.number().min(0),
  priceChange: z.number(),
  volumeChange: z.number(),
  priceAppreciation: z.object({
    monthly: z.number(),
    quarterly: z.number(),
    yearly: z.number(),
  }),
  demandSupplyRatio: z.number().min(0),
  liquidityIndex: z.number().min(0).max(1),
  propertyTypes: z.record(z.object({
    avgPrice: z.number().min(0),
    transactions: z.number().min(0),
    priceChange: z.number(),
  })),
});

export const valuationJobSchema = z.object({
  id: z.string().optional(),
  status: z.enum(['pending', 'running', 'completed', 'failed']).default('pending'),
  subjectId: z.string().min(1, 'ID del inmueble requerido'),
  modelIds: z.array(z.string()).min(1, 'Al menos un modelo requerido'),
  priority: z.enum(['low', 'normal', 'high']).default('normal'),
  progress: z.number().min(0).max(100).default(0),
  results: z.array(valuationResultSchema).optional(),
  error: z.string().optional(),
  estimatedDuration: z.number().min(1),
});

export const portfolioValuationSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(3, 'Nombre de portfolio requerido'),
  description: z.string().min(10, 'Descripción mínima: 10 caracteres'),
  properties: z.array(z.string()).min(1, 'Al menos una propiedad requerida'),
});

export const avmFiltersSchema = z.object({
  propertyType: z.string().optional(),
  minPrice: z.number().min(0).optional(),
  maxPrice: z.number().min(0).optional(),
  minArea: z.number().min(0).optional(),
  maxArea: z.number().min(0).optional(),
  minRooms: z.number().min(0).optional(),
  maxRooms: z.number().min(0).optional(),
  minYear: z.number().min(1800).optional(),
  maxYear: z.number().max(new Date().getFullYear() + 2).optional(),
  condition: z.string().optional(),
  neighborhood: z.string().optional(),
  features: z.array(z.string()).optional(),
  maxDistance: z.number().min(0.1).max(50).optional(),
  maxAge: z.number().min(1).max(120).optional(),
  verified: z.boolean().optional(),
  source: z.array(z.string()).optional(),
}).refine(
  (data) => !data.minPrice || !data.maxPrice || data.minPrice <= data.maxPrice,
  { message: 'Precio mínimo debe ser menor que precio máximo', path: ['maxPrice'] }
).refine(
  (data) => !data.minArea || !data.maxArea || data.minArea <= data.maxArea,
  { message: 'Área mínima debe ser menor que área máxima', path: ['maxArea'] }
).refine(
  (data) => !data.minRooms || !data.maxRooms || data.minRooms <= data.maxRooms,
  { message: 'Habitaciones mínimas deben ser menores que máximas', path: ['maxRooms'] }
).refine(
  (data) => !data.minYear || !data.maxYear || data.minYear <= data.maxYear,
  { message: 'Año mínimo debe ser menor que año máximo', path: ['maxYear'] }
);

export const avmSettingsSchema = z.object({
  defaultRadius: z.number().min(0.5).max(20).default(2),
  minComparables: z.number().min(3).max(50).default(5),
  maxComparables: z.number().min(5).max(100).default(25),
  maxAge: z.number().min(1).max(60).default(12),
  confidenceLevel: z.number().min(80).max(99).default(95),
  adjustmentCaps: z.object({
    area: z.number().min(5).max(50).default(20),
    condition: z.number().min(5).max(30).default(15),
    location: z.number().min(5).max(40).default(25),
    features: z.number().min(2).max(20).default(10),
  }),
  modelWeights: z.record(z.number().min(0).max(1)),
  autoRefresh: z.boolean().default(false),
  refreshInterval: z.number().min(5).max(1440).default(60),
}).refine(
  (data) => data.minComparables <= data.maxComparables,
  { message: 'Mínimo comparables debe ser ≤ máximo comparables', path: ['maxComparables'] }
);

export const batchValuationSchema = z.object({
  name: z.string().min(3, 'Nombre del lote requerido'),
  subjects: z.array(subjectSchema).min(1, 'Al menos un inmueble requerido').max(100, 'Máximo 100 inmuebles por lote'),
  modelIds: z.array(z.string()).min(1, 'Al menos un modelo requerido'),
  priority: z.enum(['low', 'normal', 'high']).default('normal'),
  notifyOnCompletion: z.boolean().default(true),
  emailNotification: z.string().email().optional(),
});

export const geospatialAnalysisSchema = z.object({
  subjectId: z.string(),
  walkScore: z.number().min(0).max(100),
  transitScore: z.number().min(0).max(100),
  bikeScore: z.number().min(0).max(100),
  crimeIndex: z.number().min(0).max(10),
  schoolRating: z.number().min(0).max(10),
  hospitalDistance: z.number().min(0),
  shoppingDistance: z.number().min(0),
  parkDistance: z.number().min(0),
  beachDistance: z.number().min(0).optional(),
  noiseLevel: z.number().min(0).max(10),
  airQuality: z.number().min(0).max(10),
  futureProjects: z.array(z.object({
    type: z.string(),
    distance: z.number().min(0),
    impact: z.enum(['positive', 'negative', 'neutral']),
    completion: z.string(),
  })),
  demographics: z.object({
    avgAge: z.number().min(18).max(80),
    avgIncome: z.number().min(0),
    education: z.string(),
    familySize: z.number().min(1).max(10),
  }),
});

export const auditEntrySchema = z.object({
  type: z.enum(['valuation', 'model_update', 'data_import', 'calibration']),
  userId: z.string().min(1),
  userName: z.string().min(1),
  action: z.string().min(5),
  details: z.record(z.any()),
  timestamp: z.string(),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
});

export const dataSourceSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(3, 'Nombre de fuente requerido'),
  type: z.enum(['portal', 'mls', 'registry', 'api', 'manual']),
  url: z.string().url().optional(),
  status: z.enum(['active', 'inactive', 'error']).default('active'),
  syncFrequency: z.number().min(1).max(168).default(24),
  coverage: z.object({
    areas: z.array(z.string()).min(1, 'Al menos un área de cobertura'),
    propertyTypes: z.array(z.string()).min(1, 'Al menos un tipo de propiedad'),
  }),
  config: z.record(z.any()),
});

export const modelPerformanceSchema = z.object({
  modelId: z.string(),
  period: z.string().regex(/^\d{4}-\d{2}$/),
  valuations: z.number().min(0),
  accuracy: z.number().min(0).max(100),
  meanAbsoluteError: z.number().min(0),
  rmse: z.number().min(0),
  r2Score: z.number().min(0).max(1),
  confidenceCalibration: z.number().min(0).max(1),
  avgExecutionTime: z.number().min(0),
  errorDistribution: z.object({
    under5: z.number().min(0).max(100),
    under10: z.number().min(0).max(100),
    under15: z.number().min(0).max(100),
    over15: z.number().min(0).max(100),
  }),
  byPropertyType: z.record(z.object({
    valuations: z.number().min(0),
    accuracy: z.number().min(0).max(100),
    mae: z.number().min(0),
  })),
  byPriceRange: z.record(z.object({
    valuations: z.number().min(0),
    accuracy: z.number().min(0).max(100),
    mae: z.number().min(0),
  })),
});

export type SubjectFormData = z.infer<typeof subjectSchema>;
export type CompData = z.infer<typeof compSchema>;
export type ModelSpecData = z.infer<typeof modelSpecSchema>;
export type ValuationResultData = z.infer<typeof valuationResultSchema>;
export type MarketTrendData = z.infer<typeof marketTrendSchema>;
export type ValuationJobData = z.infer<typeof valuationJobSchema>;
export type PortfolioValuationData = z.infer<typeof portfolioValuationSchema>;
export type AvmFiltersData = z.infer<typeof avmFiltersSchema>;
export type AvmSettingsData = z.infer<typeof avmSettingsSchema>;
export type BatchValuationData = z.infer<typeof batchValuationSchema>;
export type GeospatialAnalysisData = z.infer<typeof geospatialAnalysisSchema>;
export type AuditEntryData = z.infer<typeof auditEntrySchema>;
export type DataSourceData = z.infer<typeof dataSourceSchema>;
export type ModelPerformanceData = z.infer<typeof modelPerformanceSchema>;