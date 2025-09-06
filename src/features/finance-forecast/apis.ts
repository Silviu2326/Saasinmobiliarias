import type { 
  ForecastItem, 
  ForecastPeriod, 
  ForecastCategory, 
  ForecastScenario,
  ForecastQuery, 
  ForecastListResponse,
  ForecastSummary,
  ForecastComparison
} from './types';

// Mock data
const mockPeriods: ForecastPeriod[] = [
  {
    id: '1',
    name: 'Q1 2024',
    startDate: '2024-01-01',
    endDate: '2024-03-31',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    name: 'Q2 2024',
    startDate: '2024-04-01',
    endDate: '2024-06-30',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '3',
    name: 'Q3 2024',
    startDate: '2024-07-01',
    endDate: '2024-09-30',
    isActive: false,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  }
];

const mockCategories: ForecastCategory[] = [
  {
    id: '1',
    name: 'Ventas',
    description: 'Ingresos por ventas de propiedades',
    color: '#10B981',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    name: 'Alquileres',
    description: 'Ingresos por alquiler de propiedades',
    color: '#3B82F6',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '3',
    name: 'Marketing',
    description: 'Gastos de marketing y publicidad',
    color: '#F59E0B',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '4',
    name: 'Operaciones',
    description: 'Gastos operativos generales',
    color: '#EF4444',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  }
];

const mockForecasts: ForecastItem[] = [
  {
    id: '1',
    periodId: '1',
    categoryId: '1',
    name: 'Venta Apartamento Centro',
    description: 'Venta de apartamento en zona centro',
    type: 'income',
    amount: 45000,
    currency: 'EUR',
    probability: 85,
    status: 'confirmed',
    tags: ['venta', 'apartamento', 'centro'],
    notes: 'Cliente muy interesado, proceso avanzado',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z'
  },
  {
    id: '2',
    periodId: '1',
    categoryId: '2',
    name: 'Alquiler Local Comercial',
    description: 'Alquiler de local en zona comercial',
    type: 'income',
    amount: 1200,
    currency: 'EUR',
    probability: 70,
    status: 'draft',
    tags: ['alquiler', 'local', 'comercial'],
    notes: 'En negociación con inquilino',
    createdAt: '2024-01-10T14:30:00Z',
    updatedAt: '2024-01-10T14:30:00Z'
  },
  {
    id: '3',
    periodId: '1',
    categoryId: '3',
    name: 'Campaña Google Ads',
    description: 'Campaña publicitaria en Google Ads',
    type: 'expense',
    amount: 2500,
    currency: 'EUR',
    probability: 90,
    status: 'confirmed',
    tags: ['marketing', 'digital', 'ads'],
    notes: 'Campaña activa desde enero',
    createdAt: '2024-01-05T09:15:00Z',
    updatedAt: '2024-01-05T09:15:00Z'
  },
  {
    id: '4',
    periodId: '1',
    categoryId: '4',
    name: 'Mantenimiento Oficina',
    description: 'Gastos de mantenimiento de oficina',
    type: 'expense',
    amount: 800,
    currency: 'EUR',
    probability: 95,
    status: 'confirmed',
    tags: ['mantenimiento', 'oficina'],
    notes: 'Mantenimiento mensual programado',
    createdAt: '2024-01-20T16:45:00Z',
    updatedAt: '2024-01-20T16:45:00Z'
  },
  {
    id: '5',
    periodId: '2',
    categoryId: '1',
    name: 'Venta Casa Familiar',
    description: 'Venta de casa familiar en urbanización',
    type: 'income',
    amount: 280000,
    currency: 'EUR',
    probability: 60,
    status: 'draft',
    tags: ['venta', 'casa', 'familiar'],
    notes: 'Primera visita programada',
    createdAt: '2024-02-01T11:20:00Z',
    updatedAt: '2024-02-01T11:20:00Z'
  }
];

