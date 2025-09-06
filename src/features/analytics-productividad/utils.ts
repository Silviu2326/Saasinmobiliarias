import { LeaderboardRow, PipelineLoad, CapacitySuggestion } from './types';

// Statistical utilities
export const median = (arr: number[]): number => {
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  
  return sorted.length % 2 === 0 
    ? (sorted[mid - 1] + sorted[mid]) / 2 
    : sorted[mid];
};

export const p90 = (arr: number[]): number => {
  const sorted = [...arr].sort((a, b) => a - b);
  const index = Math.ceil(sorted.length * 0.9) - 1;
  return sorted[Math.max(0, index)];
};

export const p95 = (arr: number[]): number => {
  const sorted = [...arr].sort((a, b) => a - b);
  const index = Math.ceil(sorted.length * 0.95) - 1;
  return sorted[Math.max(0, index)];
};

export const average = (arr: number[]): number => {
  return arr.length > 0 ? arr.reduce((sum, val) => sum + val, 0) / arr.length : 0;
};

// Formatting utilities
export const formatDurationH = (hours: number): string => {
  if (hours < 1) {
    const minutes = Math.round(hours * 60);
    return `${minutes}min`;
  } else if (hours < 24) {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return m > 0 ? `${h}h ${m}min` : `${h}h`;
  } else {
    const days = Math.floor(hours / 24);
    const h = Math.floor(hours % 24);
    return h > 0 ? `${days}d ${h}h` : `${days}d`;
  }
};

export const formatDays = (days: number): string => {
  if (days < 1) {
    const hours = Math.round(days * 24);
    return `${hours}h`;
  } else {
    const d = Math.floor(days);
    const h = Math.round((days - d) * 24);
    return h > 0 ? `${d}d ${h}h` : `${d}d`;
  }
};

export const formatPct = (value: number, decimals = 1): string => {
  return `${value.toFixed(decimals)}%`;
};

export const formatNumber = (value: number, decimals = 0): string => {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  } else if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  } else {
    return value.toFixed(decimals);
  }
};

export const formatCurrency = (value: number, currency = '€'): string => {
  return `${formatNumber(value)}${currency}`;
};

// Date utilities
export const formatDateShort = (date: string | Date): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
};

