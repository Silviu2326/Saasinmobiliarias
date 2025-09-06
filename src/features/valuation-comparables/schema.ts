import { z } from "zod";

export const subjectRefSchema = z.object({
  address: z.string().optional(),
  lat: z.number().min(-90).max(90).optional(),
  lng: z.number().min(-180).max(180).optional(),
  type: z.string().optional(),
  sqm: z.number().positive().optional(),
  rooms: z.number().min(0).optional(),
  baths: z.number().min(0).optional(),
  floor: z.number().optional(),
  elevator: z.boolean().optional(),
  condition: z.string().optional(),
});

export const searchFiltersSchema = z.object({
  q: z.string().optional(),
  lat: z.number().min(-90).max(90).optional(),
  lng: z.number().min(-180).max(180).optional(),
  radiusKm: z.number().min(0.1).max(5).optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  type: z.string().optional(),
  sqmMin: z.number().positive().optional(),
  sqmMax: z.number().positive().optional(),
  roomsMin: z.number().min(0).optional(),
  bathsMin: z.number().min(0).optional(),
  floorMin: z.number().optional(),
  floorMax: z.number().optional(),
  hasElevator: z.boolean().optional(),
  terraceMin: z.number().min(0).optional(),
  parking: z.boolean().optional(),
  condition: z.string().optional(),
  priceMin: z.number().positive().optional(),
  priceMax: z.number().positive().optional(),
  source: z.enum(["PORTAL", "REGISTRO", "NOTARIA", "INTERNO"]).optional(),
  page: z.number().min(0).optional(),
  size: z.number().min(1).max(100).optional(),
  sort: z.string().optional(),
}).refine(data => {
  if (data.from && data.to) {
    return new Date(data.from) <= new Date(data.to);
  }
  return true;
}, { message: "From date must be before or equal to To date" })
.refine(data => {
  if (data.sqmMin && data.sqmMax) {
    return data.sqmMin <= data.sqmMax;
  }
  return true;
}, { message: "Minimum sqm must be less than or equal to maximum sqm" });

export const normalizeRulesSchema = z.object({
  sqmRule: z.enum(["LINEAR", "SQRT"]),
  stateFactors: z.record(z.number().positive()),
  floorBonus: z.number().optional(),
  elevatorFactor: z.number().positive().optional(),
  terracePpsqm: z.number().positive().optional(),
  parkingValue: z.number().positive().optional(),
  ageDepreciationPct: z.number().min(0).max(100).optional(),
  microLocBonusM: z.number().positive().optional(),
});

export const scoreParamsSchema = z.object({
  method: z.enum(["COSINE", "KNN"]),
  k: z.number().min(3).optional(),
  distCapM: z.number().positive().optional(),
  weights: z.record(z.number().min(0).max(1)).optional(),
}).refine(data => {
  if (data.method === "KNN" && !data.k) {
    return false;
  }
  return true;
}, { message: "KNN method requires k parameter >= 3" });

export const importDataSchema = z.object({
  ref: z.string().optional(),
  date: z.string(),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  price: z.number().positive(),
  sqm: z.number().positive(),
  rooms: z.number().min(0).optional(),
  baths: z.number().min(0).optional(),
  floor: z.number().optional(),
  elevator: z.boolean().optional(),
  terrace: z.number().min(0).optional(),
  parking: z.boolean().optional(),
  condition: z.string().optional(),
  source: z.string().optional(),
  address: z.string().optional(),
  photos: z.array(z.string()).optional(),
});

export const compSetSchema = z.object({
  name: z.string().min(1),
  client: z.string().optional(),
  notes: z.string().optional(),
  comps: z.array(z.string()).min(1),
  isDefaultForAvm: z.boolean().optional(),
});

export const validateDateRange = (from: Date, to: Date, maxMonths = 24): boolean => {
  const monthsDiff = (to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24 * 30);
  return monthsDiff <= maxMonths;
};

export const validateCompRecency = (date: string, warnMonths = 12): { valid: boolean; warning?: string } => {
  const compDate = new Date(date);
  const now = new Date();
  const monthsDiff = (now.getTime() - compDate.getTime()) / (1000 * 60 * 60 * 24 * 30);
  
  if (monthsDiff > 24) {
    return { valid: false };
  }
  
  if (monthsDiff > warnMonths) {
    return { valid: true, warning: `Comparable is ${Math.round(monthsDiff)} months old` };
  }
  
  return { valid: true };
};