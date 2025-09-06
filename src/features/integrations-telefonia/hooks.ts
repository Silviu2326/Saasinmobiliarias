import { useState, useEffect, useCallback } from "react";
import * as api from "./apis";
import type {
  ProviderInfo,
  ConnectionConfig,
  PhoneNumber,
  RoutingRule,
  Flow,
  SmsTemplate,
  QualityStats,
  UsageRow,
  CallLog,
  WebhookConfig,
  LiveStatus,
  CallLogFilters,
  UsageFilters,
  QualityFilters,
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
    const interval = setInterval(loadProviders, 30000);
    return () => clearInterval(interval);
  }, [loadProviders]);

  const connectProvider = useCallback(async (id: string, config: ConnectionConfig) => {
    try {
      setIsConnecting(true);
      setConnectError(null);
      await api.connectProvider(id, config);
      loadProviders();
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

// Numbers hooks
export const useNumbers = (filters?: {
  provider?: string;
  office?: string;
  agent?: string;
}) => {
  const [numbers, setNumbers] = useState<PhoneNumber[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isAssigning, setIsAssigning] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [assignError, setAssignError] = useState<Error | null>(null);
  const [purchaseError, setPurchaseError] = useState<Error | null>(null);

  const loadNumbers = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await api.getNumbers(filters);
      setNumbers(data);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadNumbers();
  }, [loadNumbers]);

  const assignNumber = useCallback(async (numberId: string, agentId: string) => {
    try {
      setIsAssigning(true);
      setAssignError(null);
      await api.assignNumber(numberId, agentId);
      loadNumbers();
    } catch (err) {
      setAssignError(err as Error);
    } finally {
      setIsAssigning(false);
    }
  }, [loadNumbers]);

  const purchaseNumber = useCallback(async (numberId: string) => {
    try {
      setIsPurchasing(true);
      setPurchaseError(null);
      await api.purchaseNumber(numberId);
      loadNumbers();
    } catch (err) {
      setPurchaseError(err as Error);
    } finally {
      setIsPurchasing(false);
    }
  }, [loadNumbers]);

  return {
    numbers,
    isLoading,
    error,
    assignNumber,
    purchaseNumber,
    isAssigning,
    isPurchasing,
    assignError,
    purchaseError,
  };
};

// Routing hooks
export const useRouting = (numberId?: string) => {
  const [rules, setRules] = useState<RoutingRule[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<Error | null>(null);

  const loadRules = useCallback(async () => {
    if (!numberId) return;
    try {
      setIsLoading(true);
      const data = await api.getRoutingRules(numberId);
      setRules(data);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [numberId]);

  useEffect(() => {
    loadRules();
  }, [loadRules]);

  const saveRules = useCallback(async (newRules: RoutingRule[]) => {
    try {
      setIsSaving(true);
      setSaveError(null);
      await api.saveRoutingRules(newRules);
      loadRules();
    } catch (err) {
      setSaveError(err as Error);
    } finally {
      setIsSaving(false);
    }
  }, [loadRules]);

  return {
    rules,
    isLoading,
    error,
    saveRules,
    isSaving,
    saveError,
  };
};

// Flows hooks
export const useFlows = () => {
  const [flows, setFlows] = useState<Flow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<Error | null>(null);

  const loadFlows = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await api.getFlows();
      setFlows(data);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFlows();
  }, [loadFlows]);

  const saveFlow = useCallback(async (flow: Flow) => {
    try {
      setIsSaving(true);
      setSaveError(null);
      await api.saveFlow(flow);
      loadFlows();
    } catch (err) {
      setSaveError(err as Error);
    } finally {
      setIsSaving(false);
    }
  }, [loadFlows]);

  return {
    flows,
    isLoading,
    error,
    saveFlow,
    isSaving,
    saveError,
  };
};

// SMS Templates hooks
export const useSmsTemplates = () => {
  const [templates, setTemplates] = useState<SmsTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [saveError, setSaveError] = useState<Error | null>(null);
  const [deleteError, setDeleteError] = useState<Error | null>(null);
  const [testError, setTestError] = useState<Error | null>(null);
  const [testResult, setTestResult] = useState<any>(null);

  const loadTemplates = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await api.getSmsTemplates();
      setTemplates(data);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTemplates();
  }, [loadTemplates]);

  const saveTemplate = useCallback(async (template: SmsTemplate) => {
    try {
      setIsSaving(true);
      setSaveError(null);
      await api.saveSmsTemplate(template);
      loadTemplates();
    } catch (err) {
      setSaveError(err as Error);
    } finally {
      setIsSaving(false);
    }
  }, [loadTemplates]);

  const deleteTemplate = useCallback(async (id: string) => {
    try {
      setIsDeleting(true);
      setDeleteError(null);
      await api.deleteSmsTemplate(id);
      loadTemplates();
    } catch (err) {
      setDeleteError(err as Error);
    } finally {
      setIsDeleting(false);
    }
  }, [loadTemplates]);

  const testTemplate = useCallback(async (templateId: string, phoneNumber: string) => {
    try {
      setIsTesting(true);
      setTestError(null);
      const result = await api.sendTestSms(templateId, phoneNumber);
      setTestResult(result);
    } catch (err) {
      setTestError(err as Error);
    } finally {
      setIsTesting(false);
    }
  }, []);

  return {
    templates,
    isLoading,
    error,
    saveTemplate,
    deleteTemplate,
    testTemplate,
    isSaving,
    isDeleting,
    isTesting,
    saveError,
    deleteError,
    testError,
    testResult,
  };
};

