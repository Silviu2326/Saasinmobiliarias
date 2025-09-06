import { useState, useEffect, useCallback, useMemo } from 'react';
import type { 
  Invoice, 
  InvoiceQuery, 
  InvoiceListResponse, 
  InvoiceFormData, 
  Payment,
  InvoiceLine,
  CreditNoteRequest,
  RecurrenceConfig,
  EInvoiceStatus,
  AuditEvent,
  ExportOptions,
  InvoiceTotals
} from './types';
import * as api from './apis';
import { calculateLine, calculateTotals } from './utils';

// Hook para manejo de lista de facturas
export function useInvoices(initialQuery: InvoiceQuery = {}) {
  const [data, setData] = useState<InvoiceListResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState<InvoiceQuery>(initialQuery);

  const fetchInvoices = useCallback(async (newQuery?: InvoiceQuery) => {
    try {
      setIsLoading(true);
      setError(null);
      const queryToUse = newQuery || query;
      const response = await api.getInvoices(queryToUse);
      setData(response);
      if (newQuery) {
        setQuery(newQuery);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar facturas');
    } finally {
      setIsLoading(false);
    }
  }, [query]);

  const refreshInvoices = useCallback(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  const updateQuery = useCallback((newQuery: InvoiceQuery) => {
    fetchInvoices(newQuery);
  }, [fetchInvoices]);

  useEffect(() => {
    fetchInvoices();
  }, []);

  return {
    data,
    invoices: data?.invoices || [],
    isLoading,
    error,
    query,
    refreshInvoices,
    updateQuery,
    totalAmounts: data?.totalAmounts
  };
}

// Hook para manejo de factura individual
export function useInvoice(invoiceId: string | null) {
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInvoice = useCallback(async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await api.getInvoice(id);
      setInvoice(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar factura');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const issueInvoice = useCallback(async (id: string) => {
    try {
      setIsLoading(true);
      const updatedInvoice = await api.issueInvoice(id);
      setInvoice(updatedInvoice);
      return updatedInvoice;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al emitir factura');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const cancelInvoice = useCallback(async (id: string) => {
    try {
      setIsLoading(true);
      const updatedInvoice = await api.cancelInvoice(id);
      setInvoice(updatedInvoice);
      return updatedInvoice;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al anular factura');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const sendInvoice = useCallback(async (id: string) => {
    try {
      setIsLoading(true);
      await api.sendInvoice(id);
      if (invoice) {
        setInvoice({ ...invoice, status: 'ENVIADA' });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al enviar factura');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [invoice]);

  const createCreditNote = useCallback(async (id: string, request: CreditNoteRequest) => {
    try {
      setIsLoading(true);
      return await api.createCreditNote(id, request);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear abono');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (invoiceId) {
      fetchInvoice(invoiceId);
    } else {
      setInvoice(null);
    }
  }, [invoiceId, fetchInvoice]);

  return {
    invoice,
    isLoading,
    error,
    issueInvoice,
    cancelInvoice,
    sendInvoice,
    createCreditNote,
    refreshInvoice: () => invoiceId && fetchInvoice(invoiceId)
  };
}

// Hook para formulario de factura
export function useInvoiceForm(initialInvoice?: Invoice) {
  const [formData, setFormData] = useState<InvoiceFormData>(() => ({
    type: initialInvoice?.type || 'VENTA',
    series: initialInvoice?.series || 'FAC',
    date: initialInvoice?.date || new Date().toISOString().split('T')[0],
    dueDate: initialInvoice?.dueDate,
    customer: initialInvoice?.customer,
    supplier: initialInvoice?.supplier,
    paymentMethod: initialInvoice?.paymentMethod,
    notes: initialInvoice?.notes,
    taxRegime: initialInvoice?.taxRegime || 'GENERAL',
    lines: initialInvoice?.lines?.map(line => ({
      concept: line.concept,
      description: line.description,
      qty: line.qty,
      price: line.price,
      iva: line.iva,
      ret: line.ret,
      discount: line.discount
    })) || []
  }));

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Calcular totales en tiempo real
  const totals: InvoiceTotals = useMemo(() => {
    const calculatedLines = formData.lines.map(line => calculateLine({
      ...line,
      id: crypto.randomUUID()
    }));
    return calculateTotals(calculatedLines);
  }, [formData.lines]);

  const updateField = useCallback(<K extends keyof InvoiceFormData>(
    field: K,
    value: InvoiceFormData[K]
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const updateLine = useCallback((index: number, line: Partial<InvoiceLine>) => {
    setFormData(prev => ({
      ...prev,
      lines: prev.lines.map((l, i) => i === index ? { ...l, ...line } : l)
    }));
  }, []);

  const addLine = useCallback((line?: Partial<InvoiceLine>) => {
    const newLine = {
      concept: line?.concept || '',
      description: line?.description,
      qty: line?.qty || 1,
      price: line?.price || 0,
      iva: line?.iva || 21,
      ret: line?.ret,
      discount: line?.discount || 0
    };
    
    setFormData(prev => ({
      ...prev,
      lines: [...prev.lines, newLine]
    }));
  }, []);

  const removeLine = useCallback((index: number) => {
    setFormData(prev => ({
      ...prev,
      lines: prev.lines.filter((_, i) => i !== index)
    }));
  }, []);

  const duplicateLine = useCallback((index: number) => {
    setFormData(prev => ({
      ...prev,
      lines: [...prev.lines, { ...prev.lines[index] }]
    }));
  }, []);

  const saveInvoice = useCallback(async (asDraft = true) => {
    try {
      setIsLoading(true);
      setError(null);
      
      let invoice;
      if (initialInvoice) {
        invoice = await api.updateInvoice(initialInvoice.id, formData);
      } else {
        invoice = await api.createInvoice(formData);
      }
      
      if (!asDraft) {
        invoice = await api.issueInvoice(invoice.id);
      }
      
      return invoice;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar factura');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [formData, initialInvoice]);

  const reset = useCallback(() => {
    setFormData({
      type: 'VENTA',
      series: 'FAC',
      date: new Date().toISOString().split('T')[0],
      dueDate: undefined,
      customer: undefined,
      supplier: undefined,
      paymentMethod: undefined,
      notes: undefined,
      taxRegime: 'GENERAL',
      lines: []
    });
    setError(null);
  }, []);

  return {
    formData,
    totals,
    isLoading,
    error,
    updateField,
    updateLine,
    addLine,
    removeLine,
    duplicateLine,
    saveInvoice,
    reset
  };
}

// Hook para manejo de pagos
export function usePayments(invoiceId: string | null) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPayments = useCallback(async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await api.getInvoicePayments(id);
      setPayments(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar pagos');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addPayment = useCallback(async (
    id: string,
    paymentData: Omit<Payment, 'id' | 'invoiceId' | 'createdAt'>
  ) => {
    try {
      setIsLoading(true);
      const newPayment = await api.createPayment(id, paymentData);
      setPayments(prev => [...prev, newPayment]);
      return newPayment;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al registrar pago');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const removePayment = useCallback(async (id: string, paymentId: string) => {
    try {
      setIsLoading(true);
      await api.deletePayment(id, paymentId);
      setPayments(prev => prev.filter(p => p.id !== paymentId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar pago');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (invoiceId) {
      fetchPayments(invoiceId);
    } else {
      setPayments([]);
    }
  }, [invoiceId, fetchPayments]);

  return {
    payments,
    isLoading,
    error,
    addPayment,
    removePayment,
    refreshPayments: () => invoiceId && fetchPayments(invoiceId)
  };
}

// Hook para selección múltiple
export function useMultiSelect<T extends { id: string }>() {
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  const selectItem = useCallback((item: T) => {
    setSelectedItems(prev => {
      const next = new Set(prev);
      if (next.has(item.id)) {
        next.delete(item.id);
      } else {
        next.add(item.id);
      }
      return next;
    });
  }, []);

  const selectAll = useCallback((items: T[]) => {
    setSelectedItems(prev => {
      const allSelected = items.every(item => prev.has(item.id));
      if (allSelected) {
        return new Set();
      } else {
        return new Set(items.map(item => item.id));
      }
    });
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedItems(new Set());
  }, []);

  const selectedCount = selectedItems.size;
  const isSelected = useCallback((id: string) => selectedItems.has(id), [selectedItems]);

  return {
    selectedItems,
    selectedCount,
    selectItem,
    selectAll,
    clearSelection,
    isSelected
  };
}

// Hook para exportaciones
export function useExports() {
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const exportInvoices = useCallback(async (options: ExportOptions) => {
    try {
      setIsExporting(true);
      setExportError(null);
      const blob = await api.exportInvoices(options);
      
      // Crear y descargar archivo
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      const filename = options.format === 'CSV' ? 'facturas.csv' : 
                     options.format === 'JSON' ? 'facturas.json' : 
                     'libro-iva.csv';
      
      link.download = filename;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setExportError(err instanceof Error ? err.message : 'Error al exportar');
      throw err;
    } finally {
      setIsExporting(false);
    }
  }, []);

  const importInvoices = useCallback(async (file: File) => {
    try {
      setIsExporting(true);
      setExportError(null);
      return await api.importInvoices(file);
    } catch (err) {
      setExportError(err instanceof Error ? err.message : 'Error al importar');
      throw err;
    } finally {
      setIsExporting(false);
    }
  }, []);

  return {
    isExporting,
    exportError,
    exportInvoices,
    importInvoices
  };
}

// Hook para recurrencias
export function useRecurrence(invoiceId: string | null) {
  const [recurrence, setRecurrence] = useState<RecurrenceConfig | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRecurrence = useCallback(async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await api.getRecurrence(id);
      setRecurrence(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar recurrencia');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveRecurrence = useCallback(async (id: string, config: RecurrenceConfig) => {
    try {
      setIsLoading(true);
      await api.createRecurrence(id, config);
      setRecurrence(config);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar recurrencia');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (invoiceId) {
      fetchRecurrence(invoiceId);
    } else {
      setRecurrence(null);
    }
  }, [invoiceId, fetchRecurrence]);

  return {
    recurrence,
    isLoading,
    error,
    saveRecurrence
  };
}

// Hook para e-Invoice/FacturaE
export function useEInvoice(invoiceId: string | null) {
  const [status, setStatus] = useState<EInvoiceStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = useCallback(async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await api.getEInvoiceStatus(id);
      setStatus(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar estado FacturaE');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const generateEInvoice = useCallback(async (id: string) => {
    try {
      setIsLoading(true);
      const result = await api.generateEInvoice(id);
      setStatus(prev => ({ ...prev!, generated: true, xmlUrl: result.url }));
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al generar FacturaE');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const sendEInvoice = useCallback(async (id: string) => {
    try {
      setIsLoading(true);
      const result = await api.sendEInvoice(id);
      setStatus(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al enviar FacturaE');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (invoiceId) {
      fetchStatus(invoiceId);
    } else {
      setStatus(null);
    }
  }, [invoiceId, fetchStatus]);

  return {
    status,
    isLoading,
    error,
    generateEInvoice,
    sendEInvoice
  };
}

// Hook para auditoría
export function useAuditTrail(invoiceId: string | null) {
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAuditTrail = useCallback(async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await api.getAuditTrail(id);
      setEvents(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar auditoría');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (invoiceId) {
      fetchAuditTrail(invoiceId);
    } else {
      setEvents([]);
    }
  }, [invoiceId, fetchAuditTrail]);

  return {
    events,
    isLoading,
    error,
    refreshAuditTrail: () => invoiceId && fetchAuditTrail(invoiceId)
  };
}