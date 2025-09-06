import type { 
  Subject, 
  Comp, 
  ValuationResult, 
  ModelSpec, 
  MarketTrend,
  AvmFilters,
  GeospatialAnalysis,
  PortfolioValuation
} from './types';

/**
 * Calculate haversine distance between two coordinates
 */
export const calculateDistance = (
  coord1: [number, number], 
  coord2: [number, number]
): number => {
  const [lat1, lon1] = coord1;
  const [lat2, lon2] = coord2;
  
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/**
 * Calculate similarity score between subject and comparable
 */
export const calculateSimilarity = (subject: Subject, comp: Comp): number => {
  let similarity = 1.0;
  
  // Area similarity (weight: 30%)
  const areaDiff = Math.abs(subject.area - comp.area) / subject.area;
  similarity -= areaDiff * 0.3;
  
  // Age similarity (weight: 20%)
  const ageDiff = Math.abs(subject.buildingYear - comp.buildingYear) / 50; // Normalize by 50 years
  similarity -= Math.min(ageDiff, 0.2) * 0.2;
  
  // Rooms similarity (weight: 15%)
  const roomsDiff = Math.abs(subject.rooms - comp.rooms) / Math.max(subject.rooms, 1);
  similarity -= Math.min(roomsDiff, 0.15) * 0.15;
  
  // Property type match (weight: 20%)
  if (subject.propertyType !== comp.propertyType) {
    similarity -= 0.2;
  }
  
  // Condition similarity (weight: 10%)
  const conditionValues = { poor: 1, fair: 2, good: 3, excellent: 4 };
  const conditionDiff = Math.abs(
    conditionValues[subject.condition] - conditionValues[comp.condition]
  ) / 3;
  similarity -= conditionDiff * 0.1;
  
  // Distance penalty (weight: 5%)
  const distanceKm = comp.distanceToSubject / 1000;
  const distancePenalty = Math.min(distanceKm / 5, 0.05); // Max 5% penalty at 5km
  similarity -= distancePenalty * 0.05;
  
  return Math.max(similarity, 0.1); // Minimum similarity of 10%
};

/**
 * Apply adjustments to comparable price
 */
export const applyAdjustments = (comp: Comp, subject: Subject): number => {
  let adjustedPrice = comp.salePrice;
  
  // Area adjustment
  const areaRatio = subject.area / comp.area;
  const areaAdjustment = (areaRatio - 1) * 0.8; // 80% of area difference
  adjustedPrice *= (1 + areaAdjustment);
  
  // Age adjustment (newer is better)
  const ageDiff = subject.buildingYear - comp.buildingYear;
  const ageAdjustment = ageDiff * 0.005; // 0.5% per year
  adjustedPrice *= (1 + Math.max(Math.min(ageAdjustment, 0.2), -0.2));
  
  // Condition adjustment
  const conditionValues = { poor: -0.15, fair: -0.05, good: 0, excellent: 0.1 };
  const subjectConditionAdj = conditionValues[subject.condition] || 0;
  const compConditionAdj = conditionValues[comp.condition] || 0;
  adjustedPrice *= (1 + (subjectConditionAdj - compConditionAdj));
  
  // Floor adjustment (if applicable)
  if (subject.floor !== undefined && comp.floor !== undefined) {
    const floorDiff = subject.floor - comp.floor;
    const floorAdjustment = floorDiff * 0.02; // 2% per floor
    adjustedPrice *= (1 + Math.max(Math.min(floorAdjustment, 0.15), -0.15));
  }
  
  return Math.round(adjustedPrice);
};

/**
 * Calculate confidence score based on comparables quality
 */
export const calculateConfidence = (comps: Comp[], subject: Subject): number => {
  if (comps.length === 0) return 0.1;
  
  let confidence = 0.5; // Base confidence
  
  // Number of comparables bonus
  const countBonus = Math.min(comps.length / 10, 0.2); // Up to 20% bonus for 10+ comps
  confidence += countBonus;
  
  // Average similarity bonus
  const avgSimilarity = comps.reduce((sum, comp) => sum + comp.similarity, 0) / comps.length;
  confidence += avgSimilarity * 0.25;
  
  // Verification bonus
  const verifiedRatio = comps.filter(c => c.verified).length / comps.length;
  confidence += verifiedRatio * 0.15;
  
  // Distance penalty
  const avgDistance = comps.reduce((sum, comp) => sum + comp.distanceToSubject, 0) / comps.length;
  const distancePenalty = Math.min((avgDistance / 1000) / 5, 0.1); // Up to 10% penalty
  confidence -= distancePenalty;
  
  // Age of sales penalty
  const now = new Date();
  const avgAge = comps.reduce((sum, comp) => {
    const saleDate = new Date(comp.saleDate);
    const monthsOld = (now.getTime() - saleDate.getTime()) / (1000 * 60 * 60 * 24 * 30);
    return sum + monthsOld;
  }, 0) / comps.length;
  
  const agePenalty = Math.min(avgAge / 12, 0.15); // Up to 15% penalty for 12+ month old sales
  confidence -= agePenalty;
  
  return Math.max(Math.min(confidence, 0.95), 0.1);
};

/**
 * Format currency amount
 */
export const formatCurrency = (amount: number, currency: string = 'EUR'): string => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

/**
 * Format currency with decimals
 */
export const formatCurrencyDetailed = (amount: number, currency: string = 'EUR'): string => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

/**
 * Format large numbers with K/M suffixes
 */
export const formatNumber = (value: number): string => {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  } else if (value >= 1000) {
    return `${(value / 1000).toFixed(0)}K`;
  }
  return value.toString();
};

