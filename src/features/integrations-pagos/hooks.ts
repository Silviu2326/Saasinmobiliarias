import { useState, useEffect, useCallback } from "react";
import {
  providersApi,
  methodsApi,
  checkoutLinksApi,
  chargesApi,
  disputesApi,
  plansApi,
  subscriptionsApi,
  payoutsApi,
  reconciliationApi,
  webhooksApi,
  logsApi
} from "./apis";
import type {
  ProviderInfo,
  PaymentMethodCfg,
  CheckoutLink,
  Charge,
  Dispute,
  Plan,
  Subscription,
  Payout,
  ReconciliationItem,
  WebhookConfig,
  LogItem,
  ConnectData,
  ProviderConfig,
  ChargeFilters,
  DisputeFilters,
  SubscriptionFilters,
  PayoutFilters,
  LogFilters
} from "./types";

// Hook for managing providers
export function useProviders() {
  const [providers, setProviders] = useState<ProviderInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProviders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await providersApi.getProviders();
      setProviders(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar proveedores");
    } finally {
      setLoading(false);
    }
  }, []);

  const connectProvider = useCallback(async (id: string, data: ConnectData) => {
    try {
      await providersApi.connectProvider(id, data);
      await fetchProviders(); // Refresh list
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : "Error al conectar proveedor");
    }
  }, [fetchProviders]);

  const testProvider = useCallback(async (id: string) => {
    try {
      return await providersApi.testProvider(id);
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : "Error al probar proveedor");
    }
  }, []);

  const setProviderMode = useCallback(async (id: string, mode: "test" | "live") => {
    try {
      await providersApi.setProviderMode(id, mode);
      await fetchProviders(); // Refresh list
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : "Error al cambiar modo");
    }
  }, [fetchProviders]);

  useEffect(() => {
    fetchProviders();
  }, [fetchProviders]);

  return {
    providers,
    loading,
    error,
    refetch: fetchProviders,
    connectProvider,
    testProvider,
    setProviderMode
  };
}

// Hook for managing provider configuration
export function useProviderConfig(providerId?: string) {
  const [config, setConfig] = useState<ProviderConfig | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchConfig = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await providersApi.getProviderConfig(id);
      setConfig(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar configuración");
    } finally {
      setLoading(false);
    }
  }, []);

  const updateConfig = useCallback(async (id: string, updates: Partial<ProviderConfig>) => {
    try {
      await providersApi.updateProviderConfig(id, updates);
      if (config) {
        setConfig({ ...config, ...updates });
      }
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : "Error al actualizar configuración");
    }
  }, [config]);

  useEffect(() => {
    if (providerId) {
      fetchConfig(providerId);
    }
  }, [providerId, fetchConfig]);

  return {
    config,
    loading,
    error,
    fetchConfig,
    updateConfig
  };
}

// Hook for managing payment methods
export function usePaymentMethods() {
  const [methods, setMethods] = useState<PaymentMethodCfg[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMethods = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await methodsApi.getMethods();
      setMethods(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar métodos");
    } finally {
      setLoading(false);
    }
  }, []);

  const updateMethod = useCallback(async (method: PaymentMethodCfg) => {
    try {
      await methodsApi.updateMethod(method);
      setMethods(prev => prev.map(m => m.id === method.id ? method : m));
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : "Error al actualizar método");
    }
  }, []);

  useEffect(() => {
    fetchMethods();
  }, [fetchMethods]);

  return {
    methods,
    loading,
    error,
    refetch: fetchMethods,
    updateMethod
  };
}

// Hook for managing checkout links
export function useCheckoutLinks(filters?: { status?: string; from?: string; to?: string; q?: string }) {
  const [links, setLinks] = useState<CheckoutLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLinks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await checkoutLinksApi.getCheckoutLinks(filters);
      setLinks(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar links");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const createLink = useCallback(async (data: Omit<CheckoutLink, "id" | "url" | "qrUrl" | "visits" | "conversions" | "createdAt">) => {
    try {
      const newLink = await checkoutLinksApi.createCheckoutLink(data);
      setLinks(prev => [newLink, ...prev]);
      return newLink;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : "Error al crear link");
    }
  }, []);

  const disableLink = useCallback(async (id: string) => {
    try {
      await checkoutLinksApi.disableCheckoutLink(id);
      setLinks(prev => prev.map(l => l.id === id ? { ...l, status: "expired" as const } : l));
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : "Error al desactivar link");
    }
  }, []);

  useEffect(() => {
    fetchLinks();
  }, [fetchLinks]);

  return {
    links,
    loading,
    error,
    refetch: fetchLinks,
    createLink,
    disableLink
  };
}

