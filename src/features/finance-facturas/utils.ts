import type { InvoiceLine, Invoice, InvoiceTotals, VatBookEntry } from './types';

// Cálculo de línea individual
export function calculateLine(line: Omit<InvoiceLine, 'id' | 'total' | 'baseAmount' | 'ivaAmount' | 'retAmount'>): InvoiceLine {
  const discountAmount = (line.price * line.qty * (line.discount || 0)) / 100;
  const baseAmount = (line.price * line.qty) - discountAmount;
  const ivaAmount = (baseAmount * line.iva) / 100;
  const retAmount = line.ret ? (baseAmount * line.ret) / 100 : 0;
  const total = baseAmount + ivaAmount - retAmount;

  return {
    ...line,
    id: line.id || crypto.randomUUID(),
    baseAmount,
    ivaAmount,
    retAmount,
    total
  } as InvoiceLine;
}

// Cálculo de totales de factura
export function calculateTotals(lines: InvoiceLine[]): InvoiceTotals {
  const totals = lines.reduce(
    (acc, line) => {
      acc.base += line.baseAmount;
      acc.ivaTotal += line.ivaAmount;
      acc.retTotal += line.retAmount || 0;
      acc.discount += (line.price * line.qty * (line.discount || 0)) / 100;
      
      // Agrupar IVA por tipo
      const vatKey = line.iva.toString();
      if (!acc.ivaByRate[vatKey]) {
        acc.ivaByRate[vatKey] = { base: 0, amount: 0 };
      }
      acc.ivaByRate[vatKey].base += line.baseAmount;
      acc.ivaByRate[vatKey].amount += line.ivaAmount;
      
      return acc;
    },
    {
      base: 0,
      ivaByRate: {} as Record<string, { base: number; amount: number }>,
      ivaTotal: 0,
      retTotal: 0,
      discount: 0,
      total: 0
    }
  );

  totals.total = totals.base + totals.ivaTotal - totals.retTotal;
  
  return totals;
}