/**
 * Format percentage
 */
export const formatPercent = (value: number, decimals: number = 1): string => {
  return `${value.toFixed(decimals)}%`;
};

/**
 * Format area in square meters
 */
export const formatArea = (area: number): string => {
  return `${area.toLocaleString('es-ES')} m²`;
};

/**
 * Format distance
 */
export const formatDistance = (meters: number): string => {
  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(1)} km`;
  }
  return `${Math.round(meters)} m`;
};

/**
 * Format date for display
 */
export const formatDate = (date: string | Date, format: 'short' | 'long' = 'short'): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (format === 'long') {
    return dateObj.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }
  
  return dateObj.toLocaleDateString('es-ES');
};

/**
 * Format relative time (e.g., "hace 2 días")
 */
export const formatRelativeTime = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - dateObj.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Hoy';
  if (diffDays === 1) return 'Ayer';
  if (diffDays < 7) return `Hace ${diffDays} días`;
  if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} semana${Math.floor(diffDays / 7) > 1 ? 's' : ''}`;
  if (diffDays < 365) return `Hace ${Math.floor(diffDays / 30)} mes${Math.floor(diffDays / 30) > 1 ? 'es' : ''}`;
  return `Hace ${Math.floor(diffDays / 365)} año${Math.floor(diffDays / 365) > 1 ? 's' : ''}`;
};

/**
 * Get confidence level color
 */
export const getConfidenceColor = (confidence: number): string => {
  if (confidence >= 0.85) return 'text-green-600 bg-green-100';
  if (confidence >= 0.70) return 'text-blue-600 bg-blue-100';
  if (confidence >= 0.50) return 'text-yellow-600 bg-yellow-100';
  return 'text-red-600 bg-red-100';
};

/**
 * Get market position color
 */
export const getMarketPositionColor = (position: 'below' | 'at' | 'above'): string => {
  switch (position) {
    case 'below': return 'text-green-600 bg-green-100';
    case 'at': return 'text-blue-600 bg-blue-100';
    case 'above': return 'text-red-600 bg-red-100';
  }
};

/**
 * Get market position text
 */
export const getMarketPositionText = (position: 'below' | 'at' | 'above'): string => {
  switch (position) {
    case 'below': return 'Por debajo del mercado';
    case 'at': return 'En línea con el mercado';
    case 'above': return 'Por encima del mercado';
  }
};

/**
 * Get property type label in Spanish
 */
export const getPropertyTypeLabel = (type: string): string => {
  const labels: Record<string, string> = {
    apartment: 'Piso',
    house: 'Casa',
    penthouse: 'Ático',
    studio: 'Estudio',
    duplex: 'Dúplex'
  };
  return labels[type] || type;
};

/**
 * Get condition label in Spanish
 */
export const getConditionLabel = (condition: string): string => {
  const labels: Record<string, string> = {
    excellent: 'Excelente',
    good: 'Bueno',
    fair: 'Regular',
    poor: 'Malo'
  };
  return labels[condition] || condition;
};

/**
 * Get model complexity badge color
 */
export const getComplexityColor = (complexity: string): string => {
  switch (complexity) {
    case 'low': return 'text-green-600 bg-green-100';
    case 'medium': return 'text-yellow-600 bg-yellow-100';
    case 'high': return 'text-red-600 bg-red-100';
    default: return 'text-gray-600 bg-gray-100';
  }
};

/**
 * Get model type label
 */
