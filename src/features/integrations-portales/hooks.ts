import { useState, useEffect, useCallback } from "react";
import type {
  PortalInfo,
  PortalConfig,
  SyncJob,
  PortalStats,
  LogEntry,
  AuditEvent,
  ConnectionTest,
  ImportExportConfig,
  LogFilters
} from "./types";
import {
  fetchPortals,
  fetchPortalStatus,
  fetchPortalConfig,
  savePortalConfig,
  testConnection,
  fetchSyncStatus,
  retryFailedJobs,
  fetchPortalStats,
  fetchLogs,
  fetchAuditTrail,
  connectPortal,
  disconnectPortal,
  exportConfigs,
  importConfigs
} from "./apis";

export const usePortals = (filters?: { status?: string; search?: string }) => {
  const [portals, setPortals] = useState<PortalInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPortals = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchPortals();
      
      let filtered = data;
      if (filters?.status) {
        filtered = filtered.filter(p => p.status === filters.status);
      }
      if (filters?.search) {
        const search = filters.search.toLowerCase();
        filtered = filtered.filter(p => 
          p.name.toLowerCase().includes(search) ||
          p.id.toLowerCase().includes(search)
        );
      }
      
      setPortals(filtered);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar portales");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadPortals();
  }, [loadPortals]);

  return {
    portals,
    loading,
    error,
    reload: loadPortals
  };
};

export const usePortalConfig = (portalId: string | null) => {
  const [config, setConfig] = useState<PortalConfig | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const loadConfig = useCallback(async () => {
    if (!portalId) return;
    
    try {
      setLoading(true);
      setError(null);
      const data = await fetchPortalConfig(portalId);
      setConfig(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar configuración");
    } finally {
      setLoading(false);
    }
  }, [portalId]);

  const saveConfig = useCallback(async (newConfig: Partial<PortalConfig>) => {
    if (!portalId) return { success: false, message: "Portal ID requerido" };
    
    try {
      setSaving(true);
      const result = await savePortalConfig(portalId, newConfig);
      if (result.success) {
        await loadConfig(); // Reload after save
      }
      return result;
    } catch (err) {
      return {
        success: false,
        message: err instanceof Error ? err.message : "Error al guardar"
      };
    } finally {
      setSaving(false);
    }
  }, [portalId, loadConfig]);

  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  return {
    config,
    loading,
    error,
    saving,
    saveConfig,
    reload: loadConfig
  };
};

export const useSyncQueue = (portalId: string | null) => {
  const [jobs, setJobs] = useState<SyncJob[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadJobs = useCallback(async () => {
    if (!portalId) return;
    
    try {
      setLoading(true);
      setError(null);
      const data = await fetchSyncStatus(portalId);
      setJobs(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar cola de sync");
    } finally {
      setLoading(false);
    }
  }, [portalId]);

  const retryFailed = useCallback(async () => {
    if (!portalId) return { success: false, retriedCount: 0 };
    
    try {
      const result = await retryFailedJobs(portalId);
      if (result.success) {
        await loadJobs(); // Reload after retry
      }
      return result;
    } catch (err) {
      return { success: false, retriedCount: 0 };
    }
  }, [portalId, loadJobs]);

  useEffect(() => {
    loadJobs();
    
    // Auto-refresh every 30 seconds
    if (portalId) {
      const interval = setInterval(loadJobs, 30000);
      return () => clearInterval(interval);
    }
  }, [loadJobs, portalId]);

  return {
    jobs,
    loading,
    error,
    retryFailed,
    reload: loadJobs
  };
};

export const usePortalStats = (portalId: string | null, dateRange?: { from: string; to: string }) => {
  const [stats, setStats] = useState<PortalStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadStats = useCallback(async () => {
    if (!portalId) return;
    
    try {
      setLoading(true);
      setError(null);
      const data = await fetchPortalStats(portalId, dateRange?.from, dateRange?.to);
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar estadísticas");
    } finally {
      setLoading(false);
    }
  }, [portalId, dateRange]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  return {
    stats,
    loading,
    error,
    reload: loadStats
  };
};

export const useLogs = (filters: LogFilters) => {
  const [data, setData] = useState<{
    logs: LogEntry[];
    total: number;
    page: number;
    totalPages: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchLogs(filters);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar logs");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  return {
    logs: data?.logs || [],
    total: data?.total || 0,
    page: data?.page || 1,
    totalPages: data?.totalPages || 0,
    loading,
    error,
    reload: loadLogs
  };
};

export const useConnectionTest = () => {
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<Record<string, ConnectionTest>>({});

  const testPortal = useCallback(async (portalId: string) => {
    try {
      setTesting(true);
      const result = await testConnection(portalId);
      setResults(prev => ({ ...prev, [portalId]: result }));
      return result;
    } catch (err) {
      const errorResult: ConnectionTest = {
        portalId,
        success: false,
        message: err instanceof Error ? err.message : "Error en test de conexión",
        testedAt: new Date().toISOString()
      };
      setResults(prev => ({ ...prev, [portalId]: errorResult }));
      return errorResult;
    } finally {
      setTesting(false);
    }
  }, []);

  const getResult = useCallback((portalId: string) => {
    return results[portalId];
  }, [results]);

  return {
    testing,
    testPortal,
    getResult,
    clearResults: () => setResults({})
  };
};

export const usePortalConnection = () => {
  const [connecting, setConnecting] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);

  const connect = useCallback(async (portalId: string, credentials: any) => {
    try {
      setConnecting(true);
      const result = await connectPortal(portalId, credentials);
      return result;
    } catch (err) {
      return {
        success: false,
        message: err instanceof Error ? err.message : "Error al conectar"
      };
    } finally {
      setConnecting(false);
    }
  }, []);

  const disconnect = useCallback(async (portalId: string) => {
    try {
      setDisconnecting(true);
      const result = await disconnectPortal(portalId);
      return result;
    } catch (err) {
      return {
        success: false,
        message: err instanceof Error ? err.message : "Error al desconectar"
      };
    } finally {
      setDisconnecting(false);
    }
  }, []);

  return {
    connecting,
    disconnecting,
    connect,
    disconnect
  };
};

export const useImportExport = () => {
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const exportToFile = useCallback(async () => {
    try {
      setExporting(true);
      setError(null);
      const config = await exportConfigs();
      
      const blob = new Blob([JSON.stringify(config, null, 2)], {
        type: "application/json"
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `portals-config-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      return { success: true, message: "Configuración exportada exitosamente" };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al exportar";
      setError(message);
      return { success: false, message };
    } finally {
      setExporting(false);
    }
  }, []);

  const importFromFile = useCallback(async (file: File) => {
    try {
      setImporting(true);
      setError(null);
      
      const text = await file.text();
      const config = JSON.parse(text) as ImportExportConfig;
      
      const result = await importConfigs(config);
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al importar";
      setError(message);
      return { success: false, imported: 0, errors: [message] };
    } finally {
      setImporting(false);
    }
  }, []);

  return {
    exporting,
    importing,
    error,
    exportToFile,
    importFromFile
  };
};

export const useAuditTrail = (portalId?: string) => {
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAudit = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchAuditTrail(portalId);
      setEvents(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar auditoría");
    } finally {
      setLoading(false);
    }
  }, [portalId]);

  useEffect(() => {
    loadAudit();
  }, [loadAudit]);

  return {
    events,
    loading,
    error,
    reload: loadAudit
  };
};