import { useState, useEffect, useCallback, useMemo } from 'react';
import type {
  KPIMetric,
  KPICategory,
  KPIGoal,
  KPISummary,
  KPIFilter,
  KPITimeRange,
  KPINotification,
  KPIBenchmark,
  KPIAnalysis,
  KPITimeSeries
} from './types';
import {
  getKPIMetrics,
  getKPICategories,
  getKPIGoals,
  getKPISummary,
  getKPINotifications,
  getKPIBenchmarks,
  getKPIAnalysis,
  getKPITimeSeries,
  refreshKPIMetrics
} from './apis';
import { filterKPIs, sortKPIs, calculateKPISummary } from './utils';

// Hook para gestionar KPIs con filtros y paginación
export const useKPIs = (initialFilter: KPIFilter = {}) => {
  const [metrics, setMetrics] = useState<KPIMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<KPIFilter>(initialFilter);
  const [sortBy, setSortBy] = useState<string>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const fetchMetrics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getKPIMetrics(filter);
      setMetrics(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar los KPIs');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  const updateFilter = useCallback((newFilter: Partial<KPIFilter>) => {
    setFilter(prev => ({ ...prev, ...newFilter }));
  }, []);

  const clearFilter = useCallback(() => {
    setFilter(initialFilter);
  }, [initialFilter]);

  const refresh = useCallback(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  const filteredMetrics = useMemo(() => {
    let filtered = filterKPIs(metrics, filter);
    return sortKPIs(filtered, sortBy, sortOrder);
  }, [metrics, filter, sortBy, sortOrder]);

  const summary = useMemo(() => calculateKPISummary(filteredMetrics), [filteredMetrics]);

  return {
    metrics: filteredMetrics,
    allMetrics: metrics,
    loading,
    error,
    filter,
    sortBy,
    sortOrder,
    summary,
    updateFilter,
    clearFilter,
    setSortBy,
    setSortOrder,
    refresh,
    fetchMetrics
  };
};

// Hook para gestionar categorías de KPI
export const useKPICategories = () => {
  const [categories, setCategories] = useState<KPICategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getKPICategories();
      setCategories(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar las categorías');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const refresh = useCallback(() => {
    fetchCategories();
  }, [fetchCategories]);

  return {
    categories,
    loading,
    error,
    refresh
  };
};

// Hook para gestionar objetivos de KPI
export const useKPIGoals = (metricId?: string) => {
  const [goals, setGoals] = useState<KPIGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGoals = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getKPIGoals(metricId);
      setGoals(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar los objetivos');
    } finally {
      setLoading(false);
    }
  }, [metricId]);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  const refresh = useCallback(() => {
    fetchGoals();
  }, [fetchGoals]);

  return {
    goals,
    loading,
    error,
    refresh
  };
};

// Hook para gestionar resumen de KPIs
export const useKPISummary = () => {
  const [summary, setSummary] = useState<KPISummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getKPISummary();
      setSummary(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar el resumen');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  const refresh = useCallback(() => {
    fetchSummary();
  }, [fetchSummary]);

  return {
    summary,
    loading,
    error,
    refresh
  };
};

// Hook para gestionar notificaciones de KPI
export const useKPINotifications = () => {
  const [notifications, setNotifications] = useState<KPINotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getKPINotifications();
      setNotifications(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar las notificaciones');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const refresh = useCallback(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, isRead: true } : notif
      )
    );
  }, []);

  const unreadCount = useMemo(() => 
    notifications.filter(n => !n.isRead).length, 
    [notifications]
  );

  return {
    notifications,
    loading,
    error,
    unreadCount,
    refresh,
    markAsRead
  };
};

// Hook para gestionar benchmarks de KPI
export const useKPIBenchmarks = (metricId?: string) => {
  const [benchmarks, setBenchmarks] = useState<KPIBenchmark[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBenchmarks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getKPIBenchmarks(metricId);
      setBenchmarks(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar los benchmarks');
    } finally {
      setLoading(false);
    }
  }, [metricId]);

  useEffect(() => {
    fetchBenchmarks();
  }, [fetchBenchmarks]);

  const refresh = useCallback(() => {
    fetchBenchmarks();
  }, [fetchBenchmarks]);

  return {
    benchmarks,
    loading,
    error,
    refresh
  };
};

