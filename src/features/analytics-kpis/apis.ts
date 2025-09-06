import type {
  KPIMetric,
  KPICategory,
  KPIGoal,
  KPIDashboard,
  KPISummary,
  KPIFilter,
  KPITimeRange,
  KPINotification,
  KPIBenchmark,
  KPIAnalysis,
  KPITimeSeries
} from './types';

// Mock data
const mockCategories: KPICategory[] = [
  {
    id: '1',
    name: 'Financiero',
    description: 'Indicadores financieros y económicos',
    color: '#10B981',
    icon: '💰',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    name: 'Operacional',
    description: 'Métricas de operaciones y procesos',
    color: '#3B82F6',
    icon: '⚙️',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '3',
    name: 'Cliente',
    description: 'Indicadores de satisfacción y retención',
    color: '#F59E0B',
    icon: '👥',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '4',
    name: 'Marketing',
    description: 'Métricas de campañas y conversión',
    color: '#8B5CF6',
    icon: '📈',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  }
];

const mockMetrics: KPIMetric[] = [
  {
    id: '1',
    categoryId: '1',
    name: 'ROI Marketing',
    description: 'Retorno de inversión en marketing',
    formula: '((Ingresos - Costos) / Costos) * 100',
    unit: '%',
    target: 150,
    currentValue: 175,
    previousValue: 160,
    changePercentage: 9.4,
    trend: 'up',
    status: 'excellent',
    frequency: 'monthly',
    lastUpdated: '2024-01-15T10:00:00Z',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z'
  },
  {
    id: '2',
    categoryId: '1',
    name: 'Margen Bruto',
    description: 'Margen bruto de beneficio',
    formula: '((Ingresos - Costos) / Ingresos) * 100',
    unit: '%',
    target: 25,
    currentValue: 28,
    previousValue: 26,
    changePercentage: 7.7,
    trend: 'up',
    status: 'excellent',
    frequency: 'monthly',
    lastUpdated: '2024-01-15T10:00:00Z',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z'
  },
  {
    id: '3',
    categoryId: '2',
    name: 'Tiempo de Respuesta',
    description: 'Tiempo promedio de respuesta a consultas',
    formula: 'Suma(Tiempos) / Número de consultas',
    unit: 'minutos',
    target: 30,
    currentValue: 35,
    previousValue: 40,
    changePercentage: -12.5,
    trend: 'up',
    status: 'good',
    frequency: 'daily',
    lastUpdated: '2024-01-15T10:00:00Z',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z'
  },
  {
    id: '4',
    categoryId: '3',
    name: 'NPS Score',
    description: 'Net Promoter Score',
    formula: '(% Promotores - % Detractores) * 100',
    unit: 'puntos',
    target: 50,
    currentValue: 45,
    previousValue: 42,
    changePercentage: 7.1,
    trend: 'up',
    status: 'good',
    frequency: 'monthly',
    lastUpdated: '2024-01-15T10:00:00Z',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z'
  },
  {
    id: '5',
    categoryId: '4',
    name: 'Tasa de Conversión',
    description: 'Porcentaje de visitantes que se convierten',
    formula: '(Conversiones / Visitantes) * 100',
    unit: '%',
    target: 3.5,
    currentValue: 3.2,
    previousValue: 3.8,
    changePercentage: -15.8,
    trend: 'down',
    status: 'warning',
    frequency: 'weekly',
    lastUpdated: '2024-01-15T10:00:00Z',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z'
  },
  {
    id: '6',
    categoryId: '2',
    name: 'Uptime del Sistema',
    description: 'Porcentaje de tiempo que el sistema está operativo',
    formula: '(Tiempo operativo / Tiempo total) * 100',
    unit: '%',
    target: 99.9,
    currentValue: 99.5,
    previousValue: 99.7,
    changePercentage: -0.2,
    trend: 'down',
    status: 'warning',
    frequency: 'daily',
    lastUpdated: '2024-01-15T10:00:00Z',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z'
  }
];

const mockGoals: KPIGoal[] = [
  {
    id: '1',
    metricId: '1',
    name: 'Aumentar ROI Marketing a 200%',
    description: 'Objetivo trimestral de ROI',
    targetValue: 200,
    currentValue: 175,
    startDate: '2024-01-01',
    endDate: '2024-03-31',
    progress: 87.5,
    status: 'in_progress',
    priority: 'high',
    assignedTo: 'Equipo Marketing',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z'
  },
  {
    id: '2',
    metricId: '4',
    name: 'Alcanzar NPS de 60',
    description: 'Mejorar satisfacción del cliente',
    targetValue: 60,
    currentValue: 45,
    startDate: '2024-01-01',
    endDate: '2024-06-30',
    progress: 75,
    status: 'in_progress',
    priority: 'medium',
    assignedTo: 'Equipo Cliente',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z'
  }
];

