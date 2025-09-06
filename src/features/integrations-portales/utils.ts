import type { 
  PortalStatus, 
  SampleProperty, 
  FieldMap,
  PortalStats,
  JobStatus 
} from "./types";

export const maskSecret = (secret: string, visibleChars: number = 4): string => {
  if (!secret || secret.length <= visibleChars) return secret;
  const masked = "*".repeat(secret.length - visibleChars);
  return secret.slice(0, visibleChars) + masked;
};

export const renderTemplate = (template: string, property: SampleProperty): string => {
  if (!template || !property) return template;
  
  let result = template;
  
  const replacements: Record<string, string | number> = {
    address: property.address,
    sqm: property.sqm,
    numRooms: property.numRooms,
    price: property.price,
    propertyType: property.propertyType,
    description: property.description,
    features: property.features.join(", "),
    city: property.address.split(",")[1]?.trim() || "Madrid",
    district: property.address.split(",")[0]?.trim() || "Centro",
    floor: "2º",
    bathrooms: Math.ceil(property.numRooms / 2),
    year: "2010",
    garage: property.features.includes("Garaje") ? "Sí" : "No"
  };
  
  Object.entries(replacements).forEach(([key, value]) => {
    const regex = new RegExp(`\\{\\{${key}\\}\\}`, "g");
    result = result.replace(regex, String(value));
  });
  
  return result;
};

export const validateMappings = (mappings: FieldMap[]): { missing: string[]; invalid: string[] } => {
  const requiredFields = ["propertyType", "price", "address"];
  const mappedRequired = mappings.filter(m => m.required).map(m => m.to);
  
  const missing = requiredFields.filter(field => !mappedRequired.includes(field));
  
  const invalid = mappings
    .filter(m => !m.from || !m.to)
    .map(m => `${m.from || "undefined"} → ${m.to || "undefined"}`);
  
  return { missing, invalid };
};

export const formatStatus = (status: PortalStatus): { 
  label: string; 
  color: string; 
  bgColor: string 
} => {
  switch (status) {
    case "CONNECTED":
      return { 
        label: "Conectado", 
        color: "text-green-800", 
        bgColor: "bg-green-100" 
      };
    case "DISCONNECTED":
      return { 
        label: "Desconectado", 
        color: "text-gray-800", 
        bgColor: "bg-gray-100" 
      };
    case "TOKEN_EXPIRED":
      return { 
        label: "Token Expirado", 
        color: "text-yellow-800", 
        bgColor: "bg-yellow-100" 
      };
    case "ERROR":
      return { 
        label: "Error", 
        color: "text-red-800", 
        bgColor: "bg-red-100" 
      };
    case "PAUSED":
      return { 
        label: "Pausado", 
        color: "text-orange-800", 
        bgColor: "bg-orange-100" 
      };
    default:
      return { 
        label: status, 
        color: "text-gray-800", 
        bgColor: "bg-gray-100" 
      };
  }
};

export const formatJobStatus = (status: JobStatus): {
  label: string;
  color: string;
  icon: string;
} => {
  switch (status) {
    case "ok":
      return {
        label: "Exitoso",
        color: "text-green-600",
        icon: "✅"
      };
    case "error":
      return {
        label: "Error",
        color: "text-red-600",
        icon: "❌"
      };
    case "pending":
      return {
        label: "Pendiente",
        color: "text-yellow-600",
        icon: "⏳"
      };
    default:
      return {
        label: status,
        color: "text-gray-600",
        icon: "❓"
      };
  }
};

export const formatDate = (dateString: string): string => {
  if (!dateString) return "-";
  
  try {
    const date = new Date(dateString);
    return date.toLocaleString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  } catch {
    return dateString;
  }
};

export const formatDateShort = (dateString: string): string => {
  if (!dateString) return "-";
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit"
    });
  } catch {
    return dateString;
  }
};

