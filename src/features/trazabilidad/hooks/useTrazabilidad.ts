import { useState, useEffect, useCallback } from 'react';
import { 
  trazabilidadService, 
  Producto, 
  TrazabilidadFilters, 
  TrazabilidadStats, 
  TrazabilidadResponse 
} from '../services/trazabilidadService';

interface UseTrazabilidad {
  // Data
  productos: Producto[];
  stats: TrazabilidadStats | null;
  
  // Pagination
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
  
  // Filters
  filters: TrazabilidadFilters;
  
  // Loading states
  loading: boolean;
  loadingStats: boolean;
  creating: boolean;
  updating: boolean;
  deleting: boolean;
  
  // Error handling
  error: string | null;
  
  // Actions
  fetchProductos: (newFilters?: TrazabilidadFilters, page?: number) => Promise<void>;
  createProducto: (data: Omit<Producto, 'id' | 'fechaCreacion' | 'fechaActualizacion' | 'historial' | 'alertas' | 'codigoQR'>) => Promise<Producto | null>;
  updateProducto: (id: string, data: Partial<Producto>) => Promise<Producto | null>;
  deleteProducto: (id: string) => Promise<boolean>;
  addHistoryEvent: (id: string, evento: {
    evento: string;
    descripcion: string;
    ubicacion: string;
    usuario: string;
    temperatura?: number;
    humedad?: number;
  }) => Promise<void>;
  resolveAlert: (id: string, alertId: string) => Promise<void>;
  updateFilters: (newFilters: TrazabilidadFilters) => void;
  nextPage: () => void;
  prevPage: () => void;
  goToPage: (page: number) => void;
  
  // Utility
  refreshStats: () => Promise<void>;
  generateQRCode: (id: string) => Promise<string>;
  exportData: (filters?: TrazabilidadFilters) => Promise<Blob>;
  clearError: () => void;
}