// Hook para gestionar análisis de KPI
export const useKPIAnalysis = (metricId: string) => {
  const [analysis, setAnalysis] = useState<KPIAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalysis = useCallback(async () => {
    if (!metricId) return;
    
    try {
      setLoading(true);
      setError(null);
      const data = await getKPIAnalysis(metricId);
      setAnalysis(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar el análisis');
    } finally {
      setLoading(false);
    }
  }, [metricId]);

  useEffect(() => {
    fetchAnalysis();
  }, [fetchAnalysis]);

  const refresh = useCallback(() => {
    fetchAnalysis();
  }, [fetchAnalysis]);

  return {
    analysis,
    loading,
    error,
    refresh
  };
};

// Hook para gestionar series temporales de KPI
export const useKPITimeSeries = (metricId: string, period: string) => {
  const [timeSeries, setTimeSeries] = useState<KPITimeSeries | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTimeSeries = useCallback(async () => {
    if (!metricId || !period) return;
    
    try {
      setLoading(true);
      setError(null);
      const data = await getKPITimeSeries(metricId, period);
      setTimeSeries(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar la serie temporal');
    } finally {
      setLoading(false);
    }
  }, [metricId, period]);

  useEffect(() => {
    fetchTimeSeries();
  }, [fetchTimeSeries]);

  const refresh = useCallback(() => {
    fetchTimeSeries();
  }, [fetchTimeSeries]);

  return {
    timeSeries,
    loading,
    error,
    refresh
  };
};

// Hook para gestionar rangos de tiempo
export const useKPITimeRanges = () => {
  const [timeRanges, setTimeRanges] = useState<KPITimeRange[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTimeRange, setSelectedTimeRange] = useState<KPITimeRange | null>(null);

  const fetchTimeRanges = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getKPITimeRanges();
      setTimeRanges(data);
      
      // Seleccionar el rango por defecto
      const defaultRange = data.find(tr => tr.isDefault);
      if (defaultRange) {
        setSelectedTimeRange(defaultRange);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar los rangos de tiempo');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTimeRanges();
  }, [fetchTimeRanges]);

  const refresh = useCallback(() => {
    fetchTimeRanges();
  }, [fetchTimeRanges]);

  return {
    timeRanges,
    selectedTimeRange,
    loading,
    error,
    setSelectedTimeRange,
    refresh
  };
};

// Hook para gestionar métricas individuales
export const useKPIMetric = (id: string) => {
  const [metric, setMetric] = useState<KPIMetric | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMetric = useCallback(async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      setError(null);
      const data = await getKPIMetrics();
      const foundMetric = data.find(m => m.id === id);
      setMetric(foundMetric || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar el KPI');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchMetric();
  }, [fetchMetric]);

  const refresh = useCallback(() => {
    fetchMetric();
  }, [fetchMetric]);

  return {
    metric,
    loading,
    error,
    refresh
  };
};

// Hook para gestión de selección múltiple
export const useMultiSelect = <T extends { id: string }>(items: T[]) => {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const selectedItems = useMemo(() => 
    items.filter(item => selectedIds.has(item.id)), 
    [items, selectedIds]
  );

  const isAllSelected = useMemo(() => 
    items.length > 0 && selectedIds.size === items.length, 
    [items.length, selectedIds.size]
  );

  const isIndeterminate = useMemo(() => 
    selectedIds.size > 0 && selectedIds.size < items.length, 
    [items.length, selectedIds.size]
  );

  const toggleAll = useCallback(() => {
    if (isAllSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(items.map(item => item.id)));
    }
  }, [isAllSelected, items]);

  const toggleItem = useCallback((id: string) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  return {
    selectedIds,
    selectedItems,
    isAllSelected,
    isIndeterminate,
    toggleAll,
    toggleItem,
    clearSelection
  };
};

// Hook para gestión de filtros avanzados
export const useKPIFilters = (initialFilter: KPIFilter = {}) => {
  const [filter, setFilter] = useState<KPIFilter>(initialFilter);
  const [showFilters, setShowFilters] = useState(false);

  const updateFilter = useCallback((updates: Partial<KPIFilter>) => {
    setFilter(prev => ({ ...prev, ...updates }));
  }, []);

  const clearFilter = useCallback(() => {
    setFilter(initialFilter);
  }, [initialFilter]);

  const toggleFilters = useCallback(() => {
    setShowFilters(prev => !prev);
  }, []);

  const hasActiveFilters = useMemo(() => {
    return Object.values(filter).some(value => 
      value !== undefined && 
      value !== '' && 
      (Array.isArray(value) ? value.length > 0 : true)
    );
  }, [filter]);

  return {
    filter,
    showFilters,
    hasActiveFilters,
    updateFilter,
    clearFilter,
    toggleFilters
  };
};

// Hook para gestión de exportación
export const useKPIExport = () => {
  const [exporting, setExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState<'csv' | 'excel' | 'pdf'>('csv');

  const exportData = useCallback(async (format: 'csv' | 'excel' | 'pdf' = exportFormat) => {
    try {
      setExporting(true);
      // Aquí se implementaría la lógica de exportación real
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log(`Exportando KPIs en formato ${format}`);
    } catch (error) {
      console.error('Error al exportar:', error);
    } finally {
      setExporting(false);
    }
  }, [exportFormat]);

  return {
    exporting,
    exportFormat,
    setExportFormat,
    exportData
  };
};

// Hook para gestión de actualización automática
export const useKPIAutoRefresh = (interval: number = 30000) => {
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(interval);

  useEffect(() => {
    if (!autoRefresh) return;

    const timer = setInterval(() => {
      refreshKPIMetrics();
    }, refreshInterval);

    return () => clearInterval(timer);
  }, [autoRefresh, refreshInterval]);

  const toggleAutoRefresh = useCallback(() => {
    setAutoRefresh(prev => !prev);
  }, []);

  const updateInterval = useCallback((newInterval: number) => {
    setRefreshInterval(newInterval);
  }, []);

  return {
    autoRefresh,
    refreshInterval,
    toggleAutoRefresh,
    updateInterval
  };
};


