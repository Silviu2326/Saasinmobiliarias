import { Canal, Dispositivo, TipoOperacion, Origen, ConversionFilters, ABTestVariant, ExportOptions } from "./types";

const validCanales: Canal[] = ["web", "portal", "whatsapp", "referido", "ads"];
const validDispositivos: Dispositivo[] = ["mobile", "desktop"];
const validTipos: TipoOperacion[] = ["venta", "alquiler"];
const validOrigenes: Origen[] = ["landing", "chatbot", "portales"];

interface ValidationResult {
  success: boolean;
  error?: {
    message: string;
    errors: Array<{ message: string }>;
  };
}

const isValidDateFormat = (date: string): boolean => {
  return /^\d{4}-\d{2}-\d{2}$/.test(date) && !isNaN(Date.parse(date));
};

const isValidDateRange = (from?: string, to?: string): boolean => {
  if (!from || !to) return true;
  
  const fromDate = new Date(from);
  const toDate = new Date(to);
  
  if (fromDate > toDate) return false;
  
  const diffMonths = (toDate.getFullYear() - fromDate.getFullYear()) * 12 +
    (toDate.getMonth() - fromDate.getMonth());
  
  return diffMonths <= 24;
};

export const validateConversionFilters = (filters: unknown): ValidationResult => {
  if (!filters || typeof filters !== 'object') {
    return {
      success: false,
      error: {
        message: "Los filtros deben ser un objeto",
        errors: [{ message: "Los filtros deben ser un objeto" }]
      }
    };
  }

  const f = filters as Partial<ConversionFilters>;
  const errors: Array<{ message: string }> = [];

  // Validar fechas
  if (f.from && !isValidDateFormat(f.from)) {
    errors.push({ message: "Formato de fecha 'from' inválido (YYYY-MM-DD)" });
  }
  
  if (f.to && !isValidDateFormat(f.to)) {
    errors.push({ message: "Formato de fecha 'to' inválido (YYYY-MM-DD)" });
  }

  if (f.from && f.to && !isValidDateRange(f.from, f.to)) {
    errors.push({ message: "El rango de fechas debe ser válido y no superar 24 meses" });
  }

  // Validar enums
  if (f.canal && !validCanales.includes(f.canal)) {
    errors.push({ message: `Canal inválido. Valores permitidos: ${validCanales.join(", ")}` });
  }

  if (f.dispositivo && !validDispositivos.includes(f.dispositivo)) {
    errors.push({ message: `Dispositivo inválido. Valores permitidos: ${validDispositivos.join(", ")}` });
  }

  if (f.tipo && !validTipos.includes(f.tipo)) {
    errors.push({ message: `Tipo inválido. Valores permitidos: ${validTipos.join(", ")}` });
  }

  if (f.origen && !validOrigenes.includes(f.origen)) {
    errors.push({ message: `Origen inválido. Valores permitidos: ${validOrigenes.join(", ")}` });
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

export const validateABTesting = (data: unknown): ValidationResult => {
  if (!data || typeof data !== 'object') {
    return {
      success: false,
      error: {
        message: "Los datos deben ser un objeto",
        errors: [{ message: "Los datos deben ser un objeto" }]
      }
    };
  }

  const testData = data as { variantA?: ABTestVariant; variantB?: ABTestVariant };
  const errors: Array<{ message: string }> = [];

  // Validar variante A
  if (!testData.variantA) {
    errors.push({ message: "La variante A es requerida" });
  } else {
    const vA = testData.variantA;
    if (!vA.name || typeof vA.name !== 'string') {
      errors.push({ message: "El nombre de la variante A es requerido" });
    }
    if (typeof vA.impressions !== 'number' || vA.impressions < 0 || !Number.isInteger(vA.impressions)) {
      errors.push({ message: "Las impresiones de la variante A deben ser un entero >= 0" });
    }
    if (typeof vA.clicks !== 'number' || vA.clicks < 0 || !Number.isInteger(vA.clicks)) {
      errors.push({ message: "Los clics de la variante A deben ser un entero >= 0" });
    }
    if (typeof vA.leads !== 'number' || vA.leads < 0 || !Number.isInteger(vA.leads)) {
      errors.push({ message: "Los leads de la variante A deben ser un entero >= 0" });
    }
    if (typeof vA.contracts !== 'number' || vA.contracts < 0 || !Number.isInteger(vA.contracts)) {
      errors.push({ message: "Los contratos de la variante A deben ser un entero >= 0" });
    }
    if (vA.impressions === 0) {
      errors.push({ message: "Las impresiones de la variante A deben ser mayor a 0 para evitar división por cero" });
    }
  }

  // Validar variante B
  if (!testData.variantB) {
    errors.push({ message: "La variante B es requerida" });
  } else {
    const vB = testData.variantB;
    if (!vB.name || typeof vB.name !== 'string') {
      errors.push({ message: "El nombre de la variante B es requerido" });
    }
    if (typeof vB.impressions !== 'number' || vB.impressions < 0 || !Number.isInteger(vB.impressions)) {
      errors.push({ message: "Las impresiones de la variante B deben ser un entero >= 0" });
    }
    if (typeof vB.clicks !== 'number' || vB.clicks < 0 || !Number.isInteger(vB.clicks)) {
      errors.push({ message: "Los clics de la variante B deben ser un entero >= 0" });
    }
    if (typeof vB.leads !== 'number' || vB.leads < 0 || !Number.isInteger(vB.leads)) {
      errors.push({ message: "Los leads de la variante B deben ser un entero >= 0" });
    }
    if (typeof vB.contracts !== 'number' || vB.contracts < 0 || !Number.isInteger(vB.contracts)) {
      errors.push({ message: "Los contratos de la variante B deben ser un entero >= 0" });
    }
    if (vB.impressions === 0) {
      errors.push({ message: "Las impresiones de la variante B deben ser mayor a 0 para evitar división por cero" });
    }
  }

  if (errors.length > 0) {
    return {
      success: false,
      error: {
        message: "Errores de validación en datos A/B",
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
  const errors: Array<{ message: string }> = [];

  if (!opts.format || !["CSV", "JSON", "PNG"].includes(opts.format)) {
    errors.push({ message: "El formato debe ser CSV, JSON o PNG" });
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