import type { 
  KPIMetric, 
  KPICategory, 
  KPIGoal, 
  KPISummary,
  KPIFilter,
  KPITimeRange
} from './types';

export const formatNumber = (value: number, decimals: number = 2): string => {
  return new Intl.NumberFormat('es-ES', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(value);
};

export const formatPercentage = (value: number, decimals: number = 1): string => {
  return `${value.toFixed(decimals)}%`;
};

export const formatCurrency = (amount: number, currency: string = 'EUR'): string => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
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

export const getKPIStatusColor = (status: string): string => {
  switch (status) {
    case 'excellent':
      return 'text-green-600';
    case 'good':
      return 'text-blue-600';
    case 'warning':
      return 'text-yellow-600';
    case 'critical':
      return 'text-red-600';
    default:
      return 'text-gray-600';
  }
};

export const getKPIStatusText = (status: string): string => {
  switch (status) {
    case 'excellent':
      return 'Excelente';
    case 'good':
      return 'Bueno';
    case 'warning':
      return 'Advertencia';
    case 'critical':
      return 'Crítico';
    default:
      return 'Desconocido';
  }
};

export const getKPIStatusBgColor = (status: string): string => {
  switch (status) {
    case 'excellent':
      return 'bg-green-100';
    case 'good':
      return 'bg-blue-100';
    case 'warning':
      return 'bg-yellow-100';
    case 'critical':
      return 'bg-red-100';
    default:
      return 'bg-gray-100';
  }
};

export const getKPITrendColor = (trend: string): string => {
  switch (trend) {
    case 'up':
      return 'text-green-600';
    case 'down':
      return 'text-red-600';
    case 'stable':
      return 'text-gray-600';
    default:
      return 'text-gray-600';
  }
};

export const getKPITrendIcon = (trend: string): string => {
  switch (trend) {
    case 'up':
      return '↗️';
    case 'down':
      return '↘️';
    case 'stable':
      return '→';
    default:
      return '→';
  }
};

export const getKPITrendText = (trend: string): string => {
  switch (trend) {
    case 'up':
      return 'Subiendo';
    case 'down':
      return 'Bajando';
    case 'stable':
      return 'Estable';
    default:
      return 'Estable';
  }
};

export const getKPIPriorityColor = (priority: string): string => {
  switch (priority) {
    case 'low':
      return 'text-gray-600';
    case 'medium':
      return 'text-blue-600';
    case 'high':
      return 'text-orange-600';
    case 'critical':
      return 'text-red-600';
    default:
      return 'text-gray-600';
  }
};

export const getKPIPriorityText = (priority: string): string => {
  switch (priority) {
    case 'low':
      return 'Baja';
    case 'medium':
      return 'Media';
    case 'high':
      return 'Alta';
    case 'critical':
      return 'Crítica';
    default:
      return 'Baja';
  }
};

export const getKPIFrequencyText = (frequency: string): string => {
  switch (frequency) {
    case 'daily':
      return 'Diario';
    case 'weekly':
      return 'Semanal';
    case 'monthly':
      return 'Mensual';
    case 'quarterly':
      return 'Trimestral';
    case 'yearly':
      return 'Anual';
    default:
      return 'Desconocido';
  }
};

export const getKPIFrequencyColor = (frequency: string): string => {
  switch (frequency) {
    case 'daily':
      return 'text-blue-600';
    case 'weekly':
      return 'text-green-600';
    case 'monthly':
      return 'text-purple-600';
    case 'quarterly':
      return 'text-orange-600';
    case 'yearly':
      return 'text-red-600';
    default:
      return 'text-gray-600';
  }
};

export const calculateKPISummary = (metrics: KPIMetric[]): KPISummary => {
  const totalMetrics = metrics.length;
  const excellentCount = metrics.filter(m => m.status === 'excellent').length;
  const goodCount = metrics.filter(m => m.status === 'good').length;
  const warningCount = metrics.filter(m => m.status === 'warning').length;
  const criticalCount = metrics.filter(m => m.status === 'critical').length;
  
  const trendingUp = metrics.filter(m => m.trend === 'up').length;
  const trendingDown = metrics.filter(m => m.trend === 'down').length;
  const stable = metrics.filter(m => m.trend === 'stable').length;
  
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

export const calculateGoalProgress = (goal: KPIGoal): number => {
  if (goal.targetValue === 0) return 0;
  return Math.min(100, Math.max(0, (goal.currentValue / goal.targetValue) * 100));
};

export const getGoalStatus = (goal: KPIGoal): string => {
  const progress = calculateGoalProgress(goal);
  const now = new Date();
  const endDate = new Date(goal.endDate);
  
  if (progress >= 100) return 'completed';
  if (now > endDate) return 'overdue';
  if (progress > 0) return 'in_progress';
  return 'not_started';
};

export const getGoalStatusColor = (status: string): string => {
  switch (status) {
    case 'completed':
      return 'text-green-600';
    case 'in_progress':
      return 'text-blue-600';
    case 'overdue':
      return 'text-red-600';
    case 'not_started':
      return 'text-gray-600';
    default:
      return 'text-gray-600';
  }
};

export const getGoalStatusText = (status: string): string => {
  switch (status) {
    case 'completed':
      return 'Completado';
    case 'in_progress':
      return 'En Progreso';
    case 'overdue':
      return 'Retrasado';
    case 'not_started':
      return 'No Iniciado';
    default:
      return 'Desconocido';
  }
};

export const filterKPIs = (metrics: KPIMetric[], filter: KPIFilter): KPIMetric[] => {
  let filtered = [...metrics];
  
  if (filter.categoryIds && filter.categoryIds.length > 0) {
    filtered = filtered.filter(metric => filter.categoryIds!.includes(metric.categoryId));
  }
  
  if (filter.status) {
    filtered = filtered.filter(metric => metric.status === filter.status);
  }
  
  if (filter.trend) {
    filtered = filtered.filter(metric => metric.trend === filter.trend);
  }
  
  if (filter.frequency) {
    filtered = filtered.filter(metric => metric.frequency === filter.frequency);
  }
  
  if (filter.search) {
    const searchLower = filter.search.toLowerCase();
    filtered = filtered.filter(metric => 
      metric.name.toLowerCase().includes(searchLower) ||
      metric.description?.toLowerCase().includes(searchLower)
    );
  }
  
  return filtered;
};

export const sortKPIs = (metrics: KPIMetric[], sortBy: string, sortOrder: 'asc' | 'desc'): KPIMetric[] => {
  const sorted = [...metrics];
  
  sorted.sort((a, b) => {
    let aValue: any;
    let bValue: any;
    
    switch (sortBy) {
      case 'name':
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
        break;
      case 'currentValue':
        aValue = a.currentValue;
        bValue = b.currentValue;
        break;
      case 'changePercentage':
        aValue = a.changePercentage;
        bValue = b.changePercentage;
        break;
      case 'status':
        aValue = a.status;
        bValue = b.status;
        break;
      case 'lastUpdated':
        aValue = new Date(a.lastUpdated);
        bValue = new Date(b.lastUpdated);
        break;
      default:
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
    }
    
    if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });
  
  return sorted;
};

export const getCategoryColor = (category: KPICategory): string => {
  return category.color || '#6B7280';
};

export const getCategoryIcon = (category: KPICategory): string => {
  return category.icon || '📊';
};

export const calculateChangePercentage = (current: number, previous: number): number => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
};

export const getChangeColor = (change: number): string => {
  if (change > 0) return 'text-green-600';
  if (change < 0) return 'text-red-600';
  return 'text-gray-600';
};

export const getChangeIcon = (change: number): string => {
  if (change > 0) return '↗️';
  if (change < 0) return '↘️';
  return '→';
};

export const getChangeText = (change: number): string => {
  if (change > 0) return 'Incremento';
  if (change < 0) return 'Decremento';
  return 'Sin cambios';
};

export const getTimeRangeText = (timeRange: KPITimeRange): string => {
  if (timeRange.isCustom) {
    return `${formatDate(timeRange.startDate)} - ${formatDate(timeRange.endDate)}`;
  }
  return timeRange.name;
};

export const getSeverityColor = (severity: string): string => {
  switch (severity) {
    case 'info':
      return 'text-blue-600';
    case 'warning':
      return 'text-yellow-600';
    case 'error':
      return 'text-orange-600';
    case 'critical':
      return 'text-red-600';
    default:
      return 'text-gray-600';
  }
};

export const getSeverityText = (severity: string): string => {
  switch (severity) {
    case 'info':
      return 'Información';
    case 'warning':
      return 'Advertencia';
    case 'error':
      return 'Error';
    case 'critical':
      return 'Crítico';
    default:
      return 'Desconocido';
  }
};

export const getImpactColor = (impact: string): string => {
  switch (impact) {
    case 'low':
      return 'text-gray-600';
    case 'medium':
      return 'text-yellow-600';
    case 'high':
      return 'text-orange-600';
    case 'critical':
      return 'text-red-600';
    default:
      return 'text-gray-600';
  }
};

export const getImpactText = (impact: string): string => {
  switch (impact) {
    case 'low':
      return 'Bajo';
    case 'medium':
      return 'Medio';
    case 'high':
      return 'Alto';
    case 'critical':
      return 'Crítico';
    default:
      return 'Desconocido';
  }
};

export const getEffortColor = (effort: string): string => {
  switch (effort) {
    case 'low':
      return 'text-green-600';
    case 'medium':
      return 'text-yellow-600';
    case 'high':
      return 'text-red-600';
    default:
      return 'text-gray-600';
  }
};

export const getEffortText = (effort: string): string => {
  switch (effort) {
    case 'low':
      return 'Bajo';
    case 'medium':
      return 'Medio';
    case 'high':
      return 'Alto';
    default:
      return 'Desconocido';
  }
};


