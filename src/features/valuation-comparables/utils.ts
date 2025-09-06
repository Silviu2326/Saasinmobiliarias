import type { Comparable, NormalizeRules, Quality, SubjectRef } from "./types";

export function haversine(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371e3;
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lng2 - lng1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

export function ppsqm(price: number, sqm: number): number {
  return sqm > 0 ? price / sqm : 0;
}

export function applyRules(
  comp: Comparable,
  rules: NormalizeRules,
  subject?: SubjectRef
): number {
  let adjustment = comp.price;

  if (subject?.sqm && comp.sqm) {
    const sqmDiff = subject.sqm - comp.sqm;
    if (rules.sqmRule === "LINEAR") {
      adjustment += sqmDiff * (comp.ppsqm || ppsqm(comp.price, comp.sqm));
    } else if (rules.sqmRule === "SQRT") {
      const factor = Math.sqrt(subject.sqm / comp.sqm);
      adjustment = comp.price * factor;
    }
  }

  if (comp.condition && rules.stateFactors[comp.condition]) {
    adjustment *= rules.stateFactors[comp.condition];
  }

  if (typeof comp.floor === "number" && rules.floorBonus) {
    adjustment += comp.floor * rules.floorBonus;
  }

  if (comp.elevator && rules.elevatorFactor) {
    adjustment *= rules.elevatorFactor;
  }

  if (comp.terrace && rules.terracePpsqm) {
    adjustment += comp.terrace * rules.terracePpsqm;
  }

  if (comp.parking && rules.parkingValue) {
    adjustment += rules.parkingValue;
  }

  if (rules.ageDepreciationPct && comp.date) {
    const age = (Date.now() - new Date(comp.date).getTime()) / (365 * 24 * 60 * 60 * 1000);
    adjustment *= 1 - (rules.ageDepreciationPct / 100) * age;
  }

  if (
    rules.microLocBonusM &&
    subject?.lat &&
    subject?.lng &&
    comp.distance &&
    comp.distance < rules.microLocBonusM
  ) {
    const bonus = 1 + (rules.microLocBonusM - comp.distance) / rules.microLocBonusM * 0.05;
    adjustment *= bonus;
  }

  return adjustment;
}

export function cosineSim(
  a: SubjectRef | Comparable,
  b: Comparable,
  weights: Record<string, number> = {}
): number {
  const defaultWeights = {
    location: 0.3,
    sqm: 0.25,
    rooms: 0.15,
    baths: 0.1,
    condition: 0.1,
    floor: 0.05,
    amenities: 0.05,
  };

  const w = { ...defaultWeights, ...weights };

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  if ('distance' in b && b.distance !== undefined) {
    const distScore = Math.max(0, 1 - b.distance / 5000);
    dotProduct += distScore * distScore * w.location;
    normA += distScore * distScore;
    normB += distScore * distScore;
  }

  if (a.sqm && b.sqm) {
    const sqmDiff = 1 - Math.abs(a.sqm - b.sqm) / Math.max(a.sqm, b.sqm);
    dotProduct += sqmDiff * sqmDiff * w.sqm;
    normA += sqmDiff * sqmDiff;
    normB += sqmDiff * sqmDiff;
  }

  if (a.rooms !== undefined && b.rooms !== undefined) {
    const roomScore = a.rooms === b.rooms ? 1 : 0.5;
    dotProduct += roomScore * roomScore * w.rooms;
    normA += roomScore * roomScore;
    normB += roomScore * roomScore;
  }

  if (a.baths !== undefined && b.baths !== undefined) {
    const bathScore = a.baths === b.baths ? 1 : 0.5;
    dotProduct += bathScore * bathScore * w.baths;
    normA += bathScore * bathScore;
    normB += bathScore * bathScore;
  }

  if (a.condition && b.condition) {
    const condScore = a.condition === b.condition ? 1 : 0.5;
    dotProduct += condScore * condScore * w.condition;
    normA += condScore * condScore;
    normB += condScore * condScore;
  }

  return normA > 0 && normB > 0 ? dotProduct / (Math.sqrt(normA) * Math.sqrt(normB)) : 0;
}

export function knnScore(
  subject: SubjectRef,
  comps: Comparable[],
  params: { k: number; distCapM?: number; weights?: Record<string, number> }
): Map<string, number> {
  const { k, distCapM = 2000, weights = {} } = params;

  const similarities = comps.map(comp => ({
    id: comp.id,
    similarity: cosineSim(subject, comp, weights),
    distance: comp.distance || 0,
  }));

  similarities.sort((a, b) => b.similarity - a.similarity);

  const topK = similarities
    .filter(s => s.distance <= distCapM)
    .slice(0, k);

  const totalSim = topK.reduce((sum, s) => sum + s.similarity, 0);

  const scores = new Map<string, number>();
  topK.forEach(s => {
    scores.set(s.id, totalSim > 0 ? s.similarity / totalSim : 0);
  });

  return scores;
}

export function qualityFrom(comp: Comparable): Quality {
  const now = new Date();
  const compDate = new Date(comp.date);
  const monthsOld = (now.getTime() - compDate.getTime()) / (1000 * 60 * 60 * 24 * 30);

  const hasFullData =
    comp.sqm &&
    comp.rooms !== undefined &&
    comp.baths !== undefined &&
    comp.condition &&
    comp.floor !== undefined;

  if (monthsOld <= 6 && comp.distance && comp.distance <= 500 && hasFullData) {
    return "A";
  }

  if (monthsOld <= 12 && comp.distance && comp.distance <= 1000) {
    return "B";
  }

  return "C";
}

export function dedupHash(comp: Comparable, margin = 5, daysDelta = 30): string {
  const street = comp.address?.split(",")[0]?.trim() || "";
  const num = comp.address?.match(/\d+/)?.[0] || "";
  const floor = comp.floor?.toString() || "";
  const sqmRange = Math.floor((comp.sqm || 0) / margin) * margin;
  const dateRange = Math.floor(
    new Date(comp.date).getTime() / (daysDelta * 24 * 60 * 60 * 1000)
  );

  return `${street}-${num}-${floor}-${sqmRange}-${dateRange}`;
}

export function formatMoney(amount: number): string {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatSqm(sqm: number): string {
  return `${sqm.toFixed(0)} m²`;
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function percent(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

export function calculateZScore(value: number, mean: number, stdDev: number): number {
  return stdDev > 0 ? (value - mean) / stdDev : 0;
}

export function detectOutliers(
  comps: Comparable[],
  field: keyof Comparable,
  threshold = 2
): string[] {
  const values = comps
    .map(c => c[field])
    .filter((v): v is number => typeof v === "number");

  if (values.length < 3) return [];

  const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
  const variance =
    values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
  const stdDev = Math.sqrt(variance);

  return comps
    .filter(c => {
      const value = c[field];
      if (typeof value !== "number") return false;
      return Math.abs(calculateZScore(value, mean, stdDev)) > threshold;
    })
    .map(c => c.id);
}

export function groupByFinca(comps: Comparable[]): Map<string, Comparable[]> {
  const groups = new Map<string, Comparable[]>();

  comps.forEach(comp => {
    const finca = comp.meta?.fincaRef || comp.meta?.cadastralRef;
    if (finca) {
      const existing = groups.get(finca) || [];
      existing.push(comp);
      groups.set(finca, existing);
    }
  });

  return groups;
}

export function exportToGeoJSON(comps: Comparable[]): any {
  return {
    type: "FeatureCollection",
    features: comps.map(comp => ({
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [comp.lng, comp.lat],
      },
      properties: {
        id: comp.id,
        ref: comp.ref,
        date: comp.date,
        price: comp.price,
        sqm: comp.sqm,
        ppsqm: comp.ppsqm,
        rooms: comp.rooms,
        baths: comp.baths,
        floor: comp.floor,
        elevator: comp.elevator,
        terrace: comp.terrace,
        parking: comp.parking,
        condition: comp.condition,
        source: comp.source,
        quality: comp.quality,
        address: comp.address,
        distance: comp.distance,
        weight: comp.weight,
        similarity: comp.similarity,
        adjTotal: comp.adjTotal,
      },
    })),
  };
}

export function exportToCSV(comps: Comparable[]): string {
  const headers = [
    "id",
    "ref",
    "date",
    "lat",
    "lng",
    "address",
    "price",
    "sqm",
    "ppsqm",
    "rooms",
    "baths",
    "floor",
    "elevator",
    "terrace",
    "parking",
    "condition",
    "source",
    "quality",
    "distance",
    "weight",
    "similarity",
    "adjTotal",
  ];

  const rows = comps.map(comp =>
    [
      comp.id,
      comp.ref || "",
      comp.date,
      comp.lat,
      comp.lng,
      comp.address || "",
      comp.price,
      comp.sqm,
      comp.ppsqm || "",
      comp.rooms || "",
      comp.baths || "",
      comp.floor || "",
      comp.elevator ? "Sí" : "No",
      comp.terrace || "",
      comp.parking ? "Sí" : "No",
      comp.condition || "",
      comp.source,
      comp.quality || "",
      comp.distance || "",
      comp.weight || "",
      comp.similarity || "",
      comp.adjTotal || "",
    ].join(",")
  );

  return [headers.join(","), ...rows].join("\n");
}