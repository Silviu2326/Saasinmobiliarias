import { useState, useEffect, useCallback } from 'react';
import type { 
  Subject, 
  Comp, 
  ModelSpec, 
  ValuationResult, 
  ValuationJob, 
  MarketTrend, 
  AvmFilters,
  AvmSettings,
  AuditEntry,
  GeospatialAnalysis,
  DataSource,
  ModelPerformance,
  PortfolioValuation,
  AvmStatus,
  ViewMode,
  SortField,
  SortDirection
} from './types';
import {
  getAvailableModels,
  searchComparables,
  runValuation,
  getValuationJob,
  getValuationResults,
  getMarketTrends,
  getGeospatialAnalysis,
  getAuditLog,
  getDataSources,
  getModelPerformance,
  createPortfolioValuation,
  batchValuation
} from './apis';

/**
 * Hook for managing AVM application state
 */
export const useAvmState = () => {
  const [status, setStatus] = useState<AvmStatus>('idle');
  const [viewMode, setViewMode] = useState<ViewMode>('form');
  const [currentSubject, setCurrentSubject] = useState<Subject | null>(null);
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const [currentJob, setCurrentJob] = useState<ValuationJob | null>(null);
  const [results, setResults] = useState<ValuationResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  const reset = useCallback(() => {
    setStatus('idle');
    setViewMode('form');
    setCurrentSubject(null);
    setSelectedModels([]);
    setCurrentJob(null);
    setResults([]);
    setError(null);
  }, []);

  const updateStatus = useCallback((newStatus: AvmStatus) => {
    setStatus(newStatus);
    if (newStatus !== 'error') {
      setError(null);
    }
  }, []);

  const setErrorState = useCallback((message: string) => {
    setStatus('error');
    setError(message);
  }, []);

  return {
    status,
    viewMode,
    currentSubject,
    selectedModels,
    currentJob,
    results,
    error,
    setViewMode,
    setCurrentSubject,
    setSelectedModels,
    setCurrentJob,
    setResults,
    updateStatus,
    setErrorState,
    reset
  };
};

/**
 * Hook for managing available models
 */
export const useModels = () => {
  const [models, setModels] = useState<ModelSpec[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchModels = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAvailableModels();
      setModels(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error cargando modelos');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchModels();
  }, [fetchModels]);

  const getModelById = useCallback((id: string) => {
    return models.find(model => model.id === id);
  }, [models]);

  const getModelsByType = useCallback((type: string) => {
    return models.filter(model => model.type === type);
  }, [models]);

  const getModelsByCategory = useCallback((category: string) => {
    return models.filter(model => model.category === category);
  }, [models]);

  return {
    models,
    loading,
    error,
    fetchModels,
    getModelById,
    getModelsByType,
    getModelsByCategory
  };
};

/**
 * Hook for managing comparables search and filtering
 */