const mockTimeRanges: KPITimeRange[] = [
  {
    id: '1',
    name: 'Últimos 7 días',
    startDate: '2024-01-08',
    endDate: '2024-01-15',
    isCustom: false,
    isDefault: false
  },
  {
    id: '2',
    name: 'Últimos 30 días',
    startDate: '2023-12-16',
    endDate: '2024-01-15',
    isCustom: false,
    isDefault: true
  },
  {
    id: '3',
    name: 'Último trimestre',
    startDate: '2023-10-01',
    endDate: '2023-12-31',
    isCustom: false,
    isDefault: false
  },
  {
    id: '4',
    name: 'Último año',
    startDate: '2023-01-01',
    endDate: '2023-12-31',
    isCustom: false,
    isDefault: false
  }
];

// Utility function for simulating API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// API functions
export const getKPICategories = async (): Promise<KPICategory[]> => {
  await delay(300);
  return mockCategories;
};

export const getKPICategory = async (id: string): Promise<KPICategory | null> => {
  await delay(200);
  return mockCategories.find(cat => cat.id === id) || null;
};

export const createKPICategory = async (data: Omit<KPICategory, 'id' | 'createdAt' | 'updatedAt'>): Promise<KPICategory> => {
  await delay(500);
  const newCategory: KPICategory = {
    ...data,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  mockCategories.push(newCategory);
  return newCategory;
};

export const updateKPICategory = async (id: string, data: Partial<KPICategory>): Promise<KPICategory | null> => {
  await delay(400);
  const index = mockCategories.findIndex(cat => cat.id === id);
  if (index === -1) return null;
  
  mockCategories[index] = {
    ...mockCategories[index],
    ...data,
    updatedAt: new Date().toISOString()
  };
  return mockCategories[index];
};

export const deleteKPICategory = async (id: string): Promise<boolean> => {
  await delay(300);
  const index = mockCategories.findIndex(cat => cat.id === id);
  if (index === -1) return false;
  
  mockCategories.splice(index, 1);
  return true;
};

export const getKPIMetrics = async (filter?: KPIFilter): Promise<KPIMetric[]> => {
  await delay(400);
  let filtered = [...mockMetrics];
  
  if (filter) {
    if (filter.categoryIds && filter.categoryIds.length > 0) {
      filtered = filtered.filter(metric => filter.categoryIds!.includes(metric.categoryId));
    }
    if (filter.status) {
      filtered = filtered.filter(metric => metric.status === filter.status);
    }
    if (filter.trend) {
      filtered = filtered.filter(metric => metric.trend === filter.trend);
    }
    if (filter.search) {
      const searchLower = filter.search.toLowerCase();
      filtered = filtered.filter(metric => 
        metric.name.toLowerCase().includes(searchLower) ||
        metric.description?.toLowerCase().includes(searchLower)
      );
    }
  }
  
  return filtered;
};

export const getKPIMetric = async (id: string): Promise<KPIMetric | null> => {
  await delay(200);
  return mockMetrics.find(metric => metric.id === id) || null;
};

export const createKPIMetric = async (data: Omit<KPIMetric, 'id' | 'currentValue' | 'previousValue' | 'changePercentage' | 'trend' | 'status' | 'lastUpdated' | 'createdAt' | 'updatedAt'>): Promise<KPIMetric> => {
  await delay(500);
  const newMetric: KPIMetric = {
    ...data,
    id: Date.now().toString(),
    currentValue: 0,
    previousValue: 0,
    changePercentage: 0,
    trend: 'stable',
    status: 'good',
    lastUpdated: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  mockMetrics.push(newMetric);
  return newMetric;
};

export const updateKPIMetric = async (id: string, data: Partial<KPIMetric>): Promise<KPIMetric | null> => {
  await delay(400);
  const index = mockMetrics.findIndex(metric => metric.id === id);
  if (index === -1) return null;
  
  mockMetrics[index] = {
    ...mockMetrics[index],
    ...data,
    updatedAt: new Date().toISOString()
  };
  return mockMetrics[index];
};

export const deleteKPIMetric = async (id: string): Promise<boolean> => {
  await delay(300);
  const index = mockMetrics.findIndex(metric => metric.id === id);
  if (index === -1) return false;
  
  mockMetrics.splice(index, 1);
  return true;
};

export const getKPIGoals = async (metricId?: string): Promise<KPIGoal[]> => {
  await delay(300);
  if (metricId) {
    return mockGoals.filter(goal => goal.metricId === metricId);
  }
  return mockGoals;
};

export const getKPIGoal = async (id: string): Promise<KPIGoal | null> => {
  await delay(200);
  return mockGoals.find(goal => goal.id === id) || null;
};

export const createKPIGoal = async (data: Omit<KPIGoal, 'id' | 'currentValue' | 'progress' | 'status' | 'createdAt' | 'updatedAt'>): Promise<KPIGoal> => {
  await delay(500);
  const newGoal: KPIGoal = {
    ...data,
    id: Date.now().toString(),
    currentValue: 0,
    progress: 0,
    status: 'not_started',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  mockGoals.push(newGoal);
  return newGoal;
};

export const updateKPIGoal = async (id: string, data: Partial<KPIGoal>): Promise<KPIGoal | null> => {
  await delay(400);
  const index = mockGoals.findIndex(goal => goal.id === id);
  if (index === -1) return null;
  
  mockGoals[index] = {
    ...mockGoals[index],
    ...data,
    updatedAt: new Date().toISOString()
  };
  return mockGoals[index];
};

export const deleteKPIGoal = async (id: string): Promise<boolean> => {
  await delay(300);
  const index = mockGoals.findIndex(goal => goal.id === id);
  if (index === -1) return false;
  
  mockGoals.splice(index, 1);
  return true;
};

export const getKPITimeRanges = async (): Promise<KPITimeRange[]> => {
  await delay(200);
  return mockTimeRanges;
};

export const getKPISummary = async (): Promise<KPISummary> => {
  await delay(300);
  const totalMetrics = mockMetrics.length;
  const excellentCount = mockMetrics.filter(m => m.status === 'excellent').length;
  const goodCount = mockMetrics.filter(m => m.status === 'good').length;
  const warningCount = mockMetrics.filter(m => m.status === 'warning').length;
  const criticalCount = mockMetrics.filter(m => m.status === 'critical').length;
  
  const trendingUp = mockMetrics.filter(m => m.trend === 'up').length;
  const trendingDown = mockMetrics.filter(m => m.trend === 'down').length;
  const stable = mockMetrics.filter(m => m.trend === 'stable').length;
  
  const overallHealth = totalMetrics > 0 
    ? ((excellentCount * 100 + goodCount * 75 + warningCount * 50 + criticalCount * 25) / totalMetrics)
    : 0;
  
  return {
    totalMetrics,
    excellentCount,
    goodCount,
    warningCount,
    criticalCount,
    overallHealth: Math.round(overallHealth),
    trendingUp,
    trendingDown,
    stable,
    lastUpdated: new Date().toISOString()
  };
};

export const getKPINotifications = async (): Promise<KPINotification[]> => {
  await delay(300);
  // Mock notifications
  return [
    {
      id: '1',
      metricId: '5',
      type: 'threshold',
      title: 'Tasa de Conversión Baja',
      message: 'La tasa de conversión ha caído por debajo del objetivo',
      severity: 'warning',
      isRead: false,
      createdAt: '2024-01-15T09:00:00Z'
    },
    {
      id: '2',
      metricId: '6',
      type: 'trend',
      title: 'Uptime del Sistema Deteriorándose',
      message: 'El uptime del sistema muestra una tendencia negativa',
      severity: 'error',
      isRead: false,
      createdAt: '2024-01-15T08:30:00Z'
    }
  ];
};

export const getKPIBenchmarks = async (metricId?: string): Promise<KPIBenchmark[]> => {
  await delay(300);
  // Mock benchmarks
  return [
    {
      id: '1',
      metricId: '1',
      industry: 'Tecnología',
      companySize: 'Mediana',
      region: 'Europa',
      benchmarkValue: 180,
      percentile: 75,
      dataSource: 'Industry Report 2024',
      lastUpdated: '2024-01-01T00:00:00Z'
    }
  ];
};

export const getKPIAnalysis = async (metricId: string): Promise<KPIAnalysis | null> => {
  await delay(400);
  // Mock analysis
  return {
    metricId,
    period: 'Último mes',
    insights: [
      {
        id: '1',
        type: 'trend',
        title: 'Tendencia Positiva Sostenida',
        description: 'El KPI muestra una tendencia positiva consistente durante los últimos 3 meses',
        confidence: 85,
        impact: 'high',
        data: { trend: 'up', months: 3 }
      }
    ],
    recommendations: [
      {
        id: '1',
        title: 'Mantener Estrategia Actual',
        description: 'Continuar con la estrategia actual que está generando resultados positivos',
        action: 'No action required',
        expectedImpact: 0,
        effort: 'low',
        priority: 'low'
      }
    ],
    riskFactors: [
      {
        id: '1',
        name: 'Cambios en el Mercado',
        description: 'Posibles cambios en las condiciones del mercado que podrían afectar el KPI',
        probability: 30,
        impact: 'medium',
        mitigation: 'Monitorear indicadores del mercado y ajustar estrategia según sea necesario',
        status: 'monitoring'
      }
    ],
    createdAt: new Date().toISOString()
  };
};

export const getKPITimeSeries = async (metricId: string, period: string): Promise<KPITimeSeries | null> => {
  await delay(300);
  // Mock time series data
  const now = new Date();
  const dataPoints: KPIDataPoint[] = [];
  
  for (let i = 30; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    dataPoints.push({
      timestamp: date.toISOString(),
      value: Math.random() * 100 + 50,
      target: 75
    });
  }
  
  return {
    metricId,
    dataPoints,
    period: 'day',
    startDate: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: now.toISOString()
  };
};

export const exportKPIs = async (format: 'csv' | 'excel' | 'pdf'): Promise<string> => {
  await delay(1000);
  return `kpis-export-${new Date().toISOString().split('T')[0]}.${format}`;
};

export const refreshKPIMetrics = async (): Promise<void> => {
  await delay(2000);
  // Simulate refreshing metrics
  mockMetrics.forEach(metric => {
    metric.lastUpdated = new Date().toISOString();
  });
};


