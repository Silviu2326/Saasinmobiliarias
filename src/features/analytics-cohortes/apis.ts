import type { 
  CohortFilters, 
  CohortRow, 
  HeatCell, 
  RetentionPoint, 
  StageMatrixCell, 
  TimeToEventPoint, 
  SurvivalPoint, 
  DrilldownItem,
  EventType
} from "./types";
import { filtersToQueryString } from "./utils";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "/api";

export const fetchCohorts = async (filters: CohortFilters = {}): Promise<CohortRow[]> => {
  const queryString = filtersToQueryString(filters);
  const url = `${API_BASE}/analytics/cohorts${queryString ? `?${queryString}` : ""}`;
  
  const mockData: CohortRow[] = [
    {
      cohort: "2024-01",
      size: 1250,
      visitPctM1: 45.2,
      visitPctM2: 52.1,
      offerPctM1: 28.4,
      offerPctM2: 34.7,
      contractPctM1: 12.8,
      contractPctM2: 18.3,
      contractPctM3: 22.1,
      contractPctCum: 24.5,
      timeToContractP50: 45,
      timeToContractP90: 89,
      topChannel: "web"
    },
    {
      cohort: "2024-02",
      size: 1180,
      visitPctM1: 42.8,
      visitPctM2: 49.6,
      offerPctM1: 26.1,
      offerPctM2: 31.9,
      contractPctM1: 11.2,
      contractPctM2: 16.7,
      contractPctM3: 20.4,
      contractPctCum: 22.8,
      timeToContractP50: 52,
      timeToContractP90: 94,
      topChannel: "portal"
    },
    {
      cohort: "2024-03",
      size: 1340,
      visitPctM1: 48.7,
      visitPctM2: 55.3,
      offerPctM1: 31.2,
      offerPctM2: 37.8,
      contractPctM1: 14.1,
      contractPctM2: 19.9,
      contractPctM3: 24.2,
      contractPctCum: 26.7,
      timeToContractP50: 41,
      timeToContractP90: 82,
      topChannel: "ads"
    }
  ];
  
  return new Promise(resolve => setTimeout(() => resolve(mockData), 300));
};

export const fetchHeatmap = async (filters: CohortFilters = {}): Promise<HeatCell[]> => {
  const queryString = filtersToQueryString({...filters, endpoint: "heatmap"});
  const url = `${API_BASE}/analytics/cohorts/heatmap${queryString ? `?${queryString}` : ""}`;
  
  const mockData: HeatCell[] = [
    { cohort: "2024-01", monthRel: 0, stage: "CONTRATO", pct: 8.2, count: 103, totalSize: 1250 },
    { cohort: "2024-01", monthRel: 1, stage: "CONTRATO", pct: 12.8, count: 160, totalSize: 1250 },
    { cohort: "2024-01", monthRel: 2, stage: "CONTRATO", pct: 18.3, count: 229, totalSize: 1250 },
    { cohort: "2024-01", monthRel: 3, stage: "CONTRATO", pct: 22.1, count: 276, totalSize: 1250 },
    { cohort: "2024-02", monthRel: 0, stage: "CONTRATO", pct: 7.1, count: 84, totalSize: 1180 },
    { cohort: "2024-02", monthRel: 1, stage: "CONTRATO", pct: 11.2, count: 132, totalSize: 1180 },
    { cohort: "2024-02", monthRel: 2, stage: "CONTRATO", pct: 16.7, count: 197, totalSize: 1180 },
    { cohort: "2024-03", monthRel: 0, stage: "CONTRATO", pct: 9.4, count: 126, totalSize: 1340 },
    { cohort: "2024-03", monthRel: 1, stage: "CONTRATO", pct: 14.1, count: 189, totalSize: 1340 }
  ];
  
  return new Promise(resolve => setTimeout(() => resolve(mockData), 250));
};

export const fetchRetention = async (filters: CohortFilters = {}): Promise<RetentionPoint[]> => {
  const queryString = filtersToQueryString({...filters, endpoint: "retention"});
  const url = `${API_BASE}/analytics/cohorts/retention${queryString ? `?${queryString}` : ""}`;
  
  const mockData: RetentionPoint[] = [
    { cohort: "2024-01", monthRel: 0, pctCum: 8.2, count: 103 },
    { cohort: "2024-01", monthRel: 1, pctCum: 12.8, count: 160 },
    { cohort: "2024-01", monthRel: 2, pctCum: 18.3, count: 229 },
    { cohort: "2024-01", monthRel: 3, pctCum: 22.1, count: 276 },
    { cohort: "2024-02", monthRel: 0, pctCum: 7.1, count: 84 },
    { cohort: "2024-02", monthRel: 1, pctCum: 11.2, count: 132 },
    { cohort: "2024-02", monthRel: 2, pctCum: 16.7, count: 197 },
    { cohort: "2024-03", monthRel: 0, pctCum: 9.4, count: 126 },
    { cohort: "2024-03", monthRel: 1, pctCum: 14.1, count: 189 }
  ];
  
  return new Promise(resolve => setTimeout(() => resolve(mockData), 280));
};