const mockScenarios: ForecastScenario[] = [
  {
    id: '1',
    name: 'Escenario Base',
    description: 'Escenario de referencia con probabilidades medias',
    isActive: true,
    probability: 50,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    name: 'Escenario Optimista',
    description: 'Escenario con mejores expectativas',
    isActive: true,
    probability: 25,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '3',
    name: 'Escenario Pesimista',
    description: 'Escenario con expectativas conservadoras',
    isActive: true,
    probability: 25,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  }
];

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Forecast Items APIs
export const getForecasts = async (query: ForecastQuery): Promise<ForecastListResponse> => {
  await delay(300);
  
  let filtered = [...mockForecasts];
  
  if (query.periodId) {
    filtered = filtered.filter(item => item.periodId === query.periodId);
  }
  
  if (query.categoryId) {
    filtered = filtered.filter(item => item.categoryId === query.categoryId);
  }
  
  if (query.type) {
    filtered = filtered.filter(item => item.type === query.type);
  }
  
  if (query.status) {
    filtered = filtered.filter(item => item.status === query.status);
  }
  
  if (query.search) {
    const searchLower = query.search.toLowerCase();
    filtered = filtered.filter(item => 
      item.name.toLowerCase().includes(searchLower) ||
      item.description?.toLowerCase().includes(searchLower)
    );
  }
  
  const total = filtered.length;
  const page = query.page || 1;
  const limit = query.limit || 20;
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const items = filtered.slice(startIndex, endIndex);
  
  return {
    items,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit)
  };
};

export const getForecast = async (id: string): Promise<ForecastItem | null> => {
  await delay(200);
  return mockForecasts.find(item => item.id === id) || null;
};

