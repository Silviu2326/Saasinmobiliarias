import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Offer, 
  OffersFilters, 
  OffersResponse, 
  OfferStats, 
  OfferFormData, 
  CounterOfferFormData 
} from './types';
import { 
  getOffers, 
  createOffer, 
  updateOffer, 
  deleteOffer, 
  acceptOffer, 
  rejectOffer, 
  createCounterOffer,
  getOfferTimeline,
  bulkOfferAction,
  generateMockOffers 
} from './apis';
import { 
  parseFiltersFromQuery, 
  buildQueryFromFilters, 
  filterOffers, 
  sortOffers, 
  generateOfferStats 
} from './utils';

// Hook for managing offers list
export function useOffers() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [allOffers, setAllOffers] = useState<Offer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Parse filters from URL - memoized to prevent unnecessary re-renders
  const filters = useMemo(() => parseFiltersFromQuery(searchParams), [searchParams]);

  // Memoize filter values to prevent unnecessary re-renders
  const memoizedFilters = useMemo(() => ({
    q: filters.q,
    propertyId: filters.propertyId,
    clienteId: filters.clienteId,
    estado: filters.estado,
    precioMin: filters.precioMin,
    precioMax: filters.precioMax,
    agenteId: filters.agenteId,
    fechaDesde: filters.fechaDesde,
    fechaHasta: filters.fechaHasta,
    vencimiento: filters.vencimiento,
    page: filters.page,
    sortBy: filters.sortBy,
    sortOrder: filters.sortOrder
  }), [filters.q, filters.propertyId, filters.clienteId, filters.estado, filters.precioMin, filters.precioMax, filters.agenteId, filters.fechaDesde, filters.fechaHasta, filters.vencimiento, filters.page, filters.sortBy, filters.sortOrder]);

  // Load offers
  const loadOffers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // For demo purposes, use mock data
      const mockOffers = generateMockOffers(50);
      setAllOffers(mockOffers);
      
      // Apply client-side filtering and sorting
      let filteredOffers = filterOffers(mockOffers, memoizedFilters);
      
      if (memoizedFilters.sortBy) {
        filteredOffers = sortOffers(filteredOffers, memoizedFilters.sortBy, memoizedFilters.sortOrder);
      } else {
        filteredOffers = sortOffers(filteredOffers, 'createdAt', 'desc');
      }

      setOffers(filteredOffers);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading offers');
    } finally {
      setIsLoading(false);
    }
  }, [memoizedFilters]);

  // Update filters and URL
  const updateFilters = useCallback((newFilters: Partial<OffersFilters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    
    // Remove page when filters change
    if (Object.keys(newFilters).some(key => key !== 'page')) {
      delete updatedFilters.page;
    }
    
    const queryString = buildQueryFromFilters(updatedFilters);
    setSearchParams(queryString.slice(1)); // Remove leading ?
  }, [filters, setSearchParams]);

  // Create offer
  const createOfferMutation = useCallback(async (data: OfferFormData) => {
    try {
      const newOffer = await createOffer(data);
      setAllOffers(prev => [newOffer, ...prev]);
      loadOffers(); // Reload to apply current filters
      return newOffer;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Error creating offer');
    }
  }, [loadOffers]);

  // Update offer
  const updateOfferMutation = useCallback(async (id: string, data: Partial<OfferFormData>) => {
    try {
      const updatedOffer = await updateOffer(id, data);
      setAllOffers(prev => prev.map(o => o.id === id ? updatedOffer : o));
      loadOffers();
      return updatedOffer;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Error updating offer');
    }
  }, [loadOffers]);

  // Delete offer
  const deleteOfferMutation = useCallback(async (id: string) => {
    try {
      await deleteOffer(id);
      setAllOffers(prev => prev.filter(o => o.id !== id));
      loadOffers();
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Error deleting offer');
    }
  }, [loadOffers]);

  // Accept offer
  const acceptOfferMutation = useCallback(async (id: string, notes?: string) => {
    try {
      const updatedOffer = await acceptOffer(id, notes);
      setAllOffers(prev => prev.map(o => o.id === id ? updatedOffer : o));
      loadOffers();
      return updatedOffer;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Error accepting offer');
    }
  }, [loadOffers]);

  // Reject offer
  const rejectOfferMutation = useCallback(async (id: string, notes?: string) => {
    try {
      const updatedOffer = await rejectOffer(id, notes);
      setAllOffers(prev => prev.map(o => o.id === id ? updatedOffer : o));
      loadOffers();
      return updatedOffer;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Error rejecting offer');
    }
  }, [loadOffers]);

  // Create counter offer
  const createCounterOfferMutation = useCallback(async (offerId: string, data: CounterOfferFormData) => {
    try {
      const counterOffer = await createCounterOffer(offerId, data);
      // Update the offer with counter state
      setAllOffers(prev => prev.map(o => {
        if (o.id === offerId) {
          return {
            ...o,
            estado: 'counter' as const,
            counterOffers: [...(o.counterOffers || []), counterOffer],
            updatedAt: new Date().toISOString()
          };
        }
        return o;
      }));
      loadOffers();
      return counterOffer;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Error creating counter offer');
    }
  }, [loadOffers]);

  // Bulk actions
  const bulkAction = useCallback(async (action: 'accept' | 'reject' | 'delete', offerIds: string[], notes?: string) => {
    try {
      await bulkOfferAction({ action, offerIds, notes });
      loadOffers();
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : `Error performing ${action} action`);
    }
  }, [loadOffers]);

  // Debounced version of loadOffers to prevent excessive calls
  const debouncedLoadOffers = useMemo(() => {
    const debounce = (func: () => void, delay: number) => {
      let timeoutId: NodeJS.Timeout;
      return () => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(func, delay);
      };
    };
    return debounce(loadOffers, 300);
  }, [loadOffers]);

  // Initial load
  useEffect(() => {
    debouncedLoadOffers();
  }, [debouncedLoadOffers]);

  return {
    offers,
    allOffers,
    filters,
    isLoading,
    error,
    updateFilters,
    loadOffers,
    createOffer: createOfferMutation,
    updateOffer: updateOfferMutation,
    deleteOffer: deleteOfferMutation,
    acceptOffer: acceptOfferMutation,
    rejectOffer: rejectOfferMutation,
    createCounterOffer: createCounterOfferMutation,
    bulkAction
  };
}

