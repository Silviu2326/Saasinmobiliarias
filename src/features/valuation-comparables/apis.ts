import type {
  AuditEvent,
  Comparable,
  CompSet,
  DedupStrategy,
  ExportFormat,
  ImportData,
  NormalizeRules,
  ScoreParams,
  SearchFilters,
  SubjectRef,
} from "./types";
import { haversine, ppsqm, qualityFrom } from "./utils";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "/api";

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const mockComparables: Comparable[] = Array.from({ length: 150 }, (_, i) => ({
  id: `comp-${i + 1}`,
  ref: `REF${String(i + 1).padStart(5, "0")}`,
  date: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000 * 2).toISOString().split("T")[0],
  source: ["PORTAL", "REGISTRO", "NOTARIA", "INTERNO"][Math.floor(Math.random() * 4)] as any,
  lat: 40.4168 + (Math.random() - 0.5) * 0.05,
  lng: -3.7038 + (Math.random() - 0.5) * 0.05,
  address: `Calle ${["Gran Vía", "Alcalá", "Serrano", "Velázquez", "Goya"][Math.floor(Math.random() * 5)]}, ${Math.floor(Math.random() * 200) + 1}`,
  price: Math.round(200000 + Math.random() * 800000),
  sqm: Math.round(50 + Math.random() * 200),
  rooms: Math.floor(Math.random() * 4) + 1,
  baths: Math.floor(Math.random() * 3) + 1,
  floor: Math.floor(Math.random() * 10) - 1,
  elevator: Math.random() > 0.3,
  terrace: Math.random() > 0.5 ? Math.round(5 + Math.random() * 30) : undefined,
  parking: Math.random() > 0.6,
  condition: ["nuevo", "buen_estado", "reformar", "origen"][Math.floor(Math.random() * 4)],
  photos: Math.random() > 0.3 ? [`/photo-${i + 1}-1.jpg`, `/photo-${i + 1}-2.jpg`] : undefined,
  quality: undefined,
}));

mockComparables.forEach(comp => {
  comp.ppsqm = ppsqm(comp.price, comp.sqm);
  comp.quality = qualityFrom(comp);
});

export async function searchComparables(filters: SearchFilters): Promise<{
  data: Comparable[];
  total: number;
  density: number;
}> {
  await delay(500);

  let filtered = [...mockComparables];

  if (filters.lat && filters.lng && filters.radiusKm) {
    filtered = filtered.filter(comp => {
      const dist = haversine(filters.lat!, filters.lng!, comp.lat, comp.lng);
      comp.distance = Math.round(dist);
      return dist <= (filters.radiusKm! * 1000);
    });
  }

  if (filters.from) {
    filtered = filtered.filter(comp => new Date(comp.date) >= new Date(filters.from!));
  }
  if (filters.to) {
    filtered = filtered.filter(comp => new Date(comp.date) <= new Date(filters.to!));
  }

  if (filters.sqmMin) {
    filtered = filtered.filter(comp => comp.sqm >= filters.sqmMin!);
  }
  if (filters.sqmMax) {
    filtered = filtered.filter(comp => comp.sqm <= filters.sqmMax!);
  }

  if (filters.roomsMin) {
    filtered = filtered.filter(comp => (comp.rooms || 0) >= filters.roomsMin!);
  }
  if (filters.bathsMin) {
    filtered = filtered.filter(comp => (comp.baths || 0) >= filters.bathsMin!);
  }

  if (filters.priceMin) {
    filtered = filtered.filter(comp => comp.price >= filters.priceMin!);
  }
  if (filters.priceMax) {
    filtered = filtered.filter(comp => comp.price <= filters.priceMax!);
  }

  if (filters.condition) {
    filtered = filtered.filter(comp => comp.condition === filters.condition);
  }

  if (filters.source) {
    filtered = filtered.filter(comp => comp.source === filters.source);
  }

  if (filters.hasElevator !== undefined) {
    filtered = filtered.filter(comp => comp.elevator === filters.hasElevator);
  }

  if (filters.parking !== undefined) {
    filtered = filtered.filter(comp => comp.parking === filters.parking);
  }

  const total = filtered.length;
  const area = filters.radiusKm ? Math.PI * Math.pow(filters.radiusKm, 2) : 1;
  const density = total / area;

  if (filters.sort) {
    const [field, dir] = filters.sort.split("-");
    filtered.sort((a, b) => {
      const aVal = a[field as keyof Comparable] as any;
      const bVal = b[field as keyof Comparable] as any;
      const diff = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      return dir === "desc" ? -diff : diff;
    });
  }

  const page = filters.page || 0;
  const size = filters.size || 25;
  const paginated = filtered.slice(page * size, (page + 1) * size);

  return {
    data: paginated,
    total,
    density: Math.round(density * 10) / 10,
  };
}

export async function getComparable(id: string): Promise<Comparable | null> {
  await delay(300);
  return mockComparables.find(c => c.id === id) || null;
}

export async function getComparablePhotos(id: string): Promise<string[]> {
  await delay(200);
  const comp = mockComparables.find(c => c.id === id);
  return comp?.photos || [];
}

