import type { 
  CredentialMode, 
  Currency, 
  Visibility,
  JobAction,
  JobStatus,
  Credentials,
  PublishDefaults,
  FieldMap,
  AdvancedConfig,
  LogFilters
} from "./types";

interface ValidationResult {
  success: boolean;
  error?: {
    message: string;
    errors: Array<{ message: string; path?: string[] }>;
  };
}

const VALID_CREDENTIAL_MODES: CredentialMode[] = ["oauth", "apikey", "creds"];
const VALID_CURRENCIES: Currency[] = ["EUR", "USD", "GBP"];
const VALID_VISIBILITIES: Visibility[] = ["public", "private"];
const VALID_JOB_ACTIONS: JobAction[] = ["create", "update", "delete"];
const VALID_JOB_STATUSES: JobStatus[] = ["ok", "error", "pending"];

const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

const isValidEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const isValidPhone = (phone: string): boolean => {
  return /^[+]?[\d\s\-()]{9,15}$/.test(phone);
};

const hasValidPlaceholders = (template: string): boolean => {
  const validPlaceholders = [
    "address", "sqm", "numRooms", "price", "propertyType", "description", 
    "features", "city", "district", "floor", "bathrooms", "year", "garage"
  ];
  
  const placeholders = template.match(/\{\{(\w+)\}\}/g);
  if (!placeholders) return true;
  
  return placeholders.every(placeholder => {
    const field = placeholder.replace(/[{}]/g, "");
    return validPlaceholders.includes(field);
  });
};

export const validateCredentials = (credentials: unknown): ValidationResult => {
  if (!credentials || typeof credentials !== "object") {
    return {
      success: false,
      error: {
        message: "Las credenciales deben ser un objeto",
        errors: [{ message: "Las credenciales deben ser un objeto" }]
      }
    };
  }

  const creds = credentials as Partial<Credentials>;
  const errors: Array<{ message: string; path?: string[] }> = [];

  // Validar modo
  if (!creds.mode || !VALID_CREDENTIAL_MODES.includes(creds.mode)) {
    errors.push({
      message: `Modo inválido. Valores permitidos: ${VALID_CREDENTIAL_MODES.join(", ")}`,
      path: ["mode"]
    });
  }

  // Validar alias
  if (!creds.alias || creds.alias.trim().length === 0) {
    errors.push({ message: "El alias es requerido", path: ["alias"] });
  } else if (creds.alias.length > 50) {
    errors.push({ message: "El alias no puede exceder 50 caracteres", path: ["alias"] });
  }

  // Validaciones específicas por modo
  if (creds.mode === "oauth") {
    if (creds.oauth) {
      if (!creds.oauth.clientId || creds.oauth.clientId.trim().length === 0) {
        errors.push({ message: "Client ID es requerido para OAuth", path: ["oauth", "clientId"] });
      }
    } else {
      errors.push({ message: "Configuración OAuth requerida", path: ["oauth"] });
    }
  }

  if (creds.mode === "apikey") {
    if (creds.apikey) {
      if (!creds.apikey.apiKey || creds.apikey.apiKey.trim().length === 0) {
        errors.push({ message: "API Key es requerida", path: ["apikey", "apiKey"] });
      }
    } else {
      errors.push({ message: "Configuración API Key requerida", path: ["apikey"] });
    }
  }

  if (creds.mode === "creds") {
    if (creds.creds) {
      if (!creds.creds.username || creds.creds.username.trim().length === 0) {
        errors.push({ message: "Username es requerido", path: ["creds", "username"] });
      }
      if (!creds.creds.password || creds.creds.password.trim().length === 0) {
        errors.push({ message: "Password es requerido", path: ["creds", "password"] });
      }
    } else {
      errors.push({ message: "Configuración de credenciales requerida", path: ["creds"] });
    }
  }

  if (errors.length > 0) {
    return {
      success: false,
      error: {
        message: "Errores de validación en credenciales",
        errors
      }
    };
  }

  return { success: true };
};

