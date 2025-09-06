import type { 
  Expense, 
  ExpenseQuery, 
  ExpenseListResponse, 
  ExpenseFormData, 
  ExpenseCategory,
  Supplier,
  Payment
} from './types';

// Mock data para desarrollo
const mockExpenses: Expense[] = [
  {
    id: '1',
    type: 'OPERATIONAL',
    status: 'PENDING',
    series: 'G',
    number: '001',
    date: '2024-01-15',
    dueDate: '2024-02-15',
    supplier: {
      id: '1',
      name: 'Proveedor Ejemplo S.L.',
      nif: 'B12345678',
      address: 'Calle Ejemplo 123',
      city: 'Madrid',
      zipCode: '28001',
      country: 'España'
    },
    category: {
      id: '1',
      name: 'Suministros de Oficina',
      type: 'OPERATIONAL',
      description: 'Material de oficina y suministros',
      isActive: true
    },
    lines: [
      {
        id: '1',
        concept: 'Papel A4',
        description: 'Resma de papel A4 80g',
        qty: 10,
        price: 5.50,
        iva: 21,
        baseAmount: 55.00,
        ivaAmount: 11.55,
        total: 66.55,
        categoryId: '1'
      }
    ],
    base: 55.00,
    ivaTotal: 11.55,
    retTotal: 0,
    total: 66.55,
    paid: 0,
    balance: 66.55,
    notes: 'Suministros para el primer trimestre',
    paymentMethod: 'TRANSFER',
    taxRegime: 'GENERAL',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
    createdBy: 'user1'
  },
  {
    id: '2',
    type: 'MARKETING',
    status: 'APPROVED',
    series: 'G',
    number: '002',
    date: '2024-01-20',
    dueDate: '2024-02-20',
    supplier: {
      id: '2',
      name: 'Agencia Marketing Digital',
      nif: 'B87654321',
      address: 'Avenida Digital 456',
      city: 'Barcelona',
      zipCode: '08001',
      country: 'España'
    },
    category: {
      id: '2',
      name: 'Publicidad Online',
      type: 'MARKETING',
      description: 'Campañas publicitarias digitales',
      isActive: true
    },
    lines: [
      {
        id: '2',
        concept: 'Campaña Google Ads',
        description: 'Publicidad en buscadores',
        qty: 1,
        price: 500.00,
        iva: 21,
        baseAmount: 500.00,
        ivaAmount: 105.00,
        total: 605.00,
        categoryId: '2'
      }
    ],
    base: 500.00,
    ivaTotal: 105.00,
    retTotal: 0,
    total: 605.00,
    paid: 0,
    balance: 605.00,
    notes: 'Campaña Q1 2024',
    paymentMethod: 'TRANSFER',
    taxRegime: 'GENERAL',
    createdAt: '2024-01-20T14:30:00Z',
    updatedAt: '2024-01-20T14:30:00Z',
    createdBy: 'user1'
  }
];

const mockCategories: ExpenseCategory[] = [
  {
    id: '1',
    name: 'Suministros de Oficina',
    type: 'OPERATIONAL',
    description: 'Material de oficina y suministros',
    isActive: true
  },
  {
    id: '2',
    name: 'Publicidad Online',
    type: 'MARKETING',
    description: 'Campañas publicitarias digitales',
    isActive: true
  },
  {
    id: '3',
    name: 'Mantenimiento',
    type: 'MAINTENANCE',
    description: 'Reparaciones y mantenimiento',
    isActive: true
  },
  {
    id: '4',
    name: 'Seguros',
    type: 'INSURANCE',
    description: 'Pólizas de seguro',
    isActive: true
  },
  {
    id: '5',
    name: 'Servicios Públicos',
    type: 'UTILITIES',
    description: 'Luz, agua, gas, internet',
    isActive: true
  }
];

