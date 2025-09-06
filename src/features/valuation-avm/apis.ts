import type { 
  Subject, 
  Comp, 
  ModelSpec, 
  ValuationResult, 
  MarketTrend, 
  ValuationJob, 
  AuditEntry,
  PortfolioValuation,
  GeospatialAnalysis,
  DataSource,
  ModelPerformance,
  AvmFilters
} from './types';

const API_BASE_URL = '/api/v1/avm';
const DELAY = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock data generators
const generateMockComps = (subject: Subject, count: number = 10): Comp[] => {
  return Array.from({ length: count }, (_, i) => {
    const distanceKm = Math.random() * 2 + 0.1; // 0.1-2.1 km
    const areaDiff = (Math.random() - 0.5) * 0.4; // ±20% area
    const ageDiff = Math.floor((Math.random() - 0.5) * 20); // ±10 years
    const basePrice = 2500 + Math.random() * 2000; // €2500-4500/m²
    const adjustedArea = subject.area * (1 + areaDiff);
    
    const adjustments = {
      area: areaDiff * 10,
      condition: (Math.random() - 0.5) * 8,
      floor: (Math.random() - 0.5) * 5,
      age: ageDiff * -0.5,
      features: (Math.random() - 0.5) * 6,
      location: (Math.random() - 0.5) * 12,
      total: 0
    };
    adjustments.total = Object.values(adjustments).slice(0, -1).reduce((sum, adj) => sum + adj, 0);
    
    const salePrice = Math.round(adjustedArea * basePrice * (1 + adjustments.total / 100));
    
    return {
      id: `comp-${i + 1}`,
      address: `Calle Comparable ${i + 1}, ${subject.city}`,
      coordinates: [
        subject.coordinates?.[0] + (Math.random() - 0.5) * 0.02,
        subject.coordinates?.[1] + (Math.random() - 0.5) * 0.02
      ] as [number, number],
      area: Math.round(adjustedArea),
      buildingYear: subject.buildingYear + ageDiff,
      rooms: subject.rooms + Math.floor((Math.random() - 0.5) * 2),
      bathrooms: Math.max(1, subject.bathrooms + Math.floor((Math.random() - 0.5) * 2)),
      salePrice,
      pricePerM2: Math.round(salePrice / adjustedArea),
      saleDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      daysOnMarket: Math.floor(Math.random() * 180) + 15,
      condition: subject.condition,
      propertyType: subject.propertyType,
      distanceToSubject: Math.round(distanceKm * 1000),
      similarity: Math.max(0.6, 1 - Math.abs(areaDiff) - Math.abs(ageDiff / 50)),
      adjustments,
      adjustedPrice: salePrice,
      source: ['idealista', 'fotocasa', 'habitaclia', 'yaencontre', 'manual'][Math.floor(Math.random() * 5)] as any,
      verified: Math.random() > 0.3,
      reliability: Math.random() * 0.3 + 0.7
    };
  });
};

const generateMockValuation = (subject: Subject, modelId: string, comps: Comp[]): ValuationResult => {
  const avgPricePerM2 = comps.reduce((sum, c) => sum + c.pricePerM2, 0) / comps.length;
  const baseValue = subject.area * avgPricePerM2;
  
  const locationAdj = (Math.random() - 0.5) * 0.15 * baseValue;
  const conditionAdj = subject.condition === 'excellent' ? baseValue * 0.1 : 
                      subject.condition === 'good' ? baseValue * 0.05 :
                      subject.condition === 'fair' ? 0 : -baseValue * 0.1;
  const featureAdj = subject.features.length * baseValue * 0.02;
  const marketAdj = (Math.random() - 0.5) * 0.05 * baseValue;
  
  const finalValue = Math.round(baseValue + locationAdj + conditionAdj + featureAdj + marketAdj);
  const confidence = Math.random() * 0.25 + 0.7; // 70-95%
  const confidenceRange = finalValue * 0.1; // ±10%
  
  return {
    id: `valuation-${Date.now()}`,
    subjectId: subject.id!,
    modelId,
    estimatedValue: finalValue,
    confidence,
    confidenceRange: {
      low: Math.round(finalValue - confidenceRange),
      high: Math.round(finalValue + confidenceRange),
      percentage: 95
    },
    pricePerM2: Math.round(finalValue / subject.area),
    marketPosition: avgPricePerM2 > finalValue / subject.area * 1.05 ? 'below' :
                   avgPricePerM2 < finalValue / subject.area * 0.95 ? 'above' : 'at',
    breakdown: {
      baseValue: Math.round(baseValue),
      locationAdjustment: Math.round(locationAdj),
      conditionAdjustment: Math.round(conditionAdj),
      featureAdjustments: Math.round(featureAdj),
      marketAdjustment: Math.round(marketAdj),
      final: finalValue
    },
    comparables: {
      used: comps.length,
      total: comps.length + Math.floor(Math.random() * 5),
      avgPrice: Math.round(comps.reduce((sum, c) => sum + c.salePrice, 0) / comps.length),
      avgPricePerM2: Math.round(avgPricePerM2)
    },
    marketMetrics: {
      medianPrice: Math.round(avgPricePerM2 * subject.area * 0.95),
      avgDaysOnMarket: Math.round(comps.reduce((sum, c) => sum + c.daysOnMarket, 0) / comps.length),
      priceAppreciation: (Math.random() - 0.3) * 15, // -4.5% to +10.5%
      liquidityIndex: Math.random() * 0.4 + 0.5 // 0.5-0.9
    },
    riskFactors: [
      {
        factor: 'Edad del edificio',
        impact: subject.buildingYear < 1980 ? 'negative' : 'neutral',
        severity: subject.buildingYear < 1960 ? 'high' : 'low',
        description: `Edificio construido en ${subject.buildingYear}`
      },
      {
        factor: 'Liquidez del mercado',
        impact: 'neutral',
        severity: 'medium',
        description: 'Mercado con liquidez moderada'
      }
    ],
    executionTime: Math.random() * 5 + 2, // 2-7 seconds
    createdAt: new Date().toISOString(),
    validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
  };
};

