export type ProviderStatus = "DISCONNECTED" | "CONNECTED" | "ERROR";
export type JobStatus = "ok" | "error" | "pending";
export type SyncDirection = "ONE_WAY" | "TWO_WAY";
export type ConnectMode = "OAUTH" | "API_KEY" | "CREDENTIALS";
export type TaxPeriod = "M" | "Q" | "Y"; // Monthly, Quarterly, Yearly
export type CostCenterScope = "GLOBAL" | "OFICINA" | "EQUIPO" | "PROYECTO";
export type SyncGrouping = "NONE" | "BY_PRODUCT" | "BY_TAX";
export type JobType = "invoice" | "expense" | "ledger" | "payment" | "bank";
export type LogResult = "ok" | "error";
export type BankStatus = "connected" | "disconnected";

export interface ProviderInfo {
  id: string;
  name: string;
  logo: string;
  status: ProviderStatus;
  plan?: string;
  lastSyncAt?: string;
  connectMode: ConnectMode;
  features: {
    invoices: boolean;
    expenses: boolean;
    banking: boolean;
    reports: boolean;
    sii?: boolean;
  };
}

export interface ConnectionConfig {
  mode: ConnectMode;
  scope: "GLOBAL" | "OFICINA";
  officeId?: string;
  oauth?: {
    clientId: string;
    clientSecret: string;
    redirectUri: string;
  };
  apiKey?: {
    apiKey: string;
    companyId?: string;
    environment?: string;
  };
  credentials?: {
    username: string;
    password: string;
    tenant?: string;
    database?: string;
  };
}

export interface CoaMapItem {
  entity: string; // "sales_fees", "rental_income", "customers", "banks", etc.
  purpose: string; // Human readable description
  account: string; // Account code in ERP
  costCenter?: string;
  required?: boolean;
}

export interface TaxProfile {
  id: string;
  name: string;
  iva: number; // 0, 4, 10, 21
  irpf?: number; // 0-21
  recargoEq?: number; // Surcharge equivalence
  exempt?: boolean;
  period: TaxPeriod;
  prorataPct?: number; // 0-100
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CostCenter {
  id: string;
  name: string;
  code?: string;
  scope: CostCenterScope;
  refId?: string; // Reference to office/team/project
  active: boolean;
  isDefault?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CurrencySettings {
  baseCurrency: string; // EUR, USD, etc.
  allowedCurrencies: string[];
  exchangeRates: Record<string, number>; // simulated rates
  roundingPolicy: "STANDARD" | "UP" | "DOWN";
  exchangeDiffAccount?: string; // Account for exchange differences
  tolerance: number; // Maximum difference allowed
}

export interface SyncPolicy {
  direction: SyncDirection;
  triggers: {
    invoices: boolean;
    expenses: boolean;
    payouts: boolean;
    settlements: boolean;
    payments: boolean;
  };
  windowDays: number; // How many days back to sync
  grouping: SyncGrouping;
  reconciliation: {
    enabled: boolean;
    tolerance: number; // Amount tolerance in base currency
  };
  autoRetry: boolean;
  maxRetries: number;
}

export interface LedgerLine {
  date: string;
  account: string;
  description: string;
  debit: number;
  credit: number;
  costCenter?: string;
  taxCode?: string;
  reference?: string;
  currency?: string;
  exchangeRate?: number;
}

export interface LedgerPreview {
  lines: LedgerLine[];
  totalDebit: number;
  totalCredit: number;
  balanced: boolean;
  currency: string;
  exchangeRate?: number;
  errors: string[];
  warnings: string[];
}

export interface BankConnection {
  id: string;
  name: string;
  iban?: string;
  status: BankStatus;
  provider?: string; // "bank_feed", "csv_import"
  lastSyncAt?: string;
  balance?: number;
  currency: string;
  account?: string; // Mapped COA account
}

export interface BankTransaction {
  id: string;
  date: string;
  amount: number;
  currency: string;
  description: string;
  reference?: string;
  counterparty?: string;
  iban?: string;
  reconciled: boolean;
  suggestedAccount?: string;
  suggestedCostCenter?: string;
}

export interface SyncJob {
  id: string;
  type: JobType;
  entity?: string; // Entity ID being synced
  entityType?: string; // invoice, expense, etc.
  status: JobStatus;
  message?: string;
  durationMs?: number;
  attempts: number;
  maxAttempts: number;
  scheduledAt: string;
  startedAt?: string;
  finishedAt?: string;
  progress?: number; // 0-100
  results?: {
    processed: number;
    succeeded: number;
    failed: number;
    skipped: number;
  };
}

export interface LogItem {
  id: string;
  at: string;
  providerId?: string;
  type: string; // "connection", "sync", "mapping", "tax", etc.
  entity?: string;
  entityId?: string;
  action: string; // "create", "update", "delete", "sync", "test"
  result: LogResult;
  message?: string;
  duration?: number;
  userId?: string;
  details?: Record<string, any>;
}

export interface SiiStatus {
  enabled: boolean;
  environment: "PROD" | "TEST";
  lastSync?: string;
  queuedItems: number;
  errors24h: number;
  recentSubmissions: Array<{
    type: "sales" | "purchases";
    period: string;
    submitted: number;
    accepted: number;
    rejected: number;
    submittedAt: string;
  }>;
}

export interface ReportShortcut {
  id: string;
  name: string;
  description: string;
  url: string;
  icon: string;
  category: "LEDGER" | "TAX" | "REPORTS" | "SII";
  available: boolean;
}

export interface ImportExportConfig {
  version: string;
  timestamp: string;
  mappings: CoaMapItem[];
  taxProfiles: TaxProfile[];
  costCenters: CostCenter[];
  currency: CurrencySettings;
  syncPolicies: SyncPolicy;
  bankConnections: Omit<BankConnection, 'balance' | 'lastSyncAt'>[];
}

// Filter interfaces
export interface LogFilters {
  providerId?: string;
  type?: string;
  entity?: string;
  result?: LogResult;
  from?: string;
  to?: string;
  q?: string; // search query
  page?: number;
  size?: number;
  sort?: string;
}

export interface SyncJobFilters {
  type?: JobType;
  status?: JobStatus;
  from?: string;
  to?: string;
  page?: number;
  size?: number;
}

export interface BankReconciliationFilters {
  from: string;
  to: string;
  bankId?: string;
  reconciled?: boolean;
  minAmount?: number;
  maxAmount?: number;
}

// Form interfaces
export interface CoaMappingForm {
  mappings: CoaMapItem[];
}

export interface TaxProfileForm extends Omit<TaxProfile, 'id' | 'createdAt' | 'updatedAt'> {}

export interface CostCenterForm extends Omit<CostCenter, 'id' | 'createdAt' | 'updatedAt'> {}

export interface TestResult {
  success: boolean;
  latencyMs?: number;
  error?: string;
  timestamp: string;
  details?: Record<string, any>;
}