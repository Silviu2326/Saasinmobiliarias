export type Currency = "EUR" | "USD" | "GBP";

export interface Assumptions {
  convLeadVisit: number;
  convVisitOffer: number;
  convOfferReservation: number;
  convReservationContract: number;
  avgTicketSale: number;
  avgTicketRent: number;
  feesPctSale: number;
  feesPctRent: number;
  cycleDays: number;
  commissionPct: number;
  fixedCosts?: number;
  cac?: number;
  seasonality: number[];
}

export interface Scenario {
  id: string;
  name: string;
  kind: "BASELINE" | "OPTIMISTIC" | "PESSIMISTIC" | "CUSTOM";
  assumptions: Assumptions;
  isDefault?: boolean;
  updatedAt: string;
}

export interface ProjectionPoint {
  date: string;
  revenue: number;
  commissions: number;
  inflow: number;
  outflow: number;
  balance: number;
  contracts: number;
}

export interface Projection {
  from: string;
  to: string;
  currency: Currency;
  points: ProjectionPoint[];
  kpis: {
    arr: number;
    gmv: number;
    revenue3m: number;
    revenue12m: number;
    convGlobal: number;
    paybackMonths?: number;
  };
}

export interface PipelineData {
  leads: number;
  visits: number;
  offers: number;
  reservations: number;
  contracts: number;
  date: string;
}

export interface ForecastFilters {
  from: string;
  to: string;
  office?: string;
  team?: string;
  agent?: string;
  currency: Currency;
}

export interface SeasonalityFactor {
  month: number;
  factor: number;
}

export interface SensitivityVariable {
  name: string;
  baseline: number;
  impact: number;
  delta: number;
}

export interface CohortMetric {
  cohort: string;
  leadCount: number;
  timeToClose: number;
  conversionRate: number;
  avgRevenue: number;
  ltv?: number;
}

export interface WhatIfState {
  variables: Record<string, number>;
  isActive: boolean;
}

export interface ExportOptions {
  format: "CSV" | "JSON" | "PNG";
  includeCharts?: boolean;
  dateRange?: {
    from: string;
    to: string;
  };
}

export interface ForecastError {
  code: string;
  message: string;
  field?: string;
}

export interface ForecastResponse<T> {
  data?: T;
  error?: ForecastError;
  success: boolean;
}