// Hook for managing offer details
export function useOfferDetails(offerId: string | null) {
  const [offer, setOffer] = useState<Offer | null>(null);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadOfferDetails = useCallback(async () => {
    if (!offerId) return;

    setIsLoading(true);
    setError(null);

    try {
      // For demo, find in mock data
      const mockOffers = generateMockOffers(50);
      const foundOffer = mockOffers.find(o => o.id === offerId);
      
      if (foundOffer) {
        setOffer(foundOffer);
        
        // Generate mock timeline
        const events = await getOfferTimeline(offerId);
        setTimeline(events);
      } else {
        setError('Offer not found');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading offer details');
    } finally {
      setIsLoading(false);
    }
  }, [offerId]);

  useEffect(() => {
    if (offerId) {
      loadOfferDetails();
    } else {
      setOffer(null);
      setTimeline([]);
    }
  }, [offerId, loadOfferDetails]);

  return {
    offer,
    timeline,
    isLoading,
    error,
    reload: loadOfferDetails
  };
}

// Hook for offer statistics
export function useOfferStats(offers: Offer[]) {
  const [stats, setStats] = useState<OfferStats | null>(null);

  useEffect(() => {
    if (offers.length > 0) {
      const calculatedStats = generateOfferStats(offers);
      setStats(calculatedStats);
    } else {
      setStats(null);
    }
  }, [offers]);

  return stats;
}

// Hook for form management
export function useOfferForm(initialData?: Partial<OfferFormData>) {
  const [formData, setFormData] = useState<Partial<OfferFormData>>(initialData || {});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = useCallback((field: keyof OfferFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when field is updated
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  }, [errors]);

  const resetForm = useCallback((newData?: Partial<OfferFormData>) => {
    setFormData(newData || {});
    setErrors({});
    setIsSubmitting(false);
  }, []);

  const setSubmitting = useCallback((submitting: boolean) => {
    setIsSubmitting(submitting);
  }, []);

  return {
    formData,
    errors,
    isSubmitting,
    updateField,
    setErrors,
    resetForm,
    setSubmitting
  };
}

// Hook for selection management
export function useSelection() {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const toggleSelection = useCallback((id: string) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  const toggleAll = useCallback((ids: string[], checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(ids));
    } else {
      setSelectedIds(new Set());
    }
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const isSelected = useCallback((id: string) => {
    return selectedIds.has(id);
  }, [selectedIds]);

  const isAllSelected = useCallback((ids: string[]) => {
    return ids.length > 0 && ids.every(id => selectedIds.has(id));
  }, [selectedIds]);

  const isPartiallySelected = useCallback((ids: string[]) => {
    return ids.some(id => selectedIds.has(id)) && !isAllSelected(ids);
  }, [selectedIds, isAllSelected]);

  return {
    selectedIds: Array.from(selectedIds),
    selectedCount: selectedIds.size,
    toggleSelection,
    toggleAll,
    clearSelection,
    isSelected,
    isAllSelected,
    isPartiallySelected
  };
}