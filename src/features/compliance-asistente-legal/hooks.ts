import { useState, useCallback, useEffect } from 'react';
import { complianceApi } from './apis';
import type {
  DsrRequest,
  Consent,
  AuditEvent,
  ChecklistItem,
  KycCheck,
  LegalDocument,
  DpiaReport,
  ComplianceOverview,
} from './types';

export function useComplianceOverview() {
  const [data, setData] = useState<ComplianceOverview | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await complianceApi.overview.getComplianceStatus();
      setData(result);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, [fetchData]);

  return { data, isLoading, error, refetch: fetchData };
}

export function useDsrActions() {
  const [createRequest, setCreateRequest] = useState({
    isPending: false,
    data: null as DsrRequest | null,
    isSuccess: false,
  });

  const [exportData, setExportData] = useState({
    isPending: false,
    data: null,
    isSuccess: false,
  });

  const [deleteData, setDeleteData] = useState({
    isPending: false,
    isSuccess: false,
  });

  const createRequestMutation = {
    isPending: createRequest.isPending,
    data: createRequest.data,
    isSuccess: createRequest.isSuccess,
    mutateAsync: async (data: Partial<DsrRequest>) => {
      setCreateRequest({ isPending: true, data: null, isSuccess: false });
      try {
        const result = await complianceApi.dsr.createRequest(data);
        setCreateRequest({ isPending: false, data: result, isSuccess: true });
        return result;
      } catch (error) {
        setCreateRequest({ isPending: false, data: null, isSuccess: false });
        throw error;
      }
    },
  };

  const exportDataMutation = {
    isPending: exportData.isPending,
    isSuccess: exportData.isSuccess,
    mutateAsync: async (ref: string) => {
      setExportData({ isPending: true, data: null, isSuccess: false });
      try {
        const result = await complianceApi.dsr.exportData(ref);
        setExportData({ isPending: false, data: result, isSuccess: true });
        return result;
      } catch (error) {
        setExportData({ isPending: false, data: null, isSuccess: false });
        throw error;
      }
    },
  };

  const deleteDataMutation = {
    isPending: deleteData.isPending,
    isSuccess: deleteData.isSuccess,
    mutateAsync: async (ref: string) => {
      setDeleteData({ isPending: true, isSuccess: false });
      try {
        const result = await complianceApi.dsr.deleteData(ref);
        setDeleteData({ isPending: false, isSuccess: true });
        return result;
      } catch (error) {
        setDeleteData({ isPending: false, isSuccess: false });
        throw error;
      }
    },
  };

  const checkStatus = useCallback(
    async (ref: string) => {
      return complianceApi.dsr.getStatus(ref);
    },
    []
  );

  return {
    createRequest: createRequestMutation,
    checkStatus,
    exportData: exportDataMutation,
    deleteData: deleteDataMutation,
  };
}

export function useConsents(subject?: string) {
  const [consents, setConsents] = useState<Consent[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [upsert, setUpsert] = useState({
    isPending: false,
    isSuccess: false,
  });

  const [revoke, setRevoke] = useState({
    isPending: false,
  });

  const fetchConsents = useCallback(async () => {
    if (!subject) return;
    setIsLoading(true);
    try {
      const result = await complianceApi.consents.getBySubject(subject);
      setConsents(result);
    } finally {
      setIsLoading(false);
    }
  }, [subject]);

  useEffect(() => {
    fetchConsents();
  }, [fetchConsents]);

  const upsertMutation = {
    isPending: upsert.isPending,
    isSuccess: upsert.isSuccess,
    mutateAsync: async (data: Partial<Consent>) => {
      setUpsert({ isPending: true, isSuccess: false });
      try {
        const result = await complianceApi.consents.upsert(data);
        setUpsert({ isPending: false, isSuccess: true });
        await fetchConsents();
        return result;
      } catch (error) {
        setUpsert({ isPending: false, isSuccess: false });
        throw error;
      }
    },
  };

  const revokeMutation = {
    isPending: revoke.isPending,
    mutateAsync: async (id: string) => {
      setRevoke({ isPending: true });
      try {
        const result = await complianceApi.consents.revoke(id);
        setRevoke({ isPending: false });
        await fetchConsents();
        return result;
      } catch (error) {
        setRevoke({ isPending: false });
        throw error;
      }
    },
  };

  return {
    consents,
    isLoading,
    upsert: upsertMutation,
    revoke: revokeMutation,
  };
}

export function useKycAml() {
  const [isChecking, setIsChecking] = useState(false);
  const [progress, setProgress] = useState(0);

  const check = useCallback(async (data: Partial<KycCheck>) => {
    setIsChecking(true);
    setProgress(20);

    try {
      setProgress(50);
      const kycResult = await complianceApi.kyc.check(data);
      
      setProgress(80);
      const amlResult = await complianceApi.kyc.amlScreen(data.docId || '');
      
      setProgress(100);
      
      return {
        kyc: kycResult,
        aml: amlResult,
      };
    } finally {
      setIsChecking(false);
      setProgress(0);
    }
  }, []);

  return {
    check,
    isChecking,
    progress,
  };
}

export function useAuditLog(filters?: any) {
  const [page, setPage] = useState(1);
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  
  const [log, setLog] = useState({
    isPending: false,
  });

  const fetchEvents = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await complianceApi.audit.getEvents({ ...filters, page });
      setEvents(result.items);
      setTotal(result.total);
    } finally {
      setIsLoading(false);
    }
  }, [filters, page]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const logMutation = {
    isPending: log.isPending,
    mutateAsync: async (event: Partial<AuditEvent>) => {
      setLog({ isPending: true });
      try {
        const result = await complianceApi.audit.log(event);
        setLog({ isPending: false });
        await fetchEvents();
        return result;
      } catch (error) {
        setLog({ isPending: false });
        throw error;
      }
    },
  };

  return {
    events,
    total,
    page,
    setPage,
    log: logMutation,
    isLoading,
  };
}

