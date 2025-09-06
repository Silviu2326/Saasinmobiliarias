export type Stage = "LEAD" | "CONTACTADO" | "VISITA" | "OFERTA" | "RESERVA" | "CONTRATO";
export type AttributionModel = "last" | "first" | "linear" | "ushaped";
export type ConversionTo = "OFERTA" | "CONTRATO";
export type Dimension = "canal" | "campana" | "portal";
export type Canal = "web" | "portal" | "whatsapp" | "referido" | "ads";
export type Dispositivo = "mobile" | "desktop";
export type TipoOperacion = "venta" | "alquiler";
export type Origen = "landing" | "chatbot" | "portales";

export interface ConversionFilters {
  from?: string;
  to?: string;
  canal?: Canal;
  campana?: string;
  portal?: string;
  agente?: string;
  equipo?: string;
  oficina?: string;
  dispositivo?: Dispositivo;
  tipo?: TipoOperacion;
  origen?: Origen;
}

export interface FunnelPoint {
  stage: Stage;
  count: number;
  stageRate: number;
  cumulativeRate: number;
  topChannels?: { channel: string; count: number }[];
}

export interface StageStats {
  stage: Stage;
  count: number;
  stageRate: number;
  cumulativeRate: number;
  avgDays: number;
  deltaPct?: number;
}

export interface DropoffReason {
  stage: Stage;
  reason: string;
  share: number;
  trend?: number;
}

export interface TimeStats {
  stage: Stage;
  p50: number;
  p90: number;
  to: ConversionTo;
}

export interface AttributionRow {
  dimension: Dimension;
  key: string;
  leads: number;
  contracts: number;
  contributionPct: number;
  cpl?: number;
  cpa?: number;
}

export interface AgentPerf {
  agentId: string;
  agentName: string;
  leads: number;
  visits: number;
  offers: number;
  contracts: number;
  convGlobal: number;
  firstResponseH: number;
  responseRate: number;
  isTop?: boolean;
  isBottom?: boolean;
}

export interface PortalPerf {
  portal: string;
  leads: number;
  convVisit: number;
  convOffer: number;
  convContract: number;
  cpl?: number;
  cpa?: number;
  duplicatesPct?: number;
}

export interface CohortRow {
  month: string;
  leads: number;
  visitPct: number;
  offerPct: number;
  contractPct: number;
  cumContractPct: number;
}

export interface ABTestVariant {
  name: string;
  impressions: number;
  clicks: number;
  leads: number;
  contracts: number;
}

export interface ABTestResult {
  variants: ABTestVariant[];
  uplift: number;
  significance: number;
  winner?: string;
}

export interface ExportOptions {
  format: "CSV" | "JSON" | "PNG";
  data?: any;
  filename?: string;
}

export interface KpiData {
  conversionGlobal: number;
  conversionLeadVisit: number;
  conversionVisitOffer: number;
  conversionOfferReserva: number;
  conversionReservaContrato: number;
  cpl: number;
  cpa: number;
  avgFirstContactH: number;
  deltaPrevPeriod?: {
    conversionGlobal?: number;
    cpl?: number;
    cpa?: number;
  };
}

export interface FunnelApiResponse {
  funnel: FunnelPoint[];
  kpis: KpiData;
}

export interface StagesApiResponse {
  stages: StageStats[];
}

export interface TimeToConvertApiResponse {
  timeStats: TimeStats[];
}

export interface DropoffsApiResponse {
  dropoffs: DropoffReason[];
}

export interface AttributionApiResponse {
  rows: AttributionRow[];
}

export interface AgentsPerformanceApiResponse {
  agents: AgentPerf[];
}

export interface PortalsPerformanceApiResponse {
  portals: PortalPerf[];
}

export interface CohortsApiResponse {
  cohorts: CohortRow[];
}