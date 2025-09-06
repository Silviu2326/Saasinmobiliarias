import {
  ConversionFilters,
  FunnelApiResponse,
  StagesApiResponse,
  TimeToConvertApiResponse,
  DropoffsApiResponse,
  AttributionApiResponse,
  AttributionModel,
  AgentsPerformanceApiResponse,
  PortalsPerformanceApiResponse,
  CohortsApiResponse,
  ExportOptions,
  FunnelPoint,
  StageStats,
  TimeStats,
  DropoffReason,
  AttributionRow,
  AgentPerf,
  PortalPerf,
  CohortRow,
  KpiData,
} from "./types";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "/api";

// Función auxiliar para construir query params
const buildQueryParams = (params: Record<string, any>): string => {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.append(key, String(value));
    }
  });
  return searchParams.toString();
};

// Generador de datos simulados
const generateMockFunnel = (): FunnelPoint[] => [
  {
    stage: "LEAD",
    count: 1500 + Math.floor(Math.random() * 500),
    stageRate: 100,
    cumulativeRate: 100,
    topChannels: [
      { channel: "web", count: 450 },
      { channel: "portal", count: 380 },
      { channel: "ads", count: 320 },
    ],
  },
  {
    stage: "CONTACTADO",
    count: 1200 + Math.floor(Math.random() * 300),
    stageRate: 80 + Math.random() * 10,
    cumulativeRate: 80 + Math.random() * 10,
    topChannels: [
      { channel: "web", count: 380 },
      { channel: "portal", count: 310 },
      { channel: "ads", count: 250 },
    ],
  },
  {
    stage: "VISITA",
    count: 600 + Math.floor(Math.random() * 200),
    stageRate: 50 + Math.random() * 15,
    cumulativeRate: 40 + Math.random() * 10,
    topChannels: [
      { channel: "web", count: 200 },
      { channel: "portal", count: 150 },
      { channel: "referido", count: 100 },
    ],
  },
  {
    stage: "OFERTA",
    count: 300 + Math.floor(Math.random() * 100),
    stageRate: 50 + Math.random() * 10,
    cumulativeRate: 20 + Math.random() * 5,
    topChannels: [
      { channel: "web", count: 120 },
      { channel: "portal", count: 80 },
      { channel: "referido", count: 60 },
    ],
  },
  {
    stage: "RESERVA",
    count: 150 + Math.floor(Math.random() * 50),
    stageRate: 50 + Math.random() * 10,
    cumulativeRate: 10 + Math.random() * 3,
    topChannels: [
      { channel: "web", count: 60 },
      { channel: "portal", count: 40 },
      { channel: "referido", count: 30 },
    ],
  },
  {
    stage: "CONTRATO",
    count: 120 + Math.floor(Math.random() * 30),
    stageRate: 80 + Math.random() * 10,
    cumulativeRate: 8 + Math.random() * 2,
    topChannels: [
      { channel: "web", count: 50 },
      { channel: "portal", count: 35 },
      { channel: "referido", count: 25 },
    ],
  },
];

const generateMockKpis = (): KpiData => ({
  conversionGlobal: 8 + Math.random() * 2,
  conversionLeadVisit: 40 + Math.random() * 10,
  conversionVisitOffer: 50 + Math.random() * 10,
  conversionOfferReserva: 50 + Math.random() * 10,
  conversionReservaContrato: 80 + Math.random() * 10,
  cpl: 15 + Math.random() * 10,
  cpa: 150 + Math.random() * 50,
  avgFirstContactH: 2 + Math.random() * 4,
  deltaPrevPeriod: {
    conversionGlobal: -2 + Math.random() * 4,
    cpl: -5 + Math.random() * 10,
    cpa: -20 + Math.random() * 40,
  },
});

// APIs Simuladas

export const fetchConversionFunnel = async (
  filters: ConversionFilters
): Promise<FunnelApiResponse> => {
  const query = buildQueryParams(filters);
  const url = `${API_BASE}/analytics/conversion/funnel?${query}`;

  // Simulación
  await new Promise((resolve) => setTimeout(resolve, 500));
  return {
    funnel: generateMockFunnel(),
    kpis: generateMockKpis(),
  };
};

