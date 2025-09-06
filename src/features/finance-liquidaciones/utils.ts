import { SettlementLine } from "./types";

export function sumLines(lines: SettlementLine[]) {
  return {
    gross: lines.reduce((sum, line) => sum + line.commissionAmount, 0),
    adjustments: lines.reduce((sum, line) => sum + line.adjustments, 0),
    net: lines.reduce((sum, line) => sum + line.netAmount, 0),
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

export function getSettlementScope(settlement: any): string {
  if (settlement.agentId && settlement.agentName) {
    return `Agente: ${settlement.agentName}`;
  }
  if (settlement.teamId && settlement.teamName) {
    return `Equipo: ${settlement.teamName}`;
  }
  if (settlement.officeId && settlement.officeName) {
    return `Oficina: ${settlement.officeName}`;
  }
  return "Global";
}

// Alias for formatMoney to match import expectations
export const formatCurrency = formatMoney;

export function formatDate(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
}

export function getStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case 'draft':
    case 'borrador':
      return 'text-gray-600 bg-gray-100';
    case 'pending':
    case 'pendiente':
      return 'text-yellow-600 bg-yellow-100';
    case 'approved':
    case 'aprobado':
      return 'text-green-600 bg-green-100';
    case 'rejected':
    case 'rechazado':
      return 'text-red-600 bg-red-100';
    case 'paid':
    case 'pagado':
      return 'text-blue-600 bg-blue-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
}

export function getOriginColor(origin: string): string {
  switch (origin.toLowerCase()) {
    case 'manual':
      return 'text-blue-600 bg-blue-100';
    case 'automatic':
    case 'automatico':
      return 'text-green-600 bg-green-100';
    case 'imported':
    case 'importado':
      return 'text-purple-600 bg-purple-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
}

export function getSourceColor(source: string): string {
  switch (source.toLowerCase()) {
    case 'sales':
    case 'ventas':
      return 'text-green-600 bg-green-100';
    case 'renewals':
    case 'renovaciones':
      return 'text-blue-600 bg-blue-100';
    case 'adjustments':
    case 'ajustes':
      return 'text-orange-600 bg-orange-100';
    case 'bonuses':
    case 'bonos':
      return 'text-purple-600 bg-purple-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
}

export function canModifySettlement(settlement: any): boolean {
  return settlement.status === 'draft' || settlement.status === 'borrador';
}

export function canDeleteSettlement(settlement: any): boolean {
  return settlement.status === 'draft' || settlement.status === 'borrador';
}

export function exportToCSV(data: any[], filename: string): void {
  if (data.length === 0) return;

  // Get headers from the first object
  const headers = Object.keys(data[0]);
  
  // Create CSV content
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        // Escape commas and quotes in CSV
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value || '';
      }).join(',')
    )
  ].join('\n');

  // Create and trigger download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportToJSON(data: any[], filename: string): void {
  const jsonContent = JSON.stringify(data, null, 2);
  
  // Create and trigger download
  const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.json`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}