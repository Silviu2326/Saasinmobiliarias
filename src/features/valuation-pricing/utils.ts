import type {
  Subject,
  Recommendation,
  NetWaterfall,
  CompetitorRecord,
  MarketBands,
  Scenario,
  PricePlan,
  ElasticityPoint,
  DomPoint,
  ChannelPreview,
  ChannelRule,
  Goal,
  Constraints,
  RoundingMode,
  WaterfallItem
} from './types';

/**
 * Round price according to specified mode
 */
export const roundPrice = (price: number, mode: RoundingMode, step: number = 1000): number => {
  switch (mode) {
    case '99':
      return Math.floor(price / step) * step + (step - 1);
    case '95':
      return Math.floor(price / step) * step + (step - 5);
    case '000':
      return Math.round(price / step) * step;
    case 'NONE':
    default:
      return Math.round(price);
  }
};

/**
 * Calculate price bands from market statistics
 */
export const priceBandsFromStats = (
  stats: MarketBands,
  subjectArea: number
): {
  bands: Array<{ label: string; range: [number, number]; color: string; position?: boolean }>;
  subjectPosition: { band: string; percentile: number };
} => {
  const pricePerM2 = stats.pricePerM2;
  const totalPrice = stats.totalPrice;
  
  const bands = [
    {
      label: 'Muy bajo (<P25)',
      range: [0, totalPrice.p25] as [number, number],
      color: 'bg-red-100 text-red-800',
      position: stats.subjectPosition.band === 'BELOW_P25'
    },
    {
      label: 'Bajo (P25-P50)',
      range: [totalPrice.p25, totalPrice.p50] as [number, number],
      color: 'bg-orange-100 text-orange-800',
      position: stats.subjectPosition.band === 'P25_P50'
    },
    {
      label: 'Medio (P50-P75)',
      range: [totalPrice.p50, totalPrice.p75] as [number, number],
      color: 'bg-yellow-100 text-yellow-800',
      position: stats.subjectPosition.band === 'P50_P75'
    },
    {
      label: 'Alto (P75-P90)',
      range: [totalPrice.p75, totalPrice.p90] as [number, number],
      color: 'bg-blue-100 text-blue-800',
      position: stats.subjectPosition.band === 'P75_P90'
    },
    {
      label: 'Muy alto (>P90)',
      range: [totalPrice.p90, Infinity] as [number, number],
      color: 'bg-purple-100 text-purple-800',
      position: stats.subjectPosition.band === 'ABOVE_P90'
    }
  ];
  
  return {
    bands,
    subjectPosition: {
      band: stats.subjectPosition.band,
      percentile: stats.subjectPosition.pricePercentile
    }
  };
};

/**
 * Calculate net owner proceeds from gross price
 */