// API functions
export const getAvailableModels = async (): Promise<ModelSpec[]> => {
  await DELAY(300);
  
  return [
    {
      id: 'xgboost-v2.1',
      name: 'XGBoost Avanzado',
      type: 'xgboost',
      version: '2.1.3',
      accuracy: 91.2,
      dataPoints: 125000,
      lastTrained: '2024-01-15T10:30:00Z',
      features: ['area', 'location', 'age', 'condition', 'rooms', 'bathrooms', 'features', 'market_trends'],
      description: 'Modelo de gradient boosting con características avanzadas de localización y mercado',
      category: 'ml',
      complexity: 'high',
      executionTime: 4.2,
      confidence: 0.89
    },
    {
      id: 'random-forest-v1.8',
      name: 'Random Forest Optimizado',
      type: 'random_forest',
      version: '1.8.0',
      accuracy: 88.7,
      dataPoints: 98000,
      lastTrained: '2024-01-10T14:20:00Z',
      features: ['area', 'location', 'age', 'condition', 'rooms', 'transport', 'amenities'],
      description: 'Ensemble de árboles de decisión con optimización de hiperparámetros',
      category: 'ml',
      complexity: 'medium',
      executionTime: 2.8,
      confidence: 0.86
    },
    {
      id: 'knn-weighted-v1.2',
      name: 'K-NN Ponderado',
      type: 'knn',
      version: '1.2.1',
      accuracy: 84.3,
      dataPoints: 87000,
      lastTrained: '2024-01-08T09:15:00Z',
      features: ['location', 'area', 'comparables', 'market_position'],
      description: 'Vecinos más cercanos con ponderación por similitud y distancia',
      category: 'statistical',
      complexity: 'low',
      executionTime: 1.5,
      confidence: 0.82
    },
    {
      id: 'hedonic-madrid-v3.0',
      name: 'Hedónico Madrid',
      type: 'hedonic',
      version: '3.0.2',
      accuracy: 86.9,
      dataPoints: 156000,
      lastTrained: '2024-01-20T16:45:00Z',
      features: ['area', 'rooms', 'age', 'location', 'transport', 'schools', 'crime'],
      description: 'Modelo hedónico especializado para el mercado de Madrid',
      category: 'statistical',
      complexity: 'medium',
      executionTime: 3.1,
      confidence: 0.84
    },
    {
      id: 'ensemble-premium-v1.0',
      name: 'Ensemble Premium',
      type: 'ensemble',
      version: '1.0.0',
      accuracy: 93.5,
      dataPoints: 200000,
      lastTrained: '2024-01-25T12:00:00Z',
      features: ['all_features', 'meta_learning', 'cross_validation'],
      description: 'Combinación optimizada de múltiples modelos con meta-aprendizaje',
      category: 'hybrid',
      complexity: 'high',
      executionTime: 8.7,
      confidence: 0.92
    }
  ];
};

