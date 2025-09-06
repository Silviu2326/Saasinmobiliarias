export type SettlementStatus = "BORRADOR" | "APROBADA" | "CERRADA";
export type Source = "OFERTA" | "RESERVA" | "CONTRATO" | "COBRO";
export type PaymentMethod = "TRANSFER" | "CASH" | "OTHER";
export type PaymentStatus = "PENDIENTE" | "ENVIADO" | "CONCILIADO";
export type OperationType = "VENTA" | "ALQUILER";

export interface Settlement {
  id: string;
  name: string;
  period: string;
  officeId?: string;
  officeName?: string;
  teamId?: string;
  teamName?: string;
  agentId?: string;
  agentName?: string;
  linesCount: number;
  gross: number;
  withholdings: number;
  net: number;
  status: SettlementStatus;
  createdBy: string;
  createdByName?: string;
  createdAt: string;
  closedAt?: string;
  closedBy?: string;
  notes?: string;
}

export interface SettlementLine {
  id: string;
  settlementId: string;
  date: string;
  source: Source;
  ref: string;
  agentId: string;
  agentName: string;
  officeId?: string;
  officeName?: string;
  baseAmount: number;
  rateApplied?: number;
  commissionAmount: number;
  adjustments: number;
  netAmount: number;
  planId?: string;
  planName?: string;
}

export interface Payout {
  id: string;
  settlementId: string;
  agentId: string;
  agentName: string;
  gross: number;
  withholdings: number;
  net: number;
  method: PaymentMethod;
  status: PaymentStatus;
  receiptUrl?: string;
  paidAt?: string;
  createdAt: string;
  notes?: string;
}

export interface SettlementAdjustment {
  id: string;
  lineId: string;
  settlementId: string;
  delta?: number;
  percent?: number;
  reason: string;
  fileUrl?: string;
  createdAt: string;
  createdBy: string;
  oldAmount: number;
  newAmount: number;
}

export interface AuditTrailEntry {
  id: string;
  settlementId: string;
  lineId?: string;
  action: string;
  details: Record<string, any>;
  timestamp: string;
  actor: string;
}

export interface SettlementSummary {
  totalLines: number;
  totalAgents: number;
  grossAmount: number;
  totalWithholdings: number;
  netAmount: number;
  agentBreakdown: Array<{
    agentId: string;
    agentName: string;
    lines: number;
    gross: number;
    withholdings: number;
    net: number;
  }>;
}

export interface SettlementsFilters {
  period?: string;
  from?: string;
  to?: string;
  office?: string;
  agent?: string;
  team?: string;
  status?: SettlementStatus;
  origin?: OperationType;
  q?: string;
  page?: number;
  size?: number;
  sort?: string;
}

export interface SettlementsResponse {
  items: Settlement[];
  total: number;
  page: number;
  size: number;
  totalPages: number;
}

export interface WizardStep1Data {
  period: string;
  scope: "office" | "team" | "agent";
  scopeId: string;
  origin?: OperationType;
  onlyApproved: boolean;
}

export interface WizardStep2Data {
  selectedCommissionIds: string[];
}

export interface WizardStep3Data {
  calculationSummary: {
    totalItems: number;
    grossAmount: number;
    adjustments: number;
    netAmount: number;
  };
}

export interface WizardStep4Data {
  name: string;
  notes?: string;
}

export interface WizardData extends WizardStep1Data, WizardStep2Data, WizardStep3Data, WizardStep4Data {}

export interface EligibleCommission {
  id: string;
  source: Source;
  ref: string;
  date: string;
  agentId: string;
  agentName: string;
  baseAmount: number;
  commissionAmount: number;
  status: string;
}

export interface ClosePeriodData {
  settlementId: string;
  createAccountingEntry: boolean;
  notes?: string;
}