export function useChecklists(type?: 'venta' | 'alquiler', ref?: string) {
  const [items, setItems] = useState<ChecklistItem[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [save, setSave] = useState({
    isPending: false,
  });

  const fetchItems = useCallback(async () => {
    if (!type) return;
    setIsLoading(true);
    try {
      const result = await complianceApi.checklists.getByType(type, ref);
      setItems(result);
    } finally {
      setIsLoading(false);
    }
  }, [type, ref]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const saveMutation = {
    isPending: save.isPending,
    mutateAsync: async (items: ChecklistItem[]) => {
      setSave({ isPending: true });
      try {
        const result = await complianceApi.checklists.save(items);
        setSave({ isPending: false });
        await fetchItems();
        return result;
      } catch (error) {
        setSave({ isPending: false });
        throw error;
      }
    },
  };

  return {
    items,
    save: saveMutation,
    isLoading,
  };
}

export function useDpiaLight() {
  const [currentReport, setCurrentReport] = useState<Partial<DpiaReport>>();

  const [create, setCreate] = useState({
    isPending: false,
    isSuccess: false,
  });

  const createMutation = {
    isPending: create.isPending,
    isSuccess: create.isSuccess,
    mutateAsync: async (report: Partial<DpiaReport>) => {
      setCreate({ isPending: true, isSuccess: false });
      try {
        const result = await complianceApi.dpia.create(report);
        setCreate({ isPending: false, isSuccess: true });
        setCurrentReport(result);
        return result;
      } catch (error) {
        setCreate({ isPending: false, isSuccess: false });
        throw error;
      }
    },
  };

  const load = useCallback(async (id: string) => {
    const report = await complianceApi.dpia.getById(id);
    setCurrentReport(report);
    return report;
  }, []);

  return {
    currentReport,
    create: createMutation,
    load,
  };
}

export function useLegalDocuments() {
  const [templates, setTemplates] = useState<string[]>([]);

  const [generate, setGenerate] = useState({
    isPending: false,
    data: null as LegalDocument | null,
    isSuccess: false,
  });

  const loadTemplates = useCallback(async () => {
    const result = await complianceApi.documents.getTemplates();
    setTemplates(result);
    return result;
  }, []);

  const generateMutation = {
    isPending: generate.isPending,
    data: generate.data,
    isSuccess: generate.isSuccess,
    mutateAsync: async (doc: Partial<LegalDocument>) => {
      setGenerate({ isPending: true, data: null, isSuccess: false });
      try {
        const result = await complianceApi.documents.generate(doc);
        setGenerate({ isPending: false, data: result, isSuccess: true });
        return result;
      } catch (error) {
        setGenerate({ isPending: false, data: null, isSuccess: false });
        throw error;
      }
    },
  };

  const getDocument = useCallback(
    async (id: string) => {
      return complianceApi.documents.getById(id);
    },
    []
  );

  return {
    templates,
    loadTemplates,
    generate: generateMutation,
    getDocument,
  };
}

export function useEidasProvider() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await complianceApi.eidas.getProviderStatus();
      setData(result);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 300000);
    return () => clearInterval(interval);
  }, [fetchData]);

  return { data, isLoading, refetch: fetchData };
}