import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  fetchProductivityActivity,
  fetchResponseTimes,
  fetchSlaCompliance,
  fetchTasksStats,
  fetchFieldStats,
  fetchPipelineLoad,
  fetchLeaderboard,
  fetchAgentDetail,
  fetchCapacityPlan,
  exportProductivityData
} from './apis';
import {
  ProductivityFilters,
  ActivityPoint,
  ResponseStats,
  SlaStats,
  TasksStats,
  FieldStats,
  PipelineLoad,
  LeaderboardRow,
  AgentDetail,
  CapacitySuggestion,
  GroupBy
} from './types';

// Custom hook for managing productivity filters from URL params
export function useProductivityFilters() {
  const [searchParams, setSearchParams] = useSearchParams();
  
  const filters = useMemo((): ProductivityFilters => {
    const params: ProductivityFilters = {};
    
    if (searchParams.get('from')) params.from = searchParams.get('from') || undefined;
    if (searchParams.get('to')) params.to = searchParams.get('to') || undefined;
    if (searchParams.get('office')) params.office = searchParams.get('office') || undefined;
    if (searchParams.get('team')) params.team = searchParams.get('team') || undefined;
    if (searchParams.get('agent')) params.agent = searchParams.get('agent') || undefined;
    if (searchParams.get('canal')) params.canal = searchParams.get('canal') as any;
    if (searchParams.get('tipo')) params.tipo = searchParams.get('tipo') as any;
    if (searchParams.get('portal')) params.portal = searchParams.get('portal') || undefined;
    if (searchParams.get('campaña')) params.campaña = searchParams.get('campaña') || undefined;
    if (searchParams.get('dayStartHour')) params.dayStartHour = parseInt(searchParams.get('dayStartHour') || '8');
    if (searchParams.get('groupBy')) params.groupBy = searchParams.get('groupBy') as GroupBy;
    
    return params;
  }, [searchParams]);
  
  const updateFilters = useCallback((newFilters: Partial<ProductivityFilters>) => {
    const newParams = new URLSearchParams(searchParams);
    
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        newParams.set(key, String(value));
      } else {
        newParams.delete(key);
      }
    });
    
    setSearchParams(newParams);
  }, [searchParams, setSearchParams]);
  
  return { filters, updateFilters };
}

// Hook for activity timeline data
export function useProductivityActivity(filters: ProductivityFilters) {
  const [data, setData] = useState<ActivityPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const controller = new AbortController();
    
    const loadData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const result = await fetchProductivityActivity(filters);
        if (!controller.signal.aborted) {
          setData(result);
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          setError(err instanceof Error ? err.message : 'Error loading activity data');
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };
    
    loadData();
    
    return () => controller.abort();
  }, [filters]);
  
  return { data, loading, error };
}

// Hook for response times
export function useResponseTimes(filters: ProductivityFilters) {
  const [data, setData] = useState<ResponseStats[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const controller = new AbortController();
    
    const loadData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const result = await fetchResponseTimes(filters);
        if (!controller.signal.aborted) {
          setData(result);
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          setError(err instanceof Error ? err.message : 'Error loading response times');
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };
    
    loadData();
    
    return () => controller.abort();
  }, [filters]);
  
  return { data, loading, error };
}

// Hook for SLA compliance
export function useSla(filters: ProductivityFilters & { xh?: number; yd?: number }) {
  const [data, setData] = useState<SlaStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const controller = new AbortController();
    
    const loadData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const result = await fetchSlaCompliance(filters);
        if (!controller.signal.aborted) {
          setData(result);
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          setError(err instanceof Error ? err.message : 'Error loading SLA data');
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };
    
    loadData();
    
    return () => controller.abort();
  }, [filters]);
  
  return { data, loading, error };
}

// Hook for tasks statistics
export function useTasksStats(filters: ProductivityFilters) {
  const [data, setData] = useState<TasksStats[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const controller = new AbortController();
    
    const loadData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const result = await fetchTasksStats(filters);
        if (!controller.signal.aborted) {
          setData(result);
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          setError(err instanceof Error ? err.message : 'Error loading tasks data');
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };
    
    loadData();
    
    return () => controller.abort();
  }, [filters]);
  
  return { data, loading, error };
}

// Hook for field operations stats
export function useFieldStats(filters: ProductivityFilters) {
  const [data, setData] = useState<FieldStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const controller = new AbortController();
    
    const loadData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const result = await fetchFieldStats(filters);
        if (!controller.signal.aborted) {
          setData(result);
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          setError(err instanceof Error ? err.message : 'Error loading field stats');
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };
    
    loadData();
    
    return () => controller.abort();
  }, [filters]);
  
  return { data, loading, error };
}

// Hook for pipeline load
export function usePipelineLoad(filters: ProductivityFilters) {
  const [data, setData] = useState<PipelineLoad[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const controller = new AbortController();
    
    const loadData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const result = await fetchPipelineLoad(filters);
        if (!controller.signal.aborted) {
          setData(result);
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          setError(err instanceof Error ? err.message : 'Error loading pipeline data');
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };
    
    loadData();
    
    return () => controller.abort();
  }, [filters]);
  
  return { data, loading, error };
}

// Hook for leaderboard
export function useLeaderboard(filters: ProductivityFilters, mode: 'activity' | 'results' = 'activity') {
  const [data, setData] = useState<LeaderboardRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const controller = new AbortController();
    
    const loadData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const result = await fetchLeaderboard({ ...filters, metric: mode });
        if (!controller.signal.aborted) {
          setData(result);
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          setError(err instanceof Error ? err.message : 'Error loading leaderboard');
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };
    
    loadData();
    
    return () => controller.abort();
  }, [filters, mode]);
  
  return { data, loading, error };
}

// Hook for capacity planning
export function useCapacityPlan(payload: any) {
  const [data, setData] = useState<CapacitySuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const planCapacity = useCallback(async (planPayload: any) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await fetchCapacityPlan(planPayload);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error planning capacity');
    } finally {
      setLoading(false);
    }
  }, []);
  
  return { data, loading, error, planCapacity };
}

// Hook for agent details
export function useAgentDetail(agentId: string | null, filters: { from?: string; to?: string }) {
  const [data, setData] = useState<AgentDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (!agentId) {
      setData(null);
      return;
    }
    
    const controller = new AbortController();
    
    const loadData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const result = await fetchAgentDetail(agentId, filters);
        if (!controller.signal.aborted) {
          setData(result);
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          setError(err instanceof Error ? err.message : 'Error loading agent details');
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };
    
    loadData();
    
    return () => controller.abort();
  }, [agentId, filters]);
  
  return { data, loading, error };
}

// Hook for exports
export function useExports() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const exportData = useCallback(async (format: 'CSV' | 'JSON' | 'PNG', data: any, filename?: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const blob = await exportProductivityData(format, data);
      
      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename || `productivity_export.${format.toLowerCase()}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error exporting data');
    } finally {
      setLoading(false);
    }
  }, []);
  
  return { exportData, loading, error };
}