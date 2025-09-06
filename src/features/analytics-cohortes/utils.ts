import type { HeatCell, CohortRow, CohortKpis, CohortFilters } from "./types";

export const percent = (n: number, d: number): number => {
  if (d === 0) return 0;
  return Math.round((n / d) * 100 * 10) / 10;
};

export const formatPct = (val: number | undefined): string => {
  if (val === undefined) return "-";
  return `${val.toFixed(1)}%`;
};

export const formatDays = (val: number | undefined): string => {
  if (val === undefined) return "-";
  return `${val}d`;
};

export const formatMonth = (cohort: string): string => {
  const [year, month] = cohort.split("-");
  const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
  return `${months[parseInt(month) - 1]} ${year}`;
};

export const formatNumber = (val: number): string => {
  return new Intl.NumberFormat("es-ES").format(val);
};

export const buildHeatmapMatrix = (cells: HeatCell[], maxMonths: number = 12): (HeatCell | null)[][] => {
  const cohorts = [...new Set(cells.map(c => c.cohort))].sort();
  const matrix: (HeatCell | null)[][] = [];
  
  for (const cohort of cohorts) {
    const row: (HeatCell | null)[] = [];
    for (let m = 0; m <= maxMonths; m++) {
      const cell = cells.find(c => c.cohort === cohort && c.monthRel === m);
      row.push(cell || null);
    }
    matrix.push(row);
  }
  
  return matrix;
};

export const calcCohortKpis = (rows: CohortRow[]): CohortKpis => {
  if (rows.length === 0) {
    return {
      avgContractPct: 0,
      avgCohortSize: 0,
      medianTtC: 0,
      bestCohort: "-",
      worstCohort: "-",
      totalLeads: 0,
      totalContracts: 0
    };
  }
  
  const totalLeads = rows.reduce((sum, r) => sum + r.size, 0);
  const totalContracts = rows.reduce((sum, r) => sum + Math.round(r.size * r.contractPctCum / 100), 0);
  const avgContractPct = percent(totalContracts, totalLeads);
  const avgCohortSize = Math.round(totalLeads / rows.length);
  
  const ttcValues = rows
    .map(r => r.timeToContractP50)
    .filter((v): v is number => v !== undefined)
    .sort((a, b) => a - b);
  
  const medianTtC = ttcValues.length > 0
    ? ttcValues[Math.floor(ttcValues.length / 2)]
    : 0;
  
  const sorted = [...rows].sort((a, b) => b.contractPctCum - a.contractPctCum);
  const bestCohort = sorted[0]?.cohort || "-";
  const worstCohort = sorted[sorted.length - 1]?.cohort || "-";
  
  return {
    avgContractPct,
    avgCohortSize,
    medianTtC,
    bestCohort,
    worstCohort,
    totalLeads,
    totalContracts
  };
};

export const getHeatmapColor = (pct: number): string => {
  if (pct === 0) return "bg-gray-50";
  if (pct < 10) return "bg-red-50";
  if (pct < 25) return "bg-orange-50";
  if (pct < 40) return "bg-yellow-50";
  if (pct < 60) return "bg-green-50";
  if (pct < 80) return "bg-green-100";
  return "bg-green-200";
};

export const getHeatmapTextColor = (pct: number): string => {
  if (pct > 60) return "text-green-900";
  if (pct > 40) return "text-green-800";
  return "text-gray-700";
};

export const filtersToQueryString = (filters: CohortFilters): string => {
  const params = new URLSearchParams();
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.set(key, String(value));
    }
  });
  
  return params.toString();
};

export const queryStringToFilters = (search: string): CohortFilters => {
  const params = new URLSearchParams(search);
  const filters: CohortFilters = {};
  
  params.forEach((value, key) => {
    if (key === "window" || key === "minSize" || key === "priceMin" || key === "priceMax") {
      filters[key] = Number(value);
    } else {
      (filters as any)[key] = value;
    }
  });
  
  return filters;
};

export const generateCohortRange = (from: string, to: string): string[] => {
  const cohorts: string[] = [];
  const [fromYear, fromMonth] = from.split("-").map(Number);
  const [toYear, toMonth] = to.split("-").map(Number);
  
  let currentDate = new Date(fromYear, fromMonth - 1);
  const endDate = new Date(toYear, toMonth - 1);
  
  while (currentDate <= endDate) {
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, "0");
    cohorts.push(`${year}-${month}`);
    currentDate.setMonth(currentDate.getMonth() + 1);
  }
  
  return cohorts;
};

export const getRelativeMonth = (cohortDate: string, eventDate: string): number => {
  const [cohortYear, cohortMonth] = cohortDate.split("-").map(Number);
  const [eventYear, eventMonth] = eventDate.split("-").map(Number);
  
  return (eventYear - cohortYear) * 12 + (eventMonth - cohortMonth);
};

export const downloadData = (data: any, filename: string, format: "CSV" | "JSON") => {
  let content: string;
  let mimeType: string;
  
  if (format === "CSV") {
    content = convertToCSV(data);
    mimeType = "text/csv";
  } else {
    content = JSON.stringify(data, null, 2);
    mimeType = "application/json";
  }
  
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

const convertToCSV = (data: any[]): string => {
  if (!Array.isArray(data) || data.length === 0) return "";
  
  const headers = Object.keys(data[0]);
  const rows = data.map(row => 
    headers.map(header => {
      const val = row[header];
      return typeof val === "string" && val.includes(",") 
        ? `"${val}"`
        : String(val ?? "");
    }).join(",")
  );
  
  return [headers.join(","), ...rows].join("\n");
};

export const getVariation = (current: number, previous: number): number => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
};

export const getVariationColor = (variation: number): string => {
  if (variation > 10) return "text-green-600";
  if (variation > 0) return "text-green-500";
  if (variation < -10) return "text-red-600";
  if (variation < 0) return "text-red-500";
  return "text-gray-500";
};

export const getVariationIcon = (variation: number): string => {
  if (variation > 0) return "↑";
  if (variation < 0) return "↓";
  return "→";
};