export const searchComparables = async (subject: Subject, filters?: AvmFilters): Promise<Comp[]> => {
  await DELAY(800);
  
  const comps = generateMockComps(subject, 15);
  
  if (!filters) return comps;
  
  return comps.filter(comp => {
    if (filters.minPrice && comp.salePrice < filters.minPrice) return false;
    if (filters.maxPrice && comp.salePrice > filters.maxPrice) return false;
    if (filters.minArea && comp.area < filters.minArea) return false;
    if (filters.maxArea && comp.area > filters.maxArea) return false;
    if (filters.minRooms && comp.rooms < filters.minRooms) return false;
    if (filters.maxRooms && comp.rooms > filters.maxRooms) return false;
    if (filters.minYear && comp.buildingYear < filters.minYear) return false;
    if (filters.maxYear && comp.buildingYear > filters.maxYear) return false;
    if (filters.condition && comp.condition !== filters.condition) return false;
    if (filters.propertyType && comp.propertyType !== filters.propertyType) return false;
    if (filters.maxDistance && comp.distanceToSubject > filters.maxDistance * 1000) return false;
    if (filters.verified === true && !comp.verified) return false;
    if (filters.source && !filters.source.includes(comp.source)) return false;
    
    return true;
  });
};

export const runValuation = async (subject: Subject, modelIds: string[]): Promise<ValuationJob> => {
  const jobId = `job-${Date.now()}`;
  
  // Initial job creation
  await DELAY(200);
  
  const job: ValuationJob = {
    id: jobId,
    status: 'pending',
    subjectId: subject.id!,
    modelIds,
    priority: 'normal',
    progress: 0,
    createdAt: new Date().toISOString(),
    estimatedDuration: modelIds.length * 5
  };
  
  return job;
};

export const getValuationJob = async (jobId: string): Promise<ValuationJob> => {
  await DELAY(300);
  
  // Simulate job progression
  const progress = Math.min(100, Math.floor(Math.random() * 30) + 70);
  const isCompleted = progress >= 100;
  
  const job: ValuationJob = {
    id: jobId,
    status: isCompleted ? 'completed' : 'running',
    subjectId: 'mock-subject',
    modelIds: ['xgboost-v2.1', 'random-forest-v1.8'],
    priority: 'normal',
    progress,
    createdAt: new Date(Date.now() - 60000).toISOString(),
    startedAt: new Date(Date.now() - 45000).toISOString(),
    completedAt: isCompleted ? new Date().toISOString() : undefined,
    estimatedDuration: 10,
    results: isCompleted ? [] : undefined // Would contain actual results
  };
  
  return job;
};

export const getValuationResults = async (subjectId: string): Promise<ValuationResult[]> => {
  await DELAY(500);
  
  // Mock results for multiple models
  return []; // Would return actual ValuationResult objects
};

export const getMarketTrends = async (area: string, period: string = '2024-01'): Promise<MarketTrend[]> => {
  await DELAY(600);
  
  const months = 12;
  const trends: MarketTrend[] = [];
  
  for (let i = 0; i < months; i++) {
    const date = new Date(2024, 0 + i, 1);
    const periodStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    const basePrice = 3200 + Math.sin(i / 12 * Math.PI * 2) * 200; // Seasonal variation
    const trend = (i / months) * 0.15 - 0.075; // -7.5% to +7.5% over year
    
    trends.push({
      id: `trend-${periodStr}`,
      area,
      period: periodStr,
      avgPrice: Math.round((basePrice + basePrice * trend) * (80 + Math.random() * 40)), // Random property size
      avgPricePerM2: Math.round(basePrice + basePrice * trend),
      medianPrice: Math.round((basePrice + basePrice * trend) * 85),
      transactions: Math.floor(150 + Math.random() * 100),
      inventory: Math.floor(800 + Math.random() * 400),
      avgDaysOnMarket: Math.floor(45 + Math.random() * 30),
      priceChange: trend * 100,
      volumeChange: (Math.random() - 0.5) * 40,
      priceAppreciation: {
        monthly: trend * 100 / 12,
        quarterly: trend * 100 / 4,
        yearly: trend * 100
      },
      demandSupplyRatio: 0.8 + Math.random() * 0.4,
      liquidityIndex: 0.6 + Math.random() * 0.3,
      propertyTypes: {
        apartment: {
          avgPrice: Math.round(basePrice * 0.95),
          transactions: Math.floor(80 + Math.random() * 40),
          priceChange: trend * 100 * 0.9
        },
        house: {
          avgPrice: Math.round(basePrice * 1.15),
          transactions: Math.floor(40 + Math.random() * 30),
          priceChange: trend * 100 * 1.1
        },
        penthouse: {
          avgPrice: Math.round(basePrice * 1.35),
          transactions: Math.floor(15 + Math.random() * 10),
          priceChange: trend * 100 * 1.2
        }
      }
    });
  }
  
  return trends.reverse(); // Most recent first
};

