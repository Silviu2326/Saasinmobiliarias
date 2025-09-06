import type { Expense, ExpenseLine, ExpenseQuery } from './types';

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2
  }).format(amount);
};

export const formatDate = (date: string): string => {
  return new Intl.DateTimeFormat('es-ES', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(new Date(date));
};

export const formatDateTime = (date: string): string => {
  return new Intl.DateTimeFormat('es-ES', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(date));
};

export const calculateLineTotals = (line: Omit<ExpenseLine, 'baseAmount' | 'ivaAmount' | 'retAmount' | 'total'>): {
  baseAmount: number;
  ivaAmount: number;
  retAmount: number;
  total: number;
} => {
  const baseAmount = line.qty * line.price;
  const discountAmount = baseAmount * ((line.discount || 0) / 100);
  const finalBase = baseAmount - discountAmount;
  const ivaAmount = finalBase * (line.iva / 100);
  const retAmount = finalBase * ((line.ret || 0) / 100);
  const total = finalBase + ivaAmount - retAmount;

  return {
    baseAmount: Math.round(finalBase * 100) / 100,
    ivaAmount: Math.round(ivaAmount * 100) / 100,
    retAmount: Math.round(retAmount * 100) / 100,
    total: Math.round(total * 100) / 100
  };
};

export const calculateExpenseTotals = (lines: Omit<ExpenseLine, 'baseAmount' | 'ivaAmount' | 'retAmount' | 'total'>[]): {
  base: number;
  ivaTotal: number;
  retTotal: number;
  total: number;
} => {
  return lines.reduce(
    (acc, line) => {
      const lineTotals = calculateLineTotals(line);
      return {
        base: acc.base + lineTotals.baseAmount,
        ivaTotal: acc.ivaTotal + lineTotals.ivaAmount,
        retTotal: acc.retTotal + lineTotals.retAmount,
        total: acc.total + lineTotals.total
      };
    },
    { base: 0, ivaTotal: 0, retTotal: 0, total: 0 }
  );
};

export const getExpenseStatusColor = (status: string): string => {
  switch (status) {
    case 'PENDING':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'APPROVED':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'REJECTED':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'PAID':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'CANCELLED':
      return 'bg-gray-100 text-gray-800 border-gray-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export const getExpenseStatusText = (status: string): string => {
  switch (status) {
    case 'PENDING':
      return 'Pendiente';
    case 'APPROVED':
      return 'Aprobado';
    case 'REJECTED':
      return 'Rechazado';
    case 'PAID':
      return 'Pagado';
    case 'CANCELLED':
      return 'Cancelado';
    default:
      return status;
  }
};

export const getExpenseTypeColor = (type: string): string => {
  switch (type) {
    case 'OPERATIONAL':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'MARKETING':
      return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'ADMINISTRATIVE':
      return 'bg-gray-100 text-gray-800 border-gray-200';
    case 'MAINTENANCE':
      return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'INSURANCE':
      return 'bg-indigo-100 text-indigo-800 border-indigo-200';
    case 'UTILITIES':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'OTHER':
      return 'bg-gray-100 text-gray-800 border-gray-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export const getExpenseTypeText = (type: string): string => {
  switch (type) {
    case 'OPERATIONAL':
      return 'Operacional';
    case 'MARKETING':
      return 'Marketing';
    case 'ADMINISTRATIVE':
      return 'Administrativo';
    case 'MAINTENANCE':
      return 'Mantenimiento';
    case 'INSURANCE':
      return 'Seguros';
    case 'UTILITIES':
      return 'Servicios';
    case 'OTHER':
      return 'Otros';
    default:
      return type;
  }
};

export const getPaymentMethodText = (method: string): string => {
  switch (method) {
    case 'TRANSFER':
      return 'Transferencia';
    case 'CARD':
      return 'Tarjeta';
    case 'CASH':
      return 'Efectivo';
    case 'CHECK':
      return 'Cheque';
    case 'OTHER':
      return 'Otro';
    default:
      return method;
  }
};

export const getRecurrenceFrequencyText = (freq: string): string => {
  switch (freq) {
    case 'W':
      return 'Semanal';
    case 'M':
      return 'Mensual';
    case 'Q':
      return 'Trimestral';
    case 'Y':
      return 'Anual';
    default:
      return freq;
  }
};

export const buildExpenseQuery = (filters: Partial<ExpenseQuery>): ExpenseQuery => {
  return {
    page: 1,
    size: 25,
    sort: 'date:desc',
    ...filters
  };
};

export const isExpenseOverdue = (expense: Expense): boolean => {
  if (!expense.dueDate || expense.status === 'PAID' || expense.status === 'CANCELLED') {
    return false;
  }
  return new Date(expense.dueDate) < new Date();
};

export const getExpenseBalance = (expense: Expense): number => {
  return expense.total - expense.paid;
};

export const isExpenseFullyPaid = (expense: Expense): boolean => {
  return expense.paid >= expense.total;
};

export const getExpensePaymentPercentage = (expense: Expense): number => {
  if (expense.total === 0) return 0;
  return Math.round((expense.paid / expense.total) * 100);
};

export const sortExpenses = (expenses: Expense[], sort: string): Expense[] => {
  const [field, direction] = sort.split(':');
  const isDesc = direction === 'desc';

  return [...expenses].sort((a, b) => {
    let aValue: any = a[field as keyof Expense];
    let bValue: any = b[field as keyof Expense];

    // Handle nested objects
    if (field === 'supplier') {
      aValue = a.supplier?.name || '';
      bValue = b.supplier?.name || '';
    } else if (field === 'category') {
      aValue = a.category.name;
      bValue = b.category.name;
    }

    // Handle dates
    if (field === 'date' || field === 'dueDate' || field === 'createdAt' || field === 'updatedAt') {
      aValue = new Date(aValue || 0);
      bValue = new Date(bValue || 0);
    }

    // Handle numbers
    if (['base', 'ivaTotal', 'retTotal', 'total', 'paid', 'balance'].includes(field)) {
      aValue = Number(aValue) || 0;
      bValue = Number(bValue) || 0;
    }

    if (aValue < bValue) return isDesc ? 1 : -1;
    if (aValue > bValue) return isDesc ? -1 : 1;
    return 0;
  });
};

export const filterExpenses = (expenses: Expense[], query: ExpenseQuery): Expense[] => {
  return expenses.filter(expense => {
    // Text search
    if (query.q) {
      const searchTerm = query.q.toLowerCase();
      const matchesSearch = 
        expense.number.toLowerCase().includes(searchTerm) ||
        expense.supplier?.name.toLowerCase().includes(searchTerm) ||
        expense.category.name.toLowerCase().includes(searchTerm) ||
        expense.lines.some(line => line.concept.toLowerCase().includes(searchTerm));
      
      if (!matchesSearch) return false;
    }

    // Type filter
    if (query.type && expense.type !== query.type) return false;

    // Status filter
    if (query.status && expense.status !== query.status) return false;

    // Series filter
    if (query.series && expense.series !== query.series) return false;

    // Supplier filter
    if (query.supplierId && expense.supplier?.id !== query.supplierId) return false;

    // Category filter
    if (query.categoryId && expense.category.id !== query.categoryId) return false;

    // Date range filter
    if (query.from && new Date(expense.date) < new Date(query.from)) return false;
    if (query.to && new Date(expense.date) > new Date(query.to)) return false;

    // Due date range filter
    if (query.dueFrom && expense.dueDate && new Date(expense.dueDate) < new Date(query.dueFrom)) return false;
    if (query.dueTo && expense.dueDate && new Date(expense.dueDate) > new Date(query.dueTo)) return false;

    // Paid filter
    if (query.paid !== undefined) {
      const isFullyPaid = isExpenseFullyPaid(expense);
      if (query.paid !== isFullyPaid) return false;
    }

    // Amount range filter
    if (query.minAmount && expense.total < query.minAmount) return false;
    if (query.maxAmount && expense.total > query.maxAmount) return false;

    return true;
  });
};