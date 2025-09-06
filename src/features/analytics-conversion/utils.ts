import {
  StageStats,
  AttributionRow,
  ABTestVariant,
  ABTestResult,
  ExportOptions,
} from "./types";

export const formatPct = (value: number, decimals = 1): string => {
  return `${value.toFixed(decimals)}%`;
};

export const formatDays = (value: number): string => {
  if (value < 1) {
    return `${Math.round(value * 24)}h`;
  }
  return `${value.toFixed(1)}d`;
};

export const formatMoney = (value: number): string => {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

export const formatNumber = (value: number): string => {
  return new Intl.NumberFormat("es-ES").format(value);
};

export const calcStageRates = (counts: number[]): { stageRates: number[]; cumulativeRates: number[] } => {
  const stageRates: number[] = [];
  const cumulativeRates: number[] = [];
  
  for (let i = 0; i < counts.length; i++) {
    if (i === 0) {
      stageRates.push(100);
      cumulativeRates.push(100);
    } else {
      const stageRate = counts[i - 1] > 0 ? (counts[i] / counts[i - 1]) * 100 : 0;
      const cumulativeRate = counts[0] > 0 ? (counts[i] / counts[0]) * 100 : 0;
      stageRates.push(stageRate);
      cumulativeRates.push(cumulativeRate);
    }
  }
  
  return { stageRates, cumulativeRates };
};

export const percentile = (arr: number[], p: number): number => {
  const sorted = [...arr].sort((a, b) => a - b);
  const index = Math.ceil(sorted.length * (p / 100)) - 1;
  return sorted[Math.max(0, index)] || 0;
};

export const median = (arr: number[]): number => {
  return percentile(arr, 50);
};

export const calculateTrend = (current: number, previous: number): number => {
  if (previous === 0) return 0;
  return ((current - previous) / previous) * 100;
};

export const applyAttributionModel = (
  touches: { channel: string; timestamp: number; converted: boolean }[],
  model: "last" | "first" | "linear" | "ushaped"
): Record<string, number> => {
  const attribution: Record<string, number> = {};
  
  if (touches.length === 0) return attribution;
  
  switch (model) {
    case "last": {
      const lastTouch = touches[touches.length - 1];
      attribution[lastTouch.channel] = 1;
      break;
    }
    case "first": {
      const firstTouch = touches[0];
      attribution[firstTouch.channel] = 1;
      break;
    }
    case "linear": {
      const credit = 1 / touches.length;
      touches.forEach(touch => {
        attribution[touch.channel] = (attribution[touch.channel] || 0) + credit;
      });
      break;
    }
    case "ushaped": {
      if (touches.length === 1) {
        attribution[touches[0].channel] = 1;
      } else if (touches.length === 2) {
        attribution[touches[0].channel] = 0.5;
        attribution[touches[1].channel] = 0.5;
      } else {
        // 40% first, 40% last, 20% middle
        attribution[touches[0].channel] = 0.4;
        attribution[touches[touches.length - 1].channel] = 
          (attribution[touches[touches.length - 1].channel] || 0) + 0.4;
        
        const middleCredit = 0.2 / (touches.length - 2);
        for (let i = 1; i < touches.length - 1; i++) {
          attribution[touches[i].channel] = 
            (attribution[touches[i].channel] || 0) + middleCredit;
        }
      }
      break;
    }
  }
  
  return attribution;
};

export const calculateABTestResults = (
  variantA: ABTestVariant,
  variantB: ABTestVariant
): ABTestResult => {
  const convA = variantA.leads > 0 ? variantA.contracts / variantA.leads : 0;
  const convB = variantB.leads > 0 ? variantB.contracts / variantB.leads : 0;
  
  const uplift = convA > 0 ? ((convB - convA) / convA) * 100 : 0;
  
  // Cálculo simplificado de significancia (Z-test)
  const pA = convA;
  const pB = convB;
  const nA = variantA.leads;
  const nB = variantB.leads;
  
  const pooledP = (variantA.contracts + variantB.contracts) / (nA + nB);
  const se = Math.sqrt(pooledP * (1 - pooledP) * (1/nA + 1/nB));
  const z = se > 0 ? (pB - pA) / se : 0;
  const significance = Math.min(99.9, Math.abs(z) * 33); // Simplificado
  
  return {
    variants: [variantA, variantB],
    uplift,
    significance,
    winner: significance > 95 ? (uplift > 0 ? variantB.name : variantA.name) : undefined,
  };
};

export const downloadData = (data: any, filename: string, format: "CSV" | "JSON"): void => {
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
  const link = document.createElement("a");
  link.href = url;
  link.download = `${filename}.${format.toLowerCase()}`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const convertToCSV = (data: any[]): string => {
  if (!Array.isArray(data) || data.length === 0) return "";
  
  const headers = Object.keys(data[0]);
  const csvHeaders = headers.join(",");
  
  const csvRows = data.map(row => {
    return headers.map(header => {
      const value = row[header];
      return typeof value === "string" && value.includes(",") 
        ? `"${value}"` 
        : value;
    }).join(",");
  });
  
  return [csvHeaders, ...csvRows].join("\n");
};

export const getDateRangePresets = () => {
  const today = new Date();
  const formatDate = (date: Date) => date.toISOString().split("T")[0];
  
  return {
    today: {
      from: formatDate(today),
      to: formatDate(today),
      label: "Hoy",
    },
    last7Days: {
      from: formatDate(new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)),
      to: formatDate(today),
      label: "7 días",
    },
    last30Days: {
      from: formatDate(new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)),
      to: formatDate(today),
      label: "30 días",
    },
    currentQuarter: {
      from: formatDate(new Date(today.getFullYear(), Math.floor(today.getMonth() / 3) * 3, 1)),
      to: formatDate(today),
      label: "Trimestre",
    },
    yearToDate: {
      from: formatDate(new Date(today.getFullYear(), 0, 1)),
      to: formatDate(today),
      label: "YTD",
    },
  };
};

export const getTrendIcon = (value?: number): string => {
  if (value === undefined || value === 0) return "→";
  return value > 0 ? "↑" : "↓";
};

export const getTrendColor = (value?: number, inverse = false): string => {
  if (value === undefined || value === 0) return "text-gray-500";
  const positive = value > 0;
  if (inverse) {
    return positive ? "text-red-600" : "text-green-600";
  }
  return positive ? "text-green-600" : "text-red-600";
};