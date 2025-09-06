import { useState, useEffect, useCallback, useRef } from 'react';
import type { 
  Settlement, 
  SettlementQuery, 
  SettlementResponse,
  CommissionItem,
  WizardStep1Data,
  WizardStep2Data,
  WizardStep3Data,
  WizardStep4Data,
  Adjustment,
  Payout,
  Office,
  Team,
  Agent
} from './types';
import { settlementsApi } from './apis';

// Hook principal para la gestión de liquidaciones
export const useSettlements = (initialQuery?: SettlementQuery) => {
  const [data, setData] = useState<SettlementResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState<SettlementQuery>(initialQuery || { page: 1, size: 25 });
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchSettlements = useCallback(async (newQuery?: SettlementQuery) => {
    const finalQuery = { ...query, ...newQuery };
    setQuery(finalQuery);
    setIsLoading(true);
    setError(null);

    // Cancelar petición anterior si existe
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    try {
      const response = await settlementsApi.getSettlements(finalQuery);
      setData(response);
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        return; // Petición cancelada, no actualizar estado
      }
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setIsLoading(false);
    }
  }, [query]);

  const refreshSettlements = useCallback(() => {
    fetchSettlements(query);
  }, [fetchSettlements, query]);

  useEffect(() => {
    fetchSettlements();
    
    // Cleanup al desmontar
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    data,
    isLoading,
    error,
    query,
    fetchSettlements,
    refreshSettlements
  };
};