export const useTrazabilidad = (
  initialFilters: TrazabilidadFilters = {},
  initialPage = 1,
  itemsPerPage = 20
): UseTrazabilidad => {
  // State
  const [productos, setProductos] = useState<Producto[]>([]);
  const [stats, setStats] = useState<TrazabilidadStats | null>(null);
  const [filters, setFilters] = useState<TrazabilidadFilters>(initialFilters);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [totalItems, setTotalItems] = useState(0);
  
  // Loading states
  const [loading, setLoading] = useState(true);
  const [loadingStats, setLoadingStats] = useState(false);
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  
  // Error handling
  const [error, setError] = useState<string | null>(null);

  // Calculated values
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Fetch productos
  const fetchProductos = useCallback(async (
    newFilters?: TrazabilidadFilters, 
    page?: number
  ) => {
    try {
      setLoading(true);
      setError(null);
      
      const filtersToUse = newFilters || filters;
      const pageToUse = page || currentPage;
      
      const response: TrazabilidadResponse = await trazabilidadService.getProductos(
        filtersToUse,
        pageToUse,
        itemsPerPage
      );
      
      setProductos(response.data);
      setTotalItems(response.total);
      
      if (newFilters !== undefined) {
        setFilters(filtersToUse);
      }
      if (page !== undefined) {
        setCurrentPage(pageToUse);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar productos');
      console.error('Error fetching productos:', err);
    } finally {
      setLoading(false);
    }
  }, [filters, currentPage, itemsPerPage]);

  // Refresh stats
  const refreshStats = useCallback(async () => {
    try {
      setLoadingStats(true);
      const newStats = await trazabilidadService.getStats();
      setStats(newStats);
    } catch (err) {
      console.error('Error refreshing stats:', err);
      // Don't set error for stats as it's non-critical
    } finally {
      setLoadingStats(false);
    }
  }, []);

  // Create producto
  const createProducto = useCallback(async (
    data: Omit<Producto, 'id' | 'fechaCreacion' | 'fechaActualizacion' | 'historial' | 'alertas' | 'codigoQR'>
  ): Promise<Producto | null> => {
    try {
      setCreating(true);
      setError(null);

      // Validate required fields
      if (!data.codigo || !data.nombre || !data.categoria) {
        throw new Error('Faltan campos requeridos: código, nombre y categoría');
      }

      if (!data.proveedor?.nombre || !data.fechas?.fabricacion || !data.fechas?.caducidad) {
        throw new Error('Faltan datos del proveedor o fechas');
      }

      const newProducto = await trazabilidadService.createProducto(data);
      
      // Add to local state
      setProductos(prev => [newProducto, ...prev]);
      
      // Refresh stats and refetch to ensure consistency
      await refreshStats();
      
      return newProducto;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear producto';
      setError(errorMessage);
      console.error('Error creating producto:', err);
      return null;
    } finally {
      setCreating(false);
    }
  }, [refreshStats]);

  // Update producto
  const updateProducto = useCallback(async (id: string, data: Partial<Producto>): Promise<Producto | null> => {
    try {
      setUpdating(true);
      setError(null);

      const updatedProducto = await trazabilidadService.updateProducto(id, data);
      
      if (!updatedProducto) {
        throw new Error('No se pudo actualizar el producto');
      }
      
      // Update local state
      setProductos(prev => 
        prev.map(producto => 
          producto.id === id ? updatedProducto : producto
        )
      );
      
      // Refresh stats
      await refreshStats();
      
      return updatedProducto;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar producto';
      setError(errorMessage);
      console.error('Error updating producto:', err);
      return null;
    } finally {
      setUpdating(false);
    }
  }, [refreshStats]);

  // Delete producto
  const deleteProducto = useCallback(async (id: string): Promise<boolean> => {
    try {
      setDeleting(true);
      setError(null);

      const success = await trazabilidadService.deleteProducto(id);
      
      if (!success) {
        throw new Error('No se pudo eliminar el producto');
      }
      
      // Remove from local state
      setProductos(prev => prev.filter(producto => producto.id !== id));
      setTotalItems(prev => prev - 1);
      
      // Refresh stats
      await refreshStats();
      
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al eliminar producto';
      setError(errorMessage);
      console.error('Error deleting producto:', err);
      return false;
    } finally {
      setDeleting(false);
    }
  }, [refreshStats]);

  // Add history event
  const addHistoryEvent = useCallback(async (id: string, evento: {
    evento: string;
    descripcion: string;
    ubicacion: string;
    usuario: string;
    temperatura?: number;
    humedad?: number;
  }): Promise<void> => {
    try {
      const updatedProducto = await trazabilidadService.addHistoryEvent(id, evento);
      
      if (updatedProducto) {
        // Update local state
        setProductos(prev => 
          prev.map(producto => 
            producto.id === id ? updatedProducto : producto
          )
        );
      }
    } catch (err) {
      console.error('Error adding history event:', err);
      // Don't set error for history events as it's non-critical
    }
  }, []);

  // Resolve alert
  const resolveAlert = useCallback(async (id: string, alertId: string): Promise<void> => {
    try {
      const success = await trazabilidadService.resolveAlert(id, alertId);
      
      if (success) {
        // Update local state - mark alert as resolved
        setProductos(prev => 
          prev.map(producto => 
            producto.id === id 
              ? {
                  ...producto,
                  alertas: producto.alertas.map(alerta =>
                    alerta.id === alertId 
                      ? { ...alerta, estado: 'resuelta' as const }
                      : alerta
                  )
                }
              : producto
          )
        );
        
        // Refresh stats
        await refreshStats();
      }
    } catch (err) {
      console.error('Error resolving alert:', err);
    }
  }, [refreshStats]);

  // Update filters
  const updateFilters = useCallback((newFilters: TrazabilidadFilters) => {
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

  // Generate QR Code
  const generateQRCode = useCallback(async (id: string): Promise<string> => {
    try {
      return await trazabilidadService.generateQRCode(id);
    } catch (err) {
      console.error('Error generating QR code:', err);
      throw err;
    }
  }, []);

  // Export data
  const exportData = useCallback(async (exportFilters?: TrazabilidadFilters): Promise<Blob> => {
    try {
      return await trazabilidadService.exportData(exportFilters || filters);
    } catch (err) {
      console.error('Error exporting data:', err);
      throw err;
    }
  }, [filters]);

  // Effect to fetch data when filters or page change
  useEffect(() => {
    fetchProductos(filters, currentPage);
  }, [filters, currentPage, fetchProductos]);

  // Initial stats fetch
  useEffect(() => {
    refreshStats();
  }, [refreshStats]);

  return {
    // Data
    productos,
    stats,
    
    // Pagination
    pagination: {
      currentPage,
      totalPages,
      totalItems,
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
    fetchProductos,
    createProducto,
    updateProducto,
    deleteProducto,
    addHistoryEvent,
    resolveAlert,
    updateFilters,
    nextPage,
    prevPage,
    goToPage,
    
    // Utility
    refreshStats,
    generateQRCode,
    exportData,
    clearError
  };
};

// Hook for single producto
export const useProducto = (id: string) => {
  const [producto, setProducto] = useState<Producto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducto = useCallback(async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const productoData = await trazabilidadService.getProducto(id);
      setProducto(productoData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar producto');
      console.error('Error fetching producto:', err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchProducto();
  }, [fetchProducto]);

  return {
    producto,
    loading,
    error,
    refetch: fetchProducto
  };
};

// Hook for alerts management
export const useAlertas = () => {
  const [alertas, setAlertas] = useState<Producto['alertas']>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAlertas = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get all productos and extract active alerts
      const response = await trazabilidadService.getProductos({}, 1, 1000);
      const allAlertas = response.data.flatMap(producto => 
        producto.alertas
          .filter(alerta => alerta.estado === 'activa')
          .map(alerta => ({
            ...alerta,
            productoId: producto.id,
            productoNombre: producto.nombre,
            productoCodigo: producto.codigo
          }))
      );
      
      setAlertas(allAlertas);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar alertas');
      console.error('Error fetching alertas:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const resolveAlerta = useCallback(async (productoId: string, alertaId: string) => {
    try {
      await trazabilidadService.resolveAlert(productoId, alertaId);
      await fetchAlertas(); // Refresh the list
    } catch (err) {
      console.error('Error resolving alerta:', err);
    }
  }, [fetchAlertas]);

  useEffect(() => {
    fetchAlertas();
  }, [fetchAlertas]);

  return {
    alertas,
    loading,
    error,
    resolveAlerta,
    refetch: fetchAlertas
  };
};

export default useTrazabilidad;