// Hook for managing charges
export function useCharges(filters?: ChargeFilters) {
  const [charges, setCharges] = useState<Charge[]>([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCharges = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await chargesApi.getCharges(filters);
      setCharges(response.data);
      setPagination({
        total: response.total,
        page: response.page,
        pages: response.pages
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar cobros");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const refundCharge = useCallback(async (id: string, data: { amount?: number; reason?: string }) => {
    try {
      await chargesApi.refundCharge(id, data);
      setCharges(prev => prev.map(c => c.id === id ? { ...c, status: "refunded" as const } : c));
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : "Error al reembolsar");
    }
  }, []);

  const downloadReceipt = useCallback(async (id: string) => {
    try {
      const blob = await chargesApi.getReceipt(id);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `recibo_${id}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : "Error al descargar recibo");
    }
  }, []);

  useEffect(() => {
    fetchCharges();
  }, [fetchCharges]);

  return {
    charges,
    pagination,
    loading,
    error,
    refetch: fetchCharges,
    refundCharge,
    downloadReceipt
  };
}

// Hook for managing disputes
export function useDisputes(filters?: DisputeFilters) {
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDisputes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await disputesApi.getDisputes(filters);
      setDisputes(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar disputas");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const respondToDispute = useCallback(async (id: string, evidence: FormData) => {
    try {
      await disputesApi.respondToDispute(id, evidence);
      await fetchDisputes(); // Refresh list
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : "Error al responder disputa");
    }
  }, [fetchDisputes]);

  useEffect(() => {
    fetchDisputes();
  }, [fetchDisputes]);

  return {
    disputes,
    loading,
    error,
    refetch: fetchDisputes,
    respondToDispute
  };
}

// Hook for managing plans and subscriptions
export function usePlans() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPlans = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await plansApi.getPlans();
      setPlans(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar planes");
    } finally {
      setLoading(false);
    }
  }, []);

  const createPlan = useCallback(async (data: Omit<Plan, "id">) => {
    try {
      const newPlan = await plansApi.createPlan(data);
      setPlans(prev => [...prev, newPlan]);
      return newPlan;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : "Error al crear plan");
    }
  }, []);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  return {
    plans,
    loading,
    error,
    refetch: fetchPlans,
    createPlan
  };
}

export function useSubscriptions(filters?: SubscriptionFilters) {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubscriptions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await subscriptionsApi.getSubscriptions(filters);
      setSubscriptions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar suscripciones");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const updateSubscription = useCallback(async (id: string, data: Partial<Subscription>) => {
    try {
      await subscriptionsApi.updateSubscription(id, data);
      setSubscriptions(prev => prev.map(s => s.id === id ? { ...s, ...data } : s));
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : "Error al actualizar suscripción");
    }
  }, []);

  useEffect(() => {
    fetchSubscriptions();
  }, [fetchSubscriptions]);

  return {
    subscriptions,
    loading,
    error,
    refetch: fetchSubscriptions,
    updateSubscription
  };
}

// Hook for managing payouts
export function usePayouts(filters?: PayoutFilters) {
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPayouts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await payoutsApi.getPayouts(filters);
      setPayouts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar pagos");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const simulatePayouts = useCallback(async () => {
    try {
      return await payoutsApi.simulatePayouts();
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : "Error al simular pagos");
    }
  }, []);

  useEffect(() => {
    fetchPayouts();
  }, [fetchPayouts]);

  return {
    payouts,
    loading,
    error,
    refetch: fetchPayouts,
    simulatePayouts
  };
}

// Hook for reconciliation
export function useReconciliation(params: { from: string; to: string; office?: string }) {
  const [items, setItems] = useState<ReconciliationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReconciliation = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await reconciliationApi.getReconciliation(params);
      setItems(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar conciliación");
    } finally {
      setLoading(false);
    }
  }, [params]);

  const resolveItems = useCallback(async (resolvedItems: ReconciliationItem[]) => {
    try {
      await reconciliationApi.resolveReconciliation(resolvedItems);
      await fetchReconciliation(); // Refresh data
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : "Error al resolver conciliación");
    }
  }, [fetchReconciliation]);

  useEffect(() => {
    fetchReconciliation();
  }, [fetchReconciliation]);

  return {
    items,
    loading,
    error,
    refetch: fetchReconciliation,
    resolveItems
  };
}

// Hook for webhooks
export function useWebhooks() {
  const [webhooks, setWebhooks] = useState<WebhookConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWebhooks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await webhooksApi.getWebhooks();
      setWebhooks(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar webhooks");
    } finally {
      setLoading(false);
    }
  }, []);

  const testWebhook = useCallback(async (url: string, event: string) => {
    try {
      return await webhooksApi.testWebhook(url, event);
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : "Error al probar webhook");
    }
  }, []);

  useEffect(() => {
    fetchWebhooks();
  }, [fetchWebhooks]);

  return {
    webhooks,
    loading,
    error,
    refetch: fetchWebhooks,
    testWebhook
  };
}

// Hook for logs
export function useLogs(filters?: LogFilters) {
  const [logs, setLogs] = useState<LogItem[]>([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await logsApi.getLogs(filters);
      setLogs(response.data);
      setPagination({
        total: response.total,
        page: response.page,
        pages: response.pages
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar logs");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  return {
    logs,
    pagination,
    loading,
    error,
    refetch: fetchLogs
  };
}