export const createForecast = async (data: Omit<ForecastItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<ForecastItem> => {
  await delay(400);
  
  const newForecast: ForecastItem = {
    ...data,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  mockForecasts.push(newForecast);
  return newForecast;
};

export const updateForecast = async (id: string, data: Partial<ForecastItem>): Promise<ForecastItem | null> => {
  await delay(300);
  
  const index = mockForecasts.findIndex(item => item.id === id);
  if (index === -1) return null;
  
  mockForecasts[index] = {
    ...mockForecasts[index],
    ...data,
    updatedAt: new Date().toISOString()
  };
  
  return mockForecasts[index];
};

export const deleteForecast = async (id: string): Promise<boolean> => {
  await delay(200);
  
  const index = mockForecasts.findIndex(item => item.id === id);
  if (index === -1) return false;
  
  mockForecasts.splice(index, 1);
  return true;
};

// Periods APIs
export const getForecastPeriods = async (): Promise<ForecastPeriod[]> => {
  await delay(200);
  return mockPeriods;
};

export const createForecastPeriod = async (data: Omit<ForecastPeriod, 'id' | 'createdAt' | 'updatedAt'>): Promise<ForecastPeriod> => {
  await delay(300);
  
  const newPeriod: ForecastPeriod = {
    ...data,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  mockPeriods.push(newPeriod);
  return newPeriod;
};

export const updateForecastPeriod = async (id: string, data: Partial<ForecastPeriod>): Promise<ForecastPeriod | null> => {
  await delay(300);
  
  const index = mockPeriods.findIndex(period => period.id === id);
  if (index === -1) return null;
  
  mockPeriods[index] = {
    ...mockPeriods[index],
    ...data,
    updatedAt: new Date().toISOString()
  };
  
  return mockPeriods[index];
};

export const deleteForecastPeriod = async (id: string): Promise<boolean> => {
  await delay(200);
  
  const index = mockPeriods.findIndex(period => period.id === id);
  if (index === -1) return false;
  
  mockPeriods.splice(index, 1);
  return true;
};

// Categories APIs
export const getForecastCategories = async (): Promise<ForecastCategory[]> => {
  await delay(200);
  return mockCategories;
};

export const createForecastCategory = async (data: Omit<ForecastCategory, 'id' | 'createdAt' | 'updatedAt'>): Promise<ForecastCategory> => {
  await delay(300);
  
  const newCategory: ForecastCategory = {
    ...data,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  mockCategories.push(newCategory);
  return newCategory;
};

export const updateForecastCategory = async (id: string, data: Partial<ForecastCategory>): Promise<ForecastCategory | null> => {
  await delay(300);
  
  const index = mockCategories.findIndex(category => category.id === id);
  if (index === -1) return null;
  
  mockCategories[index] = {
    ...mockCategories[index],
    ...data,
    updatedAt: new Date().toISOString()
  };
  
  return mockCategories[index];
};

export const deleteForecastCategory = async (id: string): Promise<boolean> => {
  await delay(200);
  
  const index = mockCategories.findIndex(category => category.id === id);
  if (index === -1) return false;
  
  mockCategories.splice(index, 1);
  return true;
};

// Scenarios APIs
export const getForecastScenarios = async (): Promise<ForecastScenario[]> => {
  await delay(200);
  return mockScenarios;
};

export const createForecastScenario = async (data: Omit<ForecastScenario, 'id' | 'createdAt' | 'updatedAt'>): Promise<ForecastScenario> => {
  await delay(300);
  
  const newScenario: ForecastScenario = {
    ...data,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  mockScenarios.push(newScenario);
  return newScenario;
};

export const updateForecastScenario = async (id: string, data: Partial<ForecastScenario>): Promise<ForecastScenario | null> => {
  await delay(300);
  
  const index = mockScenarios.findIndex(scenario => scenario.id === id);
  if (index === -1) return null;
  
  mockScenarios[index] = {
    ...mockScenarios[index],
    ...data,
    updatedAt: new Date().toISOString()
  };
  
  return mockScenarios[index];
};

export const deleteForecastScenario = async (id: string): Promise<boolean> => {
  await delay(200);
  
  const index = mockScenarios.findIndex(scenario => scenario.id === id);
  if (index === -1) return false;
  
  mockScenarios.splice(index, 1);
  return true;
};

// Summary and Analytics APIs
export const getForecastSummary = async (periodId?: string): Promise<ForecastSummary> => {
  await delay(200);
  
  let items = mockForecasts;
  if (periodId) {
    items = items.filter(item => item.periodId === periodId);
  }
  
  const incomeItems = items.filter(item => item.type === 'income');
  const expenseItems = items.filter(item => item.type === 'expense');
  
  const totalIncome = incomeItems.reduce((sum, item) => sum + item.amount, 0);
  const totalExpenses = expenseItems.reduce((sum, item) => sum + item.amount, 0);
  const netAmount = totalIncome - totalExpenses;
  
  const allProbabilities = items.map(item => item.probability);
  const averageProbability = allProbabilities.length > 0 
    ? allProbabilities.reduce((sum, prob) => sum + prob, 0) / allProbabilities.length 
    : 0;
  
  const period = periodId ? mockPeriods.find(p => p.id === periodId) : null;
  
  return {
    periodId: periodId || '',
    periodName: period?.name || 'Todos los períodos',
    totalIncome,
    totalExpenses,
    netAmount,
    incomeCount: incomeItems.length,
    expenseCount: expenseItems.length,
    averageProbability,
    currency: 'EUR'
  };
};

export const getForecastComparison = async (periodId: string): Promise<ForecastComparison[]> => {
  await delay(300);
  
  // Simulate comparison data
  const period = mockPeriods.find(p => p.id === periodId);
  if (!period) return [];
  
  const items = mockForecasts.filter(item => item.periodId === periodId);
  const totalForecasted = items.reduce((sum, item) => sum + item.amount, 0);
  
  // Simulate actual vs forecasted data
  const actualAmount = totalForecasted * 0.85; // Simulate 85% accuracy
  const variance = actualAmount - totalForecasted;
  const variancePercentage = (variance / totalForecasted) * 100;
  const accuracy = Math.max(0, (1 - Math.abs(variance) / totalForecasted) * 100);
  
  return [{
    periodId,
    periodName: period.name,
    actualAmount,
    forecastedAmount: totalForecasted,
    variance,
    variancePercentage,
    accuracy
  }];
};

export const exportForecasts = async (query: ForecastQuery): Promise<string> => {
  await delay(500);
  
  const response = await getForecasts(query);
  const csvContent = [
    'ID,Período,Categoría,Nombre,Tipo,Monto,Moneda,Probabilidad,Estado,Etiquetas,Notas,Fecha Creación',
    ...response.items.map(item => {
      const period = mockPeriods.find(p => p.id === item.periodId);
      const category = mockCategories.find(c => c.id === item.categoryId);
      return [
        item.id,
        period?.name || '',
        category?.name || '',
        item.name,
        item.type === 'income' ? 'Ingreso' : 'Gasto',
        item.amount,
        item.currency,
        item.probability,
        item.status,
        item.tags.join(';'),
        item.notes || '',
        item.createdAt
      ].join(',');
    })
  ].join('\n');
  
  return csvContent;
};