import { useState, useCallback, useMemo } from 'react';
import type { 
  Expense, 
  ExpenseQuery, 
  ExpenseListResponse, 
  ExpenseFormData, 
  ExpenseCategory,
  Supplier,
  Payment
} from './types';
import * as apis from './apis';
import { buildExpenseQuery, filterExpenses, sortExpenses } from './utils';

// Hook principal para gestionar gastos
export const useExpenses = (initialQuery: Partial<ExpenseQuery> = {}) => {
  const [data, setData] = useState<ExpenseListResponse | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState<ExpenseQuery>(buildExpenseQuery(initialQuery));

  const refreshExpenses = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apis.getExpenses(query);
      setData(response);
      setExpenses(response.expenses);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar los gastos');
    } finally {
      setIsLoading(false);
    }
  }, [query]);

  const updateQuery = useCallback((newQuery: Partial<ExpenseQuery>) => {
    const updatedQuery = { ...query, ...newQuery, page: 1 };
    setQuery(updatedQuery);
  }, [query]);

  const resetQuery = useCallback(() => {
    const defaultQuery = buildExpenseQuery(initialQuery);
    setQuery(defaultQuery);
  }, [initialQuery]);

  const nextPage = useCallback(() => {
    if (data && query.page < data.totalPages) {
      setQuery(prev => ({ ...prev, page: prev.page + 1 }));
    }
  }, [data, query.page]);

  const prevPage = useCallback(() => {
    if (query.page > 1) {
      setQuery(prev => ({ ...prev, page: prev.page - 1 }));
    }
  }, [query.page]);

  const goToPage = useCallback((page: number) => {
    if (data && page >= 1 && page <= data.totalPages) {
      setQuery(prev => ({ ...prev, page }));
    }
  }, [data]);

  // Calcular totales de selección
  const selectedTotal = useMemo(() => {
    if (expenses.length === 0) return undefined;
    
    return expenses.reduce(
      (acc, expense) => ({
        base: acc.base + expense.base,
        iva: acc.iva + expense.ivaTotal,
        total: acc.total + expense.total,
        paid: acc.paid + expense.paid,
        balance: acc.balance + expense.balance
      }),
      { base: 0, iva: 0, total: 0, paid: 0, balance: 0 }
    );
  }, [expenses]);

  return {
    data,
    expenses,
    isLoading,
    error,
    query,
    refreshExpenses,
    updateQuery,
    resetQuery,
    nextPage,
    prevPage,
    goToPage,
    totalAmounts: data?.totalAmounts,
    totalPages: data?.totalPages,
    currentPage: query.page,
    total: data?.total || 0,
    selectedTotal
  };
};

