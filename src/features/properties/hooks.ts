import { useState, useEffect, useCallback, useMemo } from 'react';
import { Property, PropertyFilters, PropertiesResponse, PropertyFormData } from './types';
import { 
  getProperties, 
  getProperty, 
  createProperty, 
  updateProperty, 
  deleteProperty, 
  publishProperty,
  bulkDeleteProperties,
  bulkUpdateProperties,
  exportProperties,
  importProperties 
} from './apis';
import { debounce } from './utils';

interface UsePropertiesQueryOptions {
  filters?: PropertyFilters;
  enabled?: boolean;
  refetchInterval?: number;
}

interface UsePropertiesQueryResult {
  data: PropertiesResponse | null;
  properties: Property[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export function usePropertiesQuery(options: UsePropertiesQueryOptions = {}): UsePropertiesQueryResult {
  const { filters = {}, enabled = true, refetchInterval } = options;
  
  const [data, setData] = useState<PropertiesResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Memoize filters to prevent unnecessary re-renders
  const memoizedFilters = useMemo(() => filters, [
    filters.q,
    filters.estado,
    filters.tipo,
    filters.ciudad,
    filters.priceMin,
    filters.priceMax,
    filters.habitaciones,
    filters.exclusiva,
    filters.agente,
    filters.portalSync,
    filters.page,
    filters.size,
    filters.sort
  ]);

  const fetchProperties = useCallback(async () => {
    if (!enabled) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await getProperties(memoizedFilters);
      setData(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar propiedades');
      console.error('Error fetching properties:', err);
    } finally {
      setIsLoading(false);
    }
  }, [memoizedFilters, enabled]);

  const debouncedFetch = useMemo(() => debounce(fetchProperties, 300), [fetchProperties]);

  useEffect(() => {
    debouncedFetch();
  }, [debouncedFetch]);

  useEffect(() => {
    if (refetchInterval && refetchInterval > 0) {
      const interval = setInterval(fetchProperties, refetchInterval);
      return () => clearInterval(interval);
    }
  }, [refetchInterval, fetchProperties]);

  const hasNextPage = useMemo(() => {
    return data ? data.page < data.totalPages - 1 : false;
  }, [data]);

  const hasPreviousPage = useMemo(() => {
    return data ? data.page > 0 : false;
  }, [data]);

  return {
    data,
    properties: data?.data || [],
    isLoading,
    error,
    refetch: fetchProperties,
    hasNextPage,
    hasPreviousPage
  };
}

interface UsePropertyQueryResult {
  property: Property | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function usePropertyQuery(id: string): UsePropertyQueryResult {
  const [property, setProperty] = useState<Property | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProperty = useCallback(async () => {
    if (!id) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await getProperty(id);
      setProperty(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar propiedad');
      console.error('Error fetching property:', err);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchProperty();
  }, [fetchProperty]);

  return {
    property,
    isLoading,
    error,
    refetch: fetchProperty
  };
}

interface UsePropertiesMutationsResult {
  createMutation: {
    mutate: (data: PropertyFormData) => Promise<Property>;
    isLoading: boolean;
    error: string | null;
  };
  updateMutation: {
    mutate: (id: string, data: Partial<PropertyFormData>) => Promise<Property>;
    isLoading: boolean;
    error: string | null;
  };
  deleteMutation: {
    mutate: (id: string) => Promise<void>;
    isLoading: boolean;
    error: string | null;
  };
  publishMutation: {
    mutate: (id: string, portals?: string[]) => Promise<Property>;
    isLoading: boolean;
    error: string | null;
  };
  bulkDeleteMutation: {
    mutate: (ids: string[]) => Promise<void>;
    isLoading: boolean;
    error: string | null;
  };
  bulkUpdateMutation: {
    mutate: (ids: string[], updates: Partial<Property>) => Promise<void>;
    isLoading: boolean;
    error: string | null;
  };
  exportMutation: {
    mutate: (filters?: PropertyFilters) => Promise<void>;
    isLoading: boolean;
    error: string | null;
  };
  importMutation: {
    mutate: (file: File) => Promise<{ success: number; errors: number; messages: string[] }>;
    isLoading: boolean;
    error: string | null;
  };
}

export function usePropertiesMutations(): UsePropertiesMutationsResult {
  const [loadingStates, setLoadingStates] = useState({
    create: false,
    update: false,
    delete: false,
    publish: false,
    bulkDelete: false,
    bulkUpdate: false,
    export: false,
    import: false,
  });

  const [errors, setErrors] = useState({
    create: null as string | null,
    update: null as string | null,
    delete: null as string | null,
    publish: null as string | null,
    bulkDelete: null as string | null,
    bulkUpdate: null as string | null,
    export: null as string | null,
    import: null as string | null,
  });

  const setLoading = (key: keyof typeof loadingStates, value: boolean) => {
    setLoadingStates(prev => ({ ...prev, [key]: value }));
  };

  const setError = (key: keyof typeof errors, value: string | null) => {
    setErrors(prev => ({ ...prev, [key]: value }));
  };

  const createMutation = {
    mutate: async (data: PropertyFormData) => {
      setLoading('create', true);
      setError('create', null);
      
      try {
        const result = await createProperty(data);
        return result;
      } catch (err) {
        const error = err instanceof Error ? err.message : 'Error al crear propiedad';
        setError('create', error);
        throw err;
      } finally {
        setLoading('create', false);
      }
    },
    isLoading: loadingStates.create,
    error: errors.create
  };

  const updateMutation = {
    mutate: async (id: string, data: Partial<PropertyFormData>) => {
      setLoading('update', true);
      setError('update', null);
      
      try {
        const result = await updateProperty(id, data);
        return result;
      } catch (err) {
        const error = err instanceof Error ? err.message : 'Error al actualizar propiedad';
        setError('update', error);
        throw err;
      } finally {
        setLoading('update', false);
      }
    },
    isLoading: loadingStates.update,
    error: errors.update
  };

  const deleteMutation = {
    mutate: async (id: string) => {
      setLoading('delete', true);
      setError('delete', null);
      
      try {
        await deleteProperty(id);
      } catch (err) {
        const error = err instanceof Error ? err.message : 'Error al eliminar propiedad';
        setError('delete', error);
        throw err;
      } finally {
        setLoading('delete', false);
      }
    },
    isLoading: loadingStates.delete,
    error: errors.delete
  };

  const publishMutation = {
    mutate: async (id: string, portals?: string[]) => {
      setLoading('publish', true);
      setError('publish', null);
      
      try {
        const result = await publishProperty(id, portals);
        return result;
      } catch (err) {
        const error = err instanceof Error ? err.message : 'Error al publicar propiedad';
        setError('publish', error);
        throw err;
      } finally {
        setLoading('publish', false);
      }
    },
    isLoading: loadingStates.publish,
    error: errors.publish
  };

  const bulkDeleteMutation = {
    mutate: async (ids: string[]) => {
      setLoading('bulkDelete', true);
      setError('bulkDelete', null);
      
      try {
        await bulkDeleteProperties(ids);
      } catch (err) {
        const error = err instanceof Error ? err.message : 'Error al eliminar propiedades';
        setError('bulkDelete', error);
        throw err;
      } finally {
        setLoading('bulkDelete', false);
      }
    },
    isLoading: loadingStates.bulkDelete,
    error: errors.bulkDelete
  };

  const bulkUpdateMutation = {
    mutate: async (ids: string[], updates: Partial<Property>) => {
      setLoading('bulkUpdate', true);
      setError('bulkUpdate', null);
      
      try {
        await bulkUpdateProperties(ids, updates);
      } catch (err) {
        const error = err instanceof Error ? err.message : 'Error al actualizar propiedades';
        setError('bulkUpdate', error);
        throw err;
      } finally {
        setLoading('bulkUpdate', false);
      }
    },
    isLoading: loadingStates.bulkUpdate,
    error: errors.bulkUpdate
  };

  const exportMutation = {
    mutate: async (filters?: PropertyFilters) => {
      setLoading('export', true);
      setError('export', null);
      
      try {
        await exportProperties(filters);
      } catch (err) {
        const error = err instanceof Error ? err.message : 'Error al exportar propiedades';
        setError('export', error);
        throw err;
      } finally {
        setLoading('export', false);
      }
    },
    isLoading: loadingStates.export,
    error: errors.export
  };

  const importMutation = {
    mutate: async (file: File) => {
      setLoading('import', true);
      setError('import', null);
      
      try {
        const result = await importProperties(file);
        return result;
      } catch (err) {
        const error = err instanceof Error ? err.message : 'Error al importar propiedades';
        setError('import', error);
        throw err;
      } finally {
        setLoading('import', false);
      }
    },
    isLoading: loadingStates.import,
    error: errors.import
  };

  return {
    createMutation,
    updateMutation,
    deleteMutation,
    publishMutation,
    bulkDeleteMutation,
    bulkUpdateMutation,
    exportMutation,
    importMutation
  };
}