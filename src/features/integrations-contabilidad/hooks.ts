import { useState, useEffect, useCallback } from "react";
import * as api from "./apis";
import type {
  ProviderInfo,
  ConnectionConfig,
  CoaMapItem,
  TaxProfile,
  CostCenter,
  CurrencySettings,
  SyncPolicy,
  LedgerPreview,
  BankConnection,
  BankTransaction,
  SyncJob,
  LogItem,
  SiiStatus,
  ReportShortcut,
  LogFilters,
  SyncJobFilters,
  BankReconciliationFilters,
  TestResult,
} from "./types";

// Providers hooks
export const useProviders = () => {
  const [providers, setProviders] = useState<ProviderInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResults, setTestResults] = useState<TestResult | null>(null);
  const [connectError, setConnectError] = useState<Error | null>(null);
  const [testError, setTestError] = useState<Error | null>(null);

  const loadProviders = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await api.getProviders();
      setProviders(data);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProviders();
  }, [loadProviders]);

  const connectProvider = useCallback(async (id: string, config: ConnectionConfig) => {
    try {
      setIsConnecting(true);
      setConnectError(null);
      const result = await api.connectProvider(id, config);
      if (result.success) {
        await loadProviders();
      } else {
        setConnectError(new Error(result.message));
      }
    } catch (err) {
      setConnectError(err as Error);
    } finally {
      setIsConnecting(false);
    }
  }, [loadProviders]);

  const testProvider = useCallback(async (id: string) => {
    try {
      setIsTesting(true);
      setTestError(null);
      const result = await api.testProviderConnection(id);
      setTestResults(result);
    } catch (err) {
      setTestError(err as Error);
    } finally {
      setIsTesting(false);
    }
  }, []);

  return {
    providers,
    isLoading,
    error,
    connectProvider,
    testProvider,
    isConnecting,
    isTesting,
    testResults,
    connectError,
    testError,
  };
};

// Chart of Accounts Mapping hooks
export const useMappings = () => {
  const [mappings, setMappings] = useState<CoaMapItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<Error | null>(null);

  const loadMappings = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await api.getCoaMapping();
      setMappings(data);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMappings();
  }, [loadMappings]);

  const saveMappings = useCallback(async (newMappings: CoaMapItem[]) => {
    try {
      setIsSaving(true);
      setSaveError(null);
      await api.updateCoaMapping(newMappings);
      setMappings(newMappings);
    } catch (err) {
      setSaveError(err as Error);
    } finally {
      setIsSaving(false);
    }
  }, []);

  return {
    mappings,
    isLoading,
    error,
    saveMappings,
    isSaving,
    saveError,
  };
};

// Tax Profiles hooks
export const useTaxProfiles = () => {
  const [profiles, setProfiles] = useState<TaxProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [saveError, setSaveError] = useState<Error | null>(null);
  const [deleteError, setDeleteError] = useState<Error | null>(null);

  const loadProfiles = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await api.getTaxProfiles();
      setProfiles(data);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfiles();
  }, [loadProfiles]);

  const saveProfile = useCallback(async (profile: Partial<TaxProfile>) => {
    try {
      setIsSaving(true);
      setSaveError(null);
      await api.saveTaxProfile(profile);
      await loadProfiles();
    } catch (err) {
      setSaveError(err as Error);
    } finally {
      setIsSaving(false);
    }
  }, [loadProfiles]);

  const deleteProfile = useCallback(async (id: string) => {
    try {
      setIsDeleting(true);
      setDeleteError(null);
      await api.deleteTaxProfile(id);
      await loadProfiles();
    } catch (err) {
      setDeleteError(err as Error);
    } finally {
      setIsDeleting(false);
    }
  }, [loadProfiles]);

  return {
    profiles,
    isLoading,
    error,
    saveProfile,
    deleteProfile,
    isSaving,
    isDeleting,
    saveError,
    deleteError,
  };
};

