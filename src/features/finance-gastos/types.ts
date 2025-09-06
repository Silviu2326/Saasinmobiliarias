export type ExpenseType = "OPERATIONAL" | "MARKETING" | "ADMINISTRATIVE" | "MAINTENANCE" | "INSURANCE" | "UTILITIES" | "OTHER";
export type ExpenseStatus = "PENDING" | "APPROVED" | "REJECTED" | "PAID" | "CANCELLED";
export type PaymentMethod = "TRANSFER" | "CARD" | "CASH" | "CHECK" | "OTHER";
export type RecurrenceFrequency = "M" | "Q" | "Y" | "W";

export interface Supplier {
  id: string;
  name: string;
  nif: string;
  address?: string;
  email?: string;
  phone?: string;
  city?: string;
  zipCode?: string;
  country?: string;
  category?: string;
}

export interface ExpenseCategory {
  id: string;
  name: string;
  type: ExpenseType;
  description?: string;
  budget?: number;
  color?: string;
  isActive: boolean;
}

export interface ExpenseLine {
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
  categoryId: string;
}

export interface Expense {
  id: string;
  type: ExpenseType;
  status: ExpenseStatus;
  series: string;
  number: string;
  date: string;
  dueDate?: string;
  supplier?: Supplier;
  category: ExpenseCategory;
  lines: ExpenseLine[];
  base: number;
  ivaTotal: number;
  retTotal: number;
  total: number;
  paid: number;
  balance: number;
  notes?: string;
  paymentMethod?: PaymentMethod;
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
    propertyId?: string;
    originalExpenseId?: string;
  };
  attachments?: string[];
  approvedBy?: string;
  approvedAt?: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface Payment {
  id: string;
  expenseId: string;
  date: string;
  amount: number;
  method: PaymentMethod;
  reference?: string;
  notes?: string;
  createdAt: string;
  createdBy?: string;
}

export interface ExpenseQuery {
  q?: string;
  type?: ExpenseType;
  status?: ExpenseStatus;
  series?: string;
  supplierId?: string;
  categoryId?: string;
  from?: string;
  to?: string;
  dueFrom?: string;
  dueTo?: string;
  paid?: boolean;
  minAmount?: number;
  maxAmount?: number;
  page?: number;
  size?: number;
  sort?: string;
}

export interface ExpenseListResponse {
  expenses: Expense[];
  total: number;
  page: number;
  size: number;
  totalPages: number;
  totalAmounts: {
    base: number;
    iva: number;
    total: number;
    paid: number;
    balance: number;
  };
}

export interface ExpenseFormData {
  type: ExpenseType;
  series: string;
  number: string;
  date: string;
  dueDate?: string;
  supplierId?: string;
  categoryId: string;
  lines: Omit<ExpenseLine, 'id' | 'baseAmount' | 'ivaAmount' | 'retAmount' | 'total'>[];
  notes?: string;
  paymentMethod?: PaymentMethod;
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
    propertyId?: string;
  };
}