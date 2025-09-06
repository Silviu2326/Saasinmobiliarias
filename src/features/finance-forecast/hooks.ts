import { useState, useCallback, useMemo, useEffect } from 'react';
import type { 
  ForecastItem, 
  ForecastPeriod, 
  ForecastCategory, 
  ForecastScenario,
  ForecastQuery, 
  ForecastListResponse,
  ForecastSummary,
  ForecastFormData
} from './types';
import * as apis from './apis';
import { buildForecastQuery, filterForecasts, sortForecasts } from './utils';

// Hook para gestionar la lista de forecasts
export const useForecasts = (initialQuery: Partial<ForecastQuery> = {}) => {
  const [query, setQuery] = useState<ForecastQuery>(buildForecastQuery(initialQuery));
  const [data, setData] = useState<ForecastListResponse>({
    items: [],
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchForecasts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apis.getForecasts(query);
      setData(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar los forecasts');
    } finally {
      setLoading(false);
    }
  }, [query]);

  const updateQuery = useCallback((updates: Partial<ForecastQuery>) => {
    setQuery(prev => ({
      ...prev,
      ...updates,
      page: 1 // Reset to first page when query changes
    }));
  }, []);

  const goToPage = useCallback((page: number) => {
    setQuery(prev => ({ ...prev, page }));
  }, []);

  const refresh = useCallback(() => {
    fetchForecasts();
  }, [fetchForecasts]);

  useEffect(() => {
    fetchForecasts();
  }, [fetchForecasts]);

  return {
    data,
    loading,
    error,
    query,
    updateQuery,
    goToPage,
    refresh
  };
};

// Hook para selección múltiple
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

  const selectItem = useCallback((id: string) => {
    setSelectedIds(prev => new Set(prev).add(id));
  }, []);

  const deselectItem = useCallback((id: string) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      newSet.delete(id);
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
    selectItem,
    deselectItem,
    clearSelection
  };
};

// Hook para gestionar un forecast individual
export const useForecast = (id: string) => {
  const [forecast, setForecast] = useState<ForecastItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchForecast = useCallback(async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      setError(null);
      const data = await apis.getForecast(id);
      setForecast(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar el forecast');
    } finally {
      setLoading(false);
    }
  }, [id]);

  const updateForecast = useCallback(async (updates: Partial<ForecastItem>) => {
    if (!id) return null;
    
    try {
      setLoading(true);
      setError(null);
      const updated = await apis.updateForecast(id, updates);
      if (updated) {
        setForecast(updated);
      }
      return updated;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar el forecast');
      return null;
    } finally {
      setLoading(false);
    }
  }, [id]);

  const deleteForecast = useCallback(async () => {
    if (!id) return false;
    
    try {
      setLoading(true);
      setError(null);
      const success = await apis.deleteForecast(id);
      if (success) {
        setForecast(null);
      }
      return success;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar el forecast');
      return false;
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchForecast();
  }, [fetchForecast]);

  return {
    forecast,
    loading,
    error,
    fetchForecast,
    updateForecast,
    deleteForecast
  };
};

// Hook para el formulario de forecast
export const useForecastForm = (initialData?: Partial<ForecastFormData>) => {
  const [formData, setFormData] = useState<ForecastFormData>({
    periodId: '',
    categoryId: '',
    name: '',
    description: '',
    type: 'income',
    amount: 0,
    currency: 'EUR',
    probability: 50,
    status: 'draft',
    tags: [],
    notes: '',
    ...initialData
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateField = useCallback((field: keyof ForecastFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const updateTags = useCallback((tags: string[]) => {
    setFormData(prev => ({ ...prev, tags }));
  }, []);

  const addTag = useCallback((tag: string) => {
    if (tag && !formData.tags.includes(tag)) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, tag] }));
    }
  }, [formData.tags]);

  const removeTag = useCallback((tagToRemove: string) => {
    setFormData(prev => ({ 
      ...prev, 
      tags: prev.tags.filter(tag => tag !== tagToRemove) 
    }));
  }, []);

  const resetForm = useCallback(() => {
    setFormData({
      periodId: '',
      categoryId: '',
      name: '',
      description: '',
      type: 'income',
      amount: 0,
      currency: 'EUR',
      probability: 50,
      status: 'draft',
      tags: [],
      notes: ''
    });
    setError(null);
  }, []);

  const submitForm = useCallback(async (): Promise<ForecastItem | null> => {
    try {
      setLoading(true);
      setError(null);
      const newForecast = await apis.createForecast(formData);
      return newForecast;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear el forecast');
      return null;
    } finally {
      setLoading(false);
    }
  }, [formData]);

  return {
    formData,
    loading,
    error,
    updateField,
    updateTags,
    addTag,
    removeTag,
    resetForm,
    submitForm
  };
};