// Cost Centers hooks
export const useCostCenters = () => {
  const [costCenters, setCostCenters] = useState<CostCenter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [saveError, setSaveError] = useState<Error | null>(null);
  const [deleteError, setDeleteError] = useState<Error | null>(null);

  const loadCostCenters = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await api.getCostCenters();
      setCostCenters(data);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCostCenters();
  }, [loadCostCenters]);

  const saveCostCenter = useCallback(async (costCenter: Partial<CostCenter>) => {
    try {
      setIsSaving(true);
      setSaveError(null);
      await api.saveCostCenter(costCenter);
      await loadCostCenters();
    } catch (err) {
      setSaveError(err as Error);
    } finally {
      setIsSaving(false);
    }
  }, [loadCostCenters]);

  const deleteCostCenter = useCallback(async (id: string) => {
    try {
      setIsDeleting(true);
      setDeleteError(null);
      await api.deleteCostCenter(id);
      await loadCostCenters();
    } catch (err) {
      setDeleteError(err as Error);
    } finally {
      setIsDeleting(false);
    }
  }, [loadCostCenters]);

  return {
    costCenters,
    isLoading,
    error,
    saveCostCenter,
    deleteCostCenter,
    isSaving,
    isDeleting,
    saveError,
    deleteError,
  };
};

// Currency Settings hooks
export const useCurrencySettings = () => {
  const [settings, setSettings] = useState<CurrencySettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<Error | null>(null);

  const loadSettings = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await api.getCurrencySettings();
      setSettings(data);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const saveSettings = useCallback(async (newSettings: CurrencySettings) => {
    try {
      setIsSaving(true);
      setSaveError(null);
      await api.updateCurrencySettings(newSettings);
      setSettings(newSettings);
    } catch (err) {
      setSaveError(err as Error);
    } finally {
      setIsSaving(false);
    }
  }, []);

  return {
    settings,
    isLoading,
    error,
    saveSettings,
    isSaving,
    saveError,
  };
};

// Sync Policies hooks
export const useSyncPolicies = () => {
  const [policies, setPolicies] = useState<SyncPolicy | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<Error | null>(null);
  const [isRunningSync, setIsRunningSync] = useState(false);

  const loadPolicies = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await api.getSyncPolicies();
      setPolicies(data);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPolicies();
  }, [loadPolicies]);

  const savePolicies = useCallback(async (newPolicies: SyncPolicy) => {
    try {
      setIsSaving(true);
      setSaveError(null);
      await api.updateSyncPolicies(newPolicies);
      setPolicies(newPolicies);
    } catch (err) {
      setSaveError(err as Error);
    } finally {
      setIsSaving(false);
    }
  }, []);

  const runSync = useCallback(async (type?: string) => {
    try {
      setIsRunningSync(true);
      await api.runSync(type);
    } catch (err) {
      console.error('Sync error:', err);
    } finally {
      setIsRunningSync(false);
    }
  }, []);

  return {
    policies,
    isLoading,
    error,
    savePolicies,
    runSync,
    isSaving,
    isRunningSync,
    saveError,
  };
};

// Sync Queue hooks
export const useSyncQueue = (filters?: SyncJobFilters) => {
  const [jobs, setJobs] = useState<SyncJob[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [size] = useState(10);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadJobs = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await api.getSyncStatus({ ...filters, page, size });
      setJobs(response.data);
      setTotal(response.total);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [filters, page, size]);

  useEffect(() => {
    loadJobs();
    const interval = setInterval(loadJobs, 5000); // Auto-refresh every 5s
    return () => clearInterval(interval);
  }, [loadJobs]);

  const nextPage = useCallback(() => {
    setPage(prev => prev + 1);
  }, []);

  const prevPage = useCallback(() => {
    setPage(prev => Math.max(prev - 1, 1));
  }, []);

  const totalPages = Math.ceil(total / size);

  return {
    jobs,
    total,
    page,
    size,
    totalPages,
    isLoading,
    error,
    nextPage,
    prevPage,
    refetch: loadJobs,
  };
};

// Banking hooks
export const useBanking = () => {
  const [connections, setConnections] = useState<BankConnection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const loadConnections = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await api.getBankConnections();
      setConnections(data);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadConnections();
  }, [loadConnections]);

  const connectBank = useCallback(async (bankId: string) => {
    try {
      setIsConnecting(true);
      await api.connectBankFeed(bankId);
      await loadConnections();
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsConnecting(false);
    }
  }, [loadConnections]);

  const importCsv = useCallback(async (file: File, config: any) => {
    try {
      setIsImporting(true);
      const result = await api.importBankCsv(file, config);
      await loadConnections();
      return result;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setIsImporting(false);
    }
  }, [loadConnections]);

  return {
    connections,
    isLoading,
    error,
    connectBank,
    importCsv,
    isConnecting,
    isImporting,
  };
};