export const fetchStages = async (
  filters: ConversionFilters
): Promise<StagesApiResponse> => {
  const query = buildQueryParams(filters);
  const url = `${API_BASE}/analytics/conversion/stages?${query}`;

  // Simulación
  await new Promise((resolve) => setTimeout(resolve, 400));
  const stages: StageStats[] = [
    { stage: "LEAD", count: 1500, stageRate: 100, cumulativeRate: 100, avgDays: 0, deltaPct: 5 },
    { stage: "CONTACTADO", count: 1200, stageRate: 80, cumulativeRate: 80, avgDays: 0.5, deltaPct: -2 },
    { stage: "VISITA", count: 600, stageRate: 50, cumulativeRate: 40, avgDays: 3, deltaPct: 8 },
    { stage: "OFERTA", count: 300, stageRate: 50, cumulativeRate: 20, avgDays: 7, deltaPct: -5 },
    { stage: "RESERVA", count: 150, stageRate: 50, cumulativeRate: 10, avgDays: 14, deltaPct: 3 },
    { stage: "CONTRATO", count: 120, stageRate: 80, cumulativeRate: 8, avgDays: 21, deltaPct: 10 },
  ];
  return { stages };
};

export const fetchTimeToConvert = async (
  filters: ConversionFilters
): Promise<TimeToConvertApiResponse> => {
  const query = buildQueryParams(filters);
  const url = `${API_BASE}/analytics/conversion/timetoconvert?${query}`;

  // Simulación
  await new Promise((resolve) => setTimeout(resolve, 300));
  const timeStats: TimeStats[] = [
    { stage: "CONTACTADO", p50: 0.5, p90: 2, to: "CONTRATO" },
    { stage: "VISITA", p50: 3, p90: 7, to: "CONTRATO" },
    { stage: "OFERTA", p50: 7, p90: 15, to: "CONTRATO" },
    { stage: "RESERVA", p50: 14, p90: 30, to: "CONTRATO" },
    { stage: "CONTRATO", p50: 21, p90: 45, to: "CONTRATO" },
  ];
  return { timeStats };
};

export const fetchDropoffs = async (
  filters: ConversionFilters & { stage?: string }
): Promise<DropoffsApiResponse> => {
  const query = buildQueryParams(filters);
  const url = `${API_BASE}/analytics/conversion/dropoffs?${query}`;

  // Simulación
  await new Promise((resolve) => setTimeout(resolve, 300));
  const dropoffs: DropoffReason[] = [
    { stage: "CONTACTADO", reason: "No contesta", share: 35, trend: 2 },
    { stage: "CONTACTADO", reason: "Duplicado", share: 20, trend: -1 },
    { stage: "VISITA", reason: "Precio elevado", share: 30, trend: 5 },
    { stage: "VISITA", reason: "No cumple requisitos", share: 25, trend: 0 },
    { stage: "OFERTA", reason: "Financiación rechazada", share: 40, trend: 3 },
    { stage: "OFERTA", reason: "Encontró mejor opción", share: 20, trend: -2 },
    { stage: "RESERVA", reason: "Sin respuesta propietario", share: 30, trend: 1 },
    { stage: "RESERVA", reason: "Cambió de opinión", share: 15, trend: -3 },
  ];
  return { dropoffs: filters.stage ? dropoffs.filter(d => d.stage === filters.stage) : dropoffs };
};

export const fetchAttribution = async (
  filters: ConversionFilters & { model: AttributionModel }
): Promise<AttributionApiResponse> => {
  const query = buildQueryParams(filters);
  const url = `${API_BASE}/analytics/attribution?${query}`;

  // Simulación
  await new Promise((resolve) => setTimeout(resolve, 400));
  const rows: AttributionRow[] = [
    { dimension: "canal", key: "web", leads: 500, contracts: 50, contributionPct: 35, cpl: 12, cpa: 120 },
    { dimension: "canal", key: "portal", leads: 400, contracts: 35, contributionPct: 25, cpl: 18, cpa: 180 },
    { dimension: "canal", key: "ads", leads: 300, contracts: 20, contributionPct: 20, cpl: 25, cpa: 250 },
    { dimension: "canal", key: "referido", leads: 200, contracts: 25, contributionPct: 15, cpl: 8, cpa: 80 },
    { dimension: "canal", key: "whatsapp", leads: 100, contracts: 10, contributionPct: 5, cpl: 5, cpa: 50 },
  ];
  return { rows };
};

