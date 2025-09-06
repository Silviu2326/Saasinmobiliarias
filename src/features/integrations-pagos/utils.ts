import type { Charge, FeeBreakdown, ChargeFilters, LogFilters } from "./types";

export function formatMoney(amount: number, currency: string = "EUR"): string {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 2
  }).format(amount);
}

export function formatPercent(value: number): string {
  return new Intl.NumberFormat("es-ES", {
    style: "percent",
    minimumFractionDigits: 1,
    maximumFractionDigits: 2
  }).format(value / 100);
}

export function formatDate(dateString: string): string {
  return new Intl.DateTimeFormat("es-ES", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(dateString));
}

export function formatDateShort(dateString: string): string {
  return new Intl.DateTimeFormat("es-ES", {
    year: "numeric",
    month: "short",
    day: "numeric"
  }).format(new Date(dateString));
}

export function calcNet(amount: number, feePct: number = 0, feeFixed: number = 0): number {
  const percentFee = (amount * feePct) / 100;
  return Math.max(0, amount - percentFee - feeFixed);
}

export function calcTotalFees(amount: number, feePct: number = 0, feeFixed: number = 0): number {
  const percentFee = (amount * feePct) / 100;
  return percentFee + feeFixed;
}

export function groupFeesByMethod(charges: Charge[]): FeeBreakdown[] {
  const groups = new Map<string, {
    volume: number;
    currency: string;
    totalAmount: number;
    count: number;
  }>();

  charges.forEach(charge => {
    if (charge.status !== "succeeded") return;
    
    const key = `${charge.method}-${charge.currency}`;
    const existing = groups.get(key) || {
      volume: 0,
      currency: charge.currency,
      totalAmount: 0,
      count: 0
    };

    existing.volume += charge.amount;
    existing.totalAmount += charge.amount;
    existing.count += 1;
    groups.set(key, existing);
  });

  return Array.from(groups.entries()).map(([key, data]) => {
    const method = key.split("-")[0];
    
    // Simulated fees based on method
    let feePct = 2.9;
    let feeFixed = 0.30;
    
    switch (method) {
      case "bizum":
        feePct = 1.5;
        feeFixed = 0;
        break;
      case "sepa_debit":
        feePct = 0.8;
        feeFixed = 0.25;
        break;
      case "paypal":
        feePct = 3.4;
        feeFixed = 0.35;
        break;
    }

    const totalFees = calcTotalFees(data.totalAmount, feePct, feeFixed * data.count);
    const netAmount = data.totalAmount - totalFees;

    return {
      method,
      volume: data.totalAmount,
      currency: data.currency,
      feePct,
      feeFixed,
      totalFees,
      netAmount
    };
  });
}

export function buildCsv(data: any[], headers: string[]): string {
  const csvHeaders = headers.join(",");
  const csvRows = data.map(row => 
    headers.map(header => {
      const value = row[header];
      if (value === null || value === undefined) return "";
      if (typeof value === "string" && value.includes(",")) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return String(value);
    }).join(",")
  ).join("\n");
  
  return `${csvHeaders}\n${csvRows}`;
}

export function parseCsv(csvText: string): string[][] {
  const lines = csvText.trim().split("\n");
  return lines.map(line => {
    const values = [];
    let currentValue = "";
    let insideQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"' && (i === 0 || line[i - 1] === ',')) {
        insideQuotes = true;
      } else if (char === '"' && insideQuotes && (i === line.length - 1 || line[i + 1] === ',')) {
        insideQuotes = false;
      } else if (char === ',' && !insideQuotes) {
        values.push(currentValue);
        currentValue = "";
      } else {
        currentValue += char;
      }
    }
    
    values.push(currentValue);
    return values;
  });
}

export function filtersToQuery(filters: ChargeFilters | LogFilters): string {
  const params = new URLSearchParams();
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.append(key, String(value));
    }
  });
  
  return params.toString();
}

export function queryToFilters(queryString: string): Record<string, string> {
  const params = new URLSearchParams(queryString);
  const filters: Record<string, string> = {};
  
  params.forEach((value, key) => {
    filters[key] = value;
  });
  
  return filters;
}

export function getStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case "succeeded":
    case "active":
    case "live":
    case "paid":
    case "won":
      return "text-green-600 bg-green-50";
    case "pending":
    case "scheduled":
    case "test":
      return "text-yellow-600 bg-yellow-50";
    case "failed":
    case "error":
    case "canceled":
    case "lost":
    case "disconnected":
      return "text-red-600 bg-red-50";
    case "refunded":
    case "paused":
      return "text-gray-600 bg-gray-50";
    case "needs_response":
    case "under_review":
      return "text-blue-600 bg-blue-50";
    default:
      return "text-gray-600 bg-gray-50";
  }
}

export function getStatusText(status: string): string {
  const statusTexts: Record<string, string> = {
    succeeded: "Exitoso",
    pending: "Pendiente", 
    failed: "Fallido",
    refunded: "Reembolsado",
    active: "Activo",
    paused: "Pausado",
    canceled: "Cancelado",
    past_due: "Vencido",
    needs_response: "Requiere respuesta",
    under_review: "En revisión",
    won: "Ganado",
    lost: "Perdido",
    scheduled: "Programado",
    paid: "Pagado",
    live: "Producción",
    test: "Pruebas",
    error: "Error",
    disconnected: "Desconectado"
  };
  
  return statusTexts[status.toLowerCase()] || status;
}

export function getMethodName(method: string): string {
  const methodNames: Record<string, string> = {
    card: "Tarjeta",
    apple_pay: "Apple Pay",
    google_pay: "Google Pay",
    paypal: "PayPal",
    bizum: "Bizum",
    sepa_debit: "Domiciliación SEPA",
    ideal: "iDEAL",
    sofort: "Sofort",
    bancontact: "Bancontact"
  };
  
  return methodNames[method] || method;
}

export function getCurrencySymbol(currency: string): string {
  const symbols: Record<string, string> = {
    EUR: "€",
    USD: "$",
    GBP: "£"
  };
  
  return symbols[currency] || currency;
}

export function truncateString(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + "...";
}

export function generateId(prefix: string = ""): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 15);
  return `${prefix}${prefix ? "_" : ""}${timestamp}_${random}`;
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

export function calculateRiskScore(charge: Partial<Charge>): number {
  let score = 0;
  
  // Amount-based scoring
  if (charge.amount) {
    if (charge.amount > 1000) score += 20;
    else if (charge.amount > 500) score += 10;
    else if (charge.amount > 100) score += 5;
  }
  
  // Method-based scoring
  if (charge.method === "card") score += 15;
  else if (charge.method === "paypal") score += 5;
  
  // Add some randomness for simulation
  score += Math.floor(Math.random() * 30);
  
  return Math.min(100, Math.max(0, score));
}

export function formatCardNumber(cardNumber: string): string {
  // Only show last 4 digits
  if (cardNumber.length >= 4) {
    return `**** **** **** ${cardNumber.slice(-4)}`;
  }
  return cardNumber;
}

export function exportToFile(data: string, filename: string, type: string = "text/csv"): void {
  const blob = new Blob([data], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  
  link.href = url;
  link.download = filename;
  link.click();
  
  URL.revokeObjectURL(url);
}