export const fetchStageMatrix = async (filters: CohortFilters = {}): Promise<StageMatrixCell[]> => {
  const queryString = filtersToQueryString({...filters, endpoint: "stage-matrix"});
  const url = `${API_BASE}/analytics/cohorts/stage-matrix${queryString ? `?${queryString}` : ""}`;
  
  const mockData: StageMatrixCell[] = [
    { cohort: "2024-01", monthRel: 0, stage: "LEAD", pctInMonth: 100, count: 1250 },
    { cohort: "2024-01", monthRel: 0, stage: "VISITA", pctInMonth: 32.4, count: 405 },
    { cohort: "2024-01", monthRel: 0, stage: "OFERTA", pctInMonth: 18.7, count: 234 },
    { cohort: "2024-01", monthRel: 0, stage: "CONTRATO", pctInMonth: 8.2, count: 103 },
    { cohort: "2024-01", monthRel: 1, stage: "VISITA", pctInMonth: 12.8, count: 160 },
    { cohort: "2024-01", monthRel: 1, stage: "OFERTA", pctInMonth: 9.7, count: 121 },
    { cohort: "2024-01", monthRel: 1, stage: "CONTRATO", pctInMonth: 4.6, count: 57 }
  ];
  
  return new Promise(resolve => setTimeout(() => resolve(mockData), 290));
};

export const fetchTimeToEvent = async (
  filters: CohortFilters = {}, 
  event: EventType = "CONTRATO"
): Promise<TimeToEventPoint[]> => {
  const queryString = filtersToQueryString({...filters, event});
  const url = `${API_BASE}/analytics/cohorts/time-to-event${queryString ? `?${queryString}` : ""}`;
  
  const mockData: TimeToEventPoint[] = [
    { cohort: "2024-01", days: 45, p50: 45, p90: 89, event, count: 306 },
    { cohort: "2024-02", days: 52, p50: 52, p90: 94, event, count: 269 },
    { cohort: "2024-03", days: 41, p50: 41, p90: 82, event, count: 358 }
  ];
  
  return new Promise(resolve => setTimeout(() => resolve(mockData), 320));
};

export const fetchSurvival = async (filters: CohortFilters = {}): Promise<SurvivalPoint[]> => {
  const queryString = filtersToQueryString({...filters, endpoint: "survival"});
  const url = `${API_BASE}/analytics/cohorts/survival${queryString ? `?${queryString}` : ""}`;
  
  const mockData: SurvivalPoint[] = [
    { cohort: "2024-01", monthRel: 0, survival: 91.8, atRisk: 1250, events: 103 },
    { cohort: "2024-01", monthRel: 1, survival: 87.2, atRisk: 1147, events: 57 },
    { cohort: "2024-01", monthRel: 2, survival: 81.7, atRisk: 1090, events: 69 },
    { cohort: "2024-01", monthRel: 3, survival: 77.9, atRisk: 1021, events: 47 },
    { cohort: "2024-02", monthRel: 0, survival: 92.9, atRisk: 1180, events: 84 },
    { cohort: "2024-02", monthRel: 1, survival: 88.8, atRisk: 1096, events: 48 },
    { cohort: "2024-02", monthRel: 2, survival: 83.3, atRisk: 1048, events: 65 },
    { cohort: "2024-03", monthRel: 0, survival: 90.6, atRisk: 1340, events: 126 },
    { cohort: "2024-03", monthRel: 1, survival: 85.9, atRisk: 1214, events: 63 }
  ];
  
  return new Promise(resolve => setTimeout(() => resolve(mockData), 300));
};

export const fetchDrilldown = async (params: {
  cohort: string;
  monthRel: number;
  event: string;
  filters?: CohortFilters;
}): Promise<DrilldownItem[]> => {
  const queryString = filtersToQueryString({...params.filters, ...params});
  const url = `${API_BASE}/analytics/cohorts/drilldown${queryString ? `?${queryString}` : ""}`;
  
  const mockData: DrilldownItem[] = [
    {
      id: "lead-001",
      name: "María G.",
      email: "m***@email.com",
      phone: "6**-**8-**1",
      channel: "web",
      portal: "Idealista",
      agent: "Ana Martín",
      propertyRef: "MAD-12345",
      stageDates: {
        LEAD: "2024-01-15",
        VISITA: "2024-01-28",
        OFERTA: "2024-02-05",
        CONTRATO: "2024-02-12"
      },
      currentStage: "CONTRATO",
      price: 285000,
      zone: "Centro",
      typology: "piso"
    },
    {
      id: "lead-002",
      name: "Carlos R.",
      email: "c***@email.com",
      phone: "6**-**2-**9",
      channel: "portal",
      portal: "Fotocasa",
      agent: "Luis Gómez",
      propertyRef: "MAD-12346",
      stageDates: {
        LEAD: "2024-01-18",
        VISITA: "2024-02-01",
        OFERTA: "2024-02-08",
        CONTRATO: "2024-02-15"
      },
      currentStage: "CONTRATO",
      price: 320000,
      zone: "Norte",
      typology: "casa"
    }
  ];
  
  return new Promise(resolve => setTimeout(() => resolve(mockData), 400));
};

export const exportData = async (options: {
  format: "CSV" | "JSON" | "PNG";
  type: "table" | "heatmap" | "retention" | "all";
  filters: CohortFilters;
}): Promise<{ success: boolean; url?: string; message?: string }> => {
  const url = `${API_BASE}/analytics/cohorts/export`;
  
  return new Promise(resolve => 
    setTimeout(() => resolve({ 
      success: true, 
      url: `/tmp/cohort-export-${Date.now()}.${options.format.toLowerCase()}`,
      message: "Exportación completada"
    }), 1000)
  );
};