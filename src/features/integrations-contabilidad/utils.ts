import type { CoaMapItem, LedgerLine, ProviderStatus } from "./types";

/**
 * Validate chart of accounts mapping completeness
 */
export const validateCoaMapping = (mappings: CoaMapItem[]): {
  isValid: boolean;
  missing: string[];
  invalid: string[];
} => {
  const requiredMappings = [
    { entity: "sales_fees", name: "Ventas - Honorarios" },
    { entity: "customers", name: "Clientes" },
    { entity: "banks", name: "Bancos" },
    { entity: "vat_output", name: "IVA Repercutido" },
    { entity: "vat_input", name: "IVA Soportado" },
  ];

  const mappedEntities = mappings.map(m => m.entity);
  const missing = requiredMappings
    .filter(req => !mappedEntities.includes(req.entity))
    .map(req => req.name);

  // Validate account codes (3-7 digits)
  const invalid = mappings
    .filter(m => !m.account.match(/^[0-9]{3,7}$/))
    .map(m => `${m.purpose}: ${m.account}`);

  return {
    isValid: missing.length === 0 && invalid.length === 0,
    missing,
    invalid,
  };
};

/**
 * Calculate IVA amount from base and rate
 */
export const ivaSplit = (totalAmount: number, ivaRate: number): {
  base: number;
  iva: number;
} => {
  const base = totalAmount / (1 + ivaRate / 100);
  const iva = totalAmount - base;
  
  return {
    base: Math.round(base * 100) / 100,
    iva: Math.round(iva * 100) / 100,
  };
};

/**
 * Calculate IRPF retention from base and rate
 */
export const irpfCalc = (baseAmount: number, irpfRate: number): number => {
  const retention = baseAmount * (irpfRate / 100);
  return Math.round(retention * 100) / 100;
};

/**
 * Check if ledger lines are balanced (debit = credit)
 */
export const balanceLines = (lines: LedgerLine[]): {
  balanced: boolean;
  totalDebit: number;
  totalCredit: number;
  difference: number;
} => {
  const totalDebit = lines.reduce((sum, line) => sum + line.debit, 0);
  const totalCredit = lines.reduce((sum, line) => sum + line.credit, 0);
  const difference = Math.abs(totalDebit - totalCredit);
  
  return {
    balanced: difference < 0.01, // Allow 1 cent tolerance for rounding
    totalDebit: Math.round(totalDebit * 100) / 100,
    totalCredit: Math.round(totalCredit * 100) / 100,
    difference: Math.round(difference * 100) / 100,
  };
};

/**
 * Format money amount with currency
 */
export const formatMoney = (amount: number, currency: string = 'EUR'): string => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

/**
 * Format percentage
 */
export const formatPercent = (value: number, decimals: number = 1): string => {
  return new Intl.NumberFormat('es-ES', {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value / 100);
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
      hour: '2-digit',
      minute: '2-digit',
    });
  }
  
  return dateObj.toLocaleDateString('es-ES');
};

/**
 * Mask sensitive information like API keys
 */
export const maskSecret = (secret: string, visibleChars: number = 4): string => {
  if (!secret || secret.length <= visibleChars) {
    return secret;
  }
  
  const visible = secret.slice(-visibleChars);
  const masked = '*'.repeat(secret.length - visibleChars);
  return masked + visible;
};

/**
 * Get provider status badge color
 */