// Quality hooks
export const useQuality = (filters: QualityFilters) => {
  const [stats, setStats] = useState<QualityStats | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const loadStats = useCallback(async () => {
    if (!(filters.from && filters.to)) return;
    try {
      setIsLoading(true);
      const data = await api.getQualityStats(filters);
      setStats(data?.[0]);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  return {
    stats,
    isLoading,
    error,
  };
};

// Usage and Costs hooks
export const useUsageAndCosts = (filters: UsageFilters) => {
  const [usage, setUsage] = useState<UsageRow[]>([]);
  const [costs, setCosts] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const loadData = useCallback(async () => {
    if (!(filters.from && filters.to)) return;
    try {
      setIsLoading(true);
      const [usageData, costsData] = await Promise.all([
        api.getUsageStats(filters),
        api.getCostBreakdown(filters),
      ]);
      setUsage(usageData);
      setCosts(costsData);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    usage,
    costs,
    isLoading,
    error,
  };
};

// Webhooks hooks
export const useWebhooks = () => {
  const [webhooks, setWebhooks] = useState<WebhookConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [saveError, setSaveError] = useState<Error | null>(null);
  const [testError, setTestError] = useState<Error | null>(null);
  const [testResult, setTestResult] = useState<any>(null);

  const loadWebhooks = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await api.getWebhooks();
      setWebhooks(data);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWebhooks();
  }, [loadWebhooks]);

  const saveWebhook = useCallback(async (webhook: WebhookConfig) => {
    try {
      setIsSaving(true);
      setSaveError(null);
      await api.saveWebhook(webhook);
      loadWebhooks();
    } catch (err) {
      setSaveError(err as Error);
    } finally {
      setIsSaving(false);
    }
  }, [loadWebhooks]);

  const testWebhook = useCallback(async (webhookId: string) => {
    try {
      setIsTesting(true);
      setTestError(null);
      const result = await api.testWebhook(webhookId);
      setTestResult(result);
    } catch (err) {
      setTestError(err as Error);
    } finally {
      setIsTesting(false);
    }
  }, []);

  return {
    webhooks,
    isLoading,
    error,
    saveWebhook,
    testWebhook,
    isSaving,
    isTesting,
    saveError,
    testError,
    testResult,
  };
};

// Call Logs hooks
export const useCallLogs = (filters: CallLogFilters = {}) => {
  const [localFilters, setLocalFilters] = useState<CallLogFilters>(filters);
  const [data, setData] = useState<{ data: CallLog[]; total: number; page: number; size: number } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadCallLogs = useCallback(async () => {
    try {
      setIsLoading(true);
      const result = await api.getCallLogs(localFilters);
      setData(result);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [localFilters]);

  useEffect(() => {
    loadCallLogs();
  }, [loadCallLogs]);

  const updateFilters = useCallback((newFilters: Partial<CallLogFilters>) => {
    setLocalFilters(prev => ({ ...prev, ...newFilters, page: 1 }));
  }, []);

  const nextPage = useCallback(() => {
    setLocalFilters(prev => ({ ...prev, page: (prev.page || 1) + 1 }));
  }, []);

  const prevPage = useCallback(() => {
    setLocalFilters(prev => ({ ...prev, page: Math.max((prev.page || 1) - 1, 1) }));
  }, []);

  const refetch = useCallback(() => {
    loadCallLogs();
  }, [loadCallLogs]);

  return {
    logs: data?.data || [],
    total: data?.total || 0,
    page: data?.page || 1,
    size: data?.size || 25,
    totalPages: Math.ceil((data?.total || 0) / (data?.size || 25)),
    isLoading,
    error,
    filters: localFilters,
    updateFilters,
    nextPage,
    prevPage,
    refetch,
  };
};

// Live Status hook
export const useLiveStatus = () => {
  const [status, setStatus] = useState<LiveStatus | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadStatus = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await api.getLiveStatus();
      setStatus(data);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStatus();
    const interval = setInterval(loadStatus, 5000);
    return () => clearInterval(interval);
  }, [loadStatus]);

  return {
    status,
    isLoading,
    error,
  };
};

// Audit Trail hook
export const useAuditTrail = (resourceId?: string) => {
  const [events, setEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const loadEvents = useCallback(async () => {
    if (!resourceId) return;
    try {
      setIsLoading(true);
      const data = await api.getAuditEvents(resourceId);
      setEvents(data);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [resourceId]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  return {
    events,
    isLoading,
    error,
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
      const result = await api.exportConfig();
      setExportData(result);
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

  const downloadConfig = useCallback((config: any, filename: string = 'telefonia-config.json') => {
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

// Custom hook for debounced search
export const useDebouncedSearch = (
  searchFn: (query: string) => void,
  delay: number = 300
) => {
  const [query, setQuery] = useState("");
  
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim()) {
        searchFn(query.trim());
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [query, searchFn, delay]);

  return [query, setQuery] as const;
};

// Custom hook for real-time updates
export const useRealTimeUpdates = () => {
  useEffect(() => {
    // Simulate real-time updates via polling for live status
    const interval = setInterval(() => {
      // This would typically trigger a refetch of live status
      console.log('Real-time update tick');
    }, 10000); // Every 10 seconds

    return () => clearInterval(interval);
  }, []);
};

// Custom hook for AbortController in searches
export const useAbortController = () => {
  const [controller, setController] = useState<AbortController | null>(null);

  const abort = useCallback(() => {
    if (controller) {
      controller.abort();
    }
  }, [controller]);

  const createController = useCallback(() => {
    abort(); // Cancel previous request
    const newController = new AbortController();
    setController(newController);
    return newController;
  }, [abort]);

  useEffect(() => {
    return () => {
      abort();
    };
  }, [abort]);

  return { createController, abort };
};