// Hook para selección múltiple
export const useMultiSelect = <T extends { id: string }>() => {
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  const selectItem = useCallback((item: T | string) => {
    const id = typeof item === 'string' ? item : item.id;
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  const selectAll = useCallback((items: T[]) => {
    setSelectedItems(new Set(items.map(item => item.id)));
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedItems(new Set());
  }, []);

  const isSelected = useCallback((item: T | string) => {
    const id = typeof item === 'string' ? item : item.id;
    return selectedItems.has(id);
  }, [selectedItems]);

  const selectedCount = selectedItems.size;

  return {
    selectedItems,
    selectedCount,
    selectItem,
    selectAll,
    clearSelection,
    isSelected
  };
};

// Hook para gestionar un gasto individual
export const useExpense = (id: string | null) => {
  const [expense, setExpense] = useState<Expense | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadExpense = useCallback(async () => {
    if (!id) return;
    
    try {
      setIsLoading(true);
      setError(null);
      const data = await apis.getExpense(id);
      setExpense(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar el gasto');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  const updateExpense = useCallback(async (data: Partial<ExpenseFormData>) => {
    if (!id) return;
    
    try {
      setIsLoading(true);
      setError(null);
      const updated = await apis.updateExpense(id, data);
      setExpense(updated);
      return updated;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar el gasto');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  const deleteExpense = useCallback(async () => {
    if (!id) return;
    
    try {
      setIsLoading(true);
      setError(null);
      await apis.deleteExpense(id);
      setExpense(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar el gasto');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  const approveExpense = useCallback(async () => {
    if (!id) return;
    
    try {
      setIsLoading(true);
      setError(null);
      const approved = await apis.approveExpense(id);
      setExpense(approved);
      return approved;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al aprobar el gasto');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  const rejectExpense = useCallback(async (reason?: string) => {
    if (!id) return;
    
    try {
      setIsLoading(true);
      setError(null);
      const rejected = await apis.rejectExpense(id, reason);
      setExpense(rejected);
      return rejected;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al rechazar el gasto');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  return {
    expense,
    isLoading,
    error,
    loadExpense,
    updateExpense,
    deleteExpense,
    approveExpense,
    rejectExpense
  };
};

// Hook para crear/editar gastos
export const useExpenseForm = (initialData?: Partial<ExpenseFormData>) => {
  const [formData, setFormData] = useState<ExpenseFormData>({
    type: 'OPERATIONAL',
    series: 'G',
    number: '',
    date: new Date().toISOString().split('T')[0],
    categoryId: '',
    lines: [],
    ...initialData
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateField = useCallback((field: keyof ExpenseFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const updateLine = useCallback((index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      lines: prev.lines.map((line, i) => 
        i === index ? { ...line, [field]: value } : line
      )
    }));
  }, []);

  const addLine = useCallback(() => {
    setFormData(prev => ({
      ...prev,
      lines: [
        ...prev.lines,
        {
          concept: '',
          description: '',
          qty: 1,
          price: 0,
          iva: 21,
          ret: 0,
          discount: 0,
          categoryId: prev.categoryId || ''
        }
      ]
    }));
  }, []);

  const removeLine = useCallback((index: number) => {
    setFormData(prev => ({
      ...prev,
      lines: prev.lines.filter((_, i) => i !== index)
    }));
  }, []);

  const submitForm = useCallback(async (isEdit = false, id?: string) => {
    try {
      setIsSubmitting(true);
      setError(null);
      
      if (isEdit && id) {
        const updated = await apis.updateExpense(id, formData);
        return updated;
      } else {
        const created = await apis.createExpense(formData);
        return created;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar el gasto');
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  }, [formData]);

  const resetForm = useCallback(() => {
    setFormData({
      type: 'OPERATIONAL',
      series: 'G',
      number: '',
      date: new Date().toISOString().split('T')[0],
      categoryId: '',
      lines: []
    });
    setError(null);
  }, []);

  return {
    formData,
    isSubmitting,
    error,
    updateField,
    updateLine,
    addLine,
    removeLine,
    submitForm,
    resetForm
  };
};

// Hook para categorías
export const useExpenseCategories = () => {
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCategories = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await apis.getExpenseCategories();
      setCategories(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar las categorías');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createCategory = useCallback(async (data: Omit<ExpenseCategory, 'id'>) => {
    try {
      setIsLoading(true);
      setError(null);
      const newCategory = await apis.createExpenseCategory(data);
      setCategories(prev => [...prev, newCategory]);
      return newCategory;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear la categoría');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateCategory = useCallback(async (id: string, data: Partial<ExpenseCategory>) => {
    try {
      setIsLoading(true);
      setError(null);
      const updated = await apis.updateExpenseCategory(id, data);
      setCategories(prev => prev.map(cat => cat.id === id ? updated : cat));
      return updated;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar la categoría');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteCategory = useCallback(async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);
      await apis.deleteExpenseCategory(id);
      setCategories(prev => prev.filter(cat => cat.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar la categoría');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    categories,
    isLoading,
    error,
    loadCategories: loadCategories,
    createCategory,
    updateCategory,
    deleteCategory
  };
};

// Hook para proveedores
export const useSuppliers = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSuppliers = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await apis.getSuppliers();
      setSuppliers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar los proveedores');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createSupplier = useCallback(async (data: Omit<Supplier, 'id'>) => {
    try {
      setIsLoading(true);
      setError(null);
      const newSupplier = await apis.createSupplier(data);
      setSuppliers(prev => [...prev, newSupplier]);
      return newSupplier;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear el proveedor');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateSupplier = useCallback(async (id: string, data: Partial<Supplier>) => {
    try {
      setIsLoading(true);
      setError(null);
      const updated = await apis.updateSupplier(id, data);
      setSuppliers(prev => prev.map(sup => sup.id === id ? updated : sup));
      return updated;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar el proveedor');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteSupplier = useCallback(async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);
      await apis.deleteSupplier(id);
      setSuppliers(prev => prev.filter(sup => sup.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar el proveedor');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    suppliers,
    isLoading,
    error,
    loadSuppliers: loadSuppliers,
    createSupplier,
    updateSupplier,
    deleteSupplier
  };
};

// Hook para pagos
export const useExpensePayments = (expenseId: string) => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPayments = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await apis.getExpensePayments(expenseId);
      setPayments(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar los pagos');
    } finally {
      setIsLoading(false);
    }
  }, [expenseId]);

  const createPayment = useCallback(async (data: Omit<Payment, 'id' | 'createdAt' | 'createdBy'>) => {
    try {
      setIsLoading(true);
      setError(null);
      const newPayment = await apis.createPayment(data);
      setPayments(prev => [...prev, newPayment]);
      return newPayment;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear el pago');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    payments,
    isLoading,
    error,
    loadPayments,
    createPayment
  };
};

