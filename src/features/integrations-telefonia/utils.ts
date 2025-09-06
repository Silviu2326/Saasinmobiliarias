import type { QualityStats } from "./types";

/**
 * Convert a string to E.164 format
 */
export const toE164 = (phone: string): string => {
  // Remove all non-numeric characters except +
  const cleaned = phone.replace(/[^\d+]/g, '');
  
  // If it already starts with +, return as is (after validation)
  if (cleaned.startsWith('+')) {
    return cleaned;
  }
  
  // Add + prefix if missing
  return `+${cleaned}`;
};

/**
 * Mask phone number for privacy
 */
export const maskPhone = (phone: string, visibleDigits: number = 4): string => {
  if (!phone || phone.length <= visibleDigits) {
    return phone;
  }
  
  const visible = phone.slice(-visibleDigits);
  const masked = '*'.repeat(phone.length - visibleDigits);
  return masked + visible;
};

/**
 * Format duration in seconds to human readable format
 */
export const formatDuration = (seconds: number): string => {
  if (seconds < 60) {
    return `${seconds}s`;
  }
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  if (minutes < 60) {
    return `${minutes}m ${remainingSeconds}s`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  return `${hours}h ${remainingMinutes}m ${remainingSeconds}s`;
};

/**
 * Format money amount
 */
export const formatMoney = (amount: number, currency: string = '€'): string => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: currency === '€' ? 'EUR' : 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

/**
 * Format large numbers with K, M suffixes
 */
export const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

/**
 * Score quality metrics and return badge color
 */
export const scoreQuality = (stats: {
  asr?: number;
  mos?: number;
  jitterMs?: number;
  dropPct?: number;
}): 'green' | 'yellow' | 'red' => {
  const { asr = 0, mos = 0, jitterMs = 100, dropPct = 100 } = stats;
  
  // Critical thresholds
  if (asr < 60 || mos < 3.0 || jitterMs > 50 || dropPct > 5) {
    return 'red';
  }
  
  // Warning thresholds
  if (asr < 80 || mos < 3.5 || jitterMs > 30 || dropPct > 2) {
    return 'yellow';
  }
  
  return 'green';
};

/**
 * Get quality score description
 */
export const getQualityDescription = (stats: {
  asr?: number;
  mos?: number;
  jitterMs?: number;
  dropPct?: number;
}): string => {
  const score = scoreQuality(stats);
  
  switch (score) {
    case 'green':
      return 'Excelente calidad';
    case 'yellow':
      return 'Calidad aceptable';
    case 'red':
      return 'Calidad deficiente';
    default:
      return 'Sin datos';
  }
};

/**
 * Validate flow JSON structure for loops
 */
export const validateFlow = (flowJson: { nodes: any[]; edges: any[] }): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];
  
  if (!flowJson.nodes || !flowJson.edges) {
    errors.push('Flow debe tener nodos y conexiones');
    return { isValid: false, errors };
  }
  
  const nodeIds = new Set(flowJson.nodes.map(n => n.id));
  const edges = flowJson.edges;
  
  // Validate all edge references exist
  for (const edge of edges) {
    if (!nodeIds.has(edge.source)) {
      errors.push(`Nodo origen '${edge.source}' no existe`);
    }
    if (!nodeIds.has(edge.target)) {
      errors.push(`Nodo destino '${edge.target}' no existe`);
    }
  }
  
  // Simple cycle detection using DFS
  const visited = new Set<string>();
  const recursionStack = new Set<string>();
  
  function hasCycle(nodeId: string): boolean {
    if (recursionStack.has(nodeId)) return true;
    if (visited.has(nodeId)) return false;
    
    visited.add(nodeId);
    recursionStack.add(nodeId);
    
    const outgoingEdges = edges.filter(e => e.source === nodeId);
    for (const edge of outgoingEdges) {
      if (hasCycle(edge.target)) return true;
    }
    
    recursionStack.delete(nodeId);
    return false;
  }
  
  for (const nodeId of nodeIds) {
    if (!visited.has(nodeId) && hasCycle(nodeId)) {
      errors.push('El flujo contiene bucles infinitos');
      break;
    }
  }
  
  return { isValid: errors.length === 0, errors };
};

/**
 * Convert filters object to URL query string
 */
export const filtersToQuery = (filters: Record<string, any>): string => {
  const params = new URLSearchParams();
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      if (Array.isArray(value)) {
        value.forEach(v => params.append(key, v));
      } else {
        params.append(key, value.toString());
      }
    }
  });
  
  return params.toString();
};

/**
 * Parse URL query string to filters object
 */
export const queryToFilters = (query: string): Record<string, any> => {
  const params = new URLSearchParams(query);
  const filters: Record<string, any> = {};
  
  for (const [key, value] of params.entries()) {
    if (filters[key]) {
      // Handle multiple values for the same key
      if (Array.isArray(filters[key])) {
        filters[key].push(value);
      } else {
        filters[key] = [filters[key], value];
      }
    } else {
      filters[key] = value;
    }
  }
  
  return filters;
};

/**
 * Normalize phone number variations for search
 */