export const calcNetOwnerProceeds = (
  price: number,
  costs: {
    agencyFee?: number;
    notaryFee?: number;
    registryFee?: number;
    taxes?: number;
    mortgage?: number;
    other?: number;
  } = {}
): NetWaterfall => {
  const defaultCosts = {
    agencyFee: price * 0.03, // 3%
    notaryFee: 1200,
    registryFee: 800,
    taxes: price * 0.006, // 0.6%
    mortgage: price * 0.4, // 40%
    other: 0,
    ...costs
  };
  
  const items: WaterfallItem[] = [
    {
      label: 'Precio de venta',
      amount: price,
      percentage: 100,
      kind: 'net',
      description: 'Precio bruto acordado'
    },
    {
      label: 'Honorarios agencia',
      amount: -defaultCosts.agencyFee,
      percentage: -(defaultCosts.agencyFee / price) * 100,
      kind: 'fee',
      description: 'Comisión comercial'
    },
    {
      label: 'Gastos notariales',
      amount: -defaultCosts.notaryFee,
      kind: 'cost',
      description: 'Notaría y registro'
    },
    {
      label: 'Registro propiedad',
      amount: -defaultCosts.registryFee,
      kind: 'cost',
      description: 'Inscripción registral'
    },
    {
      label: 'Impuestos',
      amount: -defaultCosts.taxes,
      percentage: -(defaultCosts.taxes / price) * 100,
      kind: 'tax',
      description: 'ITP y otros impuestos'
    },
    {
      label: 'Cancelación hipoteca',
      amount: -defaultCosts.mortgage,
      percentage: -(defaultCosts.mortgage / price) * 100,
      kind: 'cost',
      description: 'Hipoteca pendiente'
    }
  ];
  
  if (defaultCosts.other > 0) {
    items.push({
      label: 'Otros gastos',
      amount: -defaultCosts.other,
      kind: 'cost',
      description: 'Gastos adicionales'
    });
  }
  
  const totalDeductions = Object.values(defaultCosts).reduce((sum, cost) => sum + cost, 0) - defaultCosts.other;
  const netOwner = Math.max(0, price - totalDeductions);
  
  return {
    price,
    grossAmount: price,
    items,
    netOwner,
    effectiveYield: netOwner / price,
    breakdownByCategory: {
      fee: defaultCosts.agencyFee,
      cost: defaultCosts.notaryFee + defaultCosts.registryFee + defaultCosts.mortgage + defaultCosts.other,
      tax: defaultCosts.taxes,
      net: netOwner
    },
    lastUpdated: new Date().toISOString()
  };
};

/**
 * Fit elasticity curve to data points
 */
export const fitElasticity = (points: ElasticityPoint[]): {
  elasticityCoeff: number;
  r2Score: number;
  optimalPrice?: number;
} => {
  if (points.length < 3) {
    return { elasticityCoeff: -1, r2Score: 0 };
  }
  
  // Simple linear regression on log-log data
  const logPoints = points
    .filter(p => p.price > 0 && p.demand > 0)
    .map(p => ({ x: Math.log(p.price), y: Math.log(p.demand) }));
  
  const n = logPoints.length;
  const sumX = logPoints.reduce((sum, p) => sum + p.x, 0);
  const sumY = logPoints.reduce((sum, p) => sum + p.y, 0);
  const sumXY = logPoints.reduce((sum, p) => sum + p.x * p.y, 0);
  const sumX2 = logPoints.reduce((sum, p) => sum + p.x * p.x, 0);
  const sumY2 = logPoints.reduce((sum, p) => sum + p.y * p.y, 0);
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  
  // Calculate R²
  const yMean = sumY / n;
  const ssRes = logPoints.reduce((sum, p) => {
    const predicted = slope * p.x + intercept;
    return sum + Math.pow(p.y - predicted, 2);
  }, 0);
  const ssTot = logPoints.reduce((sum, p) => sum + Math.pow(p.y - yMean, 2), 0);
  const r2Score = ssTot === 0 ? 0 : 1 - (ssRes / ssTot);
  
  // Find optimal price (where marginal revenue equals marginal cost, simplified)
  const avgPrice = points.reduce((sum, p) => sum + p.price, 0) / points.length;
  const optimalPrice = Math.round(avgPrice * 0.95); // Simplified: 5% below average
  
  return {
    elasticityCoeff: slope,
    r2Score: Math.max(0, Math.min(1, r2Score)),
    optimalPrice
  };
};

/**
 * Calculate expected DOM from curve
 */
export const expectedDom = (price: number, curve: DomPoint[]): { p50: number; p90: number; p10?: number } => {
  if (curve.length === 0) {
    return { p50: 45, p90: 90 };
  }
  
  // Find closest points for interpolation
  const sorted = [...curve].sort((a, b) => a.price - b.price);
  
  let lower = sorted[0];
  let upper = sorted[sorted.length - 1];
  
  for (let i = 0; i < sorted.length - 1; i++) {
    if (price >= sorted[i].price && price <= sorted[i + 1].price) {
      lower = sorted[i];
      upper = sorted[i + 1];
      break;
    }
  }
  
  if (lower.price === upper.price) {
    return { p50: lower.p50, p90: lower.p90, p10: lower.p10 };
  }
  
  // Linear interpolation
  const ratio = (price - lower.price) / (upper.price - lower.price);
  const p50 = Math.round(lower.p50 + (upper.p50 - lower.p50) * ratio);
  const p90 = Math.round(lower.p90 + (upper.p90 - lower.p90) * ratio);
  const p10 = lower.p10 && upper.p10 ? Math.round(lower.p10 + (upper.p10 - lower.p10) * ratio) : undefined;
  
  return { p50, p90, p10 };
};

