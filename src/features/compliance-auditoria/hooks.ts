import { useState, useCallback, useEffect } from 'react';
import { auditApi } from './apis';
import type {
  AuditEvent,
  AuditQuery,
  AuditResponse,
  ExportJob,
  Schedule,
  RetentionInfo,
  IntegrityInfo,
  Evidence,
} from './types';

export function useAuditQuery(initialQuery: AuditQuery = {}) {
  const [data, setData] = useState<AuditResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [query, setQuery] = useState<AuditQuery>(initialQuery);
  const [abortController, setAbortController] = useState<AbortController | null>(null);

  const fetchEvents = useCallback(async (searchQuery: AuditQuery) => {
    // Cancelar búsqueda anterior
    if (abortController) {
      abortController.abort();
    }

    const newAbortController = new AbortController();
    setAbortController(newAbortController);
    setIsLoading(true);
    setError(null);

    try {
      const result = await auditApi.getEvents(searchQuery);
      
      if (!newAbortController.signal.aborted) {
        setData(result);
        setQuery(searchQuery);
      }
    } catch (err) {
      if (!newAbortController.signal.aborted) {
        setError(err as Error);
      }
    } finally {
      if (!newAbortController.signal.aborted) {
        setIsLoading(false);
        setAbortController(null);
      }
    }
  }, [abortController]);

  const refetch = useCallback(() => {
    fetchEvents(query);
  }, [fetchEvents, query]);

  useEffect(() => {
    fetchEvents(initialQuery);
  }, []);

  return {
    data,
    isLoading,
    error,
    query,
    fetchEvents,
    refetch,
  };
}

export function useAuditEvent(eventId?: string) {
  const [event, setEvent] = useState<AuditEvent | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchEvent = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await auditApi.getEventById(id);
      setEvent(result);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (eventId) {
      fetchEvent(eventId);
    }
  }, [eventId, fetchEvent]);

  return {
    event,
    isLoading,
    error,
    fetchEvent,
  };
}

export function useAuditExport() {
  const [jobs, setJobs] = useState<Map<string, ExportJob>>(new Map());
  const [isCreating, setIsCreating] = useState(false);

  const createExport = useCallback(async (filters: AuditQuery, format: 'csv' | 'json') => {
    setIsCreating(true);
    
    try {
      const job = await auditApi.createExport(filters, format);
      setJobs(prev => new Map(prev).set(job.id, job));
      
      // Polling para actualizar estado
      const checkStatus = async () => {
        const updatedJob = await auditApi.getExportJob(job.id);
        if (updatedJob) {
          setJobs(prev => new Map(prev).set(job.id, updatedJob));
          
          if (updatedJob.status === 'processing' || updatedJob.status === 'queued') {
            setTimeout(checkStatus, 2000);
          }
        }
      };
      
      setTimeout(checkStatus, 1000);
      return job;
    } finally {
      setIsCreating(false);
    }
  }, []);

  const getJob = useCallback((jobId: string) => {
    return jobs.get(jobId);
  }, [jobs]);

  const refreshJob = useCallback(async (jobId: string) => {
    const job = await auditApi.getExportJob(jobId);
    if (job) {
      setJobs(prev => new Map(prev).set(jobId, job));
    }
  }, []);

  return {
    jobs: Array.from(jobs.values()),
    isCreating,
    createExport,
    getJob,
    refreshJob,
  };
}

export function useAuditSchedules() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const [createState, setCreateState] = useState({
    isCreating: false,
    error: null as Error | null,
  });

  const [updateState, setUpdateState] = useState({
    isUpdating: false,
    error: null as Error | null,
  });

  const [deleteState, setDeleteState] = useState({
    isDeleting: false,
    error: null as Error | null,
  });

  const fetchSchedules = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await auditApi.getSchedules();
      setSchedules(result);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createSchedule = useCallback(async (schedule: Partial<Schedule>) => {
    setCreateState({ isCreating: true, error: null });
    
    try {
      const newSchedule = await auditApi.createSchedule(schedule);
      setSchedules(prev => [...prev, newSchedule]);
      return newSchedule;
    } catch (err) {
      setCreateState({ isCreating: false, error: err as Error });
      throw err;
    } finally {
      setCreateState({ isCreating: false, error: null });
    }
  }, []);

  const updateSchedule = useCallback(async (id: string, updates: Partial<Schedule>) => {
    setUpdateState({ isUpdating: true, error: null });
    
    try {
      const updatedSchedule = await auditApi.updateSchedule(id, updates);
      setSchedules(prev => prev.map(s => s.id === id ? updatedSchedule : s));
      return updatedSchedule;
    } catch (err) {
      setUpdateState({ isUpdating: false, error: err as Error });
      throw err;
    } finally {
      setUpdateState({ isUpdating: false, error: null });
    }
  }, []);

  const deleteSchedule = useCallback(async (id: string) => {
    setDeleteState({ isDeleting: true, error: null });
    
    try {
      await auditApi.deleteSchedule(id);
      setSchedules(prev => prev.filter(s => s.id !== id));
    } catch (err) {
      setDeleteState({ isDeleting: false, error: err as Error });
      throw err;
    } finally {
      setDeleteState({ isDeleting: false, error: null });
    }
  }, []);

  useEffect(() => {
    fetchSchedules();
  }, [fetchSchedules]);

  return {
    schedules,
    isLoading,
    error,
    fetchSchedules,
    createSchedule,
    updateSchedule,
    deleteSchedule,
    createState,
    updateState,
    deleteState,
  };
}

export function useRetentionStatus() {
  const [data, setData] = useState<RetentionInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchStatus = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await auditApi.getRetentionStatus();
      setData(result);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
    
    // Refrescar cada 5 minutos
    const interval = setInterval(fetchStatus, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchStatus]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchStatus,
  };
}

export function useIntegrityStatus() {
  const [data, setData] = useState<IntegrityInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const fetchStatus = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await auditApi.getIntegrityStatus();
      setData(result);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const verifyIntegrity = useCallback(async () => {
    setIsVerifying(true);
    
    try {
      const result = await auditApi.verifyIntegrity();
      
      // Actualizar status después de verificación
      if (data) {
        setData(prev => prev ? {
          ...prev,
          lastVerifiedAt: result.checkedAt,
          ok: result.ok,
        } : null);
      }
      
      return result;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setIsVerifying(false);
    }
  }, [data]);

  useEffect(() => {
    fetchStatus();
    
    // Refrescar cada 10 minutos
    const interval = setInterval(fetchStatus, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchStatus]);

  return {
    data,
    isLoading,
    error,
    isVerifying,
    verifyIntegrity,
    refetch: fetchStatus,
  };
}

export function useEvidence(eventId?: string, filename?: string) {
  const [evidence, setEvidence] = useState<Evidence | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchEvidence = useCallback(async (eId: string, fname: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await auditApi.getEvidence(eId, fname);
      setEvidence(result);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (eventId && filename) {
      fetchEvidence(eventId, filename);
    }
  }, [eventId, filename, fetchEvidence]);

  return {
    evidence,
    isLoading,
    error,
    fetchEvidence,
  };
}