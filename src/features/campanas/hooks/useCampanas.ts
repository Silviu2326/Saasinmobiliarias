import { useState, useEffect, useCallback } from 'react';
import { campanasService, CampanasFilters, CampanaStats } from '../services/campanasService';
import { Campana } from '../index';

interface UseCampanasReturn {
  // Data
  campanas: Campana[];
  stats: CampanaStats;
  
  // Loading states
  loading: boolean;
  creating: boolean;
  updating: boolean;
  deleting: boolean;
  
  // Error handling
  error: string | null;
  
  // Actions
  fetchCampanas: (filters?: CampanasFilters) => Promise<void>;
  createCampana: (data: Partial<Campana>) => Promise<Campana | null>;
  updateCampana: (id: string, data: Partial<Campana>) => Promise<Campana | null>;
  deleteCampana: (id: string) => Promise<boolean>;
  duplicateCampana: (campana: Campana) => Promise<Campana | null>;
  toggleCampanaStatus: (campana: Campana) => Promise<Campana | null>;
  
  // Utility
  refreshStats: () => Promise<void>;
  clearError: () => void;
}

export const useCampanas = (initialFilters?: CampanasFilters): UseCampanasReturn => {
  // State
  const [campanas, setCampanas] = useState<Campana[]>([]);
  const [stats, setStats] = useState<CampanaStats>({
    total: 0,
    activas: 0,
    pausadas: 0,
    finalizadas: 0,
    borradores: 0,
    nuevas: 0,
    roiPromedio: 0,
    presupuestoTotal: 0,
    gastado: 0
  });
  
  // Loading states
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  
  // Error handling
  const [error, setError] = useState<string | null>(null);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Fetch campaigns
  const fetchCampanas = useCallback(async (filters?: CampanasFilters) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await campanasService.getCampanas(filters || initialFilters);
      setCampanas(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar campañas');
      console.error('Error fetching campanas:', err);
    } finally {
      setLoading(false);
    }
  }, [initialFilters]);

  // Refresh stats
  const refreshStats = useCallback(async () => {
    try {
      const newStats = await campanasService.getStats();
      setStats(newStats);
    } catch (err) {
      console.error('Error refreshing stats:', err);
      // Don't set error for stats refresh as it's non-critical
    }
  }, []);

  // Create campaign
  const createCampana = useCallback(async (data: Partial<Campana>): Promise<Campana | null> => {
    try {
      setCreating(true);
      setError(null);

      if (!data.nombre || !data.tipo || !data.fechaInicio || !data.fechaFin || !data.presupuesto) {
        throw new Error('Faltan campos requeridos para crear la campaña');
      }

      const createData = {
        nombre: data.nombre,
        tipo: data.tipo as 'email' | 'sms' | 'portales' | 'rpa',
        fechaInicio: data.fechaInicio,
        fechaFin: data.fechaFin,
        presupuesto: data.presupuesto,
        segmentacion: data.segmentacion || [],
        estado: data.estado || 'borrador' as const
      };

      const newCampana = await campanasService.createCampana(createData);
      
      // Add to local state
      setCampanas(prev => [newCampana, ...prev]);
      
      // Refresh stats
      await refreshStats();
      
      return newCampana;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear campaña';
      setError(errorMessage);
      console.error('Error creating campana:', err);
      return null;
    } finally {
      setCreating(false);
    }
  }, [refreshStats]);

  // Update campaign
  const updateCampana = useCallback(async (id: string, data: Partial<Campana>): Promise<Campana | null> => {
    try {
      setUpdating(true);
      setError(null);

      const updateData = {
        ...(data.nombre && { nombre: data.nombre }),
        ...(data.tipo && { tipo: data.tipo }),
        ...(data.fechaInicio && { fechaInicio: data.fechaInicio }),
        ...(data.fechaFin && { fechaFin: data.fechaFin }),
        ...(data.presupuesto !== undefined && { presupuesto: data.presupuesto }),
        ...(data.segmentacion && { segmentacion: data.segmentacion }),
        ...(data.estado && { estado: data.estado })
      };

      const updatedCampana = await campanasService.updateCampana(id, updateData);
      
      // Update local state
      setCampanas(prev => 
        prev.map(campana => 
          campana.id === id ? updatedCampana : campana
        )
      );
      
      // Refresh stats
      await refreshStats();
      
      return updatedCampana;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar campaña';
      setError(errorMessage);
      console.error('Error updating campana:', err);
      return null;
    } finally {
      setUpdating(false);
    }
  }, [refreshStats]);

  // Delete campaign
  const deleteCampana = useCallback(async (id: string): Promise<boolean> => {
    try {
      setDeleting(true);
      setError(null);

      await campanasService.deleteCampana(id);
      
      // Remove from local state
      setCampanas(prev => prev.filter(campana => campana.id !== id));
      
      // Refresh stats
      await refreshStats();
      
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al eliminar campaña';
      setError(errorMessage);
      console.error('Error deleting campana:', err);
      return false;
    } finally {
      setDeleting(false);
    }
  }, [refreshStats]);

  // Duplicate campaign
  const duplicateCampana = useCallback(async (campana: Campana): Promise<Campana | null> => {
    try {
      setCreating(true);
      setError(null);

      const duplicatedCampana = await campanasService.duplicateCampana(
        campana.id, 
        `${campana.nombre} (Copia)`
      );
      
      // Add to local state
      setCampanas(prev => [duplicatedCampana, ...prev]);
      
      // Refresh stats
      await refreshStats();
      
      return duplicatedCampana;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al duplicar campaña';
      setError(errorMessage);
      console.error('Error duplicating campana:', err);
      return null;
    } finally {
      setCreating(false);
    }
  }, [refreshStats]);

  // Toggle campaign status
  const toggleCampanaStatus = useCallback(async (campana: Campana): Promise<Campana | null> => {
    try {
      setUpdating(true);
      setError(null);

      const newStatus = campana.estado === 'activa' ? 'pausada' : 'activa';
      const updatedCampana = await campanasService.toggleCampanaStatus(campana.id, newStatus);
      
      // Update local state
      setCampanas(prev => 
        prev.map(c => 
          c.id === campana.id ? updatedCampana : c
        )
      );
      
      // Refresh stats
      await refreshStats();
      
      return updatedCampana;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cambiar estado de campaña';
      setError(errorMessage);
      console.error('Error toggling campana status:', err);
      return null;
    } finally {
      setUpdating(false);
    }
  }, [refreshStats]);

  // Initial fetch
  useEffect(() => {
    fetchCampanas();
    refreshStats();
  }, [fetchCampanas, refreshStats]);

  return {
    // Data
    campanas,
    stats,
    
    // Loading states
    loading,
    creating,
    updating,
    deleting,
    
    // Error handling
    error,
    
    // Actions
    fetchCampanas,
    createCampana,
    updateCampana,
    deleteCampana,
    duplicateCampana,
    toggleCampanaStatus,
    
    // Utility
    refreshStats,
    clearError
  };
};

// Hook for single campaign
export const useCampana = (id: string) => {
  const [campana, setCampana] = useState<Campana | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCampana = useCallback(async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const campaignData = await campanasService.getCampana(id);
      setCampana(campaignData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar campaña');
      console.error('Error fetching campana:', err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchCampana();
  }, [fetchCampana]);

  return {
    campana,
    loading,
    error,
    refetch: fetchCampana
  };
};

// Hook for campaign metrics
export const useCampanaMetrics = (id: string, dateRange?: { from: string; to: string }) => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = useCallback(async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const metricsData = await campanasService.getCampanaMetrics(id, dateRange);
      setMetrics(metricsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar métricas');
      console.error('Error fetching metrics:', err);
    } finally {
      setLoading(false);
    }
  }, [id, dateRange]);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  return {
    metrics,
    loading,
    error,
    refetch: fetchMetrics
  };
};

// Hook for campaign templates
export const useCampanaTemplates = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTemplates = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const templatesData = await campanasService.getCampanaTemplates();
      setTemplates(templatesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar plantillas');
      console.error('Error fetching templates:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  return {
    templates,
    loading,
    error,
    refetch: fetchTemplates
  };
};

export default useCampanas;