export const fetchAgentsPerformance = async (
  filters: ConversionFilters
): Promise<AgentsPerformanceApiResponse> => {
  const query = buildQueryParams(filters);
  const url = `${API_BASE}/analytics/agents/performance?${query}`;

  // Simulación
  await new Promise((resolve) => setTimeout(resolve, 400));
  const agents: AgentPerf[] = Array.from({ length: 10 }, (_, i) => ({
    agentId: `agent-${i + 1}`,
    agentName: `Agente ${i + 1}`,
    leads: 50 + Math.floor(Math.random() * 100),
    visits: 25 + Math.floor(Math.random() * 50),
    offers: 10 + Math.floor(Math.random() * 30),
    contracts: 5 + Math.floor(Math.random() * 15),
    convGlobal: 8 + Math.random() * 12,
    firstResponseH: 1 + Math.random() * 5,
    responseRate: 70 + Math.random() * 25,
    isTop: i < 2,
    isBottom: i >= 8,
  }));
  return { agents };
};

export const fetchPortalsPerformance = async (
  filters: ConversionFilters
): Promise<PortalsPerformanceApiResponse> => {
  const query = buildQueryParams(filters);
  const url = `${API_BASE}/analytics/portals/performance?${query}`;

  // Simulación
  await new Promise((resolve) => setTimeout(resolve, 400));
  const portals: PortalPerf[] = [
    { portal: "Idealista", leads: 400, convVisit: 45, convOffer: 25, convContract: 10, cpl: 15, cpa: 150, duplicatesPct: 5 },
    { portal: "Fotocasa", leads: 350, convVisit: 40, convOffer: 22, convContract: 8, cpl: 18, cpa: 180, duplicatesPct: 7 },
    { portal: "Habitaclia", leads: 250, convVisit: 38, convOffer: 20, convContract: 7, cpl: 20, cpa: 200, duplicatesPct: 8 },
    { portal: "Milanuncios", leads: 200, convVisit: 35, convOffer: 18, convContract: 5, cpl: 12, cpa: 120, duplicatesPct: 12 },
    { portal: "Pisos.com", leads: 150, convVisit: 42, convOffer: 23, convContract: 9, cpl: 22, cpa: 220, duplicatesPct: 4 },
  ];
  return { portals };
};

export const fetchCohorts = async (
  filters: ConversionFilters & { groupBy?: string }
): Promise<CohortsApiResponse> => {
  const query = buildQueryParams({ ...filters, groupBy: filters.groupBy || "month" });
  const url = `${API_BASE}/analytics/cohorts?${query}`;

  // Simulación
  await new Promise((resolve) => setTimeout(resolve, 400));
  const months = ["2024-01", "2024-02", "2024-03", "2024-04", "2024-05", "2024-06"];
  const cohorts: CohortRow[] = months.map((month, i) => ({
    month,
    leads: 250 + Math.floor(Math.random() * 100),
    visitPct: 40 - i * 2 + Math.random() * 5,
    offerPct: 20 - i * 1.5 + Math.random() * 3,
    contractPct: 8 - i * 0.8 + Math.random() * 2,
    cumContractPct: 10 - i * 0.5 + Math.random() * 2,
  }));
  return { cohorts };
};

export const exportConversionData = async (options: ExportOptions): Promise<{ success: boolean; url?: string }> => {
  const url = `${API_BASE}/analytics/conversion/export`;

  // Simulación
  await new Promise((resolve) => setTimeout(resolve, 500));

  // En producción, esto devolvería una URL de descarga real
  return {
    success: true,
    url: `data:text/${options.format.toLowerCase()};base64,${btoa(JSON.stringify(options.data))}`,
  };
};