export async function normalizeComparables(params: {
  subject: SubjectRef;
  comps: Comparable[];
  rules: NormalizeRules;
}): Promise<Comparable[]> {
  await delay(400);

  const { comps, rules, subject } = params;
  return comps.map(comp => ({
    ...comp,
    adjTotal: Math.round(comp.price * (1 + (Math.random() - 0.5) * 0.2)),
  }));
}

export async function scoreComparables(params: {
  subject: SubjectRef;
  comps: Comparable[];
  method: ScoreParams["method"];
  params: ScoreParams;
}): Promise<Comparable[]> {
  await delay(400);

  return params.comps.map(comp => ({
    ...comp,
    similarity: Math.random(),
    weight: Math.random(),
  }));
}

export async function dedupComparables(params: {
  comps: Comparable[];
  strategy: DedupStrategy;
}): Promise<{
  groups: Array<{ key: string; comps: Comparable[] }>;
  duplicates: string[];
}> {
  await delay(300);

  const groups: Map<string, Comparable[]> = new Map();

  params.comps.forEach(comp => {
    const key = comp.address?.split(",")[0] || comp.id;
    const existing = groups.get(key) || [];
    existing.push(comp);
    groups.set(key, existing);
  });

  const duplicates: string[] = [];
  groups.forEach(group => {
    if (group.length > 1) {
      group.slice(1).forEach(c => duplicates.push(c.id));
    }
  });

  return {
    groups: Array.from(groups.entries()).map(([key, comps]) => ({ key, comps })),
    duplicates,
  };
}

const mockSets: CompSet[] = [
  {
    id: "set-1",
    name: "Cliente ABC - Zona Centro",
    client: "Cliente ABC",
    notes: "Comparables para valoración de piso en Gran Vía",
    comps: ["comp-1", "comp-2", "comp-3", "comp-4", "comp-5"],
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    isDefaultForAvm: true,
  },
  {
    id: "set-2",
    name: "Barrio Salamanca Q3",
    notes: "Comparables del tercer trimestre en Salamanca",
    comps: ["comp-6", "comp-7", "comp-8", "comp-9", "comp-10"],
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export async function getCompSets(): Promise<CompSet[]> {
  await delay(300);
  return mockSets;
}

export async function getCompSet(id: string): Promise<CompSet | null> {
  await delay(200);
  return mockSets.find(s => s.id === id) || null;
}

export async function saveCompSet(set: Omit<CompSet, "id" | "createdAt" | "updatedAt">): Promise<CompSet> {
  await delay(400);

  const newSet: CompSet = {
    ...set,
    id: `set-${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  mockSets.push(newSet);
  return newSet;
}

export async function updateCompSet(id: string, updates: Partial<CompSet>): Promise<CompSet | null> {
  await delay(400);

  const index = mockSets.findIndex(s => s.id === id);
  if (index === -1) return null;

  mockSets[index] = {
    ...mockSets[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  return mockSets[index];
}

export async function importComparables(data: ImportData[]): Promise<{
  success: number;
  errors: Array<{ row: number; error: string }>;
}> {
  await delay(600);

  const errors: Array<{ row: number; error: string }> = [];
  let success = 0;

  data.forEach((item, index) => {
    if (!item.date || !item.lat || !item.lng || !item.price || !item.sqm) {
      errors.push({ row: index + 1, error: "Missing required fields" });
    } else {
      success++;
    }
  });

  return { success, errors };
}

export async function exportComparables(params: {
  comps: Comparable[];
  format: ExportFormat["format"];
  includeAdjustments?: boolean;
  includeScores?: boolean;
}): Promise<Blob> {
  await delay(500);

  let content = "";
  const { comps, format } = params;

  if (format === "CSV") {
    const headers = ["id", "ref", "date", "price", "sqm", "address"];
    const rows = comps.map(c => [c.id, c.ref, c.date, c.price, c.sqm, c.address].join(","));
    content = [headers.join(","), ...rows].join("\n");
  } else if (format === "JSON") {
    content = JSON.stringify(comps, null, 2);
  } else if (format === "GeoJSON") {
    content = JSON.stringify({
      type: "FeatureCollection",
      features: comps.map(c => ({
        type: "Feature",
        geometry: { type: "Point", coordinates: [c.lng, c.lat] },
        properties: { ...c },
      })),
    }, null, 2);
  }

  return new Blob([content], { type: "text/plain" });
}

export async function getAuditTrail(params: {
  setId?: string;
  from?: string;
  to?: string;
}): Promise<AuditEvent[]> {
  await delay(300);

  return [
    {
      id: "audit-1",
      at: new Date(Date.now() - 60000).toISOString(),
      user: "usuario@example.com",
      action: "FILTER_APPLIED",
      payload: { radiusKm: 2, sqmMin: 60 },
    },
    {
      id: "audit-2",
      at: new Date(Date.now() - 30000).toISOString(),
      user: "usuario@example.com",
      action: "COMPARABLE_EXCLUDED",
      payload: { compId: "comp-15", reason: "Outlier" },
    },
    {
      id: "audit-3",
      at: new Date().toISOString(),
      user: "usuario@example.com",
      action: "SET_SAVED",
      payload: { setId: "set-3", name: "Nueva búsqueda" },
    },
  ];
}