export const getGeospatialAnalysis = async (subjectId: string): Promise<GeospatialAnalysis> => {
  await DELAY(700);
  
  return {
    subjectId,
    walkScore: Math.floor(Math.random() * 40) + 60,
    transitScore: Math.floor(Math.random() * 30) + 50,
    bikeScore: Math.floor(Math.random() * 35) + 45,
    crimeIndex: Math.random() * 3 + 2, // 2-5 scale
    schoolRating: Math.random() * 3 + 7, // 7-10 scale
    hospitalDistance: Math.random() * 2000 + 500, // 500-2500m
    shoppingDistance: Math.random() * 1000 + 200, // 200-1200m
    parkDistance: Math.random() * 800 + 100, // 100-900m
    beachDistance: Math.random() > 0.7 ? Math.random() * 5000 + 1000 : undefined,
    noiseLevel: Math.random() * 4 + 3, // 3-7 scale
    airQuality: Math.random() * 2 + 7, // 7-9 scale
    futureProjects: [
      {
        type: 'Metro Line Extension',
        distance: Math.random() * 1000 + 200,
        impact: 'positive',
        completion: '2025-12-01'
      },
      {
        type: 'New Shopping Center',
        distance: Math.random() * 800 + 300,
        impact: 'positive',
        completion: '2024-06-01'
      }
    ],
    demographics: {
      avgAge: Math.random() * 20 + 35, // 35-55
      avgIncome: Math.random() * 30000 + 35000, // 35k-65k
      education: ['High School', 'University', 'Graduate'][Math.floor(Math.random() * 3)],
      familySize: Math.random() * 2 + 2 // 2-4
    }
  };
};

export const getAuditLog = async (filters?: { type?: string; dateFrom?: string; dateTo?: string }): Promise<AuditEntry[]> => {
  await DELAY(400);
  
  const entries: AuditEntry[] = [];
  const types = ['valuation', 'model_update', 'data_import', 'calibration'] as const;
  const actions = [
    'Valoración realizada',
    'Modelo reentrenado',
    'Datos importados desde Idealista',
    'Calibración de modelo actualizada',
    'Configuración modificada'
  ];
  
  for (let i = 0; i < 50; i++) {
    const date = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000);
    entries.push({
      id: `audit-${i + 1}`,
      type: types[Math.floor(Math.random() * types.length)],
      userId: `user-${Math.floor(Math.random() * 10) + 1}`,
      userName: ['Ana García', 'Carlos López', 'María Rodríguez', 'Juan Pérez'][Math.floor(Math.random() * 4)],
      action: actions[Math.floor(Math.random() * actions.length)],
      details: {
        model: 'XGBoost v2.1',
        duration: Math.random() * 10 + 2,
        accuracy: Math.random() * 10 + 85
      },
      timestamp: date.toISOString(),
      ipAddress: `192.168.1.${Math.floor(Math.random() * 254) + 1}`,
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    });
  }
  
  return entries.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

export const getDataSources = async (): Promise<DataSource[]> => {
  await DELAY(350);
  
  return [
    {
      id: 'idealista-api',
      name: 'Idealista API',
      type: 'api',
      url: 'https://api.idealista.com/3.5',
      status: 'active',
      lastSync: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      nextSync: new Date(Date.now() + 22 * 60 * 60 * 1000).toISOString(),
      syncFrequency: 24,
      recordsImported: 2845,
      recordsProcessed: 2831,
      errorRate: 0.5,
      reliability: 0.94,
      coverage: {
        areas: ['Madrid', 'Barcelona', 'Valencia', 'Sevilla'],
        propertyTypes: ['apartment', 'house', 'penthouse', 'studio']
      },
      config: {
        apiKey: '***key***',
        rateLimit: 1000,
        timeout: 30
      }
    },
    {
      id: 'fotocasa-scraper',
      name: 'Fotocasa Scraper',
      type: 'portal',
      url: 'https://www.fotocasa.es',
      status: 'active',
      lastSync: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      nextSync: new Date(Date.now() + 20 * 60 * 60 * 1000).toISOString(),
      syncFrequency: 24,
      recordsImported: 1923,
      recordsProcessed: 1891,
      errorRate: 1.7,
      reliability: 0.89,
      coverage: {
        areas: ['Madrid', 'Barcelona', 'Valencia'],
        propertyTypes: ['apartment', 'house', 'duplex']
      },
      config: {
        userAgent: 'AVM-Bot/1.0',
        delay: 2000,
        maxPages: 100
      }
    },
    {
      id: 'registro-propiedad',
      name: 'Registro de la Propiedad',
      type: 'registry',
      status: 'active',
      lastSync: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      nextSync: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(),
      syncFrequency: 168, // Weekly
      recordsImported: 456,
      recordsProcessed: 456,
      errorRate: 0,
      reliability: 1.0,
      coverage: {
        areas: ['Madrid', 'Barcelona'],
        propertyTypes: ['apartment', 'house', 'penthouse', 'studio', 'duplex']
      },
      config: {
        ftpServer: 'ftp.registropropiedad.es',
        credentials: '***encrypted***'
      }
    }
  ];
};

