export interface Subject {
  id: string;
  address: string;
  coordinates: [number, number]; // [lat, lng]
  area: number;
  buildingYear: number;
  rooms: number;
  bathrooms: number;
  parkingSpaces: number;
  condition: 'excellent' | 'good' | 'fair' | 'poor';
  floor?: number;
  elevator?: boolean;
  terraceArea?: number;
  energyRating?: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G';
  propertyType: 'apartment' | 'house' | 'penthouse' | 'studio' | 'duplex';
  neighborhood: string;
  postalCode: string;
  city: string;
  province: string;
  features: string[]; // Pool, gym, security, etc.
  createdAt: string;
  updatedAt: string;
}

export interface Comp {
  id: string;
  address: string;
  coordinates: [number, number];
  area: number;
  buildingYear: number;
  rooms: number;
  bathrooms: number;
  salePrice: number;
  pricePerM2: number;
  saleDate: string;
  daysOnMarket: number;
  condition: 'excellent' | 'good' | 'fair' | 'poor';
  propertyType: 'apartment' | 'house' | 'penthouse' | 'studio' | 'duplex';
  distanceToSubject: number; // meters
  similarity: number; // 0-1 score
  adjustments: {
    area: number;
    condition: number;
    floor: number;
    age: number;
    features: number;
    location: number;
    total: number;
  };
  adjustedPrice: number;
  source: 'idealista' | 'fotocasa' | 'habitaclia' | 'yaencontre' | 'manual';
  verified: boolean;
  reliability: number; // 0-1 score
}

export interface ModelSpec {
  id: string;
  name: string;
  type: 'xgboost' | 'random_forest' | 'knn' | 'hedonic' | 'dcf' | 'ensemble';
  version: string;
  accuracy: number; // Historical accuracy %
  dataPoints: number; // Training data size
  lastTrained: string;
  features: string[];
  hyperparameters?: Record<string, any>;
  description: string;
  category: 'ml' | 'statistical' | 'hybrid';
  complexity: 'low' | 'medium' | 'high';
  executionTime: number; // seconds
  confidence: number; // 0-1
}

export interface ValuationResult {
  id: string;
  subjectId: string;
  modelId: string;
  estimatedValue: number;
  confidence: number; // 0-1
  confidenceRange: {
    low: number;
    high: number;
    percentage: number; // 90%, 95%, etc.
  };
  pricePerM2: number;
  marketPosition: 'below' | 'at' | 'above'; // market average
  breakdown: {
    baseValue: number;
    locationAdjustment: number;
    conditionAdjustment: number;
    featureAdjustments: number;
    marketAdjustment: number;
    final: number;
  };
  comparables: {
    used: number;
    total: number;
    avgPrice: number;
    avgPricePerM2: number;
  };
  marketMetrics: {
    medianPrice: number;
    avgDaysOnMarket: number;
    priceAppreciation: number; // % last 12 months
    liquidityIndex: number; // 0-1
  };
  riskFactors: Array<{
    factor: string;
    impact: 'positive' | 'negative' | 'neutral';
    severity: 'low' | 'medium' | 'high';
    description: string;
  }>;
  executionTime: number;
  createdAt: string;
  validUntil: string;
}

export interface MarketTrend {
  id: string;
  area: string; // neighborhood, city, or postal code
  period: string; // YYYY-MM
  avgPrice: number;
  avgPricePerM2: number;
  medianPrice: number;
  transactions: number;
  inventory: number;
  avgDaysOnMarket: number;
  priceChange: number; // % vs previous period
  volumeChange: number; // % vs previous period
  priceAppreciation: {
    monthly: number;
    quarterly: number;
    yearly: number;
  };
  demandSupplyRatio: number;
  liquidityIndex: number;
  propertyTypes: Record<string, {
    avgPrice: number;
    transactions: number;
    priceChange: number;
  }>;
}

export interface ValuationJob {
  id: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  subjectId: string;
  modelIds: string[];
  priority: 'low' | 'normal' | 'high';
  progress: number; // 0-100
  results?: ValuationResult[];
  error?: string;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  estimatedDuration: number; // seconds
}

export interface AuditEntry {
  id: string;
  type: 'valuation' | 'model_update' | 'data_import' | 'calibration';
  userId: string;
  userName: string;
  action: string;
  details: Record<string, any>;
  timestamp: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface ModelPerformance {
  modelId: string;
  period: string; // YYYY-MM
  valuations: number;
  accuracy: number;
  meanAbsoluteError: number;
  rmse: number;
  r2Score: number;
  confidenceCalibration: number;
  avgExecutionTime: number;
  errorDistribution: {
    under5: number;
    under10: number;
    under15: number;
    over15: number;
  };
  byPropertyType: Record<string, {
    valuations: number;
    accuracy: number;
    mae: number;
  }>;
  byPriceRange: Record<string, {
    valuations: number;
    accuracy: number;
    mae: number;
  }>;
}

export interface DataSource {
  id: string;
  name: string;
  type: 'portal' | 'mls' | 'registry' | 'api' | 'manual';
  url?: string;
  status: 'active' | 'inactive' | 'error';
  lastSync: string;
  nextSync: string;
  syncFrequency: number; // hours
  recordsImported: number;
  recordsProcessed: number;
  errorRate: number;
  reliability: number; // 0-1
  coverage: {
    areas: string[];
    propertyTypes: string[];
  };
  config: Record<string, any>;
}

export interface PortfolioValuation {
  id: string;
  name: string;
  description: string;
  properties: string[]; // subject IDs
  totalValue: number;
  avgPricePerM2: number;
  totalArea: number;
  riskScore: number;
  diversificationIndex: number;
  marketExposure: Record<string, number>; // area -> percentage
  createdAt: string;
  lastUpdated: string;
  valuationHistory: Array<{
    date: string;
    totalValue: number;
    changePercent: number;
  }>;
}

export interface GeospatialAnalysis {
  subjectId: string;
  walkScore: number;
  transitScore: number;
  bikeScore: number;
  crimeIndex: number;
  schoolRating: number;
  hospitalDistance: number;
  shoppingDistance: number;
  parkDistance: number;
  beachDistance?: number;
  noiseLevel: number;
  airQuality: number;
  futureProjects: Array<{
    type: string;
    distance: number;
    impact: 'positive' | 'negative' | 'neutral';
    completion: string;
  }>;
  demographics: {
    avgAge: number;
    avgIncome: number;
    education: string;
    familySize: number;
  };
}

export type AvmStatus = 'idle' | 'loading' | 'running' | 'completed' | 'error';
export type ViewMode = 'form' | 'results' | 'batch' | 'portfolio';
export type SortField = 'price' | 'pricePerM2' | 'similarity' | 'distance' | 'saleDate';
export type SortDirection = 'asc' | 'desc';

export interface AvmFilters {
  propertyType?: string;
  minPrice?: number;
  maxPrice?: number;
  minArea?: number;
  maxArea?: number;
  minRooms?: number;
  maxRooms?: number;
  minYear?: number;
  maxYear?: number;
  condition?: string;
  neighborhood?: string;
  features?: string[];
  maxDistance?: number; // km
  maxAge?: number; // months
  verified?: boolean;
  source?: string[];
}

export interface AvmSettings {
  defaultRadius: number; // km for comparable search
  minComparables: number;
  maxComparables: number;
  maxAge: number; // months
  confidenceLevel: number; // 90, 95, 99
  adjustmentCaps: {
    area: number; // max %
    condition: number;
    location: number;
    features: number;
  };
  modelWeights: Record<string, number>;
  autoRefresh: boolean;
  refreshInterval: number; // minutes
}