// Hook para períodos de forecast
export const useForecastPeriods = () => {
  const [periods, setPeriods] = useState<ForecastPeriod[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPeriods = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apis.getForecastPeriods();
      setPeriods(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar los períodos');
    } finally {
      setLoading(false);
    }
  }, []);

  const createPeriod = useCallback(async (data: Omit<ForecastPeriod, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      setLoading(true);
      setError(null);
      const newPeriod = await apis.createForecastPeriod(data);
      setPeriods(prev => [...prev, newPeriod]);
      return newPeriod;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear el período');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updatePeriod = useCallback(async (id: string, data: Partial<ForecastPeriod>) => {
    try {
      setLoading(true);
      setError(null);
      const updated = await apis.updateForecastPeriod(id, data);
      if (updated) {
        setPeriods(prev => prev.map(period => 
          period.id === id ? updated : period
        ));
      }
      return updated;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar el período');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const deletePeriod = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const success = await apis.deleteForecastPeriod(id);
      if (success) {
        setPeriods(prev => prev.filter(period => period.id !== id));
      }
      return success;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar el período');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPeriods();
  }, [fetchPeriods]);

  return {
    periods,
    loading,
    error,
    fetchPeriods,
    createPeriod,
    updatePeriod,
    deletePeriod
  };
};

// Hook para categorías de forecast
export const useForecastCategories = () => {
  const [categories, setCategories] = useState<ForecastCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apis.getForecastCategories();
      setCategories(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar las categorías');
    } finally {
      setLoading(false);
    }
  }, []);

  const createCategory = useCallback(async (data: Omit<ForecastCategory, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      setLoading(true);
      setError(null);
      const newCategory = await apis.createForecastCategory(data);
      setCategories(prev => [...prev, newCategory]);
      return newCategory;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear la categoría');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateCategory = useCallback(async (id: string, data: Partial<ForecastCategory>) => {
    try {
      setLoading(true);
      setError(null);
      const updated = await apis.updateForecastCategory(id, data);
      if (updated) {
        setCategories(prev => prev.map(category => 
          category.id === id ? updated : category
        ));
      }
      return updated;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar la categoría');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteCategory = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const success = await apis.deleteForecastCategory(id);
      if (success) {
        setCategories(prev => prev.filter(category => category.id !== id));
      }
      return success;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar la categoría');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return {
    categories,
    loading,
    error,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory
  };
};

// Hook para escenarios de forecast
export const useForecastScenarios = () => {
  const [scenarios, setScenarios] = useState<ForecastScenario[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchScenarios = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apis.getForecastScenarios();
      setScenarios(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar los escenarios');
    } finally {
      setLoading(false);
    }
  }, []);

  const createScenario = useCallback(async (data: Omit<ForecastScenario, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      setLoading(true);
      setError(null);
      const newScenario = await apis.createForecastScenario(data);
      setScenarios(prev => [...prev, newScenario]);
      return newScenario;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear el escenario');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateScenario = useCallback(async (id: string, data: Partial<ForecastScenario>) => {
    try {
      setLoading(true);
      setError(null);
      const updated = await apis.updateForecastScenario(id, data);
      if (updated) {
        setScenarios(prev => prev.map(scenario => 
          scenario.id === id ? updated : scenario
        ));
      }
      return updated;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar el escenario');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteScenario = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const success = await apis.deleteForecastScenario(id);
      if (success) {
        setScenarios(prev => prev.filter(scenario => scenario.id !== id));
      }
      return success;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar el escenario');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchScenarios();
  }, [fetchScenarios]);

  return {
    scenarios,
    loading,
    error,
    fetchScenarios,
    createScenario,
    updateScenario,
    deleteScenario
  };
};

// Hook para resumen de forecast
export const useForecastSummary = (periodId?: string) => {
  const [summary, setSummary] = useState<ForecastSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apis.getForecastSummary(periodId);
      setSummary(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar el resumen');
    } finally {
      setLoading(false);
    }
  }, [periodId]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  return {
    summary,
    loading,
    error,
    fetchSummary
  };
};