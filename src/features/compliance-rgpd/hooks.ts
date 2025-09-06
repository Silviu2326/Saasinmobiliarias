import { useState, useEffect, useCallback } from "react";
import {
  dsrApi,
  consentsApi,
  ropaApi,
  noticesApi,
  cookiesApi,
  retentionApi,
  breachesApi,
  dataMapApi,
  overviewApi,
  rgpdExportApi,
} from "./apis";
import type {
  DsrRequest,
  Consent,
  ActivityRecord,
  PrivacyNotice,
  CookieItem,
  CookieCategory,
  RetentionRule,
  Breach,
  DataMapEntry,
  ComplianceMetrics,
} from "./types";

// Hook para el overview de cumplimiento
export function useRgpdOverview() {
  const [metrics, setMetrics] = useState<ComplianceMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadMetrics();
  }, []);

  const loadMetrics = async () => {
    try {
      setLoading(true);
      const data = await overviewApi.getMetrics();
      setMetrics(data);
    } catch (err) {
      setError("Error al cargar métricas de cumplimiento");
    } finally {
      setLoading(false);
    }
  };

  return { metrics, loading, error, refresh: loadMetrics };
}

// Hook para gestión de DSR
export function useDsr() {
  const [requests, setRequests] = useState<DsrRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadRequests = useCallback(async () => {
    try {
      setLoading(true);
      const data = await dsrApi.list();
      setRequests(data);
    } catch (err) {
      setError("Error al cargar solicitudes DSR");
    } finally {
      setLoading(false);
    }
  }, []);

  const createRequest = useCallback(async (data: Partial<DsrRequest>) => {
    try {
      setLoading(true);
      const newRequest = await dsrApi.createRequest(data);
      setRequests((prev) => [...prev, newRequest]);
      return newRequest;
    } catch (err) {
      setError("Error al crear solicitud DSR");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getStatus = useCallback(async (ref: string) => {
    try {
      return await dsrApi.getStatus(ref);
    } catch (err) {
      setError("Error al obtener estado de DSR");
      throw err;
    }
  }, []);

  const exportData = useCallback(async (ref: string) => {
    try {
      const blob = await dsrApi.exportData(ref);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `dsr-export-${ref}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError("Error al exportar datos");
      throw err;
    }
  }, []);

  const deleteData = useCallback(async (ref: string) => {
    try {
      const result = await dsrApi.deleteData(ref);
      if (result.success) {
        setRequests((prev) => prev.filter((r) => r.id !== ref));
      }
      return result;
    } catch (err) {
      setError("Error al eliminar datos");
      throw err;
    }
  }, []);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  return {
    requests,
    loading,
    error,
    createRequest,
    getStatus,
    exportData,
    deleteData,
    refresh: loadRequests,
  };
}

// Hook para gestión de consentimientos
export function useConsents(subject?: string) {
  const [consents, setConsents] = useState<Consent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadConsents = useCallback(async () => {
    if (!subject) return;
    try {
      setLoading(true);
      const data = await consentsApi.getBySubject(subject);
      setConsents(data);
    } catch (err) {
      setError("Error al cargar consentimientos");
    } finally {
      setLoading(false);
    }
  }, [subject]);

  const createConsent = useCallback(async (data: Partial<Consent>) => {
    try {
      setLoading(true);
      const newConsent = await consentsApi.create(data);
      setConsents((prev) => [...prev, newConsent]);
      return newConsent;
    } catch (err) {
      setError("Error al crear consentimiento");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const revokeConsent = useCallback(async (id: string, reason?: string) => {
    try {
      setLoading(true);
      const updated = await consentsApi.revoke(id, reason);
      setConsents((prev) =>
        prev.map((c) => (c.id === id ? updated : c))
      );
      return updated;
    } catch (err) {
      setError("Error al revocar consentimiento");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (subject) {
      loadConsents();
    }
  }, [subject, loadConsents]);

  return {
    consents,
    loading,
    error,
    createConsent,
    revokeConsent,
    refresh: loadConsents,
  };
}

// Hook para RoPA
export function useRopa() {
  const [records, setRecords] = useState<ActivityRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadRecords = useCallback(async () => {
    try {
      setLoading(true);
      const data = await ropaApi.list();
      setRecords(data);
    } catch (err) {
      setError("Error al cargar RoPA");
    } finally {
      setLoading(false);
    }
  }, []);

  const createRecord = useCallback(async (data: Partial<ActivityRecord>) => {
    try {
      const newRecord = await ropaApi.create(data);
      setRecords((prev) => [...prev, newRecord]);
      return newRecord;
    } catch (err) {
      setError("Error al crear registro");
      throw err;
    }
  }, []);

  const updateRecord = useCallback(
    async (id: string, data: Partial<ActivityRecord>) => {
      try {
        const updated = await ropaApi.update(id, data);
        setRecords((prev) =>
          prev.map((r) => (r.id === id ? updated : r))
        );
        return updated;
      } catch (err) {
        setError("Error al actualizar registro");
        throw err;
      }
    },
    []
  );

  const deleteRecord = useCallback(async (id: string) => {
    try {
      const result = await ropaApi.delete(id);
      if (result.success) {
        setRecords((prev) => prev.filter((r) => r.id !== id));
      }
      return result;
    } catch (err) {
      setError("Error al eliminar registro");
      throw err;
    }
  }, []);

  const exportRopa = useCallback(async () => {
    try {
      const blob = await ropaApi.export();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ropa-export-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError("Error al exportar RoPA");
      throw err;
    }
  }, []);

  useEffect(() => {
    loadRecords();
  }, [loadRecords]);

  return {
    records,
    loading,
    error,
    createRecord,
    updateRecord,
    deleteRecord,
    exportRopa,
    refresh: loadRecords,
  };
}

// Hook para avisos de privacidad
export function usePrivacyNotices() {
  const [notices, setNotices] = useState<PrivacyNotice[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadNotices = useCallback(async () => {
    try {
      setLoading(true);
      const data = await noticesApi.list();
      setNotices(data);
    } catch (err) {
      setError("Error al cargar avisos");
    } finally {
      setLoading(false);
    }
  }, []);

  const createNotice = useCallback(async (data: Partial<PrivacyNotice>) => {
    try {
      const newNotice = await noticesApi.create(data);
      setNotices((prev) => [...prev, newNotice]);
      return newNotice;
    } catch (err) {
      setError("Error al crear aviso");
      throw err;
    }
  }, []);

  const updateNotice = useCallback(
    async (id: string, data: Partial<PrivacyNotice>) => {
      try {
        const updated = await noticesApi.update(id, data);
        setNotices((prev) =>
          prev.map((n) => (n.id === id ? updated : n))
        );
        return updated;
      } catch (err) {
        setError("Error al actualizar aviso");
        throw err;
      }
    },
    []
  );

  const previewNotice = useCallback(async (id: string) => {
    try {
      return await noticesApi.preview(id);
    } catch (err) {
      setError("Error al previsualizar aviso");
      throw err;
    }
  }, []);

  useEffect(() => {
    loadNotices();
  }, [loadNotices]);

  return {
    notices,
    loading,
    error,
    createNotice,
    updateNotice,
    previewNotice,
    refresh: loadNotices,
  };
}

// Hook para cookies
export function useCookies() {
  const [categories, setCategories] = useState<CookieCategory[]>([]);
  const [cookies, setCookies] = useState<CookieItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [cats, items] = await Promise.all([
        cookiesApi.getCategories(),
        cookiesApi.listCookies(),
      ]);
      setCategories(cats);
      setCookies(items);
    } catch (err) {
      setError("Error al cargar cookies");
    } finally {
      setLoading(false);
    }
  }, []);

  const createCategory = useCallback(async (data: Partial<CookieCategory>) => {
    try {
      const newCategory = await cookiesApi.createCategory(data);
      setCategories((prev) => [...prev, newCategory]);
      return newCategory;
    } catch (err) {
      setError("Error al crear categoría");
      throw err;
    }
  }, []);

  const createCookie = useCallback(async (data: Partial<CookieItem>) => {
    try {
      const newCookie = await cookiesApi.createCookie(data);
      setCookies((prev) => [...prev, newCookie]);
      return newCookie;
    } catch (err) {
      setError("Error al crear cookie");
      throw err;
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    categories,
    cookies,
    loading,
    error,
    createCategory,
    createCookie,
    refresh: loadData,
  };
}

// Hook para políticas de retención
export function useRetention() {
  const [policies, setPolicies] = useState<RetentionRule[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPolicies = useCallback(async () => {
    try {
      setLoading(true);
      const data = await retentionApi.getPolicies();
      setPolicies(data);
    } catch (err) {
      setError("Error al cargar políticas");
    } finally {
      setLoading(false);
    }
  }, []);

  const createPolicy = useCallback(async (data: Partial<RetentionRule>) => {
    try {
      const newPolicy = await retentionApi.createPolicy(data);
      setPolicies((prev) => [...prev, newPolicy]);
      return newPolicy;
    } catch (err) {
      setError("Error al crear política");
      throw err;
    }
  }, []);

  const previewPolicy = useCallback(async (policyId: string) => {
    try {
      return await retentionApi.preview(policyId);
    } catch (err) {
      setError("Error al previsualizar política");
      throw err;
    }
  }, []);

  useEffect(() => {
    loadPolicies();
  }, [loadPolicies]);

  return {
    policies,
    loading,
    error,
    createPolicy,
    previewPolicy,
    refresh: loadPolicies,
  };
}

// Hook para brechas
export function useBreaches() {
  const [breaches, setBreaches] = useState<Breach[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadBreaches = useCallback(async () => {
    try {
      setLoading(true);
      const data = await breachesApi.list();
      setBreaches(data);
    } catch (err) {
      setError("Error al cargar brechas");
    } finally {
      setLoading(false);
    }
  }, []);

  const createBreach = useCallback(async (data: Partial<Breach>) => {
    try {
      const newBreach = await breachesApi.create(data);
      setBreaches((prev) => [...prev, newBreach]);
      return newBreach;
    } catch (err) {
      setError("Error al crear brecha");
      throw err;
    }
  }, []);

  const updateBreach = useCallback(
    async (id: string, data: Partial<Breach>) => {
      try {
        const updated = await breachesApi.update(id, data);
        setBreaches((prev) =>
          prev.map((b) => (b.id === id ? updated : b))
        );
        return updated;
      } catch (err) {
        setError("Error al actualizar brecha");
        throw err;
      }
    },
    []
  );

  useEffect(() => {
    loadBreaches();
  }, [loadBreaches]);

  return {
    breaches,
    loading,
    error,
    createBreach,
    updateBreach,
    refresh: loadBreaches,
  };
}

// Hook para mapa de datos
export function useDataMap() {
  const [entries, setEntries] = useState<DataMapEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadEntries = useCallback(async () => {
    try {
      setLoading(true);
      const data = await dataMapApi.list();
      setEntries(data);
    } catch (err) {
      setError("Error al cargar mapa de datos");
    } finally {
      setLoading(false);
    }
  }, []);

  const createEntry = useCallback(async (data: Partial<DataMapEntry>) => {
    try {
      const newEntry = await dataMapApi.create(data);
      setEntries((prev) => [...prev, newEntry]);
      return newEntry;
    } catch (err) {
      setError("Error al crear entrada");
      throw err;
    }
  }, []);

  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  return {
    entries,
    loading,
    error,
    createEntry,
    refresh: loadEntries,
  };
}

// Hook para exportar pack RGPD
export function useRgpdExport() {
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const exportPack = useCallback(async () => {
    try {
      setExporting(true);
      const data = await rgpdExportApi.generatePack();
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `rgpd-pack-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError("Error al exportar pack RGPD");
      throw err;
    } finally {
      setExporting(false);
    }
  }, []);

  return { exportPack, exporting, error };
}