export const validatePublishDefaults = (defaults: unknown): ValidationResult => {
  if (!defaults || typeof defaults !== "object") {
    return {
      success: false,
      error: {
        message: "Los valores por defecto deben ser un objeto",
        errors: [{ message: "Los valores por defecto deben ser un objeto" }]
      }
    };
  }

  const def = defaults as Partial<PublishDefaults>;
  const errors: Array<{ message: string; path?: string[] }> = [];

  // Validar plantillas
  if (!def.titleTpl || def.titleTpl.trim().length === 0) {
    errors.push({ message: "La plantilla de título es requerida", path: ["titleTpl"] });
  } else if (!hasValidPlaceholders(def.titleTpl)) {
    errors.push({ message: "La plantilla de título contiene placeholders inválidos", path: ["titleTpl"] });
  }

  if (!def.descTpl || def.descTpl.trim().length === 0) {
    errors.push({ message: "La plantilla de descripción es requerida", path: ["descTpl"] });
  } else if (!hasValidPlaceholders(def.descTpl)) {
    errors.push({ message: "La plantilla de descripción contiene placeholders inválidos", path: ["descTpl"] });
  }

  // Validar política de precios
  if (!def.pricePolicy) {
    errors.push({ message: "La política de precios es requerida", path: ["pricePolicy"] });
  } else {
    if (!VALID_CURRENCIES.includes(def.pricePolicy.currency)) {
      errors.push({
        message: `Moneda inválida. Valores permitidos: ${VALID_CURRENCIES.join(", ")}`,
        path: ["pricePolicy", "currency"]
      });
    }
    
    if (def.pricePolicy.marginPct !== undefined && (def.pricePolicy.marginPct < -50 || def.pricePolicy.marginPct > 100)) {
      errors.push({
        message: "El margen debe estar entre -50% y 100%",
        path: ["pricePolicy", "marginPct"]
      });
    }

    if (def.pricePolicy.minPrice !== undefined && def.pricePolicy.minPrice < 0) {
      errors.push({
        message: "El precio mínimo debe ser >= 0",
        path: ["pricePolicy", "minPrice"]
      });
    }

    if (def.pricePolicy.maxPrice !== undefined && def.pricePolicy.maxPrice < 0) {
      errors.push({
        message: "El precio máximo debe ser >= 0",
        path: ["pricePolicy", "maxPrice"]
      });
    }

    if (def.pricePolicy.minPrice && def.pricePolicy.maxPrice && def.pricePolicy.minPrice > def.pricePolicy.maxPrice) {
      errors.push({
        message: "El precio mínimo debe ser <= precio máximo",
        path: ["pricePolicy", "maxPrice"]
      });
    }
  }

  // Validar política de fotos
  if (def.photosPolicy) {
    if (def.photosPolicy.min !== undefined && def.photosPolicy.min < 0) {
      errors.push({
        message: "El mínimo de fotos debe ser >= 0",
        path: ["photosPolicy", "min"]
      });
    }

    if (def.photosPolicy.max !== undefined && def.photosPolicy.max < 1) {
      errors.push({
        message: "El máximo de fotos debe ser >= 1",
        path: ["photosPolicy", "max"]
      });
    }

    if (def.photosPolicy.min && def.photosPolicy.max && def.photosPolicy.min > def.photosPolicy.max) {
      errors.push({
        message: "El mínimo de fotos debe ser <= máximo",
        path: ["photosPolicy", "max"]
      });
    }
  }

  // Validar visibilidad
  if (!def.visibility || !VALID_VISIBILITIES.includes(def.visibility)) {
    errors.push({
      message: `Visibilidad inválida. Valores permitidos: ${VALID_VISIBILITIES.join(", ")}`,
      path: ["visibility"]
    });
  }

  // Validar teléfono si se proporciona
  if (def.contactPhone && !isValidPhone(def.contactPhone)) {
    errors.push({
      message: "El formato del teléfono no es válido",
      path: ["contactPhone"]
    });
  }

  if (errors.length > 0) {
    return {
      success: false,
      error: {
        message: "Errores de validación en valores por defecto",
        errors
      }
    };
  }

  return { success: true };
};

export const validateMappings = (mappings: unknown): ValidationResult => {
  if (!Array.isArray(mappings)) {
    return {
      success: false,
      error: {
        message: "Los mapeos deben ser un array",
        errors: [{ message: "Los mapeos deben ser un array" }]
      }
    };
  }

  const maps = mappings as FieldMap[];
  const errors: Array<{ message: string; path?: string[] }> = [];

  // Validar que existen mapeos obligatorios
  const requiredFields = ["propertyType", "price", "address"];
  const mappedFields = maps.filter(m => m.required).map(m => m.to);
  
  for (const required of requiredFields) {
    if (!mappedFields.includes(required)) {
      errors.push({
        message: `El campo obligatorio '${required}' debe estar mapeado`,
        path: ["mappings"]
      });
    }
  }

  // Validar cada mapeo
  maps.forEach((map, index) => {
    if (!map.from || map.from.trim().length === 0) {
      errors.push({
        message: `Campo origen requerido en mapeo ${index + 1}`,
        path: ["mappings", index.toString(), "from"]
      });
    }

    if (!map.to || map.to.trim().length === 0) {
      errors.push({
        message: `Campo destino requerido en mapeo ${index + 1}`,
        path: ["mappings", index.toString(), "to"]
      });
    }

    // Validar transformación si existe
    if (map.transform) {
      const validTransforms = ["stringify", "lowercase", "uppercase", "truncate", "enum_map"];
      if (!validTransforms.includes(map.transform)) {
        errors.push({
          message: `Transformación inválida en mapeo ${index + 1}: ${map.transform}`,
          path: ["mappings", index.toString(), "transform"]
        });
      }
    }
  });

  // Validar duplicados en campos destino
  const destinationFields = maps.map(m => m.to);
  const duplicates = destinationFields.filter((field, index) => 
    destinationFields.indexOf(field) !== index
  );
  
  if (duplicates.length > 0) {
    errors.push({
      message: `Campos destino duplicados: ${duplicates.join(", ")}`,
      path: ["mappings"]
    });
  }

  if (errors.length > 0) {
    return {
      success: false,
      error: {
        message: "Errores de validación en mapeos",
        errors
      }
    };
  }

  return { success: true };
};