export const getModelTypeLabel = (type: string): string => {
  const labels: Record<string, string> = {
    xgboost: 'XGBoost',
    random_forest: 'Random Forest',
    knn: 'K-NN',
    hedonic: 'Hedónico',
    dcf: 'DCF',
    ensemble: 'Ensemble'
  };
  return labels[type] || type;
};

/**
 * Calculate price per square meter
 */
export const calculatePricePerM2 = (price: number, area: number): number => {
  return Math.round(price / area);
};

/**
 * Calculate total property value from price per m2
 */
export const calculateTotalValue = (pricePerM2: number, area: number): number => {
  return Math.round(pricePerM2 * area);
};

/**
 * Validate Spanish postal code
 */
export const isValidPostalCode = (code: string): boolean => {
  return /^\d{5}$/.test(code);
};

/**
 * Get Spanish province from postal code
 */
export const getProvinceFromPostalCode = (code: string): string => {
  if (!isValidPostalCode(code)) return 'Desconocida';
  
  const provinceMap: Record<string, string> = {
    '28': 'Madrid',
    '08': 'Barcelona',
    '46': 'Valencia',
    '41': 'Sevilla',
    '50': 'Zaragoza',
    '29': 'Málaga',
    '07': 'Palma de Mallorca',
    '30': 'Murcia',
    '35': 'Las Palmas',
    '48': 'Bilbao'
  };
  
  const prefix = code.substring(0, 2);
  return provinceMap[prefix] || 'Otra';
};

/**
 * Filter comparables based on criteria
 */
export const filterComparables = (comps: Comp[], filters: AvmFilters): Comp[] => {
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
    
    if (filters.maxAge) {
      const saleDate = new Date(comp.saleDate);
      const now = new Date();
      const monthsOld = (now.getTime() - saleDate.getTime()) / (1000 * 60 * 60 * 24 * 30);
      if (monthsOld > filters.maxAge) return false;
    }
    
    return true;
  });
};

/**
 * Sort comparables by specified criteria
 */
export const sortComparables = (
  comps: Comp[], 
  field: 'price' | 'pricePerM2' | 'similarity' | 'distance' | 'saleDate',
  direction: 'asc' | 'desc' = 'desc'
): Comp[] => {
  const multiplier = direction === 'asc' ? 1 : -1;
  
  return [...comps].sort((a, b) => {
    let aValue: number | string;
    let bValue: number | string;
    
    switch (field) {
      case 'price':
        aValue = a.salePrice;
        bValue = b.salePrice;
        break;
      case 'pricePerM2':
        aValue = a.pricePerM2;
        bValue = b.pricePerM2;
        break;
      case 'similarity':
        aValue = a.similarity;
        bValue = b.similarity;
        break;
      case 'distance':
        aValue = a.distanceToSubject;
        bValue = b.distanceToSubject;
        break;
      case 'saleDate':
        aValue = new Date(a.saleDate).getTime();
        bValue = new Date(b.saleDate).getTime();
        break;
      default:
        return 0;
    }
    
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return (aValue - bValue) * multiplier;
    }
    
    return 0;
  });
};

/**
 * Calculate market statistics from comparables
 */
export const calculateMarketStats = (comps: Comp[]): {
  avgPrice: number;
  medianPrice: number;
  avgPricePerM2: number;
  medianPricePerM2: number;
  avgDaysOnMarket: number;
  totalTransactions: number;
} => {
  if (comps.length === 0) {
    return {
      avgPrice: 0,
      medianPrice: 0,
      avgPricePerM2: 0,
      medianPricePerM2: 0,
      avgDaysOnMarket: 0,
      totalTransactions: 0
    };
  }
  
  const prices = comps.map(c => c.salePrice).sort((a, b) => a - b);
  const pricesPerM2 = comps.map(c => c.pricePerM2).sort((a, b) => a - b);
  
  const medianPrice = prices[Math.floor(prices.length / 2)];
  const medianPricePerM2 = pricesPerM2[Math.floor(pricesPerM2.length / 2)];
  
  return {
    avgPrice: Math.round(prices.reduce((sum, p) => sum + p, 0) / prices.length),
    medianPrice,
    avgPricePerM2: Math.round(pricesPerM2.reduce((sum, p) => sum + p, 0) / pricesPerM2.length),
    medianPricePerM2,
    avgDaysOnMarket: Math.round(comps.reduce((sum, c) => sum + c.daysOnMarket, 0) / comps.length),
    totalTransactions: comps.length
  };
};

