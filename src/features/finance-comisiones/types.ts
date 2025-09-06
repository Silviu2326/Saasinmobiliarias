export type Scope = "GLOBAL" | "OFICINA" | "EQUIPO" | "AGENTE";
export type Source = "OFERTA" | "RESERVA" | "CONTRATO" | "COBRO";
export type Status = "PENDIENTE" | "APROBADO" | "LIQUIDADO";
export type PaymentMethod = "TRANSFER" | "CASH" | "OTHER";
export type PaymentStatus = "PENDIENTE" | "ENVIADO" | "CONCILIADO";
export type ReconciliationStatus = "OPEN" | "RESOLVED";
export type ReconciliationType = "FACTURA" | "GASTO" | "COBRO";
export type OperationType = "VENTA" | "ALQUILER";

export interface CommissionItem {
  id: string;
  source: Source;
  ref: string;
  date: string;
  agentId: string;
  agentName: string;
  officeId?: string;
  officeName?: string;
  baseAmount: number;
  planId?: string;
  rateApplied?: number;
  commissionAmount: number;
  status: Status;
  adjustments?: number;
  netAmount?: number;
}

export interface CommissionRule {
  min?: number;
  max?: number;
  rate: number;
}

export interface CommissionSplit {
  agent: number;
  office?: number;
  team?: number;
}

export interface CommissionConditions {
  type?: OperationType;
  exclusive?: boolean;
  channel?: string;
  officeId?: string;
}

export interface CommissionPlan {
  id: string;
  name: string;
  scope: Scope;
  scopeRef?: string;
  priority: number;
  rules: CommissionRule[];
  minPayout?: number;
  cap?: number;
  split?: CommissionSplit;
  conditions?: CommissionConditions;
  validFrom?: string;
  validTo?: string;
  updatedAt: string;
  createdBy?: string;
}

export interface SettlementResult {
  id: string;
  period: string;
  items: string[];
  gross: number;
  adjustments: number;
  net: number;
  createdAt: string;
  createdBy?: string;
}

export interface Payout {
  id: string;
  agentId: string;
  agentName: string;
  period: string;
  gross: number;
  withholdings: number;
  net: number;
  method: PaymentMethod;
  status: PaymentStatus;
  receiptUrl?: string;
  paidAt?: string;
  createdAt: string;
}

export interface ReconciliationIssue {
  id: string;
  type: ReconciliationType;
  ref: string;
  amount: number;
  status: ReconciliationStatus;
  note?: string;
  resolvedAt?: string;
  resolvedBy?: string;
}

export interface CommissionAdjustment {
  id: string;
  itemId: string;
  delta: number;
  reason: string;
  fileUrl?: string;
  createdAt: string;
  createdBy: string;
}

export interface AuditTrailEntry {
  id: string;
  itemId: string;
  action: string;
  details: Record<string, any>;
  timestamp: string;
  actor: string;
}

export interface CommissionKPIs {
  totalCommissions: number;
  pendingAmount: number;
  averageCommission: number;
  topAgents: Array<{ agentId: string; agentName: string; total: number }>;
  liquidationRate: number;
  backlogByOffice: Array<{ officeId: string; officeName: string; count: number; amount: number }>;
}

export interface CommissionForecast {
  period: string;
  projected: number;
  trend: number;
  margin: number;
  assumptions: {
    conversionRate: number;
    averageCommission: number;
    pipeline: number;
  };
}

export interface CommissionsFilters {
  q?: string;
  period?: string;
  from?: string;
  to?: string;
  agent?: string;
  office?: string;
  type?: OperationType;
  status?: Status;
  source?: Source;
  page?: number;
  size?: number;
  sort?: string;
}

export interface CommissionsResponse {
  items: CommissionItem[];
  total: number;
  page: number;
  size: number;
  totalPages: number;
}

export interface CalculationPreview {
  baseAmount: number;
  planApplied: CommissionPlan;
  calculation: {
    step: number;
    min: number;
    max: number;
    rate: number;
    amount: number;
  }[];
  totalCommission: number;
  split?: {
    agent: number;
    office?: number;
    team?: number;
  };
}