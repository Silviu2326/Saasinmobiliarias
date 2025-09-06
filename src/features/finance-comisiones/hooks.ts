import { useState, useEffect, useCallback, useMemo } from "react";
import {
  CommissionItem,
  CommissionPlan,
  CommissionsFilters,
  CommissionsResponse,
  Payout,
  ReconciliationIssue,
  CommissionKPIs,
  CommissionForecast,
  AuditTrailEntry,
  CalculationPreview,
} from "./types";
import * as api from "./apis";

export function useCommissionItems(initialFilters: CommissionsFilters = {}) {
  const [data, setData] = useState<CommissionsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [filters, setFilters] = useState<CommissionsFilters>(initialFilters);

  const fetchData = useCallback(async (currentFilters: CommissionsFilters) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.getCommissions(currentFilters);
      setData(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error loading commissions");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(filters);
  }, [fetchData, filters]);

  const updateFilters = useCallback((newFilters: Partial<CommissionsFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const selectItem = useCallback((id: string) => {
    setSelectedIds(prev => new Set(prev).add(id));
  }, []);

  const deselectItem = useCallback((id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, []);

  const selectAll = useCallback(() => {
    if (data?.items) {
      setSelectedIds(new Set(data.items.map(item => item.id)));
    }
  }, [data?.items]);

  const deselectAll = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const toggleSelection = useCallback((id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const recalculate = useCallback(async (itemIds?: string[]) => {
    try {
      setLoading(true);
      const ids = itemIds || Array.from(selectedIds);
      await api.recalculateCommissions(ids);
      await fetchData(filters);
      if (!itemIds) {
        setSelectedIds(new Set());
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error recalculating");
    } finally {
      setLoading(false);
    }
  }, [selectedIds, filters, fetchData]);

  const selectedItems = useMemo(() => {
    if (!data?.items) return [];
    return data.items.filter(item => selectedIds.has(item.id));
  }, [data?.items, selectedIds]);

  const selectedTotal = useMemo(() => {
    return selectedItems.reduce((sum, item) => sum + item.commissionAmount, 0);
  }, [selectedItems]);

  return {
    data,
    loading,
    error,
    filters,
    updateFilters,
    selectedIds,
    selectedItems,
    selectedTotal,
    selectItem,
    deselectItem,
    selectAll,
    deselectAll,
    toggleSelection,
    recalculate,
    refetch: () => fetchData(filters),
  };
}

export function useCommissionPlans() {
  const [plans, setPlans] = useState<CommissionPlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPlans = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getCommissionPlans();
      setPlans(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error loading plans");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  const createPlan = useCallback(async (plan: Omit<CommissionPlan, "id" | "updatedAt">) => {
    try {
      setLoading(true);
      const newPlan = await api.createCommissionPlan(plan);
      setPlans(prev => [...prev, newPlan]);
      return newPlan;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error creating plan");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updatePlan = useCallback(async (id: string, plan: Partial<CommissionPlan>) => {
    try {
      setLoading(true);
      const updatedPlan = await api.updateCommissionPlan(id, plan);
      setPlans(prev => prev.map(p => p.id === id ? updatedPlan : p));
      return updatedPlan;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error updating plan");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deletePlan = useCallback(async (id: string) => {
    try {
      setLoading(true);
      await api.deleteCommissionPlan(id);
      setPlans(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error deleting plan");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const previewCalculation = useCallback(async (baseAmount: number, planId: string): Promise<CalculationPreview> => {
    return api.previewPlanCalculation({ baseAmount, planId });
  }, []);

  return {
    plans,
    loading,
    error,
    createPlan,
    updatePlan,
    deletePlan,
    previewCalculation,
    refetch: fetchPlans,
  };
}

export function useSettlement() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createSettlement = useCallback(async (data: { period: string; itemIds: string[] }) => {
    try {
      setLoading(true);
      setError(null);
      const result = await api.createSettlement(data);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error creating settlement");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    createSettlement,
    loading,
    error,
  };
}

export function usePayouts() {
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPayouts = useCallback(async (filters: { period?: string; agent?: string; status?: string } = {}) => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getPayouts(filters);
      setPayouts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error loading payouts");
    } finally {
      setLoading(false);
    }
  }, []);

  const updateStatus = useCallback(async (id: string, data: { status?: string; paidAt?: string }) => {
    try {
      setLoading(true);
      const updated = await api.updatePayoutStatus(id, data);
      setPayouts(prev => prev.map(p => p.id === id ? updated : p));
      return updated;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error updating payout");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const downloadReceipt = useCallback(async (id: string) => {
    try {
      const blob = await api.getPayoutReceipt(id);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `recibo-${id}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error downloading receipt");
    }
  }, []);

  useEffect(() => {
    fetchPayouts();
  }, [fetchPayouts]);

  return {
    payouts,
    loading,
    error,
    fetchPayouts,
    updateStatus,
    downloadReceipt,
  };
}

export function useImportExport() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const exportData = useCallback(async (filters: CommissionsFilters, format: "csv" | "json" = "csv") => {
    try {
      setLoading(true);
      setError(null);
      const blob = await api.exportCommissions({ filters, format });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `commissions.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error exporting data");
    } finally {
      setLoading(false);
    }
  }, []);

  const importData = useCallback(async (file: File) => {
    try {
      setLoading(true);
      setError(null);
      const result = await api.importCommissions(file);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error importing data");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    exportData,
    importData,
    loading,
    error,
  };
}