export const normalizePhoneForSearch = (phone: string): string[] => {
  if (!phone) return [];
  
  const cleaned = phone.replace(/[^\d+]/g, '');
  const variations = [cleaned];
  
  // Add with/without + prefix
  if (cleaned.startsWith('+')) {
    variations.push(cleaned.substring(1));
  } else {
    variations.push(`+${cleaned}`);
  }
  
  // Add formatted versions (Spain specific)
  if (cleaned.startsWith('+34') || cleaned.startsWith('34')) {
    const number = cleaned.replace(/^\+?34/, '');
    variations.push(`+34${number}`);
    variations.push(`34${number}`);
    variations.push(number);
  }
  
  return [...new Set(variations)];
};

/**
 * Get status badge color for provider status
 */
export const getProviderStatusColor = (status: string): string => {
  switch (status) {
    case 'CONNECTED':
      return 'text-green-600 bg-green-100';
    case 'DISCONNECTED':
      return 'text-gray-600 bg-gray-100';
    case 'TOKEN_EXPIRED':
      return 'text-yellow-600 bg-yellow-100';
    case 'ERROR':
      return 'text-red-600 bg-red-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
};

/**
 * Get status text for provider status
 */
export const getProviderStatusText = (status: string): string => {
  switch (status) {
    case 'CONNECTED':
      return 'Conectado';
    case 'DISCONNECTED':
      return 'Desconectado';
    case 'TOKEN_EXPIRED':
      return 'Token expirado';
    case 'ERROR':
      return 'Error';
    default:
      return 'Desconocido';
  }
};

/**
 * Get call status badge color
 */
export const getCallStatusColor = (status: string): string => {
  switch (status) {
    case 'answered':
      return 'text-green-600 bg-green-100';
    case 'busy':
      return 'text-yellow-600 bg-yellow-100';
    case 'no_answer':
      return 'text-gray-600 bg-gray-100';
    case 'failed':
      return 'text-red-600 bg-red-100';
    case 'sent':
      return 'text-blue-600 bg-blue-100';
    case 'received':
      return 'text-green-600 bg-green-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
};

/**
 * Get call status text
 */
export const getCallStatusText = (status: string): string => {
  switch (status) {
    case 'answered':
      return 'Respondida';
    case 'busy':
      return 'Ocupado';
    case 'no_answer':
      return 'No respuesta';
    case 'failed':
      return 'Fallida';
    case 'sent':
      return 'Enviado';
    case 'received':
      return 'Recibido';
    default:
      return 'Desconocido';
  }
};

/**
 * Get channel icon for display
 */
export const getChannelIcon = (channel: string): string => {
  switch (channel) {
    case 'CALL':
      return '📞';
    case 'SMS':
      return '💬';
    case 'WHATSAPP':
      return '💚';
    default:
      return '❓';
  }
};

/**
 * Generate random ID
 */
export const generateId = (prefix: string = 'id'): string => {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
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
 * Check if date is within business hours
 */
export const isBusinessHours = (
  date: Date,
  schedule: { open: string; close: string; enabled: boolean }
): boolean => {
  if (!schedule.enabled) return false;
  
  const timeStr = date.toTimeString().substr(0, 5); // HH:MM format
  return timeStr >= schedule.open && timeStr <= schedule.close;
};

/**
 * Get next business day
 */
export const getNextBusinessDay = (date: Date, weekSchedule: Record<string, any>): Date => {
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const nextDay = new Date(date);
  nextDay.setDate(nextDay.getDate() + 1);
  
  let attempts = 0;
  while (attempts < 7) {
    const dayName = days[nextDay.getDay()];
    if (weekSchedule[dayName]?.enabled) {
      return nextDay;
    }
    nextDay.setDate(nextDay.getDate() + 1);
    attempts++;
  }
  
  return nextDay; // fallback
};

/**
 * Validate webhook URL
 */
export const isValidWebhookUrl = (url: string): boolean => {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:' && parsed.hostname !== 'localhost';
  } catch {
    return false;
  }
};

/**
 * Extract variables from SMS template body
 */
export const extractTemplateVariables = (body: string): string[] => {
  const matches = Array.from(body.matchAll(/\{\{(\w+)\}\}/g));
  return [...new Set(matches.map(m => m[1]))];
};

/**
 * Replace variables in SMS template
 */
export const replaceTemplateVariables = (
  body: string,
  variables: Record<string, string>
): string => {
  let result = body;
  Object.entries(variables).forEach(([key, value]) => {
    result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value);
  });
  return result;
};

/**
 * Calculate SLA compliance percentage
 */
export const calculateSLA = (
  actualTime: number,
  slaThreshold: number
): { percentage: number; status: 'excellent' | 'good' | 'warning' | 'critical' } => {
  const percentage = Math.min(100, Math.max(0, (1 - actualTime / slaThreshold) * 100));
  
  let status: 'excellent' | 'good' | 'warning' | 'critical';
  if (percentage >= 95) status = 'excellent';
  else if (percentage >= 80) status = 'good';
  else if (percentage >= 60) status = 'warning';
  else status = 'critical';
  
  return { percentage, status };
};