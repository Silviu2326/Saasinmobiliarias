export type Goal = "RAPIDEZ" | "EQUILIBRIO" | "MAX_PRECIO";
export type Confidence = "LOW" | "MEDIUM" | "HIGH";
export type RoundingMode = "99" | "95" | "000" | "NONE";
export type Currency = "EUR" | "USD" | "GBP";
export type WaterfallKind = "fee" | "tax" | "cost" | "net";
export type ScenarioType = "BASELINE" | "OPTIMISTA" | "AGRESIVO" | "PERSONALIZADO";

export interface Subject {
  id: string;
  address: string;
  area: number;
  rooms: number;
  bathrooms: number;
  propertyType: string;
  condition: string;
  buildingYear: number;
  coordinates?: [number, number];
  neighborhood?: string;
  postalCode?: string;
  city?: string;
  province?: string;
  features?: string[];
  avmValue?: number;
  avmRange?: {
    low: number;
    high: number;
    confidence: number;
  };
  lastUpdated?: string;
}

export interface Constraints {
  minOwner: number;
  bankAppraisal?: number;
  pendingMortgage?: number;
  legalWindowDays?: number;
  channelLimits?: Record<string, any>;
  ownerDeadline?: string;
  maxDiscountPct?: number;
  minNetProceeds?: number;
}

export interface Recommendation {
  id: string;
  listPrice: number;
  anchorPrice: number;
  minAcceptable: number;
  confidence: Confidence;
  reasons: string[];
  domP50: number;
  closeProb30d: number;
  closeProb60d: number;
  closeProb90d: number;
  expectedNetOwner: number;
  elasticityScore?: number;
  competitivePosition?: "ABOVE" | "AT" | "BELOW";
  riskFactors?: string[];
}

export interface ElasticityPoint {
  price: number;
  demand: number;
  demandLow?: number;
  demandHigh?: number;
  visits?: number;
  leads?: number;
  offers?: number;
}

export interface ElasticityAnalysis {
  points: ElasticityPoint[];
  elasticityCoeff: number;
  optimalPrice?: number;
  confidenceInterval: {
    low: number;
    high: number;
  };
  r2Score: number;
  lastUpdated: string;
}

export interface DomPoint {
  price: number;
  p50: number;
  p90: number;
  p10?: number;
  sampleSize?: number;
}

export interface DomCurve {
  points: DomPoint[];
  currentPrice?: number;
  targetDom?: number;
  marketMedian?: number;
  lastUpdated: string;
}

export interface OfferSimulation {
  price: number;
  probAboveMin: number;
  probClose30: number;
  probClose60: number;
  probClose90: number;
  expectedDiscountPct: number;
  expectedOffers: number;
  offerDistribution: {
    range: string;
    probability: number;
    avgAmount: number;
  }[];
  negotiationRounds?: number;
  timeToDecision?: number;
}

export interface WaterfallItem {
  label: string;
  amount: number;
  percentage?: number;
  kind: WaterfallKind;
  description?: string;
  optional?: boolean;
}

export interface NetWaterfall {
  price: number;
  grossAmount: number;
  items: WaterfallItem[];
  netOwner: number;
  effectiveYield: number;
  breakdownByCategory: Record<WaterfallKind, number>;
  lastUpdated: string;
}

export interface CompetitorRecord {
  id: string;
  title?: string;
  address: string;
  distance: number;
  price: number;
  ppsqm: number;
  area: number;
  rooms: number;
  dom: number;
  lastPriceChange?: {
    date: string;
    oldPrice: number;
    newPrice: number;
    changePercent: number;
  };
  visits?: number;
  leads?: number;
  status: "ACTIVE" | "UNDER_OFFER" | "SOLD" | "WITHDRAWN";
  url?: string;
  source: "IDEALISTA" | "FOTOCASA" | "HABITACLIA" | "YAENCONTRE" | "INTERNAL";
  similarity?: number;
  photos?: number;
  lastSeen: string;
}

