import { useState, useEffect, useCallback } from 'react';
import { coExclusivasService, CoExclusivasResponse, CoExclusivasStats } from '../services/coExclusivasService';
import { CoExclusiva, CoExclusivasFilters } from '../index';

interface UseCoExclusivas {
  // Data
  propiedades: CoExclusiva[];
  stats: CoExclusivasStats | null;
  
  // Pagination
  pagination: {
    currentPage: number;
    totalPages: number;
    total: number;
    itemsPerPage: number;
  };
  
  // Filters
  filters: CoExclusivasFilters;
  
  // Loading states
  loading: boolean;
  loadingStats: boolean;
  creating: boolean;
  updating: boolean;
  deleting: boolean;
  
  // Error handling
  error: string | null;
  
  // Actions
  fetchPropiedades: (newFilters?: CoExclusivasFilters, page?: number) => Promise<void>;
  createProperty: (data: Partial<CoExclusiva>) => Promise<CoExclusiva | null>;
  updateProperty: (id: string, data: Partial<CoExclusiva>) => Promise<CoExclusiva | null>;
  deleteProperty: (id: string) => Promise<boolean>;
  toggleFavorite: (id: string) => Promise<void>;
  updateFilters: (newFilters: CoExclusivasFilters) => void;
  nextPage: () => void;
  prevPage: () => void;
  goToPage: (page: number) => void;
  
  // Utility
  refreshStats: () => Promise<void>;
  clearError: () => void;
}

export const useCoExclusivas = (
  initialFilters: CoExclusivasFilters = {},
  initialPage = 1,
  itemsPerPage = 20
): UseCoExclusivas => {
  // State
  const [propiedades, setPropiedades] = useState<CoExclusiva[]>([]);
  const [stats, setStats] = useState<CoExclusivasStats | null>(null);
  const [filters, setFilters] = useState<CoExclusivasFilters>(initialFilters);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [total, setTotal] = useState(0);
  
  // Loading states
  const [loading, setLoading] = useState(true);
  const [loadingStats, setLoadingStats] = useState(false);
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  
  // Error handling
  const [error, setError] = useState<string | null>(null);

  // Calculated values
  const totalPages = Math.ceil(total / itemsPerPage);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Fetch properties
  const fetchPropiedades = useCallback(async (
    newFilters?: CoExclusivasFilters, 
    page?: number
  ) => {
    try {
      setLoading(true);
      setError(null);
      
      const filtersToUse = newFilters || filters;
      const pageToUse = page || currentPage;
      
      const response: CoExclusivasResponse = await coExclusivasService.getCoExclusivas(
        filtersToUse,
        pageToUse,
        itemsPerPage
      );
      
      setPropiedades(response.coExclusivas);
      setTotal(response.pagination.total);
      
      if (newFilters !== undefined) {
        setFilters(filtersToUse);
      }
      if (page !== undefined) {
        setCurrentPage(pageToUse);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar propiedades');
      console.error('Error fetching properties:', err);
    } finally {
      setLoading(false);
    }
  }, [filters, currentPage, itemsPerPage]);

  // Refresh stats
  const refreshStats = useCallback(async () => {
    try {
      setLoadingStats(true);
      const newStats = await coExclusivasService.getStats();
      setStats(newStats);
    } catch (err) {
      console.error('Error refreshing stats:', err);
      // Don't set error for stats as it's non-critical
    } finally {
      setLoadingStats(false);
    }
  }, []);

  // Create property
  const createProperty = useCallback(async (data: Partial<CoExclusiva>): Promise<CoExclusiva | null> => {
    try {
      setCreating(true);
      setError(null);

      if (!data.titulo || !data.precio || !data.ubicacion || !data.tipo) {
        throw new Error('Faltan campos requeridos para crear la propiedad');
      }

      const createData = {
        titulo: data.titulo,
        descripcion: data.descripcion || '',
        precio: data.precio,
        ubicacion: data.ubicacion,
        tipo: data.tipo as 'piso' | 'chalet' | 'local' | 'oficina' | 'terreno' | 'garaje',
        caracteristicas: data.caracteristicas || {
          habitaciones: 0,
          banos: 0,
          superficie: 0
        },
        imagenes: data.imagenes || [],
        colaboracion: data.colaboracion || {
          porcentajeHonorarios: 3.0,
          condiciones: '',
          tipoColaboracion: 'venta'
        },
        agencia: data.agencia || {
          nombre: '',
          contacto: '',
          telefono: '',
          email: ''
        },
        destacada: data.destacada || false
      };

      const newProperty = await coExclusivasService.createCoExclusiva(createData);
      
      // Add to local state
      setPropiedades(prev => [newProperty, ...prev]);
      
      // Refresh stats and refetch to ensure consistency
      await refreshStats();
      
      return newProperty;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear propiedad';
      setError(errorMessage);
      console.error('Error creating property:', err);
      return null;
    } finally {
      setCreating(false);
    }
  }, [refreshStats]);

  // Update property
  const updateProperty = useCallback(async (id: string, data: Partial<CoExclusiva>): Promise<CoExclusiva | null> => {
    try {
      setUpdating(true);
      setError(null);

      const updateData = {
        ...(data.titulo && { titulo: data.titulo }),
        ...(data.descripcion !== undefined && { descripcion: data.descripcion }),
        ...(data.precio !== undefined && { precio: data.precio }),
        ...(data.ubicacion && { ubicacion: data.ubicacion }),
        ...(data.tipo && { tipo: data.tipo }),
        ...(data.caracteristicas && { caracteristicas: data.caracteristicas }),
        ...(data.imagenes && { imagenes: data.imagenes }),
        ...(data.colaboracion && { colaboracion: data.colaboracion }),
        ...(data.agencia && { agencia: data.agencia }),
        ...(data.destacada !== undefined && { destacada: data.destacada })
      };

      const updatedProperty = await coExclusivasService.updateCoExclusiva(id, updateData);
      
      // Update local state
      setPropiedades(prev => 
        prev.map(prop => 
          prop.id === id ? updatedProperty : prop
        )
      );
      
      // Refresh stats
      await refreshStats();
      
      return updatedProperty;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar propiedad';
      setError(errorMessage);
      console.error('Error updating property:', err);
      return null;
    } finally {
      setUpdating(false);
    }
  }, [refreshStats]);

  // Delete property
  const deleteProperty = useCallback(async (id: string): Promise<boolean> => {
    try {
      setDeleting(true);
      setError(null);

      await coExclusivasService.deleteCoExclusiva(id);
      
      // Remove from local state
      setPropiedades(prev => prev.filter(prop => prop.id !== id));
      setTotal(prev => prev - 1);
      
      // Refresh stats
      await refreshStats();
      
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al eliminar propiedad';
      setError(errorMessage);
      console.error('Error deleting property:', err);
      return false;
    } finally {
      setDeleting(false);
    }
  }, [refreshStats]);

  // Toggle favorite
  const toggleFavorite = useCallback(async (id: string): Promise<void> => {
    try {
      const updatedProperty = await coExclusivasService.toggleFavorite(id);
      
      // Update local state
      setPropiedades(prev => 
        prev.map(prop => 
          prop.id === id ? updatedProperty : prop
        )
      );
    } catch (err) {
      console.error('Error toggling favorite:', err);
      // Don't set error for favorites as it's non-critical
    }
  }, []);

  // Update filters
  const updateFilters = useCallback((newFilters: CoExclusivasFilters) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  }, []);

  // Pagination
  const nextPage = useCallback(() => {
    if (currentPage < totalPages) {
      const newPage = currentPage + 1;
      setCurrentPage(newPage);
    }
  }, [currentPage, totalPages]);

  const prevPage = useCallback(() => {
    if (currentPage > 1) {
      const newPage = currentPage - 1;
      setCurrentPage(newPage);
    }
  }, [currentPage]);

  const goToPage = useCallback((page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  }, [totalPages]);

  // Effect to fetch data when filters or page change
  useEffect(() => {
    fetchPropiedades(filters, currentPage);
  }, [filters, currentPage, fetchPropiedades]);

  // Initial stats fetch
  useEffect(() => {
    refreshStats();
  }, [refreshStats]);

  return {
    // Data
    propiedades,
    stats,
    
    // Pagination
    pagination: {
      currentPage,
      totalPages,
      total,
      itemsPerPage
    },
    
    // Filters
    filters,
    
    // Loading states
    loading,
    loadingStats,
    creating,
    updating,
    deleting,
    
    // Error handling
    error,
    
    // Actions
    fetchPropiedades,
    createProperty,
    updateProperty,
    deleteProperty,
    toggleFavorite,
    updateFilters,
    nextPage,
    prevPage,
    goToPage,
    
    // Utility
    refreshStats,
    clearError
  };
};

