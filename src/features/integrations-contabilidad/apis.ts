import type {
  ProviderInfo,
  ConnectionConfig,
  CoaMapItem,
  TaxProfile,
  CostCenter,
  CurrencySettings,
  SyncPolicy,
  LedgerPreview,
  LedgerLine,
  BankConnection,
  BankTransaction,
  SyncJob,
  LogItem,
  SiiStatus,
  ReportShortcut,
  LogFilters,
  SyncJobFilters,
  BankReconciliationFilters,
  TestResult,
} from "./types";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "/api";

// Simulated delay for realistic API behavior
const delay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms));

// Mock data generators
const mockProviders: ProviderInfo[] = [
  {
    id: "sage",
    name: "Sage 50cloud",
    logo: "/logos/sage.svg",
    status: "CONNECTED",
    plan: "Professional",
    lastSyncAt: "2024-01-15T10:30:00Z",
    connectMode: "API_KEY",
    features: { invoices: true, expenses: true, banking: true, reports: true },
  },
  {
    id: "a3",
    name: "A3 ERP",
    logo: "/logos/a3.svg",
    status: "DISCONNECTED",
    connectMode: "CREDENTIALS",
    features: { invoices: true, expenses: true, banking: false, reports: true },
  },
  {
    id: "holded",
    name: "Holded",
    logo: "/logos/holded.svg",
    status: "CONNECTED",
    plan: "Enterprise",
    lastSyncAt: "2024-01-14T16:45:00Z",
    connectMode: "OAUTH",
    features: { invoices: true, expenses: true, banking: true, reports: true, sii: true },
  },
  {
    id: "xero",
    name: "Xero",
    logo: "/logos/xero.svg",
    status: "ERROR",
    plan: "Growing",
    lastSyncAt: "2024-01-10T09:15:00Z",
    connectMode: "OAUTH",
    features: { invoices: true, expenses: true, banking: true, reports: true },
  },
  {
    id: "quickbooks",
    name: "QuickBooks Online",
    logo: "/logos/quickbooks.svg",
    status: "DISCONNECTED",
    connectMode: "OAUTH",
    features: { invoices: true, expenses: true, banking: true, reports: true },
  },
  {
    id: "contasol",
    name: "ContaSol",
    logo: "/logos/contasol.svg",
    status: "CONNECTED",
    plan: "Básico",
    lastSyncAt: "2024-01-15T08:20:00Z",
    connectMode: "CREDENTIALS",
    features: { invoices: true, expenses: false, banking: false, reports: true },
  },
];

const mockCoaMapping: CoaMapItem[] = [
  { entity: "sales_fees", purpose: "Ventas - Honorarios profesionales", account: "70500", required: true },
  { entity: "rental_income", purpose: "Ingresos por alquiler", account: "70510", required: false },
  { entity: "customers", purpose: "Deudores por operaciones comerciales", account: "43000", required: true },
  { entity: "banks", purpose: "Bancos e instituciones de crédito", account: "57200", required: true },
  { entity: "vat_output", purpose: "IVA repercutido", account: "47700", required: true },
  { entity: "vat_input", purpose: "IVA soportado", account: "47200", required: true },
  { entity: "irpf_retention", purpose: "Retenciones IRPF", account: "47300", required: false },
  { entity: "suppliers", purpose: "Proveedores", account: "40000", required: false },
  { entity: "expenses", purpose: "Gastos de explotación", account: "62900", required: false },
];

