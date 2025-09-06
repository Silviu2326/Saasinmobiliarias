import { z } from "zod";

// Connection schemas
export const oauthConfigSchema = z.object({
  clientId: z.string().min(1, "Client ID es obligatorio"),
  clientSecret: z.string().min(1, "Client Secret es obligatorio"),
  redirectUri: z.string().url("Redirect URI debe ser una URL válida").refine(
    (url) => url.startsWith("https://"),
    "Redirect URI debe usar HTTPS"
  ),
});

export const apiKeyConfigSchema = z.object({
  apiKey: z.string().min(1, "API Key es obligatorio"),
  companyId: z.string().optional(),
  environment: z.enum(["prod", "test", "sandbox"]).optional(),
});

export const credentialsConfigSchema = z.object({
  username: z.string().min(1, "Usuario es obligatorio"),
  password: z.string().min(1, "Contraseña es obligatoria"),
  tenant: z.string().optional(),
  database: z.string().optional(),
});

export const connectionConfigSchema = z.object({
  mode: z.enum(["OAUTH", "API_KEY", "CREDENTIALS"]),
  scope: z.enum(["GLOBAL", "OFICINA"]),
  officeId: z.string().optional(),
  oauth: oauthConfigSchema.optional(),
  apiKey: apiKeyConfigSchema.optional(),
  credentials: credentialsConfigSchema.optional(),
});

// Chart of Accounts mapping schema
export const coaMapItemSchema = z.object({
  entity: z.string().min(1, "Entidad es obligatoria"),
  purpose: z.string().min(1, "Descripción es obligatoria"),
  account: z.string().min(1, "Cuenta contable es obligatoria").regex(
    /^[0-9]{3,7}$/,
    "Código de cuenta debe tener entre 3 y 7 dígitos"
  ),
  costCenter: z.string().optional(),
  required: z.boolean().optional(),
});

export const coaMappingSchema = z.object({
  mappings: z.array(coaMapItemSchema),
}).refine((data) => {
  // Validate required mappings exist
  const requiredEntities = ["sales_fees", "customers", "banks", "vat_output", "vat_input"];
  const mappedEntities = data.mappings.map(m => m.entity);
  const missing = requiredEntities.filter(entity => !mappedEntities.includes(entity));
  
  return missing.length === 0;
}, {
  message: "Faltan cuentas obligatorias: Ventas, Clientes, Bancos, IVA repercutido/soportado",
});

// Tax profile schemas
export const taxProfileSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Nombre es obligatorio").max(100),
  iva: z.number().min(0).max(100).refine(
    (val) => [0, 4, 10, 21].includes(val),
    "IVA debe ser 0%, 4%, 10% o 21%"
  ),
  irpf: z.number().min(0).max(21).optional(),
  recargoEq: z.number().min(0).max(10).optional(),
  exempt: z.boolean().optional(),
  period: z.enum(["M", "Q", "Y"]),
  prorataPct: z.number().min(0).max(100).optional(),
  isDefault: z.boolean().default(false),
});

// Cost center schemas
export const costCenterSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Nombre es obligatorio").max(100),
  code: z.string().max(20).optional(),
  scope: z.enum(["GLOBAL", "OFICINA", "EQUIPO", "PROYECTO"]),
  refId: z.string().optional(),
  active: z.boolean().default(true),
  isDefault: z.boolean().optional(),
});

// Currency settings schema
export const currencySettingsSchema = z.object({
  baseCurrency: z.string().length(3, "Moneda base debe ser código de 3 letras (EUR, USD...)"),
  allowedCurrencies: z.array(z.string().length(3)).min(1, "Debe haber al menos una moneda permitida"),
  exchangeRates: z.record(z.string(), z.number().positive()),
  roundingPolicy: z.enum(["STANDARD", "UP", "DOWN"]),
  exchangeDiffAccount: z.string().optional(),
  tolerance: z.number().min(0, "Tolerancia debe ser >= 0"),
});

// Sync policy schema
export const syncPolicySchema = z.object({
  direction: z.enum(["ONE_WAY", "TWO_WAY"]),
  triggers: z.object({
    invoices: z.boolean(),
    expenses: z.boolean(),
    payouts: z.boolean(),
    settlements: z.boolean(),
    payments: z.boolean(),
  }),
  windowDays: z.number().min(0).max(365, "Ventana no puede ser mayor a 365 días"),
  grouping: z.enum(["NONE", "BY_PRODUCT", "BY_TAX"]),
  reconciliation: z.object({
    enabled: z.boolean(),
    tolerance: z.number().min(0, "Tolerancia debe ser >= 0"),
  }),
  autoRetry: z.boolean().default(true),
  maxRetries: z.number().min(1).max(10).default(3),
});

// Ledger schemas
export const ledgerLineSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha debe estar en formato YYYY-MM-DD"),
  account: z.string().min(1, "Cuenta es obligatoria"),
  description: z.string().min(1, "Descripción es obligatoria").max(200),
  debit: z.number().min(0),
  credit: z.number().min(0),
  costCenter: z.string().optional(),
  taxCode: z.string().optional(),
  reference: z.string().max(50).optional(),
  currency: z.string().length(3).optional(),
  exchangeRate: z.number().positive().optional(),
}).refine((data) => {
  // Either debit or credit must be > 0, but not both
  return (data.debit > 0 && data.credit === 0) || (data.credit > 0 && data.debit === 0);
}, {
  message: "Una línea debe tener debe O haber, pero no ambos",
});