/**
 * Simulate offers distribution
 */
export const simulateOffers = (
  price: number,
  goal: Goal,
  constraints: Constraints
): {
  expectedOffers: number;
  avgOfferRatio: number;
  distribution: Array<{ range: string; probability: number; avgAmount: number }>;
} => {
  const baseRatio = goal === 'RAPIDEZ' ? 0.95 : goal === 'EQUILIBRIO' ? 0.92 : 0.88;
  const offerCount = goal === 'RAPIDEZ' ? 3.2 : goal === 'EQUILIBRIO' ? 2.1 : 1.4;
  
  const distribution = [
    {
      range: `${Math.round(price * 0.85)}-${Math.round(price * 0.90)}`,
      probability: goal === 'MAX_PRECIO' ? 0.35 : 0.25,
      avgAmount: Math.round(price * 0.875)
    },
    {
      range: `${Math.round(price * 0.90)}-${Math.round(price * 0.95)}`,
      probability: 0.45,
      avgAmount: Math.round(price * 0.925)
    },
    {
      range: `${Math.round(price * 0.95)}-${Math.round(price * 1.00)}`,
      probability: goal === 'RAPIDEZ' ? 0.25 : 0.20,
      avgAmount: Math.round(price * 0.975)
    },
    {
      range: `≥${Math.round(price)}`,
      probability: goal === 'RAPIDEZ' ? 0.05 : 0.02,
      avgAmount: Math.round(price * 1.02)
    }
  ];
  
  return {
    expectedOffers: offerCount,
    avgOfferRatio: baseRatio,
    distribution
  };
};

/**
 * Check for price filter cliffs
 */
export const avoidFilterCliffs = (
  price: number,
  increment: number = 1000
): { 
  isCliff: boolean; 
  suggestion?: number;
  cliffType?: 'search' | 'psychological';
  savings?: number;
} => {
  const searchCliffs = [50000, 100000, 150000, 200000, 250000, 300000, 400000, 500000, 750000, 1000000];
  const psychCliffs = [99000, 199000, 299000, 499000, 999000];
  
  // Check search filter cliffs
  for (const cliff of searchCliffs) {
    if (price > cliff && price < cliff + 10000) {
      return {
        isCliff: true,
        suggestion: cliff - increment,
        cliffType: 'search',
        savings: price - (cliff - increment)
      };
    }
  }
  
  // Check psychological price points
  for (const cliff of psychCliffs) {
    if (price > cliff && price < cliff + 5000) {
      return {
        isCliff: true,
        suggestion: cliff,
        cliffType: 'psychological',
        savings: price - cliff
      };
    }
  }
  
  return { isCliff: false };
};

/**
 * Format currency amounts
 */
export const formatMoney = (amount: number, currency: string = 'EUR', compact: boolean = false): string => {
  if (compact && amount >= 1000000) {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency,
      notation: 'compact',
      minimumFractionDigits: 0,
      maximumFractionDigits: 1,
    }).format(amount);
  }
  
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

/**
 * Format percentages
 */
