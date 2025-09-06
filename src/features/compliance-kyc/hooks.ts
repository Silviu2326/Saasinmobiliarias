import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useCallback } from "react";
import type {
  Applicant,
  KycFilters,
  Decision,
  DocumentRef,
  WebhookConfig,
  AuditEvent,
} from "./types";
import * as api from "./apis";

export function useKycList(filters: KycFilters) {
  return useQuery({
    queryKey: ["kyc", "applicants", filters],
    queryFn: () => api.getApplicants(filters),
    staleTime: 30000,
  });
}

export function useKycApplicant(id: string) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["kyc", "applicant", id],
    queryFn: () => api.getApplicant(id),
    enabled: !!id,
  });

  const updateMutation = useMutation({
    mutationFn: (updates: Partial<Applicant>) => api.updateApplicant(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kyc", "applicant", id] });
      queryClient.invalidateQueries({ queryKey: ["kyc", "applicants"] });
    },
  });

  const submitMutation = useMutation({
    mutationFn: () => api.submitApplicant(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kyc", "applicant", id] });
      queryClient.invalidateQueries({ queryKey: ["kyc", "applicants"] });
    },
  });

  const decisionMutation = useMutation({
    mutationFn: (decision: Decision) => api.makeDecision(id, decision),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kyc", "applicant", id] });
      queryClient.invalidateQueries({ queryKey: ["kyc", "applicants"] });
    },
  });

  return {
    applicant: query.data,
    isLoading: query.isLoading,
    error: query.error,
    updateApplicant: updateMutation.mutate,
    submitApplicant: submitMutation.mutate,
    makeDecision: decisionMutation.mutate,
    isUpdating: updateMutation.isPending,
    isSubmitting: submitMutation.isPending,
    isDeciding: decisionMutation.isPending,
  };
}

export function useCreateApplicant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.createApplicant,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kyc", "applicants"] });
    },
  });
}

export function useApplicantDocuments(applicantId: string) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["kyc", "applicant", applicantId, "documents"],
    queryFn: () => api.getApplicantDocuments(applicantId),
    enabled: !!applicantId,
  });

  const uploadMutation = useMutation({
    mutationFn: ({ file, type }: { file: File; type: DocumentRef["type"] }) =>
      api.uploadDocument(applicantId, file, type),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["kyc", "applicant", applicantId, "documents"],
      });
    },
  });

  return {
    documents: query.data || [],
    isLoading: query.isLoading,
    uploadDocument: uploadMutation.mutate,
    isUploading: uploadMutation.isPending,
    uploadError: uploadMutation.error,
  };
}

export function useScreening() {
  const [results, setResults] = useState<any[]>([]);

  const mutation = useMutation({
    mutationFn: ({ name, docId, country }: { name: string; docId: string; country: string }) =>
      api.performScreening(name, docId, country),
    onSuccess: (data) => {
      setResults(data);
    },
  });

  return {
    results,
    performScreening: mutation.mutate,
    isScreening: mutation.isPending,
    error: mutation.error,
  };
}

export function useRiskScore(applicantId: string) {
  return useQuery({
    queryKey: ["kyc", "applicant", applicantId, "risk-score"],
    queryFn: () => api.calculateRisk(applicantId),
    enabled: !!applicantId,
  });
}

export function useLivenessCheck() {
  return useMutation({
    mutationFn: api.performLivenessCheck,
  });
}

export function useAddressVerification() {
  return useMutation({
    mutationFn: ({ applicantId, method }: { applicantId: string; method: string }) =>
      api.verifyAddress(applicantId, method),
  });
}

export function useWebhooks() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["kyc", "webhooks"],
    queryFn: api.getWebhooks,
  });

  const createMutation = useMutation({
    mutationFn: api.createWebhook,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kyc", "webhooks"] });
    },
  });

  const testMutation = useMutation({
    mutationFn: api.testWebhook,
  });

  return {
    webhooks: query.data || [],
    isLoading: query.isLoading,
    createWebhook: createMutation.mutate,
    testWebhook: testMutation.mutate,
    isCreating: createMutation.isPending,
    isTesting: testMutation.isPending,
    testResult: testMutation.data,
  };
}

export function useImportExport() {
  const queryClient = useQueryClient();

  const importMutation = useMutation({
    mutationFn: api.importApplicants,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kyc", "applicants"] });
    },
  });

  const exportMutation = useMutation({
    mutationFn: api.exportApplicants,
  });

  const downloadFile = useCallback((blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, []);

  return {
    importData: importMutation.mutate,
    exportData: async (applicantIds: string[]) => {
      const blob = await api.exportApplicants(applicantIds);
      downloadFile(blob, `kyc-export-${new Date().toISOString().split('T')[0]}.csv`);
    },
    isImporting: importMutation.isPending,
    isExporting: exportMutation.isPending,
    importResult: importMutation.data,
    importError: importMutation.error,
  };
}

export function useAudit(applicantId?: string) {
  return useQuery({
    queryKey: ["kyc", "audit", applicantId],
    queryFn: () => api.getAuditTrail(applicantId),
  });
}

export function useSelection() {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const toggle = useCallback((id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const selectAll = useCallback((ids: string[]) => {
    setSelected(new Set(ids));
  }, []);

  const clearSelection = useCallback(() => {
    setSelected(new Set());
  }, []);

  const isSelected = useCallback((id: string) => selected.has(id), [selected]);

  return {
    selected: Array.from(selected),
    selectedSet: selected,
    toggle,
    selectAll,
    clearSelection,
    isSelected,
    hasSelection: selected.size > 0,
    count: selected.size,
  };
}

export function useFilters() {
  const [filters, setFilters] = useState<KycFilters>({
    page: 0,
    size: 25,
    sort: "createdAt-desc",
  });

  const updateFilter = useCallback((key: keyof KycFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: key !== "page" ? 0 : value, // Reset page when changing other filters
    }));
  }, []);

  const updateFilters = useCallback((newFilters: Partial<KycFilters>) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
      page: 0, // Reset page when updating multiple filters
    }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      page: 0,
      size: 25,
      sort: "createdAt-desc",
    });
  }, []);

  return {
    filters,
    updateFilter,
    updateFilters,
    clearFilters,
  };
}

export function useApplicantWizard() {
  const [currentStep, setCurrentStep] = useState(0);
  const [applicantData, setApplicantData] = useState<Partial<Applicant>>({});

  const steps = [
    { key: "personal", label: "Datos Personales" },
    { key: "documents", label: "Documentos" },
    { key: "liveness", label: "Prueba de Vida" },
    { key: "address", label: "Verificación de Dirección" },
    { key: "review", label: "Revisión Final" },
  ];

  const nextStep = useCallback(() => {
    setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
  }, [steps.length]);

  const prevStep = useCallback(() => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  }, []);

  const goToStep = useCallback((step: number) => {
    setCurrentStep(Math.max(0, Math.min(step, steps.length - 1)));
  }, [steps.length]);

  const updateApplicantData = useCallback((data: Partial<Applicant>) => {
    setApplicantData(prev => ({ ...prev, ...data }));
  }, []);

  const resetWizard = useCallback(() => {
    setCurrentStep(0);
    setApplicantData({});
  }, []);

  return {
    currentStep,
    steps,
    applicantData,
    nextStep,
    prevStep,
    goToStep,
    updateApplicantData,
    resetWizard,
    isFirstStep: currentStep === 0,
    isLastStep: currentStep === steps.length - 1,
  };
}