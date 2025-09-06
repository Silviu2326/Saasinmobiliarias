export type Stage = "LEAD" | "VISITA" | "OFERTA" | "RESERVA" | "CONTRATO";

export type Channel = "web" | "portal" | "ads" | "whatsapp" | "referido";
export type DeviceType = "mobile" | "desktop" | "tablet";
export type PropertyType = "piso" | "casa" | "atico" | "duplex" | "chalet" | "local";
export type TransactionType = "venta" | "alquiler";
export type Origin = "landing" | "chatbot" | "portales";
export type EventType = "CONTRATO" | "OFERTA" | "VISITA";

export interface CohortRow {
  cohort: string;
  size: number;
  visitPctM1?: number;
  visitPctM2?: number;
  offerPctM1?: number;
  offerPctM2?: number;
  contractPctM1?: number;
  contractPctM2?: number;
  contractPctM3?: number;
  contractPctCum: number;
  timeToContractP50?: number;
  timeToContractP90?: number;
  topChannel?: string;
}

export interface HeatCell {
  cohort: string;
  monthRel: number;
  stage: Stage;
  pct: number;
  count: number;
  totalSize: number;
}

export interface RetentionPoint {
  cohort: string;
  monthRel: number;
  pctCum: number;
  count: number;
}

export interface StageMatrixCell {
  cohort: string;
  monthRel: number;
  stage: Stage;
  pctInMonth: number;
  count: number;
}

export interface TimeToEventPoint {
  cohort: string;
  days: number;
  p50: number;
  p90: number;
  event: EventType;
  count: number;
}

export interface SurvivalPoint {
  cohort: string;
  monthRel: number;
  survival: number;
  atRisk: number;
  events: number;
}

export interface DrilldownItem {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  channel?: Channel;
  portal?: string;
  agent?: string;
  propertyRef?: string;
  stageDates?: Partial<Record<Stage, string>>;
  currentStage?: Stage;
  price?: number;
  zone?: string;
  typology?: PropertyType;
}

export interface CohortFilters {
  from?: string;
  to?: string;
  window?: number;
  canal?: Channel;
  portal?: string;
  campana?: string;
  agente?: string;
  oficina?: string;
  tipo?: TransactionType;
  origen?: Origin;
  minSize?: number;
  priceMin?: number;
  priceMax?: number;
  zona?: string;
  tipologia?: PropertyType;
  device?: DeviceType;
  targetStage?: Stage;
}

export interface CohortKpis {
  avgContractPct: number;
  avgCohortSize: number;
  medianTtC: number;
  bestCohort: string;
  worstCohort: string;
  totalLeads: number;
  totalContracts: number;
}

export interface ExportOptions {
  format: "CSV" | "JSON" | "PNG";
  type: "table" | "heatmap" | "retention" | "all";
  filters: CohortFilters;
}