export const formatPercent = (value: number, decimals: number = 1): string => {
  return new Intl.NumberFormat('es-ES', {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
};

/**
 * Format days
 */
export const formatDays = (days: number): string => {
  if (days < 7) {
    return `${days} día${days === 1 ? '' : 's'}`;
  } else if (days < 30) {
    const weeks = Math.round(days / 7);
    return `${weeks} semana${weeks === 1 ? '' : 's'}`;
  } else if (days < 365) {
    const months = Math.round(days / 30);
    return `${months} mes${months === 1 ? '' : 'es'}`;
  } else {
    const years = Math.round(days / 365 * 10) / 10;
    return `${years} año${years === 1 ? '' : 's'}`;
  }
};

/**
 * Get confidence level styling
 */
export const getConfidenceColor = (confidence: 'LOW' | 'MEDIUM' | 'HIGH'): string => {
  switch (confidence) {
    case 'HIGH':
      return 'text-green-700 bg-green-100';
    case 'MEDIUM':
      return 'text-yellow-700 bg-yellow-100';
    case 'LOW':
      return 'text-red-700 bg-red-100';
  }
};

/**
 * Get goal styling
 */
export const getGoalColor = (goal: Goal): string => {
  switch (goal) {
    case 'RAPIDEZ':
      return 'text-orange-700 bg-orange-100';
    case 'EQUILIBRIO':
      return 'text-blue-700 bg-blue-100';
    case 'MAX_PRECIO':
      return 'text-purple-700 bg-purple-100';
  }
};

/**
 * Get goal label in Spanish
 */
export const getGoalLabel = (goal: Goal): string => {
  switch (goal) {
    case 'RAPIDEZ':
      return 'Venta rápida';
    case 'EQUILIBRIO':
      return 'Equilibrio';
    case 'MAX_PRECIO':
      return 'Máximo precio';
  }
};

/**
 * Get status color for competitors
 */
export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'ACTIVE':
      return 'text-green-700 bg-green-100';
    case 'UNDER_OFFER':
      return 'text-blue-700 bg-blue-100';
    case 'SOLD':
      return 'text-gray-700 bg-gray-100';
    case 'WITHDRAWN':
      return 'text-red-700 bg-red-100';
    default:
      return 'text-gray-700 bg-gray-100';
  }
};

/**
 * Get status label in Spanish
 */
export const getStatusLabel = (status: string): string => {
  switch (status) {
    case 'ACTIVE':
      return 'Activo';
    case 'UNDER_OFFER':
      return 'Con oferta';
    case 'SOLD':
      return 'Vendido';
    case 'WITHDRAWN':
      return 'Retirado';
    default:
      return status;
  }
};

/**
 * Calculate price change percentage
 */
export const calculatePriceChange = (oldPrice: number, newPrice: number): number => {
  if (oldPrice === 0) return 0;
  return ((newPrice - oldPrice) / oldPrice) * 100;
};

/**
 * Calculate similarity score between properties
 */
export const calculatePropertySimilarity = (subject: Subject, competitor: CompetitorRecord): number => {
  let similarity = 1.0;
  
  // Area similarity (30% weight)
  const areaDiff = Math.abs(subject.area - competitor.area) / subject.area;
  similarity -= Math.min(areaDiff, 0.3) * 0.3;
  
  // Rooms similarity (20% weight)
  const roomsDiff = Math.abs(subject.rooms - competitor.rooms) / subject.rooms;
  similarity -= Math.min(roomsDiff, 0.2) * 0.2;
  
  // Property type match (25% weight)
  if (subject.propertyType !== competitor.propertyType) {
    similarity -= 0.25;
  }
  
  // Distance penalty (15% weight)
  const distanceKm = competitor.distance / 1000;
  const distancePenalty = Math.min(distanceKm / 2, 0.15); // Max penalty at 2km
  similarity -= distancePenalty;
  
  // Age similarity (10% weight)
  const currentYear = new Date().getFullYear();
  const subjectAge = currentYear - subject.buildingYear;
  const competitorAge = currentYear - (subject.buildingYear || currentYear); // Fallback if no data
  const ageDiff = Math.abs(subjectAge - competitorAge) / 50; // Normalize by 50 years
  similarity -= Math.min(ageDiff, 0.1) * 0.1;
  
  return Math.max(0, similarity);
};