export const getProviderStatusColor = (status: ProviderStatus): string => {
  switch (status) {
    case 'CONNECTED':
      return 'text-green-600 bg-green-100';
    case 'DISCONNECTED':
      return 'text-gray-600 bg-gray-100';
    case 'ERROR':
      return 'text-red-600 bg-red-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
};

/**
 * Get provider status text
 */
export const getProviderStatusText = (status: ProviderStatus): string => {
  switch (status) {
    case 'CONNECTED':
      return 'Conectado';
    case 'DISCONNECTED':
      return 'Desconectado';
    case 'ERROR':
      return 'Error';
    default:
      return 'Desconocido';
  }
};

/**
 * Get job status badge color
 */
export const getJobStatusColor = (status: string): string => {
  switch (status) {
    case 'ok':
      return 'text-green-600 bg-green-100';
    case 'pending':
      return 'text-yellow-600 bg-yellow-100';
    case 'error':
      return 'text-red-600 bg-red-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
};

/**
 * Get job status text
 */
export const getJobStatusText = (status: string): string => {
  switch (status) {
    case 'ok':
      return 'Exitoso';
    case 'pending':
      return 'Pendiente';
    case 'error':
      return 'Error';
    default:
      return 'Desconocido';
  }
};

/**
 * Validate Spanish VAT number (NIF/CIF)
 */
export const validateVatNumber = (vat: string): boolean => {
  // Basic Spanish NIF/CIF validation
  const cleanVat = vat.replace(/[^A-Z0-9]/g, '');
  
  // NIF format: 8 digits + 1 letter
  const nifRegex = /^[0-9]{8}[TRWAGMYFPDXBNJZSQVHLCKE]$/;
  
  // CIF format: 1 letter + 7 digits + 1 letter/digit
  const cifRegex = /^[ABCDEFGHJNPQRSUVW][0-9]{7}[0-9A-J]$/;
  
  return nifRegex.test(cleanVat) || cifRegex.test(cleanVat);
};

/**
 * Validate Spanish IBAN
 */
export const validateSpanishIban = (iban: string): boolean => {
  const cleanIban = iban.replace(/\s/g, '');
  
  // Spanish IBAN: ES + 2 check digits + 20 characters
  if (!cleanIban.match(/^ES\d{22}$/)) {
    return false;
  }
  
  // Basic IBAN checksum validation (simplified)
  return cleanIban.length === 24;
};

/**
 * Generate account code suggestions based on Spanish chart of accounts
 */
export const suggestAccountCode = (entity: string): string[] => {
  const suggestions: Record<string, string[]> = {
    sales_fees: ['70500', '70501', '70502'], // Prestaciones de servicios
    rental_income: ['75100', '75200'], // Ingresos por arrendamientos
    customers: ['43000', '43100'], // Clientes
    suppliers: ['40000', '40001'], // Proveedores
    banks: ['57200', '57210'], // Bancos c/c vista
    cash: ['57000'], // Caja
    vat_output: ['47700'], // IVA repercutido
    vat_input: ['47200'], // IVA soportado
    irpf_retention: ['47300'], // Hacienda Pública, retenciones
    expenses: ['62900', '62000'], // Otros gastos de explotación
    depreciation: ['68100'], // Amortización del inmovilizado
  };
  
  return suggestions[entity] || [];
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
 * Calculate exchange rate difference
 */
export const calculateExchangeDifference = (
  amount: number,
  originalRate: number,
  currentRate: number,
  baseCurrency: string = 'EUR'
): number => {
  const originalAmount = amount * originalRate;
  const currentAmount = amount * currentRate;
  return Math.round((currentAmount - originalAmount) * 100) / 100;
};

/**
 * Round amount according to policy
 */
export const roundAmount = (amount: number, policy: 'STANDARD' | 'UP' | 'DOWN'): number => {
  switch (policy) {
    case 'UP':
      return Math.ceil(amount * 100) / 100;
    case 'DOWN':
      return Math.floor(amount * 100) / 100;
    case 'STANDARD':
    default:
      return Math.round(amount * 100) / 100;
  }
};

/**
 * Validate date range
 */
export const validateDateRange = (from: string, to: string): {
  valid: boolean;
  error?: string;
} => {
  const fromDate = new Date(from);
  const toDate = new Date(to);
  const now = new Date();
  
  if (fromDate > toDate) {
    return { valid: false, error: 'La fecha desde debe ser anterior a la fecha hasta' };
  }
  
  if (toDate > now) {
    return { valid: false, error: 'La fecha hasta no puede ser futura' };
  }
  
  const daysDiff = Math.ceil((toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24));
  if (daysDiff > 365) {
    return { valid: false, error: 'El rango no puede ser mayor a 365 días' };
  }
  
  return { valid: true };
};

/**
 * Generate fiscal periods for Spain
 */
export const generateFiscalPeriods = (year: number): Array<{ id: string; name: string; from: string; to: string }> => {
  return [
    {
      id: `${year}-Q1`,
      name: `${year} - 1er Trimestre`,
      from: `${year}-01-01`,
      to: `${year}-03-31`,
    },
    {
      id: `${year}-Q2`,
      name: `${year} - 2do Trimestre`,
      from: `${year}-04-01`,
      to: `${year}-06-30`,
    },
    {
      id: `${year}-Q3`,
      name: `${year} - 3er Trimestre`,
      from: `${year}-07-01`,
      to: `${year}-09-30`,
    },
    {
      id: `${year}-Q4`,
      name: `${year} - 4to Trimestre`,
      from: `${year}-10-01`,
      to: `${year}-12-31`,
    },
  ];
};

/**
 * Parse CSV content
 */
export const parseCsv = (content: string, delimiter: string = ','): string[][] => {
  const lines = content.trim().split('\n');
  return lines.map(line => {
    const values = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === delimiter && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    values.push(current.trim());
    return values;
  });
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
 * Calculate sync progress percentage
 */
export const calculateSyncProgress = (job: {
  results?: {
    processed: number;
    succeeded: number;
    failed: number;
    skipped: number;
  };
}): number => {
  if (!job.results) return 0;
  
  const { processed, succeeded, failed, skipped } = job.results;
  const total = processed || (succeeded + failed + skipped);
  
  if (total === 0) return 0;
  
  return Math.round(((succeeded + failed + skipped) / total) * 100);
};

/**
 * Format duration in milliseconds to human readable
 */
export const formatDuration = (ms: number): string => {
  if (ms < 1000) return `${ms}ms`;
  
  const seconds = Math.floor(ms / 1000);
  if (seconds < 60) return `${seconds}s`;
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  return `${minutes}m ${remainingSeconds}s`;
};

/**
 * Validate account code format for Spanish chart of accounts
 */
export const isValidAccountCode = (code: string): boolean => {
  return /^[0-9]{3,7}$/.test(code);
};

/**
 * Get account type from code (Spanish chart of accounts)
 */
export const getAccountType = (code: string): string => {
  if (!code) return 'unknown';
  
  const firstDigit = code.charAt(0);
  
  switch (firstDigit) {
    case '1': return 'Financiación básica';
    case '2': return 'Inmovilizado';
    case '3': return 'Existencias';
    case '4': return 'Acreedores y deudores';
    case '5': return 'Cuentas financieras';
    case '6': return 'Compras y gastos';
    case '7': return 'Ventas e ingresos';
    case '8': return 'Gastos imputados';
    case '9': return 'Ingresos imputados';
    default: return 'Desconocido';
  }
};