export const getModelPerformance = async (modelId: string, period: string): Promise<ModelPerformance> => {
  await DELAY(450);
  
  return {
    modelId,
    period,
    valuations: Math.floor(Math.random() * 500) + 200,
    accuracy: Math.random() * 10 + 85,
    meanAbsoluteError: Math.random() * 50000 + 10000,
    rmse: Math.random() * 75000 + 15000,
    r2Score: Math.random() * 0.2 + 0.8,
    confidenceCalibration: Math.random() * 0.1 + 0.85,
    avgExecutionTime: Math.random() * 3 + 2,
    errorDistribution: {
      under5: Math.random() * 30 + 40,
      under10: Math.random() * 25 + 25,
      under15: Math.random() * 15 + 10,
      over15: Math.random() * 10 + 5
    },
    byPropertyType: {
      apartment: {
        valuations: Math.floor(Math.random() * 200) + 100,
        accuracy: Math.random() * 8 + 87,
        mae: Math.random() * 45000 + 8000
      },
      house: {
        valuations: Math.floor(Math.random() * 150) + 75,
        accuracy: Math.random() * 12 + 82,
        mae: Math.random() * 65000 + 12000
      },
      penthouse: {
        valuations: Math.floor(Math.random() * 50) + 20,
        accuracy: Math.random() * 15 + 80,
        mae: Math.random() * 85000 + 15000
      }
    },
    byPriceRange: {
      'under-300k': {
        valuations: Math.floor(Math.random() * 150) + 80,
        accuracy: Math.random() * 8 + 88,
        mae: Math.random() * 35000 + 5000
      },
      '300k-600k': {
        valuations: Math.floor(Math.random() * 180) + 100,
        accuracy: Math.random() * 10 + 85,
        mae: Math.random() * 55000 + 10000
      },
      'over-600k': {
        valuations: Math.floor(Math.random() * 120) + 60,
        accuracy: Math.random() * 15 + 80,
        mae: Math.random() * 95000 + 20000
      }
    }
  };
};

export const createPortfolioValuation = async (portfolio: Partial<PortfolioValuation>): Promise<PortfolioValuation> => {
  await DELAY(1200);
  
  return {
    id: `portfolio-${Date.now()}`,
    name: portfolio.name!,
    description: portfolio.description!,
    properties: portfolio.properties!,
    totalValue: Math.floor(Math.random() * 5000000) + 1000000,
    avgPricePerM2: Math.floor(Math.random() * 2000) + 2500,
    totalArea: Math.floor(Math.random() * 500) + 200,
    riskScore: Math.random() * 4 + 3, // 3-7 scale
    diversificationIndex: Math.random() * 0.4 + 0.6, // 0.6-1.0
    marketExposure: {
      'Centro': 35,
      'Chamberí': 25,
      'Salamanca': 20,
      'Retiro': 15,
      'Otros': 5
    },
    createdAt: new Date().toISOString(),
    lastUpdated: new Date().toISOString(),
    valuationHistory: Array.from({ length: 12 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - (11 - i));
      const baseValue = 2500000;
      const variation = (Math.random() - 0.5) * 0.1;
      const value = Math.round(baseValue * (1 + variation));
      
      return {
        date: date.toISOString().split('T')[0],
        totalValue: value,
        changePercent: i === 0 ? 0 : variation * 100
      };
    })
  };
};

export const batchValuation = async (subjects: Subject[], modelIds: string[]): Promise<ValuationJob> => {
  await DELAY(500);
  
  return {
    id: `batch-${Date.now()}`,
    status: 'pending',
    subjectId: 'batch',
    modelIds,
    priority: 'normal',
    progress: 0,
    createdAt: new Date().toISOString(),
    estimatedDuration: subjects.length * modelIds.length * 3
  };
};