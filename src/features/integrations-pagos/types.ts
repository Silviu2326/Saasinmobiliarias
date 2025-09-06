export type ProviderStatus = "DISCONNECTED" | "TEST" | "LIVE" | "ERROR";
export type ChargeStatus = "succeeded" | "pending" | "failed" | "refunded";
export type DisputeStatus = "needs_response" | "under_review" | "won" | "lost";
export type SubscriptionStatus = "active" | "paused" | "canceled" | "past_due";
export type PayoutStatus = "scheduled" | "paid" | "failed";
export type Currency = "EUR" | "USD" | "GBP";

export interface ProviderInfo {
  id: string;
  name: string;
  logo: string;
  status: ProviderStatus;
  methods: string[];
  currencies: string[];
  lastSyncAt?: string;
}

export interface PaymentMethodCfg {
  id: string;
  name: string;
  enabled: boolean;
  requires3ds?: boolean;
  minAmount?: number;
  maxAmount?: number;
  feePct?: number;
  feeFixed?: number;
}

export interface CheckoutLink {
  id: string;
  url: string;
  qrUrl?: string;
  concept: string;
  amount: number;
  currency: Currency;
  status: "active" | "consumed" | "expired";
  ref?: {
    invoiceId?: string;
    contractId?: string;
  };
  visits: number;
  conversions: number;
  expireAt?: string;
  createdAt: string;
}

export interface Charge {
  id: string;
  providerId: string;
  customer: string;
  customerEmail?: string;
  amount: number;
  currency: string;
  method: string;
  status: ChargeStatus;
  ref?: {
    invoiceId?: string;
    contractId?: string;
  };
  createdAt: string;
}

export interface Refund {
  id: string;
  chargeId: string;
  amount: number;
  reason?: string;
  createdAt: string;
}

export interface Dispute {
  id: string;
  chargeId: string;
  status: DisputeStatus;
  amount: number;
  currency: string;
  dueBy?: string;
  evidence?: string[];
  updatedAt: string;
}

export interface Plan {
  id: string;
  name: string;
  amount: number;
  currency: string;
  interval: "month" | "quarter" | "year";
  trialDays?: number;
  taxPct?: number;
}

export interface Subscription {
  id: string;
  planId: string;
  customer: string;
  status: SubscriptionStatus;
  currentPeriodEnd: string;
  defaultMethod?: string;
  createdAt: string;
}

export interface Payout {
  id: string;
  providerId: string;
  date: string;
  gross: number;
  fees: number;
  net: number;
  status: PayoutStatus;
  iban?: string;
}

export interface ReconciliationItem {
  id: string;
  chargeId: string;
  invoiceId?: string;
  match: "exact" | "partial" | "none";
  delta: number;
  note?: string;
}

export interface WebhookConfig {
  url: string;
  secret: string;
  events: string[];
  enabled: boolean;
}

export interface LogItem {
  id: string;
  at: string;
  providerId?: string;
  type: string;
  entity?: string;
  result: "ok" | "error";
  message?: string;
}

export interface ConnectData {
  mode: "test" | "live";
  type: "oauth" | "apikey" | "credentials";
  credentials: Record<string, string>;
  office?: string;
  currencies: string[];
}

export interface ProviderConfig {
  methods: PaymentMethodCfg[];
  currencies: {
    base: string;
    allowed: string[];
    rounding: number;
  };
  branding: {
    logo?: string;
    color?: string;
    receiptText?: string;
    legalFooter?: string;
  };
  webhooks: WebhookConfig;
  risk: {
    force3ds: boolean;
    scoreThreshold: number;
    maxTicketAmount?: number;
    blockedCountries: string[];
    allowedRetries: number;
  };
}

export interface ChargeFilters {
  status?: ChargeStatus;
  method?: string;
  provider?: string;
  office?: string;
  customer?: string;
  ref?: string;
  from?: string;
  to?: string;
  page?: number;
  size?: number;
  sort?: string;
}

export interface DisputeFilters {
  status?: DisputeStatus;
  provider?: string;
  from?: string;
  to?: string;
}

export interface SubscriptionFilters {
  status?: SubscriptionStatus;
  planId?: string;
  customer?: string;
  from?: string;
  to?: string;
}

export interface PayoutFilters {
  provider?: string;
  from?: string;
  to?: string;
  status?: PayoutStatus;
}

export interface LogFilters {
  provider?: string;
  type?: string;
  status?: string;
  from?: string;
  to?: string;
  q?: string;
  page?: number;
  size?: number;
  sort?: string;
}

export interface FeeBreakdown {
  method: string;
  volume: number;
  currency: string;
  feePct: number;
  feeFixed: number;
  totalFees: number;
  netAmount: number;
}

export interface RiskRule {
  id: string;
  name: string;
  type: "score" | "3ds" | "limit" | "blacklist" | "country";
  condition: string;
  action: "allow" | "require3ds" | "block";
  enabled: boolean;
}

export interface AuditEvent {
  id: string;
  timestamp: string;
  userId: string;
  action: string;
  entityType: string;
  entityId: string;
  changes?: Record<string, any>;
  ipAddress?: string;
}