export const useComparables = () => {
  const [comps, setComps] = useState<Comp[]>([]);
  const [filteredComps, setFilteredComps] = useState<Comp[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<AvmFilters>({});
  const [sortField, setSortField] = useState<SortField>('similarity');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const searchComps = useCallback(async (subject: Subject, searchFilters?: AvmFilters) => {
    try {
      setLoading(true);
      setError(null);
      const data = await searchComparables(subject, searchFilters);
      setComps(data);
      setFilteredComps(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error buscando comparables');
    } finally {
      setLoading(false);
    }
  }, []);

  const applyFilters = useCallback((newFilters: AvmFilters) => {
    setFilters(newFilters);
    
    let filtered = [...comps];
    
    if (newFilters.minPrice) {
      filtered = filtered.filter(comp => comp.salePrice >= newFilters.minPrice!);
    }
    if (newFilters.maxPrice) {
      filtered = filtered.filter(comp => comp.salePrice <= newFilters.maxPrice!);
    }
    if (newFilters.minArea) {
      filtered = filtered.filter(comp => comp.area >= newFilters.minArea!);
    }
    if (newFilters.maxArea) {
      filtered = filtered.filter(comp => comp.area <= newFilters.maxArea!);
    }
    if (newFilters.minRooms) {
      filtered = filtered.filter(comp => comp.rooms >= newFilters.minRooms!);
    }
    if (newFilters.maxRooms) {
      filtered = filtered.filter(comp => comp.rooms <= newFilters.maxRooms!);
    }
    if (newFilters.condition) {
      filtered = filtered.filter(comp => comp.condition === newFilters.condition);
    }
    if (newFilters.propertyType) {
      filtered = filtered.filter(comp => comp.propertyType === newFilters.propertyType);
    }
    if (newFilters.verified === true) {
      filtered = filtered.filter(comp => comp.verified);
    }
    if (newFilters.source && newFilters.source.length > 0) {
      filtered = filtered.filter(comp => newFilters.source!.includes(comp.source));
    }

    setFilteredComps(filtered);
  }, [comps]);

  const sortComps = useCallback((field: SortField, direction: SortDirection) => {
    setSortField(field);
    setSortDirection(direction);
    
    const sorted = [...filteredComps].sort((a, b) => {
      let aValue: number, bValue: number;
      
      switch (field) {
        case 'price':
          aValue = a.salePrice;
          bValue = b.salePrice;
          break;
        case 'pricePerM2':
          aValue = a.pricePerM2;
          bValue = b.pricePerM2;
          break;
        case 'similarity':
          aValue = a.similarity;
          bValue = b.similarity;
          break;
        case 'distance':
          aValue = a.distanceToSubject;
          bValue = b.distanceToSubject;
          break;
        case 'saleDate':
          aValue = new Date(a.saleDate).getTime();
          bValue = new Date(b.saleDate).getTime();
          break;
        default:
          return 0;
      }
      
      return direction === 'asc' ? aValue - bValue : bValue - aValue;
    });
    
    setFilteredComps(sorted);
  }, [filteredComps]);

  const clearFilters = useCallback(() => {
    setFilters({});
    setFilteredComps(comps);
  }, [comps]);

  return {
    comps,
    filteredComps,
    loading,
    error,
    filters,
    sortField,
    sortDirection,
    searchComps,
    applyFilters,
    sortComps,
    clearFilters
  };
};

/**
 * Hook for managing valuation jobs and results
 */
export const useValuation = () => {
  const [currentJob, setCurrentJob] = useState<ValuationJob | null>(null);
  const [results, setResults] = useState<ValuationResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startValuation = useCallback(async (subject: Subject, modelIds: string[]) => {
    try {
      setLoading(true);
      setError(null);
      const job = await runValuation(subject, modelIds);
      setCurrentJob(job);
      return job;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error iniciando valoración');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const pollJobStatus = useCallback(async (jobId: string) => {
    try {
      const job = await getValuationJob(jobId);
      setCurrentJob(job);
      
      if (job.status === 'completed' && job.results) {
        setResults(job.results);
      }
      
      return job;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error consultando estado del trabajo');
      throw err;
    }
  }, []);

  const loadResults = useCallback(async (subjectId: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await getValuationResults(subjectId);
      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error cargando resultados');
    } finally {
      setLoading(false);
    }
  }, []);

  const clearResults = useCallback(() => {
    setCurrentJob(null);
    setResults([]);
    setError(null);
  }, []);

  return {
    currentJob,
    results,
    loading,
    error,
    startValuation,
    pollJobStatus,
    loadResults,
    clearResults
  };
};

/**
 * Hook for managing market trends
 */
export const useMarketTrends = () => {
  const [trends, setTrends] = useState<MarketTrend[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTrends = useCallback(async (area: string, period?: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await getMarketTrends(area, period);
      setTrends(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error cargando tendencias');
    } finally {
      setLoading(false);
    }
  }, []);

  const getLatestTrend = useCallback(() => {
    return trends[0] || null;
  }, [trends]);

  const getTrendForPeriod = useCallback((period: string) => {
    return trends.find(trend => trend.period === period) || null;
  }, [trends]);

  return {
    trends,
    loading,
    error,
    fetchTrends,
    getLatestTrend,
    getTrendForPeriod
  };
};

/**
 * Hook for managing geospatial analysis
 */
export const useGeospatialAnalysis = () => {
  const [analysis, setAnalysis] = useState<GeospatialAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalysis = useCallback(async (subjectId: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await getGeospatialAnalysis(subjectId);
      setAnalysis(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error cargando análisis geoespacial');
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    analysis,
    loading,
    error,
    fetchAnalysis
  };
};

/**
 * Hook for managing audit log
 */
export const useAuditLog = () => {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAuditLog = useCallback(async (filters?: { type?: string; dateFrom?: string; dateTo?: string }) => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAuditLog(filters);
      setEntries(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error cargando auditoría');
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    entries,
    loading,
    error,
    fetchAuditLog
  };
};

/**
 * Hook for managing data sources
 */
export const useDataSources = () => {
  const [sources, setSources] = useState<DataSource[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSources = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getDataSources();
      setSources(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error cargando fuentes de datos');
    } finally {
      setLoading(false);
    }
  }, []);

  const getActiveSourcesCount = useCallback(() => {
    return sources.filter(source => source.status === 'active').length;
  }, [sources]);

  const getErrorSourcesCount = useCallback(() => {
    return sources.filter(source => source.status === 'error').length;
  }, [sources]);

  return {
    sources,
    loading,
    error,
    fetchSources,
    getActiveSourcesCount,
    getErrorSourcesCount
  };
};

/**
 * Hook for managing model performance metrics
 */
export const useModelPerformance = () => {
  const [performance, setPerformance] = useState<ModelPerformance | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPerformance = useCallback(async (modelId: string, period: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await getModelPerformance(modelId, period);
      setPerformance(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error cargando rendimiento del modelo');
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    performance,
    loading,
    error,
    fetchPerformance
  };
};

/**
 * Hook for managing portfolio valuations
 */
export const usePortfolioValuation = () => {
  const [portfolios, setPortfolios] = useState<PortfolioValuation[]>([]);
  const [currentPortfolio, setCurrentPortfolio] = useState<PortfolioValuation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createPortfolio = useCallback(async (portfolio: Partial<PortfolioValuation>) => {
    try {
      setLoading(true);
      setError(null);
      const data = await createPortfolioValuation(portfolio);
      setPortfolios(prev => [...prev, data]);
      setCurrentPortfolio(data);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error creando portfolio');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    portfolios,
    currentPortfolio,
    loading,
    error,
    createPortfolio,
    setCurrentPortfolio
  };
};

/**
 * Hook for managing AVM settings
 */
export const useAvmSettings = () => {
  const [settings, setSettings] = useState<AvmSettings>({
    defaultRadius: 2,
    minComparables: 5,
    maxComparables: 25,
    maxAge: 12,
    confidenceLevel: 95,
    adjustmentCaps: {
      area: 20,
      condition: 15,
      location: 25,
      features: 10
    },
    modelWeights: {
      'xgboost-v2.1': 0.4,
      'random-forest-v1.8': 0.3,
      'ensemble-premium-v1.0': 0.3
    },
    autoRefresh: false,
    refreshInterval: 60
  });

  const updateSetting = useCallback(<K extends keyof AvmSettings>(key: K, value: AvmSettings[K]) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  }, []);

  const updateAdjustmentCap = useCallback((type: keyof AvmSettings['adjustmentCaps'], value: number) => {
    setSettings(prev => ({
      ...prev,
      adjustmentCaps: {
        ...prev.adjustmentCaps,
        [type]: value
      }
    }));
  }, []);

  const updateModelWeight = useCallback((modelId: string, weight: number) => {
    setSettings(prev => ({
      ...prev,
      modelWeights: {
        ...prev.modelWeights,
        [modelId]: weight
      }
    }));
  }, []);

  const resetToDefaults = useCallback(() => {
    setSettings({
      defaultRadius: 2,
      minComparables: 5,
      maxComparables: 25,
      maxAge: 12,
      confidenceLevel: 95,
      adjustmentCaps: {
        area: 20,
        condition: 15,
        location: 25,
        features: 10
      },
      modelWeights: {
        'xgboost-v2.1': 0.4,
        'random-forest-v1.8': 0.3,
        'ensemble-premium-v1.0': 0.3
      },
      autoRefresh: false,
      refreshInterval: 60
    });
  }, []);

  return {
    settings,
    updateSetting,
    updateAdjustmentCap,
    updateModelWeight,
    resetToDefaults
  };
};

/**
 * Hook for managing batch operations
 */
export const useBatchValuation = () => {
  const [jobs, setJobs] = useState<ValuationJob[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startBatchValuation = useCallback(async (subjects: Subject[], modelIds: string[]) => {
    try {
      setLoading(true);
      setError(null);
      const job = await batchValuation(subjects, modelIds);
      setJobs(prev => [...prev, job]);
      return job;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error iniciando valoración en lote');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getCompletedJobs = useCallback(() => {
    return jobs.filter(job => job.status === 'completed');
  }, [jobs]);

  const getRunningJobs = useCallback(() => {
    return jobs.filter(job => job.status === 'running');
  }, [jobs]);

  const getPendingJobs = useCallback(() => {
    return jobs.filter(job => job.status === 'pending');
  }, [jobs]);

  return {
    jobs,
    loading,
    error,
    startBatchValuation,
    getCompletedJobs,
    getRunningJobs,
    getPendingJobs
  };
};

/**
 * Hook for handling real-time updates
 */
export const useRealTimeUpdates = () => {
  const [connected, setConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  useEffect(() => {
    // Mock real-time connection
    const interval = setInterval(() => {
      setConnected(Math.random() > 0.1); // 90% uptime simulation
      setLastUpdate(new Date());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return {
    connected,
    lastUpdate
  };
};

/**
 * Hook for handling keyboard shortcuts
 */
export const useKeyboardShortcuts = () => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
          case 'n':
            event.preventDefault();
            // Trigger new valuation
            console.log('Nueva valoración (Ctrl+N)');
            break;
          case 'r':
            event.preventDefault();
            // Refresh data
            console.log('Actualizar datos (Ctrl+R)');
            break;
          case 's':
            event.preventDefault();
            // Save current work
            console.log('Guardar (Ctrl+S)');
            break;
          case 'e':
            event.preventDefault();
            // Export results
            console.log('Exportar (Ctrl+E)');
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);
};