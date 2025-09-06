import { useState, useEffect, useCallback, useMemo } from "react";
import type { 
  CohortFilters, 
  CohortRow, 
  HeatCell, 
  RetentionPoint, 
  StageMatrixCell, 
  TimeToEventPoint, 
  SurvivalPoint, 
  DrilldownItem,
  CohortKpis,
  EventType 
} from "./types";
import { 
  fetchCohorts, 
  fetchHeatmap, 
  fetchRetention, 
  fetchStageMatrix, 
  fetchTimeToEvent, 
  fetchSurvival, 
  fetchDrilldown, 
  exportData 
} from "./apis";
import { calcCohortKpis } from "./utils";

export const useCohorts = (filters: CohortFilters = {}) => {
  const [data, setData] = useState<CohortRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchCohorts(filters);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar cohortes");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const kpis = useMemo(() => calcCohortKpis(data), [data]);

  return {
    data,
    loading,
    error,
    kpis,
    refetch: fetchData
  };
};

export const useHeatmap = (filters: CohortFilters = {}) => {
  const [data, setData] = useState<HeatCell[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchHeatmap(filters);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar heatmap");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refetch: fetchData
  };
};

export const useRetention = (filters: CohortFilters = {}) => {
  const [data, setData] = useState<RetentionPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchRetention(filters);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar curva de retención");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refetch: fetchData
  };
};

export const useStageMatrix = (filters: CohortFilters = {}) => {
  const [data, setData] = useState<StageMatrixCell[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchStageMatrix(filters);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar matriz de etapas");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refetch: fetchData
  };
};

export const useTimeToEvent = (filters: CohortFilters = {}, event: EventType = "CONTRATO") => {
  const [data, setData] = useState<TimeToEventPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchTimeToEvent(filters, event);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar tiempo a evento");
    } finally {
      setLoading(false);
    }
  }, [filters, event]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refetch: fetchData
  };
};

export const useSurvival = (filters: CohortFilters = {}) => {
  const [data, setData] = useState<SurvivalPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchSurvival(filters);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar análisis de supervivencia");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refetch: fetchData
  };
};

export const useDrilldown = () => {
  const [data, setData] = useState<DrilldownItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const fetchData = useCallback(async (params: {
    cohort: string;
    monthRel: number;
    event: string;
    filters?: CohortFilters;
  }) => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchDrilldown(params);
      setData(result);
      setIsOpen(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar detalles");
    } finally {
      setLoading(false);
    }
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setData([]);
    setError(null);
  }, []);

  return {
    data,
    loading,
    error,
    isOpen,
    fetchData,
    close
  };
};

export const useExports = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const exportCSV = useCallback(async (filters: CohortFilters) => {
    try {
      setLoading(true);
      setError(null);
      const result = await exportData({
        format: "CSV",
        type: "table",
        filters
      });
      
      if (result.success && result.url) {
        window.open(result.url, "_blank");
      }
      
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al exportar CSV";
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const exportJSON = useCallback(async (filters: CohortFilters) => {
    try {
      setLoading(true);
      setError(null);
      const result = await exportData({
        format: "JSON",
        type: "all",
        filters
      });
      
      if (result.success && result.url) {
        window.open(result.url, "_blank");
      }
      
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al exportar JSON";
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const exportPNG = useCallback(async (filters: CohortFilters, type: "heatmap" | "retention") => {
    try {
      setLoading(true);
      setError(null);
      const result = await exportData({
        format: "PNG",
        type,
        filters
      });
      
      if (result.success && result.url) {
        window.open(result.url, "_blank");
      }
      
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al exportar PNG";
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    exportCSV,
    exportJSON,
    exportPNG
  };
};

export const useSegmentation = (filters: CohortFilters = {}) => {
  const [segments, setSegments] = useState<string[]>([]);
  const [activeSegment, setActiveSegment] = useState<string | null>(null);

  const addSegment = useCallback((segment: string) => {
    setSegments(prev => [...new Set([...prev, segment])]);
  }, []);

  const removeSegment = useCallback((segment: string) => {
    setSegments(prev => prev.filter(s => s !== segment));
    if (activeSegment === segment) {
      setActiveSegment(null);
    }
  }, [activeSegment]);

  const toggleSegment = useCallback((segment: string) => {
    setActiveSegment(prev => prev === segment ? null : segment);
  }, []);

  return {
    segments,
    activeSegment,
    addSegment,
    removeSegment,
    toggleSegment
  };
};

export const useLocalStorage = <T>(key: string, initialValue: T) => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      return initialValue;
    }
  });

  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error("Error saving to localStorage:", error);
    }
  }, [key, storedValue]);

  return [storedValue, setValue] as const;
};