const mockTaxProfiles: TaxProfile[] = [
  {
    id: "iva21",
    name: "IVA General 21%",
    iva: 21,
    period: "Q",
    isDefault: true,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "iva10",
    name: "IVA Reducido 10%",
    iva: 10,
    period: "Q",
    isDefault: false,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "iva21irpf15",
    name: "IVA 21% + IRPF 15%",
    iva: 21,
    irpf: 15,
    period: "Q",
    isDefault: false,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
];

const mockCostCenters: CostCenter[] = [
  {
    id: "cc-madrid",
    name: "Oficina Madrid",
    code: "MAD",
    scope: "OFICINA",
    refId: "office-madrid",
    active: true,
    isDefault: true,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "cc-barcelona",
    name: "Oficina Barcelona",
    code: "BCN",
    scope: "OFICINA",
    refId: "office-barcelona",
    active: true,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "cc-marketing",
    name: "Equipo Marketing",
    code: "MKT",
    scope: "EQUIPO",
    refId: "team-marketing",
    active: true,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
];

/* PROVIDERS */
export const getProviders = async (): Promise<ProviderInfo[]> => {
  await delay();
  return mockProviders;
};

export const connectProvider = async (
  id: string,
  config: ConnectionConfig
): Promise<{ success: boolean; message?: string }> => {
  await delay(1500);
  
  // Simulate different outcomes
  if (id === "a3" && config.mode === "CREDENTIALS") {
    return { success: false, message: "Base de datos no encontrada" };
  }
  
  if (id === "xero") {
    return { success: false, message: "Token OAuth expirado" };
  }
  
  return { success: true };
};

export const testProviderConnection = async (id: string): Promise<TestResult> => {
  await delay(800);
  
  if (id === "a3") {
    return {
      success: false,
      error: "Proveedor no conectado",
      timestamp: new Date().toISOString(),
    };
  }
  
  return {
    success: true,
    latencyMs: Math.floor(Math.random() * 200) + 50,
    timestamp: new Date().toISOString(),
    details: {
      companyName: "Mi Empresa SL",
      fiscalYear: "2024",
      currency: "EUR",
    },
  };
};

export const getProviderConfig = async (id: string): Promise<any> => {
  await delay();
  return {
    syncEnabled: true,
    lastSync: "2024-01-15T10:30:00Z",
    autoSync: true,
    syncFrequency: "daily",
  };
};

export const updateProviderConfig = async (id: string, config: any): Promise<void> => {
  await delay();
  // Simulate successful update
};

/* MAPPINGS & SETTINGS */
export const getCoaMapping = async (): Promise<CoaMapItem[]> => {
  await delay();
  return mockCoaMapping;
};

export const updateCoaMapping = async (mappings: CoaMapItem[]): Promise<void> => {
  await delay();
  // Simulate successful update
};

export const getTaxProfiles = async (): Promise<TaxProfile[]> => {
  await delay();
  return mockTaxProfiles;
};

export const saveTaxProfile = async (profile: Partial<TaxProfile>): Promise<TaxProfile> => {
  await delay();
  
  const now = new Date().toISOString();
  return {
    id: profile.id || `tax-${Date.now()}`,
    name: profile.name || "Nuevo Perfil",
    iva: profile.iva || 21,
    irpf: profile.irpf,
    recargoEq: profile.recargoEq,
    exempt: profile.exempt || false,
    period: profile.period || "Q",
    isDefault: profile.isDefault || false,
    createdAt: profile.id ? "2024-01-01T00:00:00Z" : now,
    updatedAt: now,
  };
};

export const deleteTaxProfile = async (id: string): Promise<void> => {
  await delay();
  // Simulate successful deletion
};

export const getCostCenters = async (): Promise<CostCenter[]> => {
  await delay();
  return mockCostCenters;
};

export const saveCostCenter = async (costCenter: Partial<CostCenter>): Promise<CostCenter> => {
  await delay();
  
  const now = new Date().toISOString();
  return {
    id: costCenter.id || `cc-${Date.now()}`,
    name: costCenter.name || "Nuevo Centro",
    code: costCenter.code,
    scope: costCenter.scope || "GLOBAL",
    refId: costCenter.refId,
    active: costCenter.active ?? true,
    isDefault: costCenter.isDefault,
    createdAt: costCenter.id ? "2024-01-01T00:00:00Z" : now,
    updatedAt: now,
  };
};

export const deleteCostCenter = async (id: string): Promise<void> => {
  await delay();
  // Simulate successful deletion
};

export const getCurrencySettings = async (): Promise<CurrencySettings> => {
  await delay();
  
  return {
    baseCurrency: "EUR",
    allowedCurrencies: ["EUR", "USD", "GBP"],
    exchangeRates: {
      "USD": 1.08,
      "GBP": 0.86,
    },
    roundingPolicy: "STANDARD",
    exchangeDiffAccount: "76800",
    tolerance: 0.01,
  };
};

export const updateCurrencySettings = async (settings: CurrencySettings): Promise<void> => {
  await delay();
  // Simulate successful update
};

/* SYNC POLICIES & STATUS */
export const getSyncPolicies = async (): Promise<SyncPolicy> => {
  await delay();
  
  return {
    direction: "ONE_WAY",
    triggers: {
      invoices: true,
      expenses: true,
      payouts: false,
      settlements: true,
      payments: true,
    },
    windowDays: 30,
    grouping: "BY_TAX",
    reconciliation: {
      enabled: true,
      tolerance: 0.05,
    },
    autoRetry: true,
    maxRetries: 3,
  };
};

export const updateSyncPolicies = async (policies: SyncPolicy): Promise<void> => {
  await delay();
  // Simulate successful update
};

export const getSyncStatus = async (filters?: SyncJobFilters): Promise<{
  data: SyncJob[];
  total: number;
  page: number;
  size: number;
}> => {
  await delay();
  
  const mockJobs: SyncJob[] = Array.from({ length: 20 }, (_, i) => ({
    id: `job-${i}`,
    type: ["invoice", "expense", "payment", "bank"][Math.floor(Math.random() * 4)] as any,
    entity: `entity-${i}`,
    entityType: Math.random() > 0.5 ? "invoice" : "expense",
    status: ["ok", "error", "pending"][Math.floor(Math.random() * 3)] as any,
    message: Math.random() > 0.7 ? "Error de validación" : undefined,
    durationMs: Math.floor(Math.random() * 5000) + 500,
    attempts: Math.floor(Math.random() * 3) + 1,
    maxAttempts: 3,
    scheduledAt: new Date(Date.now() - i * 3600000).toISOString(),
    startedAt: new Date(Date.now() - i * 3600000 + 1000).toISOString(),
    finishedAt: new Date(Date.now() - i * 3600000 + 3000).toISOString(),
    progress: 100,
    results: {
      processed: Math.floor(Math.random() * 10) + 1,
      succeeded: Math.floor(Math.random() * 8) + 1,
      failed: Math.floor(Math.random() * 2),
      skipped: 0,
    },
  }));

  const page = filters?.page || 1;
  const size = filters?.size || 10;
  const start = (page - 1) * size;
  const end = start + size;

  return {
    data: mockJobs.slice(start, end),
    total: mockJobs.length,
    page,
    size,
  };
};

export const runSync = async (type?: string): Promise<{ jobId: string }> => {
  await delay(1000);
  
  return {
    jobId: `job-${Date.now()}`,
  };
};

/* LEDGERS PREVIEW & PUSH */
export const previewLedgers = async (filters: any): Promise<LedgerPreview> => {
  await delay(1200);
  
  const mockLines: LedgerLine[] = [
    {
      date: "2024-01-15",
      account: "43000",
      description: "Factura FV-2024-001 - Cliente ABC SL",
      debit: 1210.00,
      credit: 0,
      costCenter: "MAD",
      reference: "FV-2024-001",
    },
    {
      date: "2024-01-15",
      account: "70500",
      description: "Ventas profesionales",
      debit: 0,
      credit: 1000.00,
      costCenter: "MAD",
      reference: "FV-2024-001",
    },
    {
      date: "2024-01-15",
      account: "47700",
      description: "IVA repercutido 21%",
      debit: 0,
      credit: 210.00,
      reference: "FV-2024-001",
    },
  ];

  return {
    lines: mockLines,
    totalDebit: 1210.00,
    totalCredit: 1210.00,
    balanced: true,
    currency: "EUR",
    errors: [],
    warnings: [],
  };
};

export const pushLedgers = async (preview: LedgerPreview): Promise<{ success: boolean; message?: string; erpReference?: string }> => {
  await delay(2000);
  
  if (Math.random() > 0.1) {
    return {
      success: true,
      erpReference: `AST-${Date.now()}`,
    };
  } else {
    return {
      success: false,
      message: "Error al conectar con el ERP",
    };
  }
};

/* BANKING */
export const getBankConnections = async (): Promise<BankConnection[]> => {
  await delay();
  
  return [
    {
      id: "bank-1",
      name: "BBVA Cuenta Corriente",
      iban: "ES1234567890123456789012",
      status: "connected",
      provider: "bank_feed",
      lastSyncAt: "2024-01-15T09:00:00Z",
      balance: 15420.75,
      currency: "EUR",
      account: "57200",
    },
    {
      id: "bank-2",
      name: "Santander Cuenta Nóminas",
      iban: "ES9876543210987654321098",
      status: "disconnected",
      currency: "EUR",
    },
  ];
};

export const connectBankFeed = async (bankId: string): Promise<{ success: boolean; message?: string }> => {
  await delay(2000);
  
  return { success: true };
};

export const importBankCsv = async (file: File, config: any): Promise<{
  success: boolean;
  imported: number;
  errors: string[];
}> => {
  await delay(3000);
  
  return {
    success: true,
    imported: 45,
    errors: [],
  };
};

export const getBankTransactions = async (filters: BankReconciliationFilters): Promise<BankTransaction[]> => {
  await delay();
  
  return Array.from({ length: 15 }, (_, i) => ({
    id: `tx-${i}`,
    date: new Date(Date.now() - i * 86400000).toISOString().split('T')[0],
    amount: (Math.random() - 0.5) * 2000,
    currency: "EUR",
    description: `Transferencia ${i + 1}`,
    reference: `REF-${String(i).padStart(6, '0')}`,
    counterparty: Math.random() > 0.5 ? "Cliente ABC SL" : "Proveedor XYZ SL",
    reconciled: Math.random() > 0.6,
    suggestedAccount: Math.random() > 0.5 ? "43000" : "40000",
    suggestedCostCenter: "MAD",
  }));
};

export const reconcileTransaction = async (
  transactionId: string,
  reconciliation: any
): Promise<{ success: boolean }> => {
  await delay(1000);
  
  return { success: true };
};

/* SII/AEAT (Placeholder) */
export const getSiiStatus = async (): Promise<SiiStatus> => {
  await delay();
  
  return {
    enabled: true,
    environment: "TEST",
    lastSync: "2024-01-15T12:00:00Z",
    queuedItems: 3,
    errors24h: 1,
    recentSubmissions: [
      {
        type: "sales",
        period: "2024-Q4",
        submitted: 25,
        accepted: 24,
        rejected: 1,
        submittedAt: "2024-01-15T10:30:00Z",
      },
      {
        type: "purchases",
        period: "2024-Q4",
        submitted: 18,
        accepted: 18,
        rejected: 0,
        submittedAt: "2024-01-15T11:15:00Z",
      },
    ],
  };
};

export const getSiiLogs = async (filters: any): Promise<LogItem[]> => {
  await delay();
  
  return [
    {
      id: "sii-1",
      at: "2024-01-15T10:30:00Z",
      type: "sii_sales",
      entity: "FV-2024-001",
      entityId: "invoice-123",
      action: "submit",
      result: "ok",
      message: "Enviado correctamente",
      duration: 1200,
    },
  ];
};

export const retrySiiSubmission = async (submissionId: string): Promise<{ success: boolean }> => {
  await delay(2000);
  
  return { success: true };
};

/* REPORTS SHORTCUTS */
export const getReportShortcuts = async (): Promise<ReportShortcut[]> => {
  await delay();
  
  return [
    {
      id: "mayor",
      name: "Libro Mayor",
      description: "Movimientos por cuenta contable",
      url: "/reports/ledger",
      icon: "📊",
      category: "LEDGER",
      available: true,
    },
    {
      id: "balance",
      name: "Balance Sumas y Saldos",
      description: "Balance de comprobación",
      url: "/reports/trial-balance",
      icon: "⚖️",
      category: "LEDGER",
      available: true,
    },
    {
      id: "modelo303",
      name: "Modelo 303 (IVA)",
      description: "Declaración trimestral IVA",
      url: "/reports/modelo-303",
      icon: "🧾",
      category: "TAX",
      available: false,
    },
    {
      id: "modelo390",
      name: "Modelo 390 (IVA Anual)",
      description: "Resumen anual IVA",
      url: "/reports/modelo-390",
      icon: "📋",
      category: "TAX",
      available: false,
    },
  ];
};

/* LOGS & AUDIT */
export const getLogs = async (filters: LogFilters): Promise<{
  data: LogItem[];
  total: number;
  page: number;
  size: number;
}> => {
  await delay();
  
  const mockLogs: LogItem[] = Array.from({ length: 50 }, (_, i) => ({
    id: `log-${i}`,
    at: new Date(Date.now() - i * 3600000).toISOString(),
    providerId: ["sage", "holded", "contasol"][Math.floor(Math.random() * 3)],
    type: ["connection", "sync", "mapping", "ledger"][Math.floor(Math.random() * 4)],
    entity: Math.random() > 0.5 ? `FV-2024-${String(i).padStart(3, '0')}` : undefined,
    entityId: Math.random() > 0.5 ? `entity-${i}` : undefined,
    action: ["create", "update", "sync", "test"][Math.floor(Math.random() * 4)],
    result: Math.random() > 0.2 ? "ok" : "error",
    message: Math.random() > 0.7 ? "Error de validación en cuenta contable" : "Operación completada",
    duration: Math.floor(Math.random() * 3000) + 100,
    userId: "user-1",
    details: {
      account: "70500",
      amount: Math.random() * 1000,
    },
  }));

  const page = filters.page || 1;
  const size = filters.size || 25;
  const start = (page - 1) * size;
  const end = start + size;

  return {
    data: mockLogs.slice(start, end),
    total: mockLogs.length,
    page,
    size,
  };
};

export const getAuditEvents = async (resourceId?: string): Promise<any[]> => {
  await delay();
  
  return [
    {
      id: "audit-1",
      timestamp: new Date().toISOString(),
      userId: "user-001",
      action: "UPDATE",
      resource: "coa_mapping",
      resourceId: resourceId || "mapping-1",
      details: { field: "account", operation: "change_account" },
      oldValues: { account: "70000" },
      newValues: { account: "70500" },
    },
  ];
};

/* IMPORT/EXPORT */
export const exportConfig = async (): Promise<any> => {
  await delay(1500);
  
  return {
    version: "1.0.0",
    timestamp: new Date().toISOString(),
    mappings: mockCoaMapping,
    taxProfiles: mockTaxProfiles,
    costCenters: mockCostCenters,
    currency: await getCurrencySettings(),
    syncPolicies: await getSyncPolicies(),
    bankConnections: (await getBankConnections()).map(({ balance, lastSyncAt, ...conn }) => conn),
  };
};

export const importConfig = async (config: any): Promise<{ success: boolean; errors?: string[] }> => {
  await delay(2500);
  
  if (Math.random() > 0.1) {
    return { success: true };
  } else {
    return {
      success: false,
      errors: ["Versión no compatible", "Falta mapeo de cuenta obligatoria"],
    };
  }
};