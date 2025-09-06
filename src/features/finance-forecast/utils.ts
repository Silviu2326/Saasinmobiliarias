import type { 
  ForecastItem, 
  ForecastQuery, 
  ForecastSummary, 
  ForecastComparison,
  ForecastPeriod,
  ForecastCategory
} from './types';

export const formatCurrency = (amount: number, currency: string = 'EUR'): string => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const formatDateTime = (dateString: string): string => {
  return new Date(dateString).toLocaleString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const formatPercentage = (value: number): string => {
  return `${value.toFixed(1)}%`;
};

export const getForecastTypeColor = (type: 'income' | 'expense'): string => {
  return type === 'income' ? 'text-green-600' : 'text-red-600';
};

export const getForecastTypeText = (type: 'income' | 'expense'): string => {
  return type === 'income' ? 'Ingreso' : 'Gasto';
};

export const getForecastStatusColor = (status: string): string => {
  switch (status) {
    case 'confirmed':
      return 'text-green-600';
    case 'draft':
      return 'text-yellow-600';
    case 'cancelled':
      return 'text-red-600';
    default:
      return 'text-gray-600';
  }
};

export const getForecastStatusText = (status: string): string => {
  switch (status) {
    case 'confirmed':
      return 'Confirmado';
    case 'draft':
      return 'Borrador';
    case 'cancelled':
      return 'Cancelado';
    default:
      return 'Desconocido';
  }
};

export const getProbabilityColor = (probability: number): string => {
  if (probability >= 80) return 'text-green-600';
  if (probability >= 60) return 'text-blue-600';
  if (probability >= 40) return 'text-yellow-600';
  if (probability >= 20) return 'text-orange-600';
  return 'text-red-600';
};

export const getProbabilityText = (probability: number): string => {
  if (probability >= 80) return 'Muy Alta';
  if (probability >= 60) return 'Alta';
  if (probability >= 40) return 'Media';
  if (probability >= 20) return 'Baja';
  return 'Muy Baja';
};

export const calculateForecastTotals = (items: ForecastItem[]): ForecastSummary => {
  const incomeItems = items.filter(item => item.type === 'income');
  const expenseItems = items.filter(item => item.type === 'expense');
  
  const totalIncome = incomeItems.reduce((sum, item) => sum + item.amount, 0);
  const totalExpenses = expenseItems.reduce((sum, item) => sum + item.amount, 0);
  const netAmount = totalIncome - totalExpenses;
  
  const allProbabilities = items.map(item => item.probability);
  const averageProbability = allProbabilities.length > 0 
    ? allProbabilities.reduce((sum, prob) => sum + prob, 0) / allProbabilities.length 
    : 0;
  
  return {
    periodId: '',
    periodName: '',
    totalIncome,
    totalExpenses,
    netAmount,
    incomeCount: incomeItems.length,
    expenseCount: expenseItems.length,
    averageProbability,
    currency: items[0]?.currency || 'EUR'
  };
};

export const buildForecastQuery = (params: Partial<ForecastQuery>): ForecastQuery => {
  return {
    page: 1,
    limit: 20,
    sortBy: 'createdAt',
    sortOrder: 'desc',
    ...params
  };
};

export const filterForecasts = (items: ForecastItem[], query: ForecastQuery): ForecastItem[] => {
  let filtered = [...items];
  
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
  
  if (query.minAmount !== undefined) {
    filtered = filtered.filter(item => item.amount >= query.minAmount!);
  }
  
  if (query.maxAmount !== undefined) {
    filtered = filtered.filter(item => item.amount <= query.maxAmount!);
  }
  
  if (query.minProbability !== undefined) {
    filtered = filtered.filter(item => item.probability >= query.minProbability!);
  }
  
  if (query.maxProbability !== undefined) {
    filtered = filtered.filter(item => item.probability <= query.maxProbability!);
  }
  
  if (query.tags && query.tags.length > 0) {
    filtered = filtered.filter(item => 
      query.tags!.some(tag => item.tags.includes(tag))
    );
  }
  
  if (query.search) {
    const searchLower = query.search.toLowerCase();
    filtered = filtered.filter(item => 
      item.name.toLowerCase().includes(searchLower) ||
      item.description?.toLowerCase().includes(searchLower) ||
      item.notes?.toLowerCase().includes(searchLower)
    );
  }
  
  if (query.startDate) {
    filtered = filtered.filter(item => 
      new Date(item.createdAt) >= new Date(query.startDate!)
    );
  }
  
  if (query.endDate) {
    filtered = filtered.filter(item => 
      new Date(item.createdAt) <= new Date(query.endDate!)
    );
  }
  
  return filtered;
};

export const sortForecasts = (items: ForecastItem[], sortBy: string, sortOrder: 'asc' | 'desc'): ForecastItem[] => {
  const sorted = [...items];
  
  sorted.sort((a, b) => {
    let aValue: any;
    let bValue: any;
    
    switch (sortBy) {
      case 'name':
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
        break;
      case 'amount':
        aValue = a.amount;
        bValue = b.amount;
        break;
      case 'probability':
        aValue = a.probability;
        bValue = b.probability;
        break;
      case 'status':
        aValue = a.status;
        bValue = b.status;
        break;
      case 'createdAt':
        aValue = new Date(a.createdAt);
        bValue = new Date(b.createdAt);
        break;
      default:
        aValue = a.createdAt;
        bValue = b.createdAt;
    }
    
    if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });
  
  return sorted;
};

export const calculateForecastAccuracy = (actual: number, forecasted: number): number => {
  if (forecasted === 0) return 0;
  const variance = Math.abs(actual - forecasted) / forecasted;
  return Math.max(0, (1 - variance) * 100);
};

export const getForecastVariance = (actual: number, forecasted: number): ForecastComparison => {
  const variance = actual - forecasted;
  const variancePercentage = forecasted !== 0 ? (variance / forecasted) * 100 : 0;
  const accuracy = calculateForecastAccuracy(actual, forecasted);
  
  return {
    periodId: '',
    periodName: '',
    actualAmount: actual,
    forecastedAmount: forecasted,
    variance,
    variancePercentage,
    accuracy
  };
};

export const isPeriodActive = (period: ForecastPeriod): boolean => {
  const now = new Date();
  const startDate = new Date(period.startDate);
  const endDate = new Date(period.endDate);
  
  return period.isActive && now >= startDate && now <= endDate;
};

export const getPeriodDuration = (period: ForecastPeriod): number => {
  const startDate = new Date(period.startDate);
  const endDate = new Date(period.endDate);
  const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const getCategoryColor = (category: ForecastCategory): string => {
  return category.color || '#6B7280';
};