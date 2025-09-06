import type { Channel, DeviceType, PropertyType, TransactionType, Origin, Stage, CohortFilters, ExportOptions } from "./types";

const VALID_CHANNELS: Channel[] = ["web", "portal", "ads", "whatsapp", "referido"];
const VALID_DEVICES: DeviceType[] = ["mobile", "desktop", "tablet"];
const VALID_PROPERTY_TYPES: PropertyType[] = ["piso", "casa", "atico", "duplex", "chalet", "local"];
const VALID_TRANSACTION_TYPES: TransactionType[] = ["venta", "alquiler"];
const VALID_ORIGINS: Origin[] = ["landing", "chatbot", "portales"];
const VALID_STAGES: Stage[] = ["LEAD", "VISITA", "OFERTA", "RESERVA", "CONTRATO"];

interface ValidationResult {
  success: boolean;
  error?: {
    message: string;
    errors: Array<{ message: string; path?: string[] }>;
  };
}

const isValidMonthFormat = (date: string): boolean => {
  return /^\d{4}-\d{2}$/.test(date);
};

const isValidDateRange = (from?: string, to?: string): boolean => {
  if (!from || !to) return true;
  
  const fromDate = new Date(from + "-01");
  const toDate = new Date(to + "-01");
  
  if (fromDate > toDate) return false;
  
  const diffMonths = (toDate.getFullYear() - fromDate.getFullYear()) * 12 
    + (toDate.getMonth() - fromDate.getMonth());
  
  return diffMonths <= 36;
};

export const validateCohortFilters = (filters: unknown): ValidationResult => {
  if (!filters || typeof filters !== 'object') {
    return {
      success: false,
      error: {
        message: "Los filtros deben ser un objeto",
        errors: [{ message: "Los filtros deben ser un objeto" }]
      }
    };
  }

  const f = filters as Partial<CohortFilters>;
  const errors: Array<{ message: string; path?: string[] }> = [];

  // Validar fechas
  if (f.from && !isValidMonthFormat(f.from)) {
    errors.push({ message: "Formato debe ser YYYY-MM", path: ["from"] });
  }
  
  if (f.to && !isValidMonthFormat(f.to)) {
    errors.push({ message: "Formato debe ser YYYY-MM", path: ["to"] });
  }

  if (f.from && f.to && !isValidDateRange(f.from, f.to)) {
    errors.push({ 
      message: "El rango de fechas no debe exceder 36 meses y 'from' debe ser <= 'to'", 
      path: ["to"] 
    });
  }

  // Validar ventana
  if (f.window !== undefined && (f.window < 3 || f.window > 18)) {
    errors.push({ message: "Ventana debe estar entre 3 y 18 meses", path: ["window"] });
  }

  // Validar enums
  if (f.canal && !VALID_CHANNELS.includes(f.canal)) {
    errors.push({ 
      message: `Canal inválido. Valores permitidos: ${VALID_CHANNELS.join(", ")}`, 
      path: ["canal"] 
    });
  }

  if (f.tipo && !VALID_TRANSACTION_TYPES.includes(f.tipo)) {
    errors.push({ 
      message: `Tipo inválido. Valores permitidos: ${VALID_TRANSACTION_TYPES.join(", ")}`, 
      path: ["tipo"] 
    });
  }

  if (f.origen && !VALID_ORIGINS.includes(f.origen)) {
    errors.push({ 
      message: `Origen inválido. Valores permitidos: ${VALID_ORIGINS.join(", ")}`, 
      path: ["origen"] 
    });
  }

  if (f.tipologia && !VALID_PROPERTY_TYPES.includes(f.tipologia)) {
    errors.push({ 
      message: `Tipología inválida. Valores permitidos: ${VALID_PROPERTY_TYPES.join(", ")}`, 
      path: ["tipologia"] 
    });
  }

  if (f.device && !VALID_DEVICES.includes(f.device)) {
    errors.push({ 
      message: `Dispositivo inválido. Valores permitidos: ${VALID_DEVICES.join(", ")}`, 
      path: ["device"] 
    });
  }

  if (f.targetStage && !VALID_STAGES.includes(f.targetStage)) {
    errors.push({ 
      message: `Etapa inválida. Valores permitidos: ${VALID_STAGES.join(", ")}`, 
      path: ["targetStage"] 
    });
  }

  // Validar números
  if (f.minSize !== undefined && f.minSize < 0) {
    errors.push({ message: "Tamaño mínimo debe ser >= 0", path: ["minSize"] });
  }

  if (f.priceMin !== undefined && f.priceMin < 0) {
    errors.push({ message: "Precio mínimo debe ser >= 0", path: ["priceMin"] });
  }

  if (f.priceMax !== undefined && f.priceMax < 0) {
    errors.push({ message: "Precio máximo debe ser >= 0", path: ["priceMax"] });
  }

  if (f.priceMin !== undefined && f.priceMax !== undefined && f.priceMin > f.priceMax) {
    errors.push({ 
      message: "Precio mínimo debe ser <= precio máximo", 
      path: ["priceMax"] 
    });
  }

  // Validar strings
  if (f.portal && f.portal.length > 50) {
    errors.push({ message: "Portal no puede exceder 50 caracteres", path: ["portal"] });
  }

  if (f.campana && f.campana.length > 100) {
    errors.push({ message: "Campaña no puede exceder 100 caracteres", path: ["campana"] });
  }

  if (f.agente && f.agente.length > 50) {
    errors.push({ message: "Agente no puede exceder 50 caracteres", path: ["agente"] });
  }

  if (f.oficina && f.oficina.length > 50) {
    errors.push({ message: "Oficina no puede exceder 50 caracteres", path: ["oficina"] });
  }

  if (f.zona && f.zona.length > 100) {
    errors.push({ message: "Zona no puede exceder 100 caracteres", path: ["zona"] });
  }

  if (errors.length > 0) {
    return {
      success: false,
      error: {
        message: "Errores de validación en filtros",
        errors
      }
    };
  }

  return { success: true };
};