const mockSuppliers: Supplier[] = [
  {
    id: '1',
    name: 'Proveedor Ejemplo S.L.',
    nif: 'B12345678',
    address: 'Calle Ejemplo 123',
    city: 'Madrid',
    zipCode: '28001',
    country: 'España',
    category: 'Suministros'
  },
  {
    id: '2',
    name: 'Agencia Marketing Digital',
    nif: 'B87654321',
    address: 'Avenida Digital 456',
    city: 'Barcelona',
    zipCode: '08001',
    country: 'España',
    category: 'Marketing'
  }
];

// Simular delay de red
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// APIs de Gastos
export const getExpenses = async (query: ExpenseQuery): Promise<ExpenseListResponse> => {
  await delay(300);
  
  let filteredExpenses = [...mockExpenses];
  
  // Aplicar filtros básicos
  if (query.q) {
    const searchTerm = query.q.toLowerCase();
    filteredExpenses = filteredExpenses.filter(expense =>
      expense.number.toLowerCase().includes(searchTerm) ||
      expense.supplier?.name.toLowerCase().includes(searchTerm) ||
      expense.category.name.toLowerCase().includes(searchTerm)
    );
  }
  
  if (query.status) {
    filteredExpenses = filteredExpenses.filter(expense => expense.status === query.status);
  }
  
  if (query.type) {
    filteredExpenses = filteredExpenses.filter(expense => expense.type === query.type);
  }
  
  if (query.categoryId) {
    filteredExpenses = filteredExpenses.filter(expense => expense.category.id === query.categoryId);
  }
  
  if (query.supplierId) {
    filteredExpenses = filteredExpenses.filter(expense => expense.supplier?.id === query.supplierId);
  }
  
  // Ordenar
  const [field, direction] = (query.sort || 'date:desc').split(':');
  filteredExpenses.sort((a, b) => {
    let aValue: any = a[field as keyof Expense];
    let bValue: any = b[field as keyof Expense];
    
    if (field === 'supplier') {
      aValue = a.supplier?.name || '';
      bValue = b.supplier?.name || '';
    } else if (field === 'category') {
      aValue = a.category.name;
      bValue = b.category.name;
    }
    
    if (field === 'date' || field === 'dueDate') {
      aValue = new Date(aValue);
      bValue = new Date(bValue);
    }
    
    if (aValue < bValue) return direction === 'desc' ? 1 : -1;
    if (aValue > bValue) return direction === 'desc' ? -1 : 1;
    return 0;
  });
  
  // Paginación
  const page = query.page || 1;
  const size = query.size || 25;
  const start = (page - 1) * size;
  const end = start + size;
  const paginatedExpenses = filteredExpenses.slice(start, end);
  
  // Calcular totales
  const totalAmounts = filteredExpenses.reduce(
    (acc, expense) => ({
      base: acc.base + expense.base,
      iva: acc.iva + expense.ivaTotal,
      total: acc.total + expense.total,
      paid: acc.paid + expense.paid,
      balance: acc.balance + expense.balance
    }),
    { base: 0, iva: 0, total: 0, paid: 0, balance: 0 }
  );
  
  return {
    expenses: paginatedExpenses,
    total: filteredExpenses.length,
    page,
    size,
    totalPages: Math.ceil(filteredExpenses.length / size),
    totalAmounts
  };
};

export const getExpense = async (id: string): Promise<Expense | null> => {
  await delay(200);
  return mockExpenses.find(expense => expense.id === id) || null;
};