export interface MarketBands {
  area: string;
  propertyType: string;
  sampleSize: number;
  pricePerM2: {
    p25: number;
    p50: number;
    p75: number;
    p90: number;
    p95: number;
  };
  totalPrice: {
    p25: number;
    p50: number;
    p75: number;
    p90: number;
    p95: number;
  };
  subjectPosition: {
    pricePercentile: number;
    band: "BELOW_P25" | "P25_P50" | "P50_P75" | "P75_P90" | "ABOVE_P90";
  };
  lastUpdated: string;
}

export interface ChannelRule {
  channel: string;
  name: string;
  rounding: RoundingMode;
  marginPct?: number;
  currency: Currency;
  minStep?: number;
  maxPhotos?: number;
  requiresDescription?: boolean;
  feeStructure?: {
    listingFee?: number;
    successFee?: number;
    monthlyFee?: number;
  };
  restrictions?: string[];
  active: boolean;
}

export interface ChannelPreview {
  channel: string;
  displayPrice: number;
  originalPrice: number;
  adjustments: {
    rounding: number;
    margin: number;
    fees: number;
  };
  note?: string;
  estimatedReach?: number;
  competitorCount?: number;
  avgDom?: number;
}

export interface Scenario {
  id: string;
  name: string;
  type: ScenarioType;
  goal: Goal;
  constraints: Constraints;
  listPrice: number;
  anchorPrice: number;
  minAcceptable: number;
  strategy?: PricingStrategy;
  expectedOutcome: {
    domP50: number;
    closeProb60d: number;
    netOwner: number;
    totalRevenue: number;
  };
  createdAt: string;
  lastModified: string;
  createdBy: string;
  isBaseline?: boolean;
}

export interface PricingStrategy {
  phases: PricingPhase[];
  triggers: PriceTrigger[];
  channelMapping: Record<string, number>;
  negotiationRules: {
    maxDiscount: number;
    counterOfferSteps: number[];
    autoAcceptThreshold?: number;
  };
}

export interface PricingPhase {
  id: string;
  name: string;
  order: number;
  listPrice: number;
  duration: number; // days
  objective: string;
  triggers: {
    domGt?: number;
    visitsLt?: number;
    leadsLt?: number;
    offersLt?: number;
    dateAfter?: string;
  };
  actions: string[];
  active: boolean;
}

export interface PriceTrigger {
  id: string;
  name: string;
  condition: {
    type: "DOM" | "VISITS" | "LEADS" | "OFFERS" | "DATE" | "COMPETITOR";
    operator: "GT" | "LT" | "EQ" | "GTE" | "LTE";
    value: number | string;
    timeframe?: number; // days
  };
  action: {
    type: "PRICE_CHANGE" | "ALERT" | "CHANNEL_UPDATE" | "CONTACT_OWNER";
    parameters: Record<string, any>;
  };
  active: boolean;
  lastTriggered?: string;
}

export interface PriceStep {
  at: string;
  listPrice: number;
  reason?: string;
  trigger?: {
    domGt?: number;
    visitsLt?: number;
    leadsLt?: number;
    competitorAction?: string;
  };
  executed?: boolean;
  executedAt?: string;
  executedBy?: string;
}

export interface PricePlan {
  id: string;
  propertyId: string;
  scenarioId: string;
  steps: PriceStep[];
  currentStep: number;
  nextReviewDate: string;
  autoExecute: boolean;
  notifications: {
    email: boolean;
    sms: boolean;
    dashboard: boolean;
  };
  createdAt: string;
  lastUpdated: string;
}