// Hook for single property
export const useCoExclusiva = (id: string) => {
  const [propiedad, setPropiedad] = useState<CoExclusiva | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPropiedad = useCallback(async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const propiedadData = await coExclusivasService.getCoExclusiva(id);
      setPropiedad(propiedadData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar propiedad');
      console.error('Error fetching property:', err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchPropiedad();
  }, [fetchPropiedad]);

  return {
    propiedad,
    loading,
    error,
    refetch: fetchPropiedad
  };
};

// Hook for collaboration requests
export const useCollaborationRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const requestsData = await coExclusivasService.getCollaborationRequests();
      setRequests(requestsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar solicitudes');
      console.error('Error fetching collaboration requests:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const respondToRequest = useCallback(async (
    requestId: string, 
    response: 'aceptada' | 'rechazada',
    mensaje?: string
  ) => {
    try {
      await coExclusivasService.respondToCollaborationRequest(requestId, response, mensaje);
      await fetchRequests(); // Refresh the list
      return { success: true };
    } catch (err) {
      console.error('Error responding to collaboration request:', err);
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Error al responder solicitud' 
      };
    }
  }, [fetchRequests]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  return {
    requests,
    loading,
    error,
    respondToRequest,
    refetch: fetchRequests
  };
};

// Hook for favorites
export const useFavorites = () => {
  const [favorites, setFavorites] = useState<CoExclusiva[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFavorites = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const favoritesData = await coExclusivasService.getFavorites();
      setFavorites(favoritesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar favoritos');
      console.error('Error fetching favorites:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const toggleFavorite = useCallback(async (id: string) => {
    try {
      await coExclusivasService.toggleFavorite(id);
      await fetchFavorites(); // Refresh the list
    } catch (err) {
      console.error('Error toggling favorite:', err);
    }
  }, [fetchFavorites]);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  return {
    favorites,
    loading,
    error,
    toggleFavorite,
    refetch: fetchFavorites
  };
};

// Hook for search
export const useSearch = () => {
  const [results, setResults] = useState<CoExclusiva[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(async (query: string, filters?: CoExclusivasFilters) => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const searchResults = await coExclusivasService.searchProperties(query, filters);
      setResults(searchResults);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error en la búsqueda');
      console.error('Error searching properties:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearResults = useCallback(() => {
    setResults([]);
    setError(null);
  }, []);

  return {
    results,
    loading,
    error,
    search,
    clearResults
  };
};

export default useCoExclusivas;