export const validateAdvancedConfig = (config: unknown): ValidationResult => {
  if (!config || typeof config !== "object") {
    return {
      success: false,
      error: {
        message: "La configuración avanzada debe ser un objeto",
        errors: [{ message: "La configuración avanzada debe ser un objeto" }]
      }
    };
  }

  const conf = config as Partial<AdvancedConfig>;
  const errors: Array<{ message: string; path?: string[] }> = [];

  // Validar frecuencia de sync
  if (conf.syncFrequencyMin !== undefined && (conf.syncFrequencyMin < 1 || conf.syncFrequencyMin > 1440)) {
    errors.push({
      message: "La frecuencia de sync debe estar entre 1 y 1440 minutos",
      path: ["syncFrequencyMin"]
    });
  }

  // Validar throttle
  if (conf.throttleReqPerMin !== undefined && (conf.throttleReqPerMin < 1 || conf.throttleReqPerMin > 1000)) {
    errors.push({
      message: "El throttle debe estar entre 1 y 1000 req/min",
      path: ["throttleReqPerMin"]
    });
  }

  // Validar políticas
  const validDeletePolicies = ["remove", "pause", "archive"];
  if (conf.deletePolicy && !validDeletePolicies.includes(conf.deletePolicy)) {
    errors.push({
      message: `Política de borrado inválida. Valores permitidos: ${validDeletePolicies.join(", ")}`,
      path: ["deletePolicy"]
    });
  }

  const validDuplicatePolicies = ["skip", "update", "create"];
  if (conf.duplicatePolicy && !validDuplicatePolicies.includes(conf.duplicatePolicy)) {
    errors.push({
      message: `Política de duplicados inválida. Valores permitidos: ${validDuplicatePolicies.join(", ")}`,
      path: ["duplicatePolicy"]
    });
  }

  // Validar reintentos
  if (conf.errorRetryCount !== undefined && (conf.errorRetryCount < 0 || conf.errorRetryCount > 10)) {
    errors.push({
      message: "Los reintentos deben estar entre 0 y 10",
      path: ["errorRetryCount"]
    });
  }

  if (conf.backoffMultiplier !== undefined && (conf.backoffMultiplier < 1 || conf.backoffMultiplier > 10)) {
    errors.push({
      message: "El multiplicador de backoff debe estar entre 1 y 10",
      path: ["backoffMultiplier"]
    });
  }

  if (errors.length > 0) {
    return {
      success: false,
      error: {
        message: "Errores de validación en configuración avanzada",
        errors
      }
    };
  }

  return { success: true };
};

export const validateLogFilters = (filters: unknown): ValidationResult => {
  if (!filters || typeof filters !== "object") {
    return {
      success: false,
      error: {
        message: "Los filtros deben ser un objeto",
        errors: [{ message: "Los filtros deben ser un objeto" }]
      }
    };
  }

  const f = filters as Partial<LogFilters>;
  const errors: Array<{ message: string; path?: string[] }> = [];

  // Validar acción
  if (f.action && !VALID_JOB_ACTIONS.includes(f.action)) {
    errors.push({
      message: `Acción inválida. Valores permitidos: ${VALID_JOB_ACTIONS.join(", ")}`,
      path: ["action"]
    });
  }

  // Validar resultado
  if (f.result && !VALID_JOB_STATUSES.includes(f.result)) {
    errors.push({
      message: `Resultado inválido. Valores permitidos: ${VALID_JOB_STATUSES.join(", ")}`,
      path: ["result"]
    });
  }

  // Validar fechas
  if (f.from && !/^\d{4}-\d{2}-\d{2}$/.test(f.from)) {
    errors.push({
      message: "Formato de fecha 'from' inválido (YYYY-MM-DD)",
      path: ["from"]
    });
  }

  if (f.to && !/^\d{4}-\d{2}-\d{2}$/.test(f.to)) {
    errors.push({
      message: "Formato de fecha 'to' inválido (YYYY-MM-DD)",
      path: ["to"]
    });
  }

  if (f.from && f.to && new Date(f.from) > new Date(f.to)) {
    errors.push({
      message: "La fecha 'from' debe ser <= 'to'",
      path: ["to"]
    });
  }

  // Validar paginación
  if (f.page !== undefined && f.page < 1) {
    errors.push({
      message: "La página debe ser >= 1",
      path: ["page"]
    });
  }

  if (f.size !== undefined && (f.size < 1 || f.size > 100)) {
    errors.push({
      message: "El tamaño debe estar entre 1 y 100",
      path: ["size"]
    });
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