export const validateDrilldownParams = (params: unknown): ValidationResult => {
  if (!params || typeof params !== 'object') {
    return {
      success: false,
      error: {
        message: "Los parámetros deben ser un objeto",
        errors: [{ message: "Los parámetros deben ser un objeto" }]
      }
    };
  }

  const p = params as any;
  const errors: Array<{ message: string; path?: string[] }> = [];

  if (!p.cohort || !isValidMonthFormat(p.cohort)) {
    errors.push({ message: "Cohort debe tener formato YYYY-MM", path: ["cohort"] });
  }

  if (typeof p.monthRel !== 'number' || p.monthRel < 0 || p.monthRel > 18) {
    errors.push({ message: "monthRel debe ser un número entre 0 y 18", path: ["monthRel"] });
  }

  if (!p.event || !["CONTRATO", "OFERTA", "VISITA"].includes(p.event)) {
    errors.push({ 
      message: "Evento debe ser CONTRATO, OFERTA o VISITA", 
      path: ["event"] 
    });
  }

  if (errors.length > 0) {
    return {
      success: false,
      error: {
        message: "Errores de validación en parámetros de drilldown",
        errors
      }
    };
  }

  return { success: true };
};

export const validateExportOptions = (options: unknown): ValidationResult => {
  if (!options || typeof options !== 'object') {
    return {
      success: false,
      error: {
        message: "Las opciones deben ser un objeto",
        errors: [{ message: "Las opciones deben ser un objeto" }]
      }
    };
  }

  const opts = options as Partial<ExportOptions>;
  const errors: Array<{ message: string; path?: string[] }> = [];

  if (!opts.format || !["CSV", "JSON", "PNG"].includes(opts.format)) {
    errors.push({ 
      message: "El formato debe ser CSV, JSON o PNG", 
      path: ["format"] 
    });
  }

  if (!opts.type || !["table", "heatmap", "retention", "all"].includes(opts.type)) {
    errors.push({ 
      message: "El tipo debe ser table, heatmap, retention o all", 
      path: ["type"] 
    });
  }

  if (errors.length > 0) {
    return {
      success: false,
      error: {
        message: "Errores de validación en opciones de exportación",
        errors
      }
    };
  }

  return { success: true };
};