// Ledgers Preview hooks
export const useLedgersPreview = () => {
  const [preview, setPreview] = useState<LedgerPreview | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isPushing, setIsPushing] = useState(false);
  const [pushError, setPushError] = useState<Error | null>(null);

  const generatePreview = useCallback(async (filters: any) => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await api.previewLedgers(filters);
      setPreview(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const pushToErp = useCallback(async (previewData: LedgerPreview) => {
    try {
      setIsPushing(true);
      setPushError(null);
      const result = await api.pushLedgers(previewData);
      return result;
    } catch (err) {
      setPushError(err as Error);
      throw err;
    } finally {
      setIsPushing(false);
    }
  }, []);

  return {
    preview,
    isLoading,
    error,
    generatePreview,
    pushToErp,
    isPushing,
    pushError,
  };
};

// SII/AEAT hooks
export const useSii = () => {
  const [status, setStatus] = useState<SiiStatus | null>(null);
  const [logs, setLogs] = useState<LogItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadStatus = useCallback(async () => {
    try {
      setIsLoading(true);
      const [statusData, logsData] = await Promise.all([
        api.getSiiStatus(),
        api.getSiiLogs({}),
      ]);
      setStatus(statusData);
      setLogs(logsData);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStatus();
  }, [loadStatus]);

  const retrySubmission = useCallback(async (submissionId: string) => {
    try {
      await api.retrySiiSubmission(submissionId);
      await loadStatus();
    } catch (err) {
      setError(err as Error);
    }
  }, [loadStatus]);

  return {
    status,
    logs,
    isLoading,
    error,
    retrySubmission,
  };
};

// Reports shortcuts hook
export const useReports = () => {
  const [shortcuts, setShortcuts] = useState<ReportShortcut[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadShortcuts = async () => {
      try {
        setIsLoading(true);
        const data = await api.getReportShortcuts();
        setShortcuts(data);
        setError(null);
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    loadShortcuts();
  }, []);

  return {
    shortcuts,
    isLoading,
    error,
  };
};

// Logs hooks
export const useLogs = (initialFilters: LogFilters = {}) => {
  const [logs, setLogs] = useState<LogItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [size] = useState(25);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [filters, setFilters] = useState<LogFilters>(initialFilters);

  const loadLogs = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await api.getLogs({ ...filters, page, size });
      setLogs(response.data);
      setTotal(response.total);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [filters, page, size]);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  const updateFilters = useCallback((newFilters: Partial<LogFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPage(1);
  }, []);

  const nextPage = useCallback(() => {
    setPage(prev => prev + 1);
  }, []);

  const prevPage = useCallback(() => {
    setPage(prev => Math.max(prev - 1, 1));
  }, []);

  const totalPages = Math.ceil(total / size);

  return {
    logs,
    total,
    page,
    size,
    totalPages,
    isLoading,
    error,
    filters,
    updateFilters,
    nextPage,
    prevPage,
    refetch: loadLogs,
  };
};

// Import/Export hooks
export const useImportExport = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [exportData, setExportData] = useState<any>(null);
  const [importResult, setImportResult] = useState<any>(null);
  const [exportError, setExportError] = useState<Error | null>(null);
  const [importError, setImportError] = useState<Error | null>(null);

  const exportConfig = useCallback(async () => {
    try {
      setIsExporting(true);
      setExportError(null);
      const data = await api.exportConfig();
      setExportData(data);
    } catch (err) {
      setExportError(err as Error);
    } finally {
      setIsExporting(false);
    }
  }, []);

  const importConfig = useCallback(async (config: any) => {
    try {
      setIsImporting(true);
      setImportError(null);
      const result = await api.importConfig(config);
      setImportResult(result);
    } catch (err) {
      setImportError(err as Error);
    } finally {
      setIsImporting(false);
    }
  }, []);

  const downloadConfig = useCallback((config: any, filename: string = 'contabilidad-config.json') => {
    const blob = new Blob([JSON.stringify(config, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, []);

  return {
    exportConfig,
    importConfig,
    downloadConfig,
    isExporting,
    isImporting,
    exportData,
    importResult,
    exportError,
    importError,
  };
};