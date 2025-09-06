import { useState, useEffect, useCallback } from 'react';
import {
  fetchProviders,
  connectProvider,
  testProviderConnection,
  fetchProviderConfig,
  updateProviderConfig,
  fetchProviderCredits,
  fetchTemplates,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  fetchFlows,
  createFlow,
  fetchEnvelopes,
  createEnvelope,
  sendEnvelope,
  remindEnvelope,
  cancelEnvelope,
  fetchEvidenceReport,
  fetchWebhooks,
  createWebhook,
  testWebhook,
  fetchLogs,
  fetchAuditTrail,
  exportTemplates,
  importTemplates
} from './apis';
import {
  ProviderInfo,
  Template,
  Flow,
  Envelope,
  WebhookConfig,
  LogItem,
  EvidenceReport,
  CreditsUsage,
  AuditTrailEntry
} from './types';

// Providers hooks
export function useProviders() {
  const [providers, setProviders] = useState<ProviderInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadProviders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchProviders();
      setProviders(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading providers');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProviders();
  }, [loadProviders]);

  const connect = useCallback(async (providerId: string, credentials: any) => {
    setLoading(true);
    setError(null);
    try {
      await connectProvider(providerId, credentials);
      await loadProviders(); // Refresh providers
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Connection failed');
      return false;
    } finally {
      setLoading(false);
    }
  }, [loadProviders]);

  const testConnection = useCallback(async (providerId: string) => {
    try {
      const result = await testProviderConnection(providerId);
      return result;
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Test failed' };
    }
  }, []);

  return {
    providers,
    loading,
    error,
    loadProviders,
    connect,
    testConnection
  };
}

export function useProviderConfig(providerId: string | null) {
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadConfig = useCallback(async () => {
    if (!providerId) return;
    
    setLoading(true);
    setError(null);
    try {
      const data = await fetchProviderConfig(providerId);
      setConfig(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading config');
    } finally {
      setLoading(false);
    }
  }, [providerId]);

  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  const updateConfig = useCallback(async (newConfig: any) => {
    if (!providerId) return false;
    
    setLoading(true);
    setError(null);
    try {
      await updateProviderConfig(providerId, newConfig);
      setConfig(newConfig);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error updating config');
      return false;
    } finally {
      setLoading(false);
    }
  }, [providerId]);

  return {
    config,
    loading,
    error,
    loadConfig,
    updateConfig
  };
}

export function useCreditsUsage(providerId: string | null) {
  const [credits, setCredits] = useState<CreditsUsage | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!providerId) return;

    const loadCredits = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchProviderCredits(providerId);
        setCredits(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error loading credits');
      } finally {
        setLoading(false);
      }
    };

    loadCredits();
  }, [providerId]);

  return { credits, loading, error };
}

