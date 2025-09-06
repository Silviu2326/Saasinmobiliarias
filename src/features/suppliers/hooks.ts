import { useState, useEffect } from 'react';
import { Supplier, SupplierFilters, SupplierFormData, AttachPropertyData, SupplierService, PropertyAttachment } from './types';
import { getSuppliers, getSupplier, createSupplier, updateSupplier, deleteSupplier, bulkDeleteSuppliers, getSupplierServices, attachProperty, getSupplierProperties, importSuppliers, exportSuppliers } from './apis';

interface UseSupplierQueryOptions {
  filters?: SupplierFilters;
  enabled?: boolean;
}

interface UseSupplierQueryReturn {
  suppliers: Supplier[];
  total: number;
  page: number;
  size: number;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useSuppliersQuery({ filters = {}, enabled = true }: UseSupplierQueryOptions = {}): UseSupplierQueryReturn {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(filters.page || 1);
  const [size, setSize] = useState(filters.size || 20);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSuppliers = async () => {
    if (!enabled) return;
    
    setIsLoading(true);
    setError(null);

    try {
      const result = await getSuppliers(filters);
      setSuppliers(result.data);
      setTotal(result.total);
      setPage(result.page);
      setSize(result.size);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar proveedores');
      setSuppliers([]);
      setTotal(0);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, [enabled, JSON.stringify(filters)]);

  return {
    suppliers,
    total,
    page,
    size,
    isLoading,
    error,
    refetch: fetchSuppliers
  };
}

interface UseSupplierDetailReturn {
  supplier: Supplier | null;
  services: SupplierService[];
  properties: PropertyAttachment[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useSupplierDetail(id: string): UseSupplierDetailReturn {
  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [services, setServices] = useState<SupplierService[]>([]);
  const [properties, setProperties] = useState<PropertyAttachment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    if (!id) return;
    
    setIsLoading(true);
    setError(null);

    try {
      const [supplierData, servicesData, propertiesData] = await Promise.all([
        getSupplier(id),
        getSupplierServices(id),
        getSupplierProperties(id)
      ]);

      setSupplier(supplierData);
      setServices(servicesData);
      setProperties(propertiesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar detalles del proveedor');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  return {
    supplier,
    services,
    properties,
    isLoading,
    error,
    refetch: fetchData
  };
}

interface MutationState {
  isLoading: boolean;
  error: string | null;
}

interface MutationFunction<TData, TVariables> {
  mutate: (variables: TVariables) => Promise<TData>;
  isLoading: boolean;
  error: string | null;
}

function useMutation<TData, TVariables>(
  mutationFn: (variables: TVariables) => Promise<TData>
): MutationFunction<TData, TVariables> {
  const [state, setState] = useState<MutationState>({
    isLoading: false,
    error: null
  });

  const mutate = async (variables: TVariables): Promise<TData> => {
    setState({ isLoading: true, error: null });
    
    try {
      const result = await mutationFn(variables);
      setState({ isLoading: false, error: null });
      return result;
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Error desconocido';
      setState({ isLoading: false, error });
      throw err;
    }
  };

  return {
    mutate,
    isLoading: state.isLoading,
    error: state.error
  };
}

export function useSuppliersMutations() {
  const createMutation = useMutation(createSupplier);
  const updateMutation = useMutation(({ id, data }: { id: string; data: Partial<SupplierFormData> }) => 
    updateSupplier(id, data)
  );
  const deleteMutation = useMutation(deleteSupplier);
  const bulkDeleteMutation = useMutation(bulkDeleteSuppliers);
  const attachPropertyMutation = useMutation(attachProperty);
  const importMutation = useMutation(importSuppliers);
  const exportMutation = useMutation(exportSuppliers);

  return {
    createMutation,
    updateMutation,
    deleteMutation,
    bulkDeleteMutation,
    attachPropertyMutation,
    importMutation,
    exportMutation
  };
}