/**
 * Calculate weighted average valuation from multiple models
 */
export const calculateWeightedValuation = (
  results: ValuationResult[],
  modelWeights: Record<string, number>
): {
  weightedValue: number;
  weightedConfidence: number;
  contributingModels: Array<{ modelId: string; weight: number; value: number; confidence: number }>;
} => {
  if (results.length === 0) {
    return { weightedValue: 0, weightedConfidence: 0, contributingModels: [] };
  }
  
  let totalWeightedValue = 0;
  let totalWeightedConfidence = 0;
  let totalWeight = 0;
  const contributingModels = [];
  
  for (const result of results) {
    const weight = modelWeights[result.modelId] || 1;
    const confidenceWeight = result.confidence * weight;
    
    totalWeightedValue += result.estimatedValue * confidenceWeight;
    totalWeightedConfidence += result.confidence * weight;
    totalWeight += weight;
    
    contributingModels.push({
      modelId: result.modelId,
      weight: weight,
      value: result.estimatedValue,
      confidence: result.confidence
    });
  }
  
  return {
    weightedValue: totalWeight > 0 ? Math.round(totalWeightedValue / totalWeight) : 0,
    weightedConfidence: totalWeight > 0 ? totalWeightedConfidence / totalWeight : 0,
    contributingModels
  };
};

/**
 * Export valuation results to CSV
 */
export const exportToCSV = (results: ValuationResult[], filename: string = 'valoraciones.csv'): void => {
  const headers = [
    'ID', 'Inmueble', 'Modelo', 'Valor Estimado', 'Confianza', 'Precio/m²',
    'Posición Mercado', 'Fecha Creación', 'Tiempo Ejecución'
  ];
  
  const rows = results.map(result => [
    result.id,
    result.subjectId,
    result.modelId,
    result.estimatedValue.toString(),
    (result.confidence * 100).toFixed(1),
    result.pricePerM2.toString(),
    getMarketPositionText(result.marketPosition),
    formatDate(result.createdAt),
    `${result.executionTime.toFixed(1)}s`
  ]);
  
  const csvContent = [headers, ...rows]
    .map(row => row.map(cell => `"${cell}"`).join(','))
    .join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

/**
 * Generate PDF report (mock function - would integrate with PDF library)
 */
export const generatePDFReport = async (
  subject: Subject,
  results: ValuationResult[],
  comps: Comp[]
): Promise<void> => {
  // Mock PDF generation
  console.log('Generando informe PDF...', { subject, results, comps });
  
  // In a real implementation, this would use a PDF library like jsPDF or PDFKit
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  const filename = `valoracion_${subject.id}_${new Date().toISOString().split('T')[0]}.pdf`;
  console.log(`Informe PDF generado: ${filename}`);
};

/**
 * Debounce function for search inputs
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: ReturnType<typeof setTimeout>;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

/**
 * Generate unique ID
 */
export const generateId = (prefix: string = 'id'): string => {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Validate coordinates
 */
export const isValidCoordinates = (coords: [number, number]): boolean => {
  const [lat, lng] = coords;
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
};

/**
 * Calculate portfolio risk score
 */
export const calculatePortfolioRisk = (portfolio: PortfolioValuation): number => {
  // Mock risk calculation based on diversification and market exposure
  const diversificationBonus = portfolio.diversificationIndex * 2; // 0-2 points
  const concentrationPenalty = Math.max(...Object.values(portfolio.marketExposure)) / 100 * 3; // 0-3 penalty
  const baseRisk = 5; // Base risk score
  
  return Math.max(1, Math.min(10, baseRisk - diversificationBonus + concentrationPenalty));
};

/**
 * Format execution time
 */
export const formatExecutionTime = (seconds: number): string => {
  if (seconds < 60) return `${seconds.toFixed(1)}s`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${remainingSeconds.toFixed(0)}s`;
};

/**
 * Get risk factor severity color
 */
export const getRiskSeverityColor = (severity: 'low' | 'medium' | 'high'): string => {
  switch (severity) {
    case 'low': return 'text-green-600 bg-green-100';
    case 'medium': return 'text-yellow-600 bg-yellow-100';
    case 'high': return 'text-red-600 bg-red-100';
  }
};

/**
 * Get impact color
 */
export const getImpactColor = (impact: 'positive' | 'negative' | 'neutral'): string => {
  switch (impact) {
    case 'positive': return 'text-green-600 bg-green-100';
    case 'negative': return 'text-red-600 bg-red-100';
    case 'neutral': return 'text-gray-600 bg-gray-100';
  }
};