export const createExpense = async (data: ExpenseFormData): Promise<Expense> => {
  await delay(500);
  
  const newExpense: Expense = {
    id: Date.now().toString(),
    ...data,
    lines: data.lines.map((line, index) => ({
      ...line,
      id: `${Date.now()}-${index}`,
      baseAmount: line.qty * line.price,
      ivaAmount: (line.qty * line.price) * (line.iva / 100),
      retAmount: line.ret ? (line.qty * line.price) * (line.ret / 100) : 0,
      total: (line.qty * line.price) * (1 + line.iva / 100 - (line.ret || 0) / 100)
    })),
    base: data.lines.reduce((sum, line) => sum + (line.qty * line.price), 0),
    ivaTotal: data.lines.reduce((sum, line) => sum + (line.qty * line.price) * (line.iva / 100), 0),
    retTotal: data.lines.reduce((sum, line) => sum + (line.ret ? (line.qty * line.price) * (line.ret / 100) : 0), 0),
    total: data.lines.reduce((sum, line) => sum + (line.qty * line.price) * (1 + line.iva / 100 - (line.ret || 0) / 100), 0),
    paid: 0,
    balance: data.lines.reduce((sum, line) => sum + (line.qty * line.price) * (1 + line.iva / 100 - (line.ret || 0) / 100), 0),
    status: 'PENDING',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'current-user'
  };
  
  mockExpenses.push(newExpense);
  return newExpense;
};

export const updateExpense = async (id: string, data: Partial<ExpenseFormData>): Promise<Expense> => {
  await delay(500);
  
  const expenseIndex = mockExpenses.findIndex(expense => expense.id === id);
  if (expenseIndex === -1) {
    throw new Error('Gasto no encontrado');
  }
  
  const updatedExpense = {
    ...mockExpenses[expenseIndex],
    ...data,
    updatedAt: new Date().toISOString(),
    updatedBy: 'current-user'
  };
  
  mockExpenses[expenseIndex] = updatedExpense;
  return updatedExpense;
};

export const deleteExpense = async (id: string): Promise<void> => {
  await delay(300);
  
  const expenseIndex = mockExpenses.findIndex(expense => expense.id === id);
  if (expenseIndex === -1) {
    throw new Error('Gasto no encontrado');
  }
  
  mockExpenses.splice(expenseIndex, 1);
};

export const approveExpense = async (id: string): Promise<Expense> => {
  await delay(300);
  
  const expense = mockExpenses.find(expense => expense.id === id);
  if (!expense) {
    throw new Error('Gasto no encontrado');
  }
  
  expense.status = 'APPROVED';
  expense.approvedBy = 'current-user';
  expense.approvedAt = new Date().toISOString();
  expense.updatedAt = new Date().toISOString();
  
  return expense;
};

export const rejectExpense = async (id: string, reason?: string): Promise<Expense> => {
  await delay(300);
  
  const expense = mockExpenses.find(expense => expense.id === id);
  if (!expense) {
    throw new Error('Gasto no encontrado');
  }
  
  expense.status = 'REJECTED';
  expense.notes = reason ? `${expense.notes || ''}\n\nRechazado: ${reason}`.trim() : expense.notes;
  expense.updatedAt = new Date().toISOString();
  
  return expense;
};

// APIs de Categorías
export const getExpenseCategories = async (): Promise<ExpenseCategory[]> => {
  await delay(200);
  return mockCategories;
};

export const createExpenseCategory = async (data: Omit<ExpenseCategory, 'id'>): Promise<ExpenseCategory> => {
  await delay(300);
  
  const newCategory: ExpenseCategory = {
    id: Date.now().toString(),
    ...data
  };
  
  mockCategories.push(newCategory);
  return newCategory;
};

export const updateExpenseCategory = async (id: string, data: Partial<ExpenseCategory>): Promise<ExpenseCategory> => {
  await delay(300);
  
  const categoryIndex = mockCategories.findIndex(category => category.id === id);
  if (categoryIndex === -1) {
    throw new Error('Categoría no encontrada');
  }
  
  const updatedCategory = {
    ...mockCategories[categoryIndex],
    ...data
  };
  
  mockCategories[categoryIndex] = updatedCategory;
  return updatedCategory;
};

export const deleteExpenseCategory = async (id: string): Promise<void> => {
  await delay(300);
  
  const categoryIndex = mockCategories.findIndex(category => category.id === id);
  if (categoryIndex === -1) {
    throw new Error('Categoría no encontrada');
  }
  
  mockCategories.splice(categoryIndex, 1);
};