export const formatDateTime = (date: string | Date): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('es-ES', { 
    day: '2-digit', 
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const getDateRange = (days: number): { from: string; to: string } => {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - days);
  
  return {
    from: from.toISOString().split('T')[0],
    to: to.toISOString().split('T')[0]
  };
};

// Agent scoring and ranking
export const scoreAgent = (row: LeaderboardRow): number => {
  // Composite score: activity (40%) + SLA (30%) + results (30%)
  const activityScore = Math.min(row.activities / 300 * 100, 100); // Normalize to max 300 activities
  const slaScore = row.slaPct;
  const resultsScore = Math.min((row.offers * 2 + row.contracts * 5) / 50 * 100, 100); // Normalize
  
  return Math.round(activityScore * 0.4 + slaScore * 0.3 + resultsScore * 0.3);
};

export const getRankingBadge = (position: number): { color: string; label: string } => {
  if (position === 1) return { color: 'bg-yellow-100 text-yellow-800', label: '🥇' };
  if (position === 2) return { color: 'bg-gray-100 text-gray-800', label: '🥈' };
  if (position === 3) return { color: 'bg-orange-100 text-orange-800', label: '🥉' };
  return { color: 'bg-blue-100 text-blue-800', label: `#${position}` };
};

// Workload and capacity
export const detectOverload = (pipelineLoad: PipelineLoad): boolean => {
  // Overload criteria
  const MAX_ACTIVE_LEADS = 60;
  const MAX_OPEN_DEALS = 15;
  const MAX_AVG_AGE_DAYS = 21;
  
  return pipelineLoad.activeLeads > MAX_ACTIVE_LEADS || 
         pipelineLoad.openDeals > MAX_OPEN_DEALS ||
         pipelineLoad.avgAgeDays > MAX_AVG_AGE_DAYS;
};

export const calculateCapacityScore = (load: PipelineLoad): number => {
  // Score from 0-100, where 70-80 is optimal
  const leadWeight = Math.min(load.activeLeads / 50, 1.5); // Max at 50 leads
  const dealWeight = Math.min(load.openDeals / 12, 1.5); // Max at 12 deals
  const ageWeight = Math.min(load.avgAgeDays / 14, 1.5); // Max at 14 days
  
  const rawScore = (leadWeight + dealWeight + ageWeight) / 3 * 100;
  return Math.min(Math.max(rawScore, 0), 100);
};

export const suggestRebalance = (
  loads: PipelineLoad[], 
  targetPerAgent = 40
): CapacitySuggestion[] => {
  const suggestions: CapacitySuggestion[] = [];
  
  // Find overloaded and underloaded agents
  const overloaded = loads.filter(l => l.activeLeads > targetPerAgent + 15);
  const underloaded = loads.filter(l => l.activeLeads < targetPerAgent - 10);
  
  // Create suggestions
  overloaded.forEach(over => {
    const excess = over.activeLeads - targetPerAgent;
    
    underloaded.forEach(under => {
      const capacity = targetPerAgent - under.activeLeads;
      const toMove = Math.min(excess, capacity, 20); // Max 20 leads per move
      
      if (toMove >= 5) { // Minimum 5 leads to justify move
        suggestions.push({
          moveFrom: over.agentName,
          moveTo: under.agentName,
          leads: toMove,
          reason: `${over.agentName} tiene ${over.activeLeads} leads vs. ${under.agentName} con ${under.activeLeads}. Equilibrar carga.`
        });
      }
    });
  });
  
  return suggestions.slice(0, 5); // Max 5 suggestions
};

// Performance indicators
export const getPerformanceLevel = (score: number): {
  level: 'excellent' | 'good' | 'average' | 'poor';
  color: string;
  label: string;
} => {
  if (score >= 90) return { level: 'excellent', color: 'text-green-600', label: 'Excelente' };
  if (score >= 75) return { level: 'good', color: 'text-blue-600', label: 'Bueno' };
  if (score >= 60) return { level: 'average', color: 'text-yellow-600', label: 'Regular' };
  return { level: 'poor', color: 'text-red-600', label: 'Mejorable' };
};

export const getSlaStatus = (percentage: number): {
  status: 'success' | 'warning' | 'danger';
  color: string;
  label: string;
} => {
  if (percentage >= 95) return { status: 'success', color: 'text-green-600', label: 'Excelente' };
  if (percentage >= 85) return { status: 'warning', color: 'text-yellow-600', label: 'Advertencia' };
  return { status: 'danger', color: 'text-red-600', label: 'Crítico' };
};

// Data transformation utilities
export const groupByPeriod = <T extends { date: string }>(
  data: T[], 
  groupBy: 'day' | 'week' | 'month'
): T[] => {
  if (groupBy === 'day') return data;
  
  const grouped = new Map<string, T[]>();
  
  data.forEach(item => {
    const date = new Date(item.date);
    let key: string;
    
    if (groupBy === 'week') {
      const startOfWeek = new Date(date);
      startOfWeek.setDate(date.getDate() - date.getDay());
      key = startOfWeek.toISOString().split('T')[0];
    } else { // month
      key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-01`;
    }
    
    if (!grouped.has(key)) {
      grouped.set(key, []);
    }
    grouped.get(key)!.push(item);
  });
  
  // Aggregate grouped data (this would need to be customized per data type)
  return Array.from(grouped.entries()).map(([date, items]) => ({
    ...items[0],
    date,
    // Add aggregation logic here based on data type
  }));
};

// Color utilities for charts and heatmaps
export const getHeatmapColor = (intensity: number, maxIntensity: number): string => {
  const ratio = Math.min(intensity / maxIntensity, 1);
  
  if (ratio < 0.2) return 'bg-blue-50';
  if (ratio < 0.4) return 'bg-blue-100';
  if (ratio < 0.6) return 'bg-blue-200';
  if (ratio < 0.8) return 'bg-blue-300';
  return 'bg-blue-400';
};

export const getTrendColor = (value: number): string => {
  if (value > 0) return 'text-green-600';
  if (value < 0) return 'text-red-600';
  return 'text-gray-600';
};

export const getTrendIcon = (value: number): string => {
  if (value > 0) return '↑';
  if (value < 0) return '↓';
  return '→';
};

// Validation utilities
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^[+]?[\d\s\-\(\)]{9,}$/;
  return phoneRegex.test(phone);
};

export const sanitizeFilename = (filename: string): string => {
  return filename.replace(/[^a-z0-9_\-\.]/gi, '_').toLowerCase();
};