// Templates hooks
export function useTemplates(filters: any = {}) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadTemplates = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchTemplates(filters);
      setTemplates(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading templates');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadTemplates();
  }, [loadTemplates]);

  const create = useCallback(async (template: Omit<Template, 'id' | 'createdAt' | 'updatedAt'>) => {
    setLoading(true);
    setError(null);
    try {
      const newTemplate = await createTemplate(template);
      setTemplates(prev => [...prev, newTemplate]);
      return newTemplate;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error creating template');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const update = useCallback(async (id: string, template: Partial<Template>) => {
    setLoading(true);
    setError(null);
    try {
      const updatedTemplate = await updateTemplate(id, template);
      setTemplates(prev => prev.map(t => t.id === id ? updatedTemplate : t));
      return updatedTemplate;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error updating template');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const remove = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await deleteTemplate(id);
      setTemplates(prev => prev.filter(t => t.id !== id));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error deleting template');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    templates,
    loading,
    error,
    loadTemplates,
    create,
    update,
    remove
  };
}

// Flows hooks
export function useFlows() {
  const [flows, setFlows] = useState<Flow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadFlows = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchFlows();
      setFlows(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading flows');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFlows();
  }, [loadFlows]);

  const create = useCallback(async (flow: Omit<Flow, 'id' | 'createdAt' | 'updatedAt'>) => {
    setLoading(true);
    setError(null);
    try {
      const newFlow = await createFlow(flow);
      setFlows(prev => [...prev, newFlow]);
      return newFlow;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error creating flow');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    flows,
    loading,
    error,
    loadFlows,
    create
  };
}

// Envelopes hooks
export function useEnvelopes(filters: any = {}) {
  const [envelopes, setEnvelopes] = useState<Envelope[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadEnvelopes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchEnvelopes(filters);
      setEnvelopes(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading envelopes');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadEnvelopes();
  }, [loadEnvelopes]);

  const create = useCallback(async (envelope: any) => {
    setLoading(true);
    setError(null);
    try {
      const newEnvelope = await createEnvelope(envelope);
      setEnvelopes(prev => [...prev, newEnvelope]);
      return newEnvelope;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error creating envelope');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const send = useCallback(async (envelopeId: string) => {
    try {
      await sendEnvelope(envelopeId);
      setEnvelopes(prev => prev.map(e => 
        e.id === envelopeId ? { ...e, status: 'sent' as const, sentAt: new Date().toISOString() } : e
      ));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error sending envelope');
      return false;
    }
  }, []);

  const remind = useCallback(async (envelopeId: string) => {
    try {
      await remindEnvelope(envelopeId);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error sending reminder');
      return false;
    }
  }, []);

  const cancel = useCallback(async (envelopeId: string) => {
    try {
      await cancelEnvelope(envelopeId);
      setEnvelopes(prev => prev.map(e => 
        e.id === envelopeId ? { ...e, status: 'canceled' as const } : e
      ));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error canceling envelope');
      return false;
    }
  }, []);

  return {
    envelopes,
    loading,
    error,
    loadEnvelopes,
    create,
    send,
    remind,
    cancel
  };
}

// Evidence hooks
export function useEvidenceReport(envelopeId: string | null) {
  const [evidence, setEvidence] = useState<EvidenceReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!envelopeId) return;

    const loadEvidence = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchEvidenceReport(envelopeId);
        setEvidence(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error loading evidence report');
      } finally {
        setLoading(false);
      }
    };

    loadEvidence();
  }, [envelopeId]);

  return { evidence, loading, error };
}

// Webhooks hooks
export function useWebhooks() {
  const [webhooks, setWebhooks] = useState<WebhookConfig[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadWebhooks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchWebhooks();
      setWebhooks(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading webhooks');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWebhooks();
  }, [loadWebhooks]);

  const create = useCallback(async (webhook: Omit<WebhookConfig, 'id'>) => {
    setLoading(true);
    setError(null);
    try {
      const newWebhook = await createWebhook(webhook);
      setWebhooks(prev => [...prev, newWebhook]);
      return newWebhook;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error creating webhook');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const test = useCallback(async (webhookId: string) => {
    try {
      const result = await testWebhook(webhookId);
      return result;
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Test failed' };
    }
  }, []);

  return {
    webhooks,
    loading,
    error,
    loadWebhooks,
    create,
    test
  };
}

// Logs hooks
export function useLogs(filters: any = {}) {
  const [logs, setLogs] = useState<{ items: LogItem[]; total: number }>({ items: [], total: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadLogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchLogs(filters);
      setLogs(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading logs');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  return {
    logs: logs.items,
    total: logs.total,
    loading,
    error,
    loadLogs
  };
}

// Audit Trail hooks
export function useAuditTrail(filters: any = {}) {
  const [auditTrail, setAuditTrail] = useState<{ items: AuditTrailEntry[]; total: number }>({ items: [], total: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadAuditTrail = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAuditTrail(filters);
      setAuditTrail(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading audit trail');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadAuditTrail();
  }, [loadAuditTrail]);

  return {
    auditTrail: auditTrail.items,
    total: auditTrail.total,
    loading,
    error,
    loadAuditTrail
  };
}

// Import/Export hooks
export function useImportExport() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const exportData = useCallback(async (templateIds: string[]) => {
    setLoading(true);
    setError(null);
    try {
      const blob = await exportTemplates(templateIds);
      
      // Download the file
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `templates_export_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error exporting templates');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const importData = useCallback(async (file: File) => {
    setLoading(true);
    setError(null);
    try {
      const result = await importTemplates(file);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error importing templates');
      return { success: false, imported: 0, errors: ['Import failed'] };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    exportData,
    importData
  };
}