/**
 * Generate price recommendation reasons
 */
export const generateRecommendationReasons = (
  price: number,
  subject: Subject,
  marketBands: MarketBands,
  competitors: CompetitorRecord[]
): string[] => {
  const reasons: string[] = [];
  const pricePerM2 = price / subject.area;
  const avgCompetitorPrice = competitors.length > 0 
    ? competitors.reduce((sum, c) => sum + c.price, 0) / competitors.length 
    : price;
  
  // Market position reason
  if (pricePerM2 <= marketBands.pricePerM2.p50) {
    reasons.push('Precio competitivo dentro del mercado local');
  } else if (pricePerM2 <= marketBands.pricePerM2.p75) {
    reasons.push('Posicionamiento en banda media-alta del mercado');
  } else {
    reasons.push('Precio premium justificado por características');
  }
  
  // Competition reason
  const competitorAdvantage = (price - avgCompetitorPrice) / avgCompetitorPrice * 100;
  if (competitorAdvantage < -5) {
    reasons.push('Ventaja competitiva significativa vs. similares');
  } else if (competitorAdvantage < 5) {
    reasons.push('Precio alineado con competencia directa');
  } else {
    reasons.push('Prima sobre competencia por valor añadido');
  }
  
  // Filter cliff check
  const cliffCheck = avoidFilterCliffs(price);
  if (!cliffCheck.isCliff) {
    reasons.push('Evita filtros de búsqueda críticos');
  }
  
  // Property features
  if (subject.features && subject.features.length > 2) {
    reasons.push('Justificado por características premium');
  }
  
  return reasons.slice(0, 3); // Limit to top 3 reasons
};

/**
 * Validate scenario consistency
 */
export const validateScenarioConsistency = (scenario: Scenario): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} => {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Price hierarchy
  if (scenario.anchorPrice < scenario.listPrice) {
    errors.push('Precio ancla debe ser mayor o igual al precio de lista');
  }
  
  if (scenario.listPrice < scenario.minAcceptable) {
    errors.push('Precio de lista debe ser mayor o igual al mínimo aceptable');
  }
  
  if (scenario.minAcceptable < scenario.constraints.minOwner) {
    errors.push('Mínimo aceptable debe ser mayor o igual al mínimo del propietario');
  }
  
  // Bank appraisal check
  if (scenario.constraints.bankAppraisal && scenario.listPrice > scenario.constraints.bankAppraisal * 1.25) {
    warnings.push('Precio de lista supera 125% de la tasación bancaria');
  }
  
  // Expected outcome consistency
  if (scenario.expectedOutcome.closeProb60d > 0.95 && scenario.expectedOutcome.domP50 > 30) {
    warnings.push('Alta probabilidad de cierre con DOM elevado es inconsistente');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

/**
 * Calculate optimal price steps for plan
 */
export const calculateOptimalPriceSteps = (
  startPrice: number,
  minPrice: number,
  targetDom: number,
  strategy: Goal
): Array<{ price: number; timing: number; reason: string }> => {
  const steps: Array<{ price: number; timing: number; reason: string }> = [];
  const totalReduction = startPrice - minPrice;
  
  if (totalReduction <= 0) {
    return steps;
  }
  
  let currentPrice = startPrice;
  let daysSinceStart = 0;
  
  // Strategy-specific parameters
  const stepParams = {
    'RAPIDEZ': { steps: 2, intervals: [15, 30], reductions: [0.03, 0.05] },
    'EQUILIBRIO': { steps: 3, intervals: [21, 45, 75], reductions: [0.025, 0.035, 0.05] },
    'MAX_PRECIO': { steps: 4, intervals: [30, 60, 90, 120], reductions: [0.02, 0.03, 0.04, 0.06] }
  };
  
  const params = stepParams[strategy];
  
  for (let i = 0; i < params.steps && currentPrice > minPrice; i++) {
    const reductionPct = params.reductions[i];
    const nextPrice = Math.max(minPrice, Math.round(currentPrice * (1 - reductionPct)));
    
    if (nextPrice < currentPrice) {
      daysSinceStart += params.intervals[i];
      
      steps.push({
        price: nextPrice,
        timing: daysSinceStart,
        reason: `Ajuste estratégico ${i + 1} - Respuesta al mercado`
      });
      
      currentPrice = nextPrice;
    }
  }
  
  return steps;
};

/**
 * Calculate channel-specific price with rules
 */
export const calculateChannelPrice = (basePrice: number, rule: ChannelRule): number => {
  let adjustedPrice = basePrice;
  
  // Apply margin
  if (rule.marginPct) {
    adjustedPrice = basePrice * (1 + rule.marginPct / 100);
  }
  
  // Apply rounding
  adjustedPrice = roundPrice(adjustedPrice, rule.rounding);
  
  // Ensure minimum step
  if (rule.minStep && adjustedPrice % rule.minStep !== 0) {
    adjustedPrice = Math.round(adjustedPrice / rule.minStep) * rule.minStep;
  }
  
  return adjustedPrice;
};

/**
 * Export utility functions
 */
export const generateCSVFromData = (data: any[], headers: string[]): string => {
  const csvHeaders = headers.join(',');
  const csvRows = data.map(row => 
    headers.map(header => {
      const value = row[header];
      // Escape commas and quotes in CSV
      if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value || '';
    }).join(',')
  );
  
  return [csvHeaders, ...csvRows].join('\n');
};

/**
 * Deep merge utility for complex objects
 */
export const deepMerge = <T extends Record<string, any>>(target: T, source: Partial<T>): T => {
  const result = { ...target };
  
  for (const key in source) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      result[key] = deepMerge(result[key] || {}, source[key] as any);
    } else {
      result[key] = source[key] as any;
    }
  }
  
  return result;
};

