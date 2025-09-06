export type InvoiceType = "VENTA" | "COMPRA";
export type InvoiceStatus = "BORRADOR" | "EMITIDA" | "ENVIADA" | "PAGADA" | "VENCIDA" | "ANULADA";
export type PaymentMethod = "TRANSFER" | "CARD" | "CASH" | "OTHER";
export type RecurrenceFrequency = "M" | "Q" | "Y";

export interface Party {
  id: string;
  name: string;
  nif: string;
  address?: string;
  email?: string;
  phone?: string;
  city?: string;
  zipCode?: string;
  country?: string;
}

export interface InvoiceLine {
  id: string;
  concept: string;
  description?: string;
  qty: number;
  price: number;
  iva: number;
  ret?: number;
  discount?: number;
  total: number;
  baseAmount: number;
  ivaAmount: number;
  retAmount?: number;
}

export interface Invoice {
  id: string;
  type: InvoiceType;
  status: InvoiceStatus;
  series: string;
  number: string;
  date: string;
  dueDate?: string;
  customer?: Party;
  supplier?: Party;
  lines: InvoiceLine[];
  base: number;
  ivaTotal: number;
  retTotal: number;
  total: number;
  paid: number;
  balance: number;
  notes?: string;
  paymentMethod?: string;
  taxRegime?: 'GENERAL' | 'EXEMPT' | 'REVERSE_CHARGE';
  recurrence?: {
    freq: RecurrenceFrequency;
    day?: number;
    until?: string;
    updatePrices?: boolean;
  };
  references?: {
    contractId?: string;
    operationId?: string;
    originalInvoiceId?: string; // Para abonos
  };
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface Payment {
  id: string;
  invoiceId: string;
  date: string;
  amount: number;
  method: PaymentMethod;
  reference?: string;
  notes?: string;
  createdAt: string;
  createdBy?: string;
}

export interface InvoiceQuery {
  q?: string;
  type?: InvoiceType;
  status?: InvoiceStatus;
  series?: string;
  customerId?: string;
  supplierId?: string;
  from?: string;
  to?: string;
  dueFrom?: string;
  dueTo?: string;
  paid?: boolean;
  page?: number;
  size?: number;
  sort?: string;
}

export interface InvoiceListResponse {
  invoices: Invoice[];
  total: number;
  page: number;
  size: number;
  totalPages: number;
  totalAmounts: {
    base: number;
    iva: number;
    total: number;
    paid: number;
    pending: number;
  };
}

export interface CreditNoteRequest {
  type: 'TOTAL' | 'PARTIAL';
  reason: string;
  lines?: string[]; // IDs de líneas para abono parcial
  amounts?: {
    base: number;
    iva: number;
    total: number;
  };
}

export interface EInvoiceStatus {
  generated: boolean;
  sent: boolean;
  error?: string;
  xmlUrl?: string;
  sentAt?: string;
  generatedAt?: string;
}

export interface AuditEvent {
  id: string;
  invoiceId: string;
  event: 'CREATE' | 'UPDATE' | 'ISSUE' | 'SEND' | 'CANCEL' | 'PAYMENT' | 'CREDIT_NOTE';
  description: string;
  actor: string;
  timestamp: string;
  data?: any;
}

export interface InvoiceFormData {
  type: InvoiceType;
  series: string;
  date: string;
  dueDate?: string;
  customer?: Party;
  supplier?: Party;
  paymentMethod?: string;
  notes?: string;
  taxRegime?: 'GENERAL' | 'EXEMPT' | 'REVERSE_CHARGE';
  lines: Omit<InvoiceLine, 'id' | 'total' | 'baseAmount' | 'ivaAmount' | 'retAmount'>[];
}

export interface ExportOptions {
  format: 'CSV' | 'JSON' | 'IVA_BOOK';
  filters?: InvoiceQuery;
  from?: string;
  to?: string;
  includeLines?: boolean;
  groupByVat?: boolean;
}

export interface RecurrenceConfig {
  frequency: RecurrenceFrequency;
  day?: number;
  until?: string;
  updatePrices?: boolean;
  nextDate?: string;
  active?: boolean;
}

export interface InvoiceTotals {
  base: number;
  ivaByRate: Record<string, { base: number; amount: number }>;
  ivaTotal: number;
  retTotal: number;
  discount: number;
  total: number;
}

export interface VatBookEntry {
  period: string;
  vatRate: number;
  base: number;
  amount: number;
  invoiceCount: number;
}