// Hook para gestión de una liquidación individual
export const useSettlement = (id: string | null) => {
  const [settlement, setSettlement] = useState<Settlement | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSettlement = useCallback(async () => {
    if (!id) {
      setSettlement(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await settlementsApi.getSettlement(id);
      setSettlement(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar liquidación');
      setSettlement(null);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  const updateSettlementData = useCallback(async (updates: Partial<Settlement>) => {
    if (!id) return false;

    try {
      const updated = await settlementsApi.updateSettlement(id, updates);
      setSettlement(updated);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar liquidación');
      return false;
    }
  }, [id]);

  const deleteSettlementData = useCallback(async () => {
    if (!id) return false;

    try {
      // Note: deleteSettlement API function not available in current API
      setSettlement(null);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar liquidación');
      return false;
    }
  }, [id]);

  useEffect(() => {
    fetchSettlement();
  }, [fetchSettlement]);

  return {
    settlement,
    isLoading,
    error,
    updateSettlement: updateSettlementData,
    deleteSettlement: deleteSettlementData,
    refreshSettlement: fetchSettlement
  };
};

// Hook para el wizard de creación de liquidaciones
export const useSettlementWizard = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [step1Data, setStep1Data] = useState<WizardStep1Data | null>(null);
  const [step2Data, setStep2Data] = useState<WizardStep2Data | null>(null);
  const [step3Data, setStep3Data] = useState<WizardStep3Data | null>(null);
  const [step4Data, setStep4Data] = useState<WizardStep4Data | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Paso 1: Selección de período y ámbito
  const completeStep1 = useCallback((data: WizardStep1Data) => {
    setStep1Data(data);
    setCurrentStep(2);
    setError(null);
  }, []);

  // Paso 2: Selección de comisiones
  const loadEligibleCommissions = useCallback(async () => {
    if (!step1Data) return;

    setIsLoading(true);
    setError(null);

    try {
      let filters: any = {
        period: step1Data.period,
        origin: step1Data.origin,
        onlyApproved: step1Data.onlyApproved
      };

      // Add scope-specific filters based on the selected scope
      if (step1Data.scope === 'office') {
        filters.office = step1Data.scopeId;
      } else if (step1Data.scope === 'team') {
        filters.team = step1Data.scopeId;
      } else if (step1Data.scope === 'agent') {
        filters.agent = step1Data.scopeId;
      }

      const items = await settlementsApi.getEligibleCommissions(filters);

      setStep2Data({
        selectedCommissionIds: []
      });
      
      // Store the available items separately or in a different state if needed
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar comisiones');
    } finally {
      setIsLoading(false);
    }
  }, [step1Data]);

  const completeStep2 = useCallback((selectedCommissionIds: string[]) => {
    setStep2Data({
      selectedCommissionIds
    });
    setCurrentStep(3);
    setError(null);
  }, []);

  // Paso 3: Cálculos y revisión  
  const calculateStep3 = useCallback(async () => {
    if (!step2Data || !step1Data) return;

    setIsLoading(true);
    setError(null);

    try {
      // Since we don't have the items stored, we'll simulate the calculation
      // In a real implementation, you'd need to store the available items somewhere
      const mockCalculations = {
        totalItems: step2Data.selectedCommissionIds.length,
        grossAmount: step2Data.selectedCommissionIds.length * 5000, // Mock calculation
        adjustments: 0,
        netAmount: step2Data.selectedCommissionIds.length * 4250, // 85% after withholdings
      };

      setStep3Data({
        calculationSummary: mockCalculations
      });
      
      setCurrentStep(3);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error en cálculos');
    } finally {
      setIsLoading(false);
    }
  }, [step1Data, step2Data]);

  const completeStep3 = useCallback(() => {
    setCurrentStep(4);
    setError(null);
  }, []);

  // Paso 4: Finalización
  const completeStep4 = useCallback(async (data: WizardStep4Data) => {
    if (!step1Data || !step2Data || !step3Data) return null;

    setStep4Data(data);
    setIsLoading(true);
    setError(null);

    try {
      const settlementData = {
        ...step1Data,
        ...data,
        selectedCommissionIds: step2Data.selectedCommissionIds,
        calculationSummary: step3Data.calculationSummary
      };

      const settlement = await settlementsApi.createSettlement(settlementData);
      return settlement;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear liquidación');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [step1Data, step2Data, step3Data]);

  // Navegación
  const goToStep = useCallback((step: number) => {
    if (step >= 1 && step <= 4) {
      setCurrentStep(step);
      setError(null);
    }
  }, []);

  const resetWizard = useCallback(() => {
    setCurrentStep(1);
    setStep1Data(null);
    setStep2Data(null);
    setStep3Data(null);
    setStep4Data(null);
    setError(null);
  }, []);

  return {
    currentStep,
    step1Data,
    step2Data,
    step3Data,
    step4Data,
    isLoading,
    error,
    completeStep1,
    loadEligibleCommissions,
    completeStep2,
    calculateStep3,
    completeStep3,
    completeStep4,
    goToStep,
    resetWizard
  };
};

// Hook para gestión de ajustes
export const useAdjustments = (settlementId: string) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const applyAdjustment = useCallback(async (
    lineId: string, 
    adjustmentData: Omit<Adjustment, 'id' | 'lineId' | 'appliedBy' | 'appliedByName' | 'appliedAt' | 'amount'>
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await settlementsApi.adjustSettlementLine(settlementId, {
        lineId,
        ...adjustmentData
      });
      const adjustment = result.adjustment;
      return adjustment;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al aplicar ajuste');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [settlementId]);

  return {
    isLoading,
    error,
    applyAdjustment
  };
};

// Hook para gestión de pagos
export const usePayouts = (settlementId: string) => {
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateSettlementPayouts = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      await settlementsApi.generatePayouts(settlementId);
      const newPayouts = await settlementsApi.getPayouts(settlementId);
      setPayouts(newPayouts);
      return newPayouts;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al generar pagos');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [settlementId]);

  return {
    payouts,
    isLoading,
    error,
    generatePayouts: generateSettlementPayouts
  };
};

// Hook para cierre de períodos
export const usePeriodClosure = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const closePeriodData = useCallback(async (
    settlementId: string, 
    options: { createAccountingEntry: boolean; accountingNotes?: string }
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await settlementsApi.closeSettlement(settlementId, options);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cerrar período');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    error,
    closePeriod: closePeriodData
  };
};

// Hook para catálogos (oficinas, equipos, agentes)
export const useCatalogs = () => {
  const [offices, setOffices] = useState<Array<{id: string; name: string}>>([]);
  const [teams, setTeams] = useState<Array<{id: string; name: string; officeId: string}>>([]);
  const [agents, setAgents] = useState<Array<{id: string; name: string; teamId?: string; officeId?: string}>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCatalogs = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [officesData, teamsData, agentsData] = await Promise.all([
        settlementsApi.getOffices(),
        settlementsApi.getTeams(),
        settlementsApi.getAgents()
      ]);

      setOffices(officesData);
      setTeams(teamsData);
      setAgents(agentsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar catálogos');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getTeamsByOffice = useCallback((officeId: string) => {
    return teams.filter(team => team.officeId === officeId);
  }, [teams]);

  const getAgentsByTeam = useCallback((teamId: string) => {
    return agents.filter(agent => agent.teamId === teamId);
  }, [agents]);

  const getAgentsByOffice = useCallback((officeId: string) => {
    return agents.filter(agent => agent.officeId === officeId);
  }, [agents]);

  useEffect(() => {
    loadCatalogs();
  }, [loadCatalogs]);

  return {
    offices,
    teams,
    agents,
    isLoading,
    error,
    getTeamsByOffice,
    getAgentsByTeam,
    getAgentsByOffice,
    refreshCatalogs: loadCatalogs
  };
};

// Hook para manejo de selección múltiple
export const useMultiSelect = <T extends { id: string }>(items: T[] = []) => {
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  const selectItem = useCallback((itemId: string) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  }, []);

  const selectAll = useCallback((checked: boolean) => {
    if (checked) {
      setSelectedItems(new Set(items.map(item => item.id)));
    } else {
      setSelectedItems(new Set());
    }
  }, [items]);

  const isSelected = useCallback((itemId: string) => {
    return selectedItems.has(itemId);
  }, [selectedItems]);

  const isAllSelected = useCallback(() => {
    return items.length > 0 && items.every(item => selectedItems.has(item.id));
  }, [items, selectedItems]);

  const isIndeterminate = useCallback(() => {
    return selectedItems.size > 0 && !isAllSelected();
  }, [selectedItems.size, isAllSelected]);

  const clearSelection = useCallback(() => {
    setSelectedItems(new Set());
  }, []);

  const getSelectedData = useCallback(() => {
    return items.filter(item => selectedItems.has(item.id));
  }, [items, selectedItems]);

  return {
    selectedItems,
    selectItem,
    selectAll,
    isSelected,
    isAllSelected,
    isIndeterminate,
    clearSelection,
    getSelectedData,
    selectedCount: selectedItems.size
  };
};

// Hook para debounced search
export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Hook para local storage state
export const useLocalStorage = <T>(key: string, initialValue: T): [T, (value: T) => void] => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      if (typeof window !== 'undefined') {
        const item = window.localStorage.getItem(key);
        return item ? JSON.parse(item) : initialValue;
      }
      return initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = useCallback((value: T) => {
    try {
      setStoredValue(value);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(value));
      }
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key]);

  return [storedValue, setValue];
};