export const formatDuration = (durationMs?: number): string => {
  if (!durationMs) return "-";
  
  if (durationMs < 1000) {
    return `${durationMs}ms`;
  } else if (durationMs < 60000) {
    return `${(durationMs / 1000).toFixed(1)}s`;
  } else {
    return `${(durationMs / 60000).toFixed(1)}m`;
  }
};

export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat("es-ES").format(num);
};

export const formatPrice = (price: number, currency: string = "EUR"): string => {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency,
    minimumFractionDigits: 0
  }).format(price);
};

export const formatPercent = (value: number): string => {
  return `${value.toFixed(1)}%`;
};

export const calculateStats = (stats: PortalStats): {
  cplFormatted: string;
  cpaFormatted: string;
  successRateFormatted: string;
  avgResponseFormatted: string;
} => {
  return {
    cplFormatted: stats.cpl ? formatPrice(stats.cpl) : "-",
    cpaFormatted: stats.cpa ? formatPrice(stats.cpa) : "-",
    successRateFormatted: formatPercent(stats.successRate),
    avgResponseFormatted: stats.avgResponseTime ? `${stats.avgResponseTime}ms` : "-"
  };
};

export const getHealthScore = (stats: PortalStats): {
  score: number;
  level: "excellent" | "good" | "warning" | "critical";
  color: string;
  bgColor: string;
} => {
  let score = 100;
  
  // Penalizar por errores
  if (stats.errors24h > 0) {
    score -= Math.min(stats.errors24h * 5, 40);
  }
  
  // Penalizar por baja tasa de éxito
  if (stats.successRate < 95) {
    score -= (95 - stats.successRate) * 2;
  }
  
  // Penalizar por alta latencia
  if (stats.avgResponseTime && stats.avgResponseTime > 2000) {
    score -= Math.min((stats.avgResponseTime - 2000) / 100, 20);
  }
  
  score = Math.max(0, Math.round(score));
  
  if (score >= 90) {
    return {
      score,
      level: "excellent",
      color: "text-green-600",
      bgColor: "bg-green-50"
    };
  } else if (score >= 75) {
    return {
      score,
      level: "good",
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    };
  } else if (score >= 50) {
    return {
      score,
      level: "warning",
      color: "text-yellow-600",
      bgColor: "bg-yellow-50"
    };
  } else {
    return {
      score,
      level: "critical",
      color: "text-red-600",
      bgColor: "bg-red-50"
    };
  }
};

export const generateSampleProperty = (): SampleProperty => {
  return {
    address: "Calle Gran Vía 28, Centro, Madrid",
    sqm: 85,
    numRooms: 3,
    price: 320000,
    propertyType: "Piso",
    description: "Luminoso piso en el centro de Madrid con todas las comodidades.",
    features: ["Ascensor", "Aire acondicionado", "Calefacción", "Internet"],
    photos: [
      "https://example.com/photo1.jpg",
      "https://example.com/photo2.jpg",
      "https://example.com/photo3.jpg"
    ]
  };
};

export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void => {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(null, args), wait);
  };
};

export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void => {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func.apply(null, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    try {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      return true;
    } catch (fallbackErr) {
      console.error("Failed to copy text: ", fallbackErr);
      return false;
    }
  }
};

export const downloadFile = (content: string, filename: string, contentType: string = "text/plain") => {
  const blob = new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const getPortalLogo = (portalId: string): string => {
  const logos: Record<string, string> = {
    idealista: "🏠",
    fotocasa: "📸",
    habitaclia: "🏘️",
    "pisos.com": "🏢",
    yaencontre: "🔍",
    "segundamano.es": "🔄",
    milanuncios: "📋",
    vibbo: "📱"
  };
  
  return logos[portalId] || "🌐";
};

export const isRecentActivity = (timestamp: string, hours: number = 24): boolean => {
  const now = new Date();
  const activityTime = new Date(timestamp);
  const diffHours = (now.getTime() - activityTime.getTime()) / (1000 * 60 * 60);
  
  return diffHours <= hours;
};