import { EidasLevel, ProviderStatus, EnvelopeStatus, Template, Signer } from './types';

// Hash utilities
export const computeHash = (data: string | File): string => {
  // Simulated SHA-256 hash
  let hash = 0;
  const str = typeof data === 'string' ? data : data.name + data.size;
  
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  const hashHex = Math.abs(hash).toString(16).padStart(8, '0');
  return `sha256:${hashHex}${'0'.repeat(56)}...`;
};

export const verifyHash = (document: string | File, expectedHash: string): boolean => {
  const actualHash = computeHash(document);
  return actualHash === expectedHash;
};

// Template utilities
export const renderTemplate = (template: string, data: Record<string, any>): { rendered: string; missing: string[] } => {
  const missing: string[] = [];
  
  const rendered = template.replace(/\{\{([^}]+)\}\}/g, (match, variable) => {
    const trimmedVar = variable.trim();
    const value = getNestedValue(data, trimmedVar);
    
    if (value === undefined || value === null) {
      missing.push(trimmedVar);
      return `{{${trimmedVar}}}`; // Keep placeholder if missing
    }
    
    return String(value);
  });
  
  return { rendered, missing };
};

const getNestedValue = (obj: Record<string, any>, path: string): any => {
  return path.split('.').reduce((current, key) => current?.[key], obj);
};

export const extractTemplateVariables = (content: string): string[] => {
  const variables: string[] = [];
  const variableRegex = /\{\{([^}]+)\}\}/g;
  let match;
  
  while ((match = variableRegex.exec(content)) !== null) {
    const variable = match[1].trim();
    if (!variables.includes(variable)) {
      variables.push(variable);
    }
  }
  
  return variables;
};

// Security utilities
export const maskSecret = (secret: string, visibleChars = 4): string => {
  if (!secret || secret.length <= visibleChars * 2) {
    return '*'.repeat(secret?.length || 8);
  }
  
  const start = secret.substring(0, visibleChars);
  const end = secret.substring(secret.length - visibleChars);
  const middle = '*'.repeat(secret.length - (visibleChars * 2));
  
  return `${start}${middle}${end}`;
};

export const generateSecret = (length = 32): string => {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  
  for (let i = 0; i < length; i++) {
    result += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  
  return result;
};

// Formatting utilities
export const formatEidas = (level: EidasLevel): { label: string; color: string; description: string } => {
  const formats = {
    SES: {
      label: 'SES',
      color: 'bg-blue-100 text-blue-800',
      description: 'Firma Electrónica Simple'
    },
    AES: {
      label: 'AES', 
      color: 'bg-green-100 text-green-800',
      description: 'Firma Electrónica Avanzada'
    },
    QES: {
      label: 'QES',
      color: 'bg-purple-100 text-purple-800', 
      description: 'Firma Electrónica Cualificada'
    }
  };
  
  return formats[level];
};

export const statusColor = (status: ProviderStatus | EnvelopeStatus): string => {
  const colors = {
    // Provider status
    DISCONNECTED: 'bg-gray-100 text-gray-800',
    CONNECTED: 'bg-green-100 text-green-800',
    TOKEN_EXPIRED: 'bg-yellow-100 text-yellow-800',
    ERROR: 'bg-red-100 text-red-800',
    
    // Envelope status
    draft: 'bg-gray-100 text-gray-800',
    sent: 'bg-blue-100 text-blue-800',
    viewed: 'bg-yellow-100 text-yellow-800',
    signed: 'bg-green-100 text-green-800',
    declined: 'bg-red-100 text-red-800',
    expired: 'bg-orange-100 text-orange-800',
    canceled: 'bg-gray-100 text-gray-800',
    pending: 'bg-gray-100 text-gray-800'
  };
  
  return colors[status] || 'bg-gray-100 text-gray-800';
};

export const formatDateTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleString('es-ES', {
    year: 'numeric',
    month: '2-digit', 
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const formatDateShort = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit'
  });
};