export interface AuditEvent {
  id: string;
  at: string;
  user: string;
  userName?: string;
  action: string;
  category: "PRICE_CHANGE" | "SCENARIO" | "CHANNEL" | "SIMULATION" | "NEGOTIATION";
  payload?: Record<string, any>;
  oldValue?: any;
  newValue?: any;
  reason?: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface Alert {
  id: string;
  type: "WARNING" | "ERROR" | "INFO" | "SUCCESS";
  category: "LEGAL" | "FINANCIAL" | "MARKET" | "TECHNICAL" | "RGPD";
  title: string;
  message: string;
  details?: string;
  actions?: Array<{
    label: string;
    action: string;
    primary?: boolean;
  }>;
  dismissible: boolean;
  createdAt: string;
  expiresAt?: string;
  acknowledged?: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
}

export interface PricingMetrics {
  propertyId: string;
  period: {
    from: string;
    to: string;
  };
  priceHistory: Array<{
    date: string;
    price: number;
    channel?: string;
    reason?: string;
  }>;
  performanceMetrics: {
    avgDom: number;
    totalVisits: number;
    totalLeads: number;
    totalOffers: number;
    conversionRate: number;
    avgOfferRatio: number;
  };
  competitorComparison: {
    similarProperties: number;
    avgCompetitorPrice: number;
    priceAdvantage: number;
    marketShare: number;
  };
  forecast: {
    expectedSaleDate: string;
    expectedPrice: number;
    confidence: number;
  };
}

export interface ExportOptions {
  format: "CSV" | "JSON" | "PDF" | "XLSX";
  sections: {
    subject: boolean;
    recommendations: boolean;
    scenarios: boolean;
    competitors: boolean;
    audit: boolean;
    metrics: boolean;
  };
  timeframe?: {
    from: string;
    to: string;
  };
  includeCharts: boolean;
  includeRawData: boolean;
}

// Utility types
export type PricingStatus = "DRAFT" | "ACTIVE" | "PAUSED" | "COMPLETED" | "CANCELLED";
export type ViewMode = "WIZARD" | "DASHBOARD" | "SCENARIOS" | "ANALYTICS";
export type SortField = "price" | "dom" | "distance" | "similarity" | "lastUpdate";
export type SortDirection = "asc" | "desc";

// Filter types
export interface PricingFilters {
  priceRange?: {
    min: number;
    max: number;
  };
  domRange?: {
    min: number;
    max: number;
  };
  distance?: number;
  propertyTypes?: string[];
  conditions?: string[];
  sources?: string[];
  activeOnly?: boolean;
  dateRange?: {
    from: string;
    to: string;
  };
}

// Settings
export interface PricingSettings {
  defaultGoal: Goal;
  defaultMarginPct: number;
  autoPublishChannels: string[];
  alertThresholds: {
    domExceeded: number;
    visitsBelow: number;
    leadsBelow: number;
    priceDeviationPct: number;
  };
  roundingRules: {
    default: RoundingMode;
    byPriceRange: Record<string, RoundingMode>;
  };
  negotiationDefaults: {
    maxDiscountPct: number;
    counterOfferSteps: number[];
    timeToDecision: number; // hours
  };
  integrations: {
    channels: Record<string, boolean>;
    crm: boolean;
    notifications: boolean;
  };
  permissions: {
    canModifyConstraints: boolean;
    canPublishToChannels: boolean;
    canApproveScenarios: boolean;
    canViewAudit: boolean;
  };
}

export interface CompetitorAlert {
  id: string;
  competitorId: string;
  type: "PRICE_DROP" | "PRICE_INCREASE" | "NEW_LISTING" | "SOLD" | "WITHDRAWN";
  oldValue?: number;
  newValue?: number;
  changePercent?: number;
  triggeredAt: string;
  acknowledged: boolean;
  actions?: string[];
}

export interface MarketInsight {
  id: string;
  type: "TREND" | "SEASONAL" | "COMPETITIVE" | "DEMAND";
  title: string;
  description: string;
  impact: "POSITIVE" | "NEGATIVE" | "NEUTRAL";
  confidence: Confidence;
  data?: Record<string, any>;
  recommendedAction?: string;
  validUntil?: string;
  source: string;
}

// Component props types
export interface ComponentBaseProps {
  className?: string;
  loading?: boolean;
  error?: string | null;
}

export interface ChartProps extends ComponentBaseProps {
  data: any[];
  width?: number;
  height?: number;
  responsive?: boolean;
}

export interface TableProps extends ComponentBaseProps {
  columns: Array<{
    key: string;
    label: string;
    sortable?: boolean;
    formatter?: (value: any) => string;
  }>;
  data: any[];
  sortField?: string;
  sortDirection?: SortDirection;
  onSort?: (field: string, direction: SortDirection) => void;
  pageSize?: number;
  currentPage?: number;
  onPageChange?: (page: number) => void;
}