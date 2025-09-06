import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  DueDateItem, 
  DueDateFilters, 
  DueDateKPIs, 
  BoardBucket, 
  CalendarEvent,
  ReminderSettings,
  EscalationRule,
  AuditEvent,
  BulkAction
} from './types';
import {
  getDueDates,
  getDueDate,
  createDueDate,
  updateDueDate,
  updateDueDateStatus,
  updateDueDateSchedule,
  updateDueDateAssignee,
  deleteDueDate,
  getDueDateKPIs,
  bulkUpdateStatus,
  bulkPostpone,
  bulkReassign,
  getReminderSettings,
  updateReminderSettings,
  getEscalationRules,
  updateEscalationRules,
  exportDueDates,
  importDueDates,
  getAuditEvents,
  recalculateSLA
} from './apis';
import { 
  queryStringToFilters, 
  filtersToQueryString, 
  createBoardBuckets, 
  itemsToCalendarEvents 
} from './utils';

export const useDueDates = (initialFilters: DueDateFilters = {}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [items, setItems] = useState<DueDateItem[]>([]);
  const [total, setTotal] = useState(0);
  const [kpis, setKPIs] = useState<DueDateKPIs>({
    total: 0,
    vencidos: 0,
    hoy: 0,
    semana: 0,
    atRisk: 0,
    completados: 0
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  // Merge URL params with initial filters
  const filters = useMemo(() => ({
    ...initialFilters,
    ...queryStringToFilters(searchParams.toString())
  }), [searchParams, initialFilters]);

  const updateFilters = useCallback((newFilters: DueDateFilters) => {
    const queryString = filtersToQueryString(newFilters);
    setSearchParams(queryString ? `?${queryString}` : '');
  }, [setSearchParams]);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const [dueDatesResult, kpisResult] = await Promise.all([
        getDueDates(filters),
        getDueDateKPIs(filters)
      ]);
      
      setItems(dueDatesResult.items);
      setTotal(dueDatesResult.total);
      setKPIs(kpisResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar los datos');
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const refresh = useCallback(() => {
    loadData();
  }, [loadData]);

  const toggleSelection = useCallback((itemId: string) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  }, []);

  const selectAll = useCallback(() => {
    setSelectedItems(new Set(items.map(item => item.id)));
  }, [items]);

  const clearSelection = useCallback(() => {
    setSelectedItems(new Set());
  }, []);

  const isSelected = useCallback((itemId: string) => {
    return selectedItems.has(itemId);
  }, [selectedItems]);

  return {
    items,
    total,
    kpis,
    filters,
    isLoading,
    error,
    selectedItems: Array.from(selectedItems),
    selectedCount: selectedItems.size,
    updateFilters,
    refresh,
    toggleSelection,
    selectAll,
    clearSelection,
    isSelected
  };
};

export const useDueDate = (id?: string) => {
  const [item, setItem] = useState<DueDateItem | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadItem = useCallback(async () => {
    if (!id) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await getDueDate(id);
      setItem(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar el elemento');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadItem();
  }, [loadItem]);

  const updateStatus = useCallback(async (status: string, reason?: string) => {
    if (!id) return;
    
    try {
      const updated = await updateDueDateStatus(id, status as any, reason);
      setItem(updated);
      return updated;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Error al actualizar el estado');
    }
  }, [id]);

  const updateSchedule = useCallback(async (date: string, endDate?: string) => {
    if (!id) return;
    
    try {
      const updated = await updateDueDateSchedule(id, date, endDate);
      setItem(updated);
      return updated;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Error al actualizar la programación');
    }
  }, [id]);

  const updateAssignee = useCallback(async (assigneeId: string, assigneeName?: string) => {
    if (!id) return;
    
    try {
      const updated = await updateDueDateAssignee(id, assigneeId, assigneeName);
      setItem(updated);
      return updated;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Error al reasignar');
    }
  }, [id]);

  const update = useCallback(async (data: Partial<DueDateItem>) => {
    if (!id) return;
    
    try {
      const updated = await updateDueDate(id, data);
      setItem(updated);
      return updated;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Error al actualizar');
    }
  }, [id]);

  const remove = useCallback(async () => {
    if (!id) return;
    
    try {
      await deleteDueDate(id);
      setItem(null);
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Error al eliminar');
    }
  }, [id]);

  return {
    item,
    isLoading,
    error,
    refresh: loadItem,
    updateStatus,
    updateSchedule,
    updateAssignee,
    update,
    remove
  };
};

export const useBoardBuckets = (items: DueDateItem[]): BoardBucket[] => {
  return useMemo(() => createBoardBuckets(items), [items]);
};

export const useCalendar = (items: DueDateItem[], range?: { start: Date; end: Date }): CalendarEvent[] => {
  return useMemo(() => {
    let filteredItems = items;
    
    if (range) {
      filteredItems = items.filter(item => {
        const itemDate = new Date(item.date);
        return itemDate >= range.start && itemDate <= range.end;
      });
    }
    
    return itemsToCalendarEvents(filteredItems);
  }, [items, range]);
};

export const useReminderSettings = () => {
  const [settings, setSettings] = useState<ReminderSettings[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSettings = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await getReminderSettings();
      setSettings(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar configuración');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const updateSettings = useCallback(async (newSettings: ReminderSettings[]) => {
    try {
      const updated = await updateReminderSettings(newSettings);
      setSettings(updated);
      return updated;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Error al actualizar configuración');
    }
  }, []);

  return {
    settings,
    isLoading,
    error,
    updateSettings,
    refresh: loadSettings
  };
};

export const useEscalations = () => {
  const [rules, setRules] = useState<EscalationRule[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadRules = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await getEscalationRules();
      setRules(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar reglas');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRules();
  }, [loadRules]);

  const updateRules = useCallback(async (newRules: EscalationRule[]) => {
    try {
      const updated = await updateEscalationRules(newRules);
      setRules(updated);
      return updated;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Error al actualizar reglas');
    }
  }, []);

  return {
    rules,
    isLoading,
    error,
    updateRules,
    refresh: loadRules
  };
};

export const useExportImport = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [importError, setImportError] = useState<string | null>(null);

  const exportItems = useCallback(async (itemIds: string[], format: 'csv' | 'json' | 'ical') => {
    setIsExporting(true);
    setExportError(null);
    
    try {
      const blob = await exportDueDates(itemIds, format);
      
      // Download file
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `due-dates-${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      return true;
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Error en la exportación';
      setExportError(error);
      throw new Error(error);
    } finally {
      setIsExporting(false);
    }
  }, []);

  const importItems = useCallback(async (file: File) => {
    setIsImporting(true);
    setImportError(null);
    
    try {
      const imported = await importDueDates(file);
      return imported;
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Error en la importación';
      setImportError(error);
      throw new Error(error);
    } finally {
      setIsImporting(false);
    }
  }, []);

  return {
    isExporting,
    isImporting,
    exportError,
    importError,
    exportItems,
    importItems
  };
};

export const useAudit = (itemId?: string) => {
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadEvents = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await getAuditEvents(itemId);
      setEvents(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar auditoría');
    } finally {
      setIsLoading(false);
    }
  }, [itemId]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  return {
    events,
    isLoading,
    error,
    refresh: loadEvents
  };
};

export const useBulkActions = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const executeAction = useCallback(async (action: BulkAction) => {
    setIsProcessing(true);
    setError(null);
    
    try {
      let result;
      
      switch (action.action) {
        case 'complete':
          result = await bulkUpdateStatus(action.itemIds, 'COMPLETADO');
          break;
        case 'postpone':
          if (!action.params?.postponeDays) throw new Error('Días de posposición requeridos');
          result = await bulkPostpone(action.itemIds, action.params.postponeDays);
          break;
        case 'reassign':
          if (!action.params?.assigneeId) throw new Error('Responsable requerido');
          result = await bulkReassign(action.itemIds, action.params.assigneeId);
          break;
        case 'export':
          if (!action.params?.format) throw new Error('Formato de exportación requerido');
          const blob = await exportDueDates(action.itemIds, action.params.format);
          
          // Download file
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `due-dates-${new Date().toISOString().split('T')[0]}.${action.params.format}`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
          
          result = { success: true };
          break;
        default:
          throw new Error('Acción no soportada');
      }
      
      return result;
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Error en la acción masiva';
      setError(error);
      throw new Error(error);
    } finally {
      setIsProcessing(false);
    }
  }, []);

  return {
    isProcessing,
    error,
    executeAction
  };
};

export const useCreateDueDate = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = useCallback(async (data: Partial<DueDateItem>) => {
    setIsCreating(true);
    setError(null);
    
    try {
      const created = await createDueDate(data);
      return created;
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Error al crear elemento';
      setError(error);
      throw new Error(error);
    } finally {
      setIsCreating(false);
    }
  }, []);

  return {
    isCreating,
    error,
    create
  };
};

export const useSLARecalculation = () => {
  const [isRecalculating, setIsRecalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const recalculate = useCallback(async () => {
    setIsRecalculating(true);
    setError(null);
    
    try {
      const result = await recalculateSLA();
      return result;
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Error al recalcular SLA';
      setError(error);
      throw new Error(error);
    } finally {
      setIsRecalculating(false);
    }
  }, []);

  return {
    isRecalculating,
    error,
    recalculate
  };
};

// Custom hook for managing view state
export const useViewState = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  const view = searchParams.get('view') || 'board';
  const selectedId = searchParams.get('selected') || null;
  const editingId = searchParams.get('edit') || null;
  const creating = searchParams.has('create');

  const setView = useCallback((newView: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('view', newView);
    setSearchParams(params);
  }, [searchParams, setSearchParams]);

  const selectItem = useCallback((id: string | null) => {
    const params = new URLSearchParams(searchParams);
    if (id) {
      params.set('selected', id);
    } else {
      params.delete('selected');
    }
    setSearchParams(params);
  }, [searchParams, setSearchParams]);

  const editItem = useCallback((id: string | null) => {
    const params = new URLSearchParams(searchParams);
    if (id) {
      params.set('edit', id);
    } else {
      params.delete('edit');
    }
    setSearchParams(params);
  }, [searchParams, setSearchParams]);

  const setCreating = useCallback((isCreating: boolean) => {
    const params = new URLSearchParams(searchParams);
    if (isCreating) {
      params.set('create', 'true');
    } else {
      params.delete('create');
    }
    setSearchParams(params);
  }, [searchParams, setSearchParams]);

  return {
    view,
    selectedId,
    editingId,
    creating,
    setView,
    selectItem,
    editItem,
    setCreating
  };
};