// Formatear moneda
export function formatMoney(amount: number, currency = "EUR"): string {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

// Alias para compatibilidad
export const formatCurrency = formatMoney;

// Formatear fecha
export function formatDate(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
}

// Formatear porcentaje
export function formatPercent(value: number): string {
  return new Intl.NumberFormat("es-ES", {
    style: "percent",
    minimumFractionDigits: 1,
    maximumFractionDigits: 2,
  }).format(value / 100);
}

// Generar número de factura consecutivo
export function generateInvoiceNumber(series: string, lastNumber: number = 0): string {
  const nextNumber = lastNumber + 1;
  return `${series}${nextNumber.toString().padStart(4, '0')}`;
}

// Colores para estados
export function getStatusColor(status: string): string {
  switch (status) {
    case 'BORRADOR':
      return 'text-gray-600 bg-gray-100';
    case 'EMITIDA':
      return 'text-blue-600 bg-blue-100';
    case 'ENVIADA':
      return 'text-purple-600 bg-purple-100';
    case 'PAGADA':
      return 'text-green-600 bg-green-100';
    case 'VENCIDA':
      return 'text-red-600 bg-red-100';
    case 'ANULADA':
      return 'text-gray-600 bg-gray-200';
    default:
      return 'text-gray-600 bg-gray-100';
  }
}

// Colores para tipos
export function getTypeColor(type: string): string {
  switch (type) {
    case 'VENTA':
      return 'text-green-600 bg-green-100';
    case 'COMPRA':
      return 'text-orange-600 bg-orange-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
}

// Verificar si una factura está vencida
export function isOverdue(invoice: Invoice): boolean {
  if (!invoice.dueDate || invoice.status === 'PAGADA' || invoice.balance <= 0) {
    return false;
  }
  return new Date(invoice.dueDate) < new Date();
}

// Verificar si se puede editar la factura
export function canEditInvoice(invoice: Invoice): boolean {
  return invoice.status === 'BORRADOR';
}

// Verificar si se puede emitir la factura
export function canIssueInvoice(invoice: Invoice): boolean {
  return invoice.status === 'BORRADOR' && invoice.lines.length > 0;
}

// Verificar si se puede anular la factura
export function canCancelInvoice(invoice: Invoice): boolean {
  return ['EMITIDA', 'ENVIADA'].includes(invoice.status);
}

// Verificar si se puede enviar la factura
export function canSendInvoice(invoice: Invoice): boolean {
  return ['EMITIDA', 'ENVIADA'].includes(invoice.status);
}

// Verificar si se puede hacer abono
export function canCreditNote(invoice: Invoice): boolean {
  return invoice.status === 'EMITIDA' || invoice.status === 'ENVIADA' || invoice.status === 'PAGADA';
}

// Calcular fecha de vencimiento
export function calculateDueDate(issueDate: string, paymentTermDays: number = 30): string {
  const date = new Date(issueDate);
  date.setDate(date.getDate() + paymentTermDays);
  return date.toISOString().split('T')[0];
}

// Generar libro de IVA
export function generateVatBook(invoices: Invoice[], from: string, to: string): VatBookEntry[] {
  const vatMap = new Map<string, VatBookEntry>();
  
  const filteredInvoices = invoices.filter(invoice => {
    const invoiceDate = new Date(invoice.date);
    const fromDate = new Date(from);
    const toDate = new Date(to);
    return invoiceDate >= fromDate && invoiceDate <= toDate && invoice.status !== 'BORRADOR';
  });

  filteredInvoices.forEach(invoice => {
    invoice.lines.forEach(line => {
      const key = `${line.iva}`;
      const period = formatPeriod(invoice.date);
      
      if (!vatMap.has(key)) {
        vatMap.set(key, {
          period,
          vatRate: line.iva,
          base: 0,
          amount: 0,
          invoiceCount: 0
        });
      }
      
      const entry = vatMap.get(key)!;
      entry.base += line.baseAmount;
      entry.amount += line.ivaAmount;
    });
    
    // Contar facturas únicas por tipo de IVA
    const uniqueVatRates = [...new Set(invoice.lines.map(line => line.iva))];
    uniqueVatRates.forEach(vatRate => {
      const key = `${vatRate}`;
      if (vatMap.has(key)) {
        vatMap.get(key)!.invoiceCount++;
      }
    });
  });

  return Array.from(vatMap.values()).sort((a, b) => a.vatRate - b.vatRate);
}

// Formatear período para el libro de IVA
function formatPeriod(date: string): string {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  return `${year}-${month}`;
}

// Exportar a CSV
export function exportToCSV(data: any[], filename: string): void {
  if (data.length === 0) return;

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value || '';
      }).join(',')
    )
  ].join('\n');

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

// Exportar a JSON
export function exportToJSON(data: any[], filename: string): void {
  const jsonContent = JSON.stringify(data, null, 2);
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

// Validar NIF/CIF básico
export function validateNIF(nif: string): boolean {
  const nifRegex = /^[0-9]{8}[TRWAGMYFPDXBNJZSQVHLCKE]$/i;
  const cifRegex = /^[ABCDEFGHJNPQRSUVW][0-9]{7}[0-9A-J]$/i;
  
  return nifRegex.test(nif) || cifRegex.test(nif);
}

// Calcular próxima fecha de recurrencia
export function calculateNextRecurrence(lastDate: string, frequency: 'M' | 'Q' | 'Y', day?: number): string {
  const date = new Date(lastDate);
  
  switch (frequency) {
    case 'M':
      date.setMonth(date.getMonth() + 1);
      break;
    case 'Q':
      date.setMonth(date.getMonth() + 3);
      break;
    case 'Y':
      date.setFullYear(date.getFullYear() + 1);
      break;
  }
  
  if (day) {
    date.setDate(Math.min(day, new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()));
  }
  
  return date.toISOString().split('T')[0];
}

// Obtener tipos de IVA disponibles
export function getAvailableVatRates(): number[] {
  return [0, 4, 10, 21]; // Tipos de IVA estándar en España
}

// Obtener tipos de retención IRPF
export function getAvailableRetentionRates(): number[] {
  return [0, 7, 15, 19, 21]; // Tipos de retención IRPF comunes
}