export const ledgerPreviewSchema = z.object({
  lines: z.array(ledgerLineSchema).min(1, "Debe haber al menos una línea"),
  currency: z.string().length(3),
  exchangeRate: z.number().positive().optional(),
}).refine((data) => {
  // Total debits must equal total credits
  const totalDebit = data.lines.reduce((sum, line) => sum + line.debit, 0);
  const totalCredit = data.lines.reduce((sum, line) => sum + line.credit, 0);
  return Math.abs(totalDebit - totalCredit) < 0.01; // Allow for rounding
}, {
  message: "El asiento debe estar cuadrado (debe = haber)",
});

// Bank connection schema
export const bankConnectionSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Nombre es obligatorio").max(100),
  iban: z.string().regex(
    /^[A-Z]{2}\d{2}[A-Z0-9]{4}\d{7}([A-Z0-9]?){0,16}$/,
    "IBAN no válido"
  ).optional(),
  provider: z.enum(["bank_feed", "csv_import"]).optional(),
  currency: z.string().length(3).default("EUR"),
  account: z.string().optional(), // COA account mapping
});

// CSV import schema
export const csvImportSchema = z.object({
  file: z.instanceof(File).refine(
    (file) => file.type === "text/csv" || file.name.endsWith('.csv'),
    "Archivo debe ser CSV"
  ).refine(
    (file) => file.size < 10 * 1024 * 1024, // 10MB
    "Archivo no puede ser mayor a 10MB"
  ),
  bankId: z.string().min(1, "Banco es obligatorio"),
  dateColumn: z.string().min(1, "Columna de fecha es obligatoria"),
  amountColumn: z.string().min(1, "Columna de importe es obligatoria"),
  descriptionColumn: z.string().min(1, "Columna de descripción es obligatoria"),
  referenceColumn: z.string().optional(),
  dateFormat: z.enum(["DD/MM/YYYY", "MM/DD/YYYY", "YYYY-MM-DD"]).default("DD/MM/YYYY"),
});

// Bank reconciliation schema
export const bankReconciliationSchema = z.object({
  transactionId: z.string().min(1),
  account: z.string().min(1, "Cuenta contable es obligatoria"),
  costCenter: z.string().optional(),
  taxCode: z.string().optional(),
  description: z.string().max(200).optional(),
});

// Filter schemas
export const logFiltersSchema = z.object({
  providerId: z.string().optional(),
  type: z.string().optional(),
  entity: z.string().optional(),
  result: z.enum(["ok", "error"]).optional(),
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  q: z.string().optional(),
  page: z.number().min(1).optional(),
  size: z.number().min(1).max(100).optional(),
  sort: z.string().optional(),
});

export const syncJobFiltersSchema = z.object({
  type: z.enum(["invoice", "expense", "ledger", "payment", "bank"]).optional(),
  status: z.enum(["ok", "error", "pending"]).optional(),
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  page: z.number().min(1).optional(),
  size: z.number().min(1).max(100).optional(),
});

export const bankReconciliationFiltersSchema = z.object({
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha desde debe estar en formato YYYY-MM-DD"),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha hasta debe estar en formato YYYY-MM-DD"),
  bankId: z.string().optional(),
  reconciled: z.boolean().optional(),
  minAmount: z.number().optional(),
  maxAmount: z.number().optional(),
});

// Test connection schema
export const testConnectionSchema = z.object({
  providerId: z.string().min(1, "Proveedor es obligatorio"),
});

// Import/Export schema
export const importConfigSchema = z.object({
  version: z.string(),
  timestamp: z.string(),
  mappings: z.array(coaMapItemSchema).optional(),
  taxProfiles: z.array(taxProfileSchema).optional(),
  costCenters: z.array(costCenterSchema).optional(),
  currency: currencySettingsSchema.optional(),
  syncPolicies: syncPolicySchema.optional(),
  bankConnections: z.array(bankConnectionSchema).optional(),
});

// Validation helpers
export function validateRequiredMappings(mappings: any[]): string[] {
  const requiredEntities = [
    { entity: "sales_fees", name: "Ventas - Honorarios" },
    { entity: "customers", name: "Clientes" },
    { entity: "banks", name: "Bancos" },
    { entity: "vat_output", name: "IVA Repercutido" },
    { entity: "vat_input", name: "IVA Soportado" },
  ];

  const mappedEntities = mappings.map(m => m.entity);
  return requiredEntities
    .filter(req => !mappedEntities.includes(req.entity))
    .map(req => req.name);
}

export function validateTaxRates(iva: number, irpf?: number, recargoEq?: number): string[] {
  const errors: string[] = [];
  
  // Spanish VAT rates
  if (![0, 4, 10, 21].includes(iva)) {
    errors.push("IVA debe ser 0%, 4%, 10% o 21%");
  }
  
  if (irpf !== undefined && (irpf < 0 || irpf > 21)) {
    errors.push("IRPF debe estar entre 0% y 21%");
  }
  
  if (recargoEq !== undefined && (recargoEq < 0 || recargoEq > 10)) {
    errors.push("Recargo de equivalencia debe estar entre 0% y 10%");
  }
  
  return errors;
}

export function validateLedgerBalance(lines: any[]): { balanced: boolean; difference: number } {
  const totalDebit = lines.reduce((sum, line) => sum + (line.debit || 0), 0);
  const totalCredit = lines.reduce((sum, line) => sum + (line.credit || 0), 0);
  const difference = Math.abs(totalDebit - totalCredit);
  
  return {
    balanced: difference < 0.01,
    difference
  };
}