/**
 * Debounce utility for API calls
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
 * Generate unique IDs
 */
export const generateId = (prefix: string = 'id'): string => {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Calculate confidence intervals
 */
export const calculateConfidenceInterval = (
  values: number[],
  confidence: number = 0.95
): { mean: number; low: number; high: number; margin: number } => {
  if (values.length === 0) {
    return { mean: 0, low: 0, high: 0, margin: 0 };
  }
  
  const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
  const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / (values.length - 1);
  const stdDev = Math.sqrt(variance);
  
  // Simplified t-distribution approximation
  const tValue = confidence === 0.95 ? 1.96 : confidence === 0.90 ? 1.645 : 2.576;
  const margin = tValue * (stdDev / Math.sqrt(values.length));
  
  return {
    mean,
    low: mean - margin,
    high: mean + margin,
    margin
  };
};

/**
 * Format relative time
 */
export const formatRelativeTime = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - dateObj.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Hoy';
  if (diffDays === 1) return 'Ayer';
  if (diffDays < 7) return `Hace ${diffDays} días`;
  if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `Hace ${weeks} semana${weeks === 1 ? '' : 's'}`;
  }
  if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return `Hace ${months} mes${months === 1 ? '' : 'es'}`;
  }
  
  const years = Math.floor(diffDays / 365);
  return `Hace ${years} año${years === 1 ? '' : 's'}`;
};

/**
 * Validate Spanish postal code
 */
export const isValidPostalCode = (postalCode: string): boolean => {
  return /^\d{5}$/.test(postalCode);
};

/**
 * Calculate property appreciation
 */
export const calculateAppreciation = (
  initialPrice: number,
  currentPrice: number,
  years: number
): { totalReturn: number; annualReturn: number } => {
  const totalReturn = ((currentPrice - initialPrice) / initialPrice) * 100;
  const annualReturn = years > 0 ? Math.pow(currentPrice / initialPrice, 1 / years) - 1 : 0;
  
  return {
    totalReturn,
    annualReturn: annualReturn * 100
  };
};