// APIs de Proveedores
export const getSuppliers = async (): Promise<Supplier[]> => {
  await delay(200);
  return mockSuppliers;
};

export const createSupplier = async (data: Omit<Supplier, 'id'>): Promise<Supplier> => {
  await delay(300);
  
  const newSupplier: Supplier = {
    id: Date.now().toString(),
    ...data
  };
  
  mockSuppliers.push(newSupplier);
  return newSupplier;
};

export const updateSupplier = async (id: string, data: Partial<Supplier>): Promise<Supplier> => {
  await delay(300);
  
  const supplierIndex = mockSuppliers.findIndex(supplier => supplier.id === id);
  if (supplierIndex === -1) {
    throw new Error('Proveedor no encontrado');
  }
  
  const updatedSupplier = {
    ...mockSuppliers[supplierIndex],
    ...data
  };
  
  mockSuppliers[supplierIndex] = updatedSupplier;
  return updatedSupplier;
};

export const deleteSupplier = async (id: string): Promise<void> => {
  await delay(300);
  
  const supplierIndex = mockSuppliers.findIndex(supplier => supplier.id === id);
  if (supplierIndex === -1) {
    throw new Error('Proveedor no encontrado');
  }
  
  mockSuppliers.splice(supplierIndex, 1);
};

// APIs de Pagos
export const getExpensePayments = async (expenseId: string): Promise<Payment[]> => {
  await delay(200);
  // Mock payments - en una implementación real vendrían de la base de datos
  return [];
};

export const createPayment = async (data: Omit<Payment, 'id' | 'createdAt' | 'createdBy'>): Promise<Payment> => {
  await delay(300);
  
  const newPayment: Payment = {
    id: Date.now().toString(),
    ...data,
    createdAt: new Date().toISOString(),
    createdBy: 'current-user'
  };
  
  // Actualizar el gasto con el pago
  const expense = mockExpenses.find(expense => expense.id === data.expenseId);
  if (expense) {
    expense.paid += data.amount;
    expense.balance = expense.total - expense.paid;
    expense.updatedAt = new Date().toISOString();
    
    if (expense.balance <= 0) {
      expense.status = 'PAID';
    }
  }
  
  return newPayment;
};

// APIs de Reportes
export const getExpenseSummary = async (from: string, to: string) => {
  await delay(400);
  
  const expenses = mockExpenses.filter(expense => {
    const expenseDate = new Date(expense.date);
    return expenseDate >= new Date(from) && expenseDate <= new Date(to);
  });
  
  const summary = {
    totalExpenses: expenses.length,
    totalAmount: expenses.reduce((sum, expense) => sum + expense.total, 0),
    totalPaid: expenses.reduce((sum, expense) => sum + expense.paid, 0),
    totalPending: expenses.reduce((sum, expense) => sum + (expense.total - expense.paid), 0),
    byStatus: expenses.reduce((acc, expense) => {
      acc[expense.status] = (acc[expense.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    byType: expenses.reduce((acc, expense) => {
      acc[expense.type] = (acc[expense.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    byCategory: expenses.reduce((acc, expense) => {
      acc[expense.category.name] = (acc[expense.category.name] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  };
  
  return summary;
};

export const exportExpenses = async (query: ExpenseQuery, format: 'csv' | 'xlsx' = 'csv') => {
  await delay(1000);
  
  const { expenses } = await getExpenses(query);
  
  if (format === 'csv') {
    const headers = ['Fecha', 'Número', 'Proveedor', 'Categoría', 'Base', 'IVA', 'Total', 'Estado'];
    const rows = expenses.map(expense => [
      expense.date,
      `${expense.series}-${expense.number}`,
      expense.supplier?.name || '',
      expense.category.name,
      expense.base,
      expense.ivaTotal,
      expense.total,
      expense.status
    ]);
    
    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');
    
    return csvContent;
  }
  
  // Para xlsx se usaría una librería como xlsx
  return 'Formato no soportado';
};

