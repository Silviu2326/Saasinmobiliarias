import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Visit, VisitFilters } from './types';
import { generateMockVisits, exportVisits } from './apis';
import { queryStringToFilters, filtersToQueryString, sortVisits } from './utils';

import VisitsTable from './components/VisitsTable';

export default function VisitsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [visits, setVisits] = useState<Visit[]>([]);
  const [filteredVisits, setFilteredVisits] = useState<Visit[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState('fechaCompleta');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

  // Parse filters from URL - memoized to prevent unnecessary re-renders
  const filters: VisitFilters = useMemo(() => queryStringToFilters(searchParams.toString()), [searchParams]);

  // Mock data for development
  const [mockData] = useState(() => generateMockVisits(60));

  const showNotification = (type: 'success' | 'error' | 'info', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  const updateFilters = useCallback((newFilters: VisitFilters) => {
    const queryString = filtersToQueryString(newFilters);
    setSearchParams(queryString ? `?${queryString}` : '');
  }, [setSearchParams]);

  const clearFilters = () => {
    setSearchParams('');
  };

  // Memoize filter values to prevent unnecessary re-renders
  const memoizedFilters = useMemo(() => ({
    q: filters.q,
    agente: filters.agente,
    cliente: filters.cliente,
    property: filters.property,
    estado: filters.estado,
    from: filters.from,
    to: filters.to
  }), [filters.q, filters.agente, filters.cliente, filters.property, filters.estado, filters.from, filters.to]);

  // Load and filter visits
  const loadVisits = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // In development, use mock data
      let filtered = [...mockData];

      // Apply filters
      if (memoizedFilters.q) {
        const query = memoizedFilters.q.toLowerCase();
        filtered = filtered.filter(visit => 
          visit.clienteNombre.toLowerCase().includes(query) ||
          visit.propertyTitle.toLowerCase().includes(query) ||
          visit.agenteNombre.toLowerCase().includes(query) ||
          visit.propertyAddress.toLowerCase().includes(query)
        );
      }

      if (memoizedFilters.agente) {
        filtered = filtered.filter(visit => 
          visit.agenteNombre.toLowerCase().includes(memoizedFilters.agente!.toLowerCase())
        );
      }

      if (memoizedFilters.cliente) {
        filtered = filtered.filter(visit => 
          visit.clienteNombre.toLowerCase().includes(memoizedFilters.cliente!.toLowerCase())
        );
      }

      if (memoizedFilters.property) {
        filtered = filtered.filter(visit => 
          visit.propertyTitle.toLowerCase().includes(memoizedFilters.property!.toLowerCase()) ||
          visit.propertyId === memoizedFilters.property
        );
      }

      if (memoizedFilters.estado) {
        filtered = filtered.filter(visit => visit.estado === memoizedFilters.estado);
      }

      if (memoizedFilters.from) {
        filtered = filtered.filter(visit => visit.fecha >= memoizedFilters.from!);
      }

      if (memoizedFilters.to) {
        filtered = filtered.filter(visit => visit.fecha <= memoizedFilters.to!);
      }

      // Apply sorting
      const sorted = sortVisits(filtered, sortBy, sortOrder);

      setVisits(mockData);
      setFilteredVisits(sorted);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar los datos');
      setVisits(mockData);
      setFilteredVisits(mockData);
    } finally {
      setIsLoading(false);
    }
  }, [memoizedFilters, mockData, sortBy, sortOrder]);

  // Debounced version of loadVisits to prevent excessive function calls
  const debouncedLoadVisits = useMemo(() => {
    const debounce = (func: () => void, delay: number) => {
      let timeoutId: NodeJS.Timeout;
      return () => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(func, delay);
      };
    };
    return debounce(loadVisits, 300);
  }, [loadVisits]);

  // Load visits when filters or sorting change
  useEffect(() => {
    debouncedLoadVisits();
  }, [debouncedLoadVisits]);

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const handleSelectVisit = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleSelectAllVisits = () => {
    if (selectedIds.size === filteredVisits.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredVisits.map(v => v.id)));
    }
  };

  const handleNewVisit = () => {
    showNotification('info', 'Función disponible próximamente');
  };

  const handleEditVisit = (visit: Visit) => {
    showNotification('info', `Editando visita con ${visit.clienteNombre}`);
  };

  const handleViewVisit = (visit: Visit) => {
    showNotification('info', `Viendo detalles de visita con ${visit.clienteNombre}`);
  };

  const handleDeleteVisit = async (id: string) => {
    const visit = filteredVisits.find(v => v.id === id);
    if (window.confirm(`¿Estás seguro de que quieres eliminar la visita con ${visit?.clienteNombre}?`)) {
      try {
        showNotification('success', 'Visita eliminada correctamente');
        loadVisits();
      } catch (error) {
        showNotification('error', `Error al eliminar: ${error instanceof Error ? error.message : 'Error desconocido'}`);
      }
    }
  };

  const handleConfirmVisit = (visit: Visit) => {
    showNotification('success', `Visita con ${visit.clienteNombre} confirmada`);
    loadVisits();
  };

  const handleCancelVisit = (visit: Visit) => {
    const reason = prompt('Motivo de la cancelación (opcional):');
    showNotification('success', `Visita con ${visit.clienteNombre} cancelada`);
    loadVisits();
  };

  const handleAddFeedback = (visit: Visit) => {
    showNotification('info', 'Modal de feedback disponible próximamente');
  };

  const handleBulkConfirm = async () => {
    if (selectedIds.size === 0) return;
    
    try {
      showNotification('success', `${selectedIds.size} visita${selectedIds.size > 1 ? 's' : ''} confirmada${selectedIds.size > 1 ? 's' : ''}`);
      setSelectedIds(new Set());
      loadVisits();
    } catch (error) {
      showNotification('error', `Error al confirmar: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  };

  const handleBulkCancel = async () => {
    if (selectedIds.size === 0) return;
    
    const reason = prompt('Motivo de la cancelación (opcional):');
    try {
      showNotification('success', `${selectedIds.size} visita${selectedIds.size > 1 ? 's' : ''} cancelada${selectedIds.size > 1 ? 's' : ''}`);
      setSelectedIds(new Set());
      loadVisits();
    } catch (error) {
      showNotification('error', `Error al cancelar: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  };

  const handleExport = async () => {
    try {
      await exportVisits(filters);
      showNotification('success', 'Visitas exportadas correctamente');
    } catch (error) {
      showNotification('error', `Error en la exportación: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  };

  if (error && filteredVisits.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error al cargar los datos</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadVisits}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  // Stats
  const stats = {
    total: filteredVisits.length,
    pendiente: filteredVisits.filter(v => v.estado === 'pendiente').length,
    confirmada: filteredVisits.filter(v => v.estado === 'confirmada').length,
    cancelada: filteredVisits.filter(v => v.estado === 'cancelada').length,
    hecha: filteredVisits.filter(v => v.estado === 'hecha').length,
    today: filteredVisits.filter(v => {
      const today = new Date().toISOString().split('T')[0];
      return v.fecha === today;
    }).length,
    avgFeedback: filteredVisits.filter(v => v.feedback).length > 0 
      ? Math.round(filteredVisits.filter(v => v.feedback).reduce((sum, v) => sum + (v.feedback?.score || 0), 0) / filteredVisits.filter(v => v.feedback).length * 10) / 10
      : 0
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Visitas</h1>
              <p className="text-gray-600">
                Gestiona las visitas programadas a tus propiedades
                {filteredVisits.length > 0 && (
                  <span className="ml-2 text-sm">
                    ({filteredVisits.length} visita{filteredVisits.length !== 1 ? 's' : ''}
                    {isLoading && ' - Cargando...'})
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-md shadow-lg ${
          notification.type === 'success' ? 'bg-green-500 text-white' :
          notification.type === 'error' ? 'bg-red-500 text-white' :
          'bg-blue-500 text-white'
        }`}>
          <div className="flex items-center">
            <span className="mr-2">
              {notification.type === 'success' && '✓'}
              {notification.type === 'error' && '✕'}
              {notification.type === 'info' && 'ℹ'}
            </span>
            {notification.message}
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-lg">📅</span>
                  </div>
                </div>
                <div className="ml-4">
                  <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
                  <div className="text-sm text-gray-600">Total</div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-yellow-200">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                    <span className="text-lg">🟡</span>
                  </div>
                </div>
                <div className="ml-4">
                  <div className="text-2xl font-bold text-gray-900">{stats.pendiente}</div>
                  <div className="text-sm text-gray-600">Pendientes</div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-blue-200">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-lg">🔵</span>
                  </div>
                </div>
                <div className="ml-4">
                  <div className="text-2xl font-bold text-gray-900">{stats.confirmada}</div>
                  <div className="text-sm text-gray-600">Confirmadas</div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-green-200">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-lg">🟢</span>
                  </div>
                </div>
                <div className="ml-4">
                  <div className="text-2xl font-bold text-gray-900">{stats.hecha}</div>
                  <div className="text-sm text-gray-600">Realizadas</div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-blue-200">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-lg">🔥</span>
                  </div>
                </div>
                <div className="ml-4">
                  <div className="text-2xl font-bold text-blue-600">{stats.today}</div>
                  <div className="text-sm text-gray-600">Hoy</div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-yellow-200">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                    <span className="text-lg">⭐</span>
                  </div>
                </div>
                <div className="ml-4">
                  <div className="text-2xl font-bold text-gray-900">{stats.avgFeedback || '-'}</div>
                  <div className="text-sm text-gray-600">Feedback</div>
                </div>
              </div>
            </div>
          </div>

          {/* Toolbar */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {selectedIds.size > 0 && (
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-700">
                        {selectedIds.size} seleccionada{selectedIds.size !== 1 ? 's' : ''}
                      </span>
                      <button
                        onClick={handleBulkConfirm}
                        className="inline-flex items-center px-3 py-1.5 border border-green-300 text-sm font-medium rounded-md text-green-700 bg-green-50 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-green-500"
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Confirmar
                      </button>
                      <button
                        onClick={handleBulkCancel}
                        className="inline-flex items-center px-3 py-1.5 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500"
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Cancelar
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-3">
                  {/* Export */}
                  <button
                    onClick={handleExport}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Exportar
                  </button>

                  {/* New visit */}
                  <button
                    onClick={handleNewVisit}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Nueva visita
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div>
                <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                  Búsqueda
                </label>
                <input
                  type="text"
                  id="search"
                  placeholder="Cliente, inmueble, agente..."
                  value={filters.q || ''}
                  onChange={(e) => updateFilters({ ...filters, q: e.target.value || undefined })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="agente" className="block text-sm font-medium text-gray-700 mb-1">
                  Agente
                </label>
                <input
                  type="text"
                  id="agente"
                  placeholder="Nombre del agente"
                  value={filters.agente || ''}
                  onChange={(e) => updateFilters({ ...filters, agente: e.target.value || undefined })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="estado" className="block text-sm font-medium text-gray-700 mb-1">
                  Estado
                </label>
                <select
                  id="estado"
                  value={filters.estado || ''}
                  onChange={(e) => updateFilters({ ...filters, estado: e.target.value || undefined })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Todos los estados</option>
                  <option value="pendiente">🟡 Pendiente</option>
                  <option value="confirmada">🔵 Confirmada</option>
                  <option value="cancelada">🔴 Cancelada</option>
                  <option value="hecha">🟢 Realizada</option>
                </select>
              </div>

              <div>
                <label htmlFor="from" className="block text-sm font-medium text-gray-700 mb-1">
                  Desde
                </label>
                <input
                  type="date"
                  id="from"
                  value={filters.from || ''}
                  onChange={(e) => updateFilters({ ...filters, from: e.target.value || undefined })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="to" className="block text-sm font-medium text-gray-700 mb-1">
                  Hasta
                </label>
                <input
                  type="date"
                  id="to"
                  value={filters.to || ''}
                  onChange={(e) => updateFilters({ ...filters, to: e.target.value || undefined })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {Object.values(filters).some(v => v) && (
              <div className="mt-4">
                <button
                  onClick={clearFilters}
                  className="text-sm text-gray-600 hover:text-gray-800"
                >
                  Limpiar filtros
                </button>
              </div>
            )}
          </div>

          {/* Table */}
          <VisitsTable
            visits={filteredVisits}
            selectedIds={selectedIds}
            onSelect={handleSelectVisit}
            onSelectAll={handleSelectAllVisits}
            onView={handleViewVisit}
            onEdit={handleEditVisit}
            onDelete={handleDeleteVisit}
            onConfirm={handleConfirmVisit}
            onCancel={handleCancelVisit}
            onAddFeedback={handleAddFeedback}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSort={handleSort}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
}