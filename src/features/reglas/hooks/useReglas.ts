import { useState, useEffect, useCallback } from 'react';
import { 
  Regla, 
  ReglaEjecucion, 
  CreateReglaRequest, 
  UpdateReglaRequest, 
  ReglaStats 
} from '../types/regla.types';
import { reglasService } from '../services/reglasService';

interface UseReglasReturn {
  // Data
  reglas: Regla[];
  selectedRegla: Regla | null;
  ejecuciones: ReglaEjecucion[];
  stats: ReglaStats | null;
  
  // Loading states
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  isTestingRegla: boolean;
  
  // Error state
  error: string | null;
  
  // Test results
  testResult: { success: boolean; result: string; actions: string[] } | null;
  
  // Actions
  loadReglas: () => Promise<void>;
  loadStats: () => Promise<void>;
  selectRegla: (regla: Regla | null) => void;
  createRegla: (data: CreateReglaRequest) => Promise<Regla>;
  updateRegla: (id: string, data: UpdateReglaRequest) => Promise<Regla>;
  deleteRegla: (id: string) => Promise<void>;
  toggleRegla: (id: string) => Promise<void>;
  duplicateRegla: (id: string) => Promise<Regla>;
  reorderReglas: (reorderedIds: string[]) => Promise<void>;
  loadEjecuciones: (reglaId?: string) => Promise<void>;
  testRegla: (id: string, testData: any) => Promise<void>;
  clearError: () => void;
  clearTestResult: () => void;
}

export const useReglas = (): UseReglasReturn => {
  // Data state
  const [reglas, setReglas] = useState<Regla[]>([]);
  const [selectedRegla, setSelectedRegla] = useState<Regla | null>(null);
  const [ejecuciones, setEjecuciones] = useState<ReglaEjecucion[]>([]);
  const [stats, setStats] = useState<ReglaStats | null>(null);
  
  // Loading states
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isTestingRegla, setIsTestingRegla] = useState(false);
  
  // Error and test states
  const [error, setError] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ success: boolean; result: string; actions: string[] } | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const clearTestResult = useCallback(() => {
    setTestResult(null);
  }, []);

  const loadReglas = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await reglasService.getReglas();
      setReglas(data);
    } catch (err) {
      setError('Error al cargar las reglas');
      console.error('Error loading reglas:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadStats = useCallback(async () => {
    try {
      const data = await reglasService.getStats();
      setStats(data);
    } catch (err) {
      console.error('Error loading stats:', err);
    }
  }, []);

  const selectRegla = useCallback((regla: Regla | null) => {
    setSelectedRegla(regla);
    setTestResult(null);
    
    if (regla) {
      loadEjecuciones(regla.id);
    } else {
      setEjecuciones([]);
    }
  }, []);

  const createRegla = useCallback(async (data: CreateReglaRequest): Promise<Regla> => {
    setIsCreating(true);
    setError(null);
    
    try {
      const newRegla = await reglasService.createRegla(data);
      setReglas(prev => [...prev, newRegla]);
      await loadStats(); // Reload stats after creating
      return newRegla;
    } catch (err) {
      setError('Error al crear la regla');
      console.error('Error creating regla:', err);
      throw err;
    } finally {
      setIsCreating(false);
    }
  }, [loadStats]);

  const updateRegla = useCallback(async (id: string, data: UpdateReglaRequest): Promise<Regla> => {
    setIsUpdating(true);
    setError(null);
    
    try {
      const updatedRegla = await reglasService.updateRegla(id, data);
      setReglas(prev => prev.map(regla => 
        regla.id === id ? updatedRegla : regla
      ));
      
      if (selectedRegla?.id === id) {
        setSelectedRegla(updatedRegla);
      }
      
      await loadStats(); // Reload stats after updating
      return updatedRegla;
    } catch (err) {
      setError('Error al actualizar la regla');
      console.error('Error updating regla:', err);
      throw err;
    } finally {
      setIsUpdating(false);
    }
  }, [selectedRegla, loadStats]);

  const deleteRegla = useCallback(async (id: string): Promise<void> => {
    setIsDeleting(true);
    setError(null);
    
    try {
      await reglasService.deleteRegla(id);
      setReglas(prev => prev.filter(regla => regla.id !== id));
      
      if (selectedRegla?.id === id) {
        setSelectedRegla(null);
        setEjecuciones([]);
      }
      
      await loadStats(); // Reload stats after deleting
    } catch (err) {
      setError('Error al eliminar la regla');
      console.error('Error deleting regla:', err);
      throw err;
    } finally {
      setIsDeleting(false);
    }
  }, [selectedRegla, loadStats]);

  const toggleRegla = useCallback(async (id: string): Promise<void> => {
    setError(null);
    
    try {
      const updatedRegla = await reglasService.toggleRegla(id);
      setReglas(prev => prev.map(regla => 
        regla.id === id ? updatedRegla : regla
      ));
      
      if (selectedRegla?.id === id) {
        setSelectedRegla(updatedRegla);
      }
      
      await loadStats(); // Reload stats after toggling
    } catch (err) {
      setError('Error al cambiar el estado de la regla');
      console.error('Error toggling regla:', err);
      throw err;
    }
  }, [selectedRegla, loadStats]);

  const duplicateRegla = useCallback(async (id: string): Promise<Regla> => {
    setError(null);
    
    try {
      const duplicatedRegla = await reglasService.duplicateRegla(id);
      setReglas(prev => [...prev, duplicatedRegla]);
      await loadStats(); // Reload stats after duplicating
      return duplicatedRegla;
    } catch (err) {
      setError('Error al duplicar la regla');
      console.error('Error duplicating regla:', err);
      throw err;
    }
  }, [loadStats]);

  const reorderReglas = useCallback(async (reorderedIds: string[]): Promise<void> => {
    setError(null);
    
    try {
      const reorderedReglas = await reglasService.reorderReglas(reorderedIds);
      setReglas(reorderedReglas);
    } catch (err) {
      setError('Error al reordenar las reglas');
      console.error('Error reordering reglas:', err);
      throw err;
    }
  }, []);

  const loadEjecuciones = useCallback(async (reglaId?: string): Promise<void> => {
    try {
      const data = await reglasService.getEjecuciones(reglaId);
      setEjecuciones(data);
    } catch (err) {
      setError('Error al cargar las ejecuciones');
      console.error('Error loading ejecuciones:', err);
    }
  }, []);

  const testRegla = useCallback(async (id: string, testData: any): Promise<void> => {
    setIsTestingRegla(true);
    setError(null);
    setTestResult(null);
    
    try {
      const result = await reglasService.testRegla(id, testData);
      setTestResult(result);
    } catch (err) {
      setError('Error al probar la regla');
      console.error('Error testing regla:', err);
    } finally {
      setIsTestingRegla(false);
    }
  }, []);

  // Auto-refresh stats every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (stats) {
        loadStats();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [stats, loadStats]);

  // Load initial data on mount
  useEffect(() => {
    loadReglas();
    loadStats();
  }, [loadReglas, loadStats]);

  return {
    // Data
    reglas,
    selectedRegla,
    ejecuciones,
    stats,
    
    // Loading states
    isLoading,
    isCreating,
    isUpdating,
    isDeleting,
    isTestingRegla,
    
    // Error state
    error,
    
    // Test results
    testResult,
    
    // Actions
    loadReglas,
    loadStats,
    selectRegla,
    createRegla,
    updateRegla,
    deleteRegla,
    toggleRegla,
    duplicateRegla,
    reorderReglas,
    loadEjecuciones,
    testRegla,
    clearError,
    clearTestResult
  };
};