export const formatTimeAgo = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  
  if (diffDays > 0) return `hace ${diffDays} día${diffDays > 1 ? 's' : ''}`;
  if (diffHours > 0) return `hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
  if (diffMinutes > 0) return `hace ${diffMinutes} minuto${diffMinutes > 1 ? 's' : ''}`;
  return 'hace un momento';
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Signer utilities
export const normalizeSigner = (signer: Partial<Signer>, order: number): Signer => {
  return {
    name: signer.name || '',
    email: signer.email || '',
    phone: signer.phone,
    role: signer.role || 'CLIENTE',
    auth: signer.auth || 'EMAIL',
    order: signer.order || order,
    ...signer
  };
};

export const validateSignerOrder = (signers: Signer[]): boolean => {
  const orders = signers.map(s => s.order).sort((a, b) => a - b);
  
  for (let i = 0; i < orders.length; i++) {
    if (orders[i] !== i + 1) {
      return false;
    }
  }
  
  return true;
};

export const reorderSigners = (signers: Signer[]): Signer[] => {
  return signers.map((signer, index) => ({
    ...signer,
    order: index + 1
  }));
};

// Provider utilities
export const getProviderLogo = (providerId: string): string => {
  const logos: Record<string, string> = {
    signaturit: '/logos/signaturit.svg',
    docusign: '/logos/docusign.svg',
    'adobe-sign': '/logos/adobe.svg',
    uanataca: '/logos/uanataca.svg'
  };
  
  return logos[providerId] || '/logos/default-provider.svg';
};

export const getProviderDisplayName = (providerId: string): string => {
  const names: Record<string, string> = {
    signaturit: 'Signaturit',
    docusign: 'DocuSign',
    'adobe-sign': 'Adobe Sign',
    uanataca: 'Uanataca'
  };
  
  return names[providerId] || providerId;
};

// Credits utilities
export const calculateCreditsUsagePercentage = (used: number, total: number): number => {
  if (total === 0) return 0;
  return Math.round((used / total) * 100);
};

export const shouldShowCreditsAlert = (current: number, threshold: number): boolean => {
  return current <= threshold;
};

export const estimateCreditsForMonth = (dailyAverage: number): number => {
  const today = new Date();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  return Math.ceil(dailyAverage * daysInMonth);
};

// Validation utilities
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidPhoneE164 = (phone: string): boolean => {
  const e164Regex = /^\+?[1-9]\d{1,14}$/;
  return e164Regex.test(phone);
};

export const isValidUrl = (url: string, requireHttps = false): boolean => {
  try {
    const parsed = new URL(url);
    if (requireHttps) {
      return parsed.protocol === 'https:';
    }
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
};

export const isValidHexColor = (color: string): boolean => {
  const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
  return hexRegex.test(color);
};

// File utilities
export const getFileExtension = (filename: string): string => {
  return filename.split('.').pop()?.toLowerCase() || '';
};

export const isValidDocumentType = (filename: string): boolean => {
  const validExtensions = ['pdf', 'doc', 'docx', 'odt'];
  return validExtensions.includes(getFileExtension(filename));
};

export const downloadBlob = (blob: Blob, filename: string): void => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Template placeholders
export const getCommonPlaceholders = (): string[] => {
  return [
    'cliente.nombre',
    'cliente.email', 
    'cliente.telefono',
    'cliente.dni',
    'cliente.direccion',
    'propietario.nombre',
    'propietario.email',
    'propietario.dni',
    'propiedad.ref',
    'propiedad.direccion',
    'propiedad.superficie',
    'propiedad.precio',
    'agencia.nombre',
    'agencia.cif',
    'agencia.direccion',
    'fecha.hoy',
    'fecha.expiracion'
  ];
};

export const getPlaceholderDescription = (placeholder: string): string => {
  const descriptions: Record<string, string> = {
    'cliente.nombre': 'Nombre completo del cliente',
    'cliente.email': 'Email del cliente',
    'cliente.telefono': 'Teléfono del cliente', 
    'cliente.dni': 'DNI/NIE del cliente',
    'cliente.direccion': 'Dirección del cliente',
    'propietario.nombre': 'Nombre completo del propietario',
    'propietario.email': 'Email del propietario',
    'propietario.dni': 'DNI/NIE del propietario',
    'propiedad.ref': 'Referencia de la propiedad',
    'propiedad.direccion': 'Dirección de la propiedad',
    'propiedad.superficie': 'Superficie en m²',
    'propiedad.precio': 'Precio de la propiedad',
    'agencia.nombre': 'Nombre de la agencia',
    'agencia.cif': 'CIF de la agencia',
    'agencia.direccion': 'Dirección de la agencia',
    'fecha.hoy': 'Fecha actual',
    'fecha.expiracion': 'Fecha de expiración'
  };
  
  return descriptions[placeholder] || placeholder;
};

// Error handling utilities
export const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'An unknown error occurred';
};

export const formatApiError = (error: any): string => {
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }
  if (error?.message) {
    return error.message;
  }
  return 'Error de conexión con el servidor';
};

// Copy utilities
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback for older browsers
    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      return true;
    } catch {
      return false;
    }
  }
};

// Debounce utility
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};