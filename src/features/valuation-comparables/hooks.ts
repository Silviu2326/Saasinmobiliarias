import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useCallback, useMemo } from "react";
import type {
  AuditEvent,
  Comparable,
  CompSet,
  DedupStrategy,
  NormalizeRules,
  ScoreParams,
  SearchFilters,
  SubjectRef,
} from "./types";
import * as api from "./apis";
import { applyRules, cosineSim, knnScore } from "./utils";

export function useSubjectRef() {
  const [subject, setSubject] = useState<SubjectRef>({});

  const updateSubject = useCallback((updates: Partial<SubjectRef>) => {
    setSubject(prev => ({ ...prev, ...updates }));
  }, []);

  const clearSubject = useCallback(() => {
    setSubject({});
  }, []);

  return {
    subject,
    updateSubject,
    clearSubject,
    hasSubject: Object.keys(subject).length > 0,
  };
}

export function useSearch(filters: SearchFilters) {
  const query = useQuery({
    queryKey: ["comparables", "search", filters],
    queryFn: () => api.searchComparables(filters),
    staleTime: 30000,
  });

  return {
    comparables: query.data?.data || [],
    total: query.data?.total || 0,
    density: query.data?.density || 0,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

export function useComparable(id: string) {
  return useQuery({
    queryKey: ["comparables", id],
    queryFn: () => api.getComparable(id),
    enabled: !!id,
  });
}

export function useComparablePhotos(id: string) {
  return useQuery({
    queryKey: ["comparables", id, "photos"],
    queryFn: () => api.getComparablePhotos(id),
    enabled: !!id,
  });
}

export function useNormalize(
  subject: SubjectRef,
  comps: Comparable[],
  rules: NormalizeRules
) {
  const [normalized, setNormalized] = useState<Comparable[]>([]);

  const mutation = useMutation({
    mutationFn: () => api.normalizeComparables({ subject, comps, rules }),
    onSuccess: (data) => {
      setNormalized(data);
    },
  });

  const localNormalize = useCallback(() => {
    const result = comps.map(comp => ({
      ...comp,
      adjTotal: applyRules(comp, rules, subject),
    }));
    setNormalized(result);
    return result;
  }, [comps, rules, subject]);

  return {
    normalized,
    normalize: mutation.mutate,
    localNormalize,
    isNormalizing: mutation.isPending,
    error: mutation.error,
  };
}

export function useScore(
  subject: SubjectRef,
  comps: Comparable[],
  params: ScoreParams
) {
  const [scored, setScored] = useState<Comparable[]>([]);

  const mutation = useMutation({
    mutationFn: () => api.scoreComparables({ subject, comps, method: params.method, params }),
    onSuccess: (data) => {
      setScored(data);
    },
  });

  const localScore = useCallback(() => {
    if (params.method === "COSINE") {
      const result = comps.map(comp => ({
        ...comp,
        similarity: cosineSim(subject, comp, params.weights),
      }));
      setScored(result);
      return result;
    } else if (params.method === "KNN" && params.k) {
      const scores = knnScore(subject, comps, {
        k: params.k,
        distCapM: params.distCapM,
        weights: params.weights,
      });
      const result = comps.map(comp => ({
        ...comp,
        weight: scores.get(comp.id) || 0,
      }));
      setScored(result);
      return result;
    }
    return comps;
  }, [comps, params, subject]);

  return {
    scored,
    score: mutation.mutate,
    localScore,
    isScoring: mutation.isPending,
    error: mutation.error,
  };
}

export function useDedup(comps: Comparable[], strategy: DedupStrategy) {
  const [result, setResult] = useState<{
    groups: Array<{ key: string; comps: Comparable[] }>;
    duplicates: string[];
  }>({ groups: [], duplicates: [] });

  const mutation = useMutation({
    mutationFn: () => api.dedupComparables({ comps, strategy }),
    onSuccess: (data) => {
      setResult(data);
    },
  });

  return {
    groups: result.groups,
    duplicates: result.duplicates,
    dedup: mutation.mutate,
    isDeduping: mutation.isPending,
    error: mutation.error,
  };
}

export function useCompSets() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["compSets"],
    queryFn: api.getCompSets,
  });

  const saveMutation = useMutation({
    mutationFn: api.saveCompSet,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["compSets"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<CompSet> }) =>
      api.updateCompSet(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["compSets"] });
    },
  });

  return {
    sets: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    saveSet: saveMutation.mutate,
    updateSet: updateMutation.mutate,
    isSaving: saveMutation.isPending || updateMutation.isPending,
  };
}

export function useCompSet(id: string) {
  return useQuery({
    queryKey: ["compSets", id],
    queryFn: () => api.getCompSet(id),
    enabled: !!id,
  });
}

export function useAudit(params?: { setId?: string; from?: string; to?: string }) {
  const [events, setEvents] = useState<AuditEvent[]>([]);

  const query = useQuery({
    queryKey: ["audit", params],
    queryFn: () => api.getAuditTrail(params || {}),
    enabled: true,
  });

  const logEvent = useCallback((action: string, payload?: Record<string, any>) => {
    const event: AuditEvent = {
      id: `audit-${Date.now()}`,
      at: new Date().toISOString(),
      user: "current-user",
      action,
      payload,
    };
    setEvents(prev => [event, ...prev]);
  }, []);

  return {
    events: query.data || events,
    logEvent,
    isLoading: query.isLoading,
    error: query.error,
  };
}

export function useImportExport() {
  const importMutation = useMutation({
    mutationFn: api.importComparables,
  });

  const exportMutation = useMutation({
    mutationFn: api.exportComparables,
  });

  const downloadBlob = useCallback((blob: Blob, filename: string) => {
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
    exportData: async (params: Parameters<typeof api.exportComparables>[0]) => {
      const blob = await api.exportComparables(params);
      const ext = params.format.toLowerCase();
      downloadBlob(blob, `comparables-${Date.now()}.${ext}`);
    },
    isImporting: importMutation.isPending,
    isExporting: exportMutation.isPending,
    importResult: importMutation.data,
    importError: importMutation.error,
    exportError: exportMutation.error,
  };
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