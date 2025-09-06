import { CommissionPlan, CommissionRule, CommissionSplit, CalculationPreview } from "./types";

export function applyPlan(baseAmount: number, plan: CommissionPlan): CalculationPreview {
  const calculation: CalculationPreview['calculation'] = [];
  let totalCommission = 0;
  let remainingAmount = baseAmount;

  const sortedRules = [...plan.rules].sort((a, b) => (a.min || 0) - (b.min || 0));

  for (let i = 0; i < sortedRules.length; i++) {
    const rule = sortedRules[i];
    const min = rule.min || 0;
    const max = rule.max || Infinity;
    
    if (remainingAmount <= 0) break;
    
    const rangeStart = Math.max(min, baseAmount - remainingAmount);
    const rangeEnd = Math.min(max, baseAmount);
    const rangeAmount = Math.max(0, rangeEnd - rangeStart);
    
    if (rangeAmount > 0) {
      const stepCommission = (rangeAmount * rule.rate) / 100;
      totalCommission += stepCommission;
      remainingAmount -= rangeAmount;
      
      calculation.push({
        step: i + 1,
        min: rangeStart,
        max: rangeEnd,
        rate: rule.rate,
        amount: stepCommission,
      });
    }
  }

  if (plan.minPayout && totalCommission < plan.minPayout) {
    totalCommission = plan.minPayout;
  }

  if (plan.cap && totalCommission > plan.cap) {
    totalCommission = plan.cap;
  }

  return {
    baseAmount,
    planApplied: plan,
    calculation,
    totalCommission,
    split: plan.split,
  };
}

export function applySplit(amount: number, split: CommissionSplit) {
  const agent = (amount * split.agent) / 100;
  const office = split.office ? (amount * split.office) / 100 : 0;
  const team = split.team ? (amount * split.team) / 100 : 0;

  return {
    agent,
    office: office > 0 ? office : undefined,
    team: team > 0 ? team : undefined,
    total: agent + office + team,
  };
}

export function formatMoney(amount: number, currency = "EUR"): string {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

export function formatPercent(value: number): string {
  return new Intl.NumberFormat("es-ES", {
    style: "percent",
    minimumFractionDigits: 1,
    maximumFractionDigits: 2,
  }).format(value / 100);
}

export function formatPeriod(period: string): string {
  if (period.match(/^\d{4}-\d{2}$/)) {
    const [year, month] = period.split("-");
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
    });
  }
  return period;
}

export function buildCsv<T extends Record<string, any>>(
  rows: T[],
  headers?: Array<{ key: keyof T; label: string }>
): string {
  if (rows.length === 0) return "";

  const keys = headers?.map(h => h.key) || Object.keys(rows[0]) as Array<keyof T>;
  const labels = headers?.map(h => h.label) || keys.map(String);

  const csvHeaders = labels.join(",");
  const csvRows = rows.map(row =>
    keys.map(key => {
      const value = row[key];
      if (value === null || value === undefined) return "";
      if (typeof value === "string" && value.includes(",")) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return String(value);
    }).join(",")
  );

  return [csvHeaders, ...csvRows].join("\n");
}

export function parseCsv(csvContent: string): Record<string, string>[] {
  const lines = csvContent.trim().split("\n");
  if (lines.length < 2) return [];

  const headers = lines[0].split(",").map(h => h.trim());
  const rows: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(",").map(v => v.trim().replace(/^"|"$/g, ""));
    const row: Record<string, string> = {};
    headers.forEach((header, index) => {
      row[header] = values[index] || "";
    });
    rows.push(row);
  }

  return rows;
}

export function sumBy<T>(array: T[], key: keyof T): number {
  return array.reduce((sum, item) => {
    const value = item[key];
    return sum + (typeof value === "number" ? value : 0);
  }, 0);
}

export function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce((groups, item) => {
    const value = String(item[key]);
    if (!groups[value]) {
      groups[value] = [];
    }
    groups[value].push(item);
    return groups;
  }, {} as Record<string, T[]>);
}

export function calculateTotals<T extends { amount: number }>(items: T[]) {
  return {
    count: items.length,
    total: sumBy(items, 'amount'),
    average: items.length > 0 ? sumBy(items, 'amount') / items.length : 0,
  };
}

export function generatePeriodOptions(months = 12): Array<{ value: string; label: string }> {
  const options: Array<{ value: string; label: string }> = [];
  const today = new Date();

  for (let i = 0; i < months; i++) {
    const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    const label = formatPeriod(value);
    options.push({ value, label });
  }

  return options;
}

export function validatePlanRules(rules: CommissionRule[]): string[] {
  const errors: string[] = [];
  
  if (rules.length === 0) {
    errors.push("At least one rule is required");
    return errors;
  }

  const sortedRules = [...rules].sort((a, b) => (a.min || 0) - (b.min || 0));
  
  for (let i = 0; i < sortedRules.length; i++) {
    const rule = sortedRules[i];
    
    if (rule.rate < 0 || rule.rate > 100) {
      errors.push(`Rule ${i + 1}: Rate must be between 0 and 100`);
    }
    
    if (rule.min !== undefined && rule.max !== undefined && rule.min >= rule.max) {
      errors.push(`Rule ${i + 1}: Min must be less than max`);
    }
    
    if (i > 0) {
      const prevRule = sortedRules[i - 1];
      if (prevRule.max !== undefined && rule.min !== undefined && rule.min < prevRule.max) {
        errors.push(`Rule ${i + 1}: Overlapping ranges detected`);
      }
    }
  }

  return errors;
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

export function downloadFile(content: string, filename: string, contentType = "text/plain") {
  const blob = new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}