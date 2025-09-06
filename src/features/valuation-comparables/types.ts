export type Source = "PORTAL" | "REGISTRO" | "NOTARIA" | "INTERNO";
export type Quality = "A" | "B" | "C";
export type NormalizeMethod = "LINEAR" | "SQRT";
export type ScoreMethod = "COSINE" | "KNN";
export type DedupStrategy = "HASH" | "PORTAL_REF" | "CADASTRE";

export interface SubjectRef {
  address?: string;
  lat?: number;
  lng?: number;
  type?: string;
  sqm?: number;
  rooms?: number;
  baths?: number;
  floor?: number;
  elevator?: boolean;
  condition?: string;
}

export interface Comparable {
  id: string;
  ref?: string;
  date: string;
  source: Source;
  lat: number;
  lng: number;
  address?: string;
  price: number;
  sqm: number;
  rooms?: number;
  baths?: number;
  floor?: number;
  elevator?: boolean;
  terrace?: number;
  parking?: boolean;
  condition?: string;
  photos?: string[];
  distance?: number;
  ppsqm?: number;
  adjTotal?: number;
  weight?: number;
  similarity?: number;
  quality?: Quality;
  meta?: Record<string, any>;
}

export interface NormalizeRules {
  sqmRule: NormalizeMethod;
  stateFactors: Record<string, number>;
  floorBonus?: number;
  elevatorFactor?: number;
  terracePpsqm?: number;
  parkingValue?: number;
  ageDepreciationPct?: number;
  microLocBonusM?: number;
}

export interface ScoreParams {
  method: ScoreMethod;
  k?: number;
  distCapM?: number;
  weights?: Record<string, number>;
}

export interface CompSet {
  id: string;
  name: string;
  client?: string;
  notes?: string;
  comps: string[];
  createdAt: string;
  updatedAt: string;
  isDefaultForAvm?: boolean;
}

export interface AuditEvent {
  id: string;
  at: string;
  user: string;
  action: string;
  payload?: Record<string, any>;
}

export interface SearchFilters {
  q?: string;
  lat?: number;
  lng?: number;
  radiusKm?: number;
  from?: string;
  to?: string;
  type?: string;
  sqmMin?: number;
  sqmMax?: number;
  roomsMin?: number;
  bathsMin?: number;
  floorMin?: number;
  floorMax?: number;
  hasElevator?: boolean;
  terraceMin?: number;
  parking?: boolean;
  condition?: string;
  priceMin?: number;
  priceMax?: number;
  source?: Source;
  page?: number;
  size?: number;
  sort?: string;
}

export interface ImportData {
  ref?: string;
  date: string;
  lat: number;
  lng: number;
  price: number;
  sqm: number;
  rooms?: number;
  baths?: number;
  floor?: number;
  elevator?: boolean;
  terrace?: number;
  parking?: boolean;
  condition?: string;
  source?: string;
  address?: string;
  photos?: string[];
}

export interface ExportFormat {
  format: "CSV" | "JSON" | "GeoJSON";
  includeAdjustments?: boolean;
  includeScores?: boolean;
}