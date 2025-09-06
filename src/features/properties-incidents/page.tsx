import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PropertyIncident, IncidentFilters } from './types';
import { generateMockIncidents, exportIncidents } from './apis';
import { queryStringToFilters, filtersToQueryString } from './utils';

import IncidentsTable from './components/IncidentsTable';

export default function PropertiesIncidentsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [incidents, setIncidents] = useState<PropertyIncident[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

  // Parse filters from URL
  const filters: IncidentFilters = queryStringToFilters(searchParams.toString());

  // Mock data for development
  const [mockData] = useState(() => generateMockIncidents(60));

  const showNotification = (type: 'success' | 'error' | 'info', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  const updateFilters = useCallback((newFilters: IncidentFilters) => {
    const queryString = filtersToQueryString(newFilters);
    setSearchParams(queryString ? `?${queryString}` : '');
  }, [setSearchParams]);

  const clearFilters = () => {
    setSearchParams('');
  };

  // Load incidents
  const loadIncidents = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // In development, use filtered mock data
      let filtered = mockData;

      if (filters.q) {
        const query = filters.q.toLowerCase();
        filtered = filtered.filter(incident => 
          incident.title.toLowerCase().includes(query) ||
          incident.description.toLowerCase().includes(query) ||
          incident.propertyTitle.toLowerCase().includes(query) ||
          incident.propertyAddress.toLowerCase().includes(query)
        );
      }

      if (filters.propertyId) {
        filtered = filtered.filter(incident => incident.propertyId === filters.propertyId);
      }

      if (filters.category) {
        filtered = filtered.filter(incident => incident.category === filters.category);
      }

      if (filters.priority) {
        filtered = filtered.filter(incident => incident.priority === filters.priority);
      }

      if (filters.status) {
        filtered = filtered.filter(incident => incident.status === filters.status);
      }

      if (filters.assignedTo) {
        filtered = filtered.filter(incident => 
          incident.assignedTo && incident.assignedTo.toLowerCase().includes(filters.assignedTo!.toLowerCase())
        );
      }

      if (filters.reportedBy) {
        filtered = filtered.filter(incident => 
          incident.reportedBy.toLowerCase().includes(filters.reportedBy!.toLowerCase())
        );
      }

      if (filters.dateFrom) {
        filtered = filtered.filter(incident => 
          incident.reportedDate >= filters.dateFrom!
        );
      }

      if (filters.dateTo) {
        filtered = filtered.filter(incident => 
          incident.reportedDate <= filters.dateTo!
        );
      }

      if (filters.dueDateFrom) {
        filtered = filtered.filter(incident => 
          incident.dueDate && incident.dueDate >= filters.dueDateFrom!
        );
      }

      if (filters.dueDateTo) {
        filtered = filtered.filter(incident => 
          incident.dueDate && incident.dueDate <= filters.dueDateTo!
        );
      }

      setIncidents(filtered);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar los datos');
      setIncidents(mockData); // Fallback to mock data
    } finally {
      setIsLoading(false);
    }
  }, [filters, mockData]);

  // Load incidents when filters change
  useEffect(() => {
    loadIncidents();
  }, [loadIncidents]);

  const handleSelectIncident = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleSelectAllIncidents = () => {
    if (selectedIds.size === incidents.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(incidents.map(i => i.id)));
    }
  };

  const handleViewIncident = (incident: PropertyIncident) => {
    console.log('View incident:', incident);
    showNotification('info', `Viendo detalles de "${incident.title}"`);
  };

  const handleEditIncident = (incident: PropertyIncident) => {
    console.log('Edit incident:', incident);
    showNotification('info', `Editando "${incident.title}"`);
  };

  const handleDeleteIncident = async (id: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta incidencia?')) {
      try {
        showNotification('success', 'Incidencia eliminada correctamente');
        loadIncidents();
      } catch (error) {
        showNotification('error', `Error al eliminar: ${error instanceof Error ? error.message : 'Error desconocido'}`);
      }
    }
  };

  const handleCloseIncident = (incident: PropertyIncident) => {
    const resolution = prompt('Describe la resolución de la incidencia:');
    if (resolution) {
      showNotification('success', `Incidencia "${incident.title}" cerrada correctamente`);
      loadIncidents();
    }
  };

  const handleAssignIncident = (incident: PropertyIncident) => {
    const assignee = prompt('Asignar incidencia a:', incident.assignedTo || '');
    if (assignee) {
      showNotification('success', `Incidencia "${incident.title}" asignada a ${assignee}`);
      loadIncidents();
    }
  };

  const handleExport = async () => {
    try {
      await exportIncidents(filters);
      showNotification('success', 'Incidencias exportadas correctamente');
    } catch (error) {
      showNotification('error', `Error en la exportación: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  };

  if (error && incidents.length === 0) {
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
            onClick={loadIncidents}
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
    total: incidents.length,
    open: incidents.filter(i => i.status === 'abierta').length,
    inProgress: incidents.filter(i => i.status === 'en_progreso').length,
    closed: incidents.filter(i => i.status === 'cerrada').length,
    overdue: incidents.filter(i => {
      if (!i.dueDate || i.status === 'cerrada' || i.status === 'cancelada') return false;
      return new Date(i.dueDate) < new Date();
    }).length,
    critical: incidents.filter(i => i.priority === 'critica').length
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Gestión de Incidencias</h1>
              <p className="text-gray-600">
                Registra y hace seguimiento de las incidencias de tus propiedades
                {incidents.length > 0 && (
                  <span className="ml-2 text-sm">
                    ({incidents.length} incidencia{incidents.length !== 1 ? 's' : ''}
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
                    <span className="text-lg">📋</span>
                  </div>
                </div>
                <div className="ml-4">
                  <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
                  <div className="text-sm text-gray-600">Total</div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                    <span className="text-lg">🔴</span>
                  </div>
                </div>
                <div className="ml-4">
                  <div className="text-2xl font-bold text-gray-900">{stats.open}</div>
                  <div className="text-sm text-gray-600">Abiertas</div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-lg">🔵</span>
                  </div>
                </div>
                <div className="ml-4">
                  <div className="text-2xl font-bold text-gray-900">{stats.inProgress}</div>
                  <div className="text-sm text-gray-600">En progreso</div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-lg">🟢</span>
                  </div>
                </div>
                <div className="ml-4">
                  <div className="text-2xl font-bold text-gray-900">{stats.closed}</div>
                  <div className="text-sm text-gray-600">Cerradas</div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-red-200">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                    <span className="text-lg">⏰</span>
                  </div>
                </div>
                <div className="ml-4">
                  <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
                  <div className="text-sm text-gray-600">Vencidas</div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-red-200">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                    <span className="text-lg">🚨</span>
                  </div>
                </div>
                <div className="ml-4">
                  <div className="text-2xl font-bold text-red-600">{stats.critical}</div>
                  <div className="text-sm text-gray-600">Críticas</div>
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
                        onClick={() => {
                          if (window.confirm(`¿Estás seguro de que quieres eliminar ${selectedIds.size} incidencia${selectedIds.size > 1 ? 's' : ''}?`)) {
                            showNotification('success', `${selectedIds.size} incidencia${selectedIds.size > 1 ? 's' : ''} eliminada${selectedIds.size > 1 ? 's' : ''} correctamente`);
                            setSelectedIds(new Set());
                            loadIncidents();
                          }
                        }}
                        className="inline-flex items-center px-3 py-1.5 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500"
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Eliminar
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

                  {/* New incident */}
                  <button
                    onClick={() => showNotification('info', 'Función disponible próximamente')}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Nueva incidencia
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Basic filters */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                  Búsqueda
                </label>
                <input
                  type="text"
                  id="search"
                  placeholder="Título, descripción..."
                  value={filters.q || ''}
                  onChange={(e) => updateFilters({ ...filters, q: e.target.value || undefined })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                  Categoría
                </label>
                <select
                  id="category"
                  value={filters.category || ''}
                  onChange={(e) => updateFilters({ ...filters, category: e.target.value || undefined })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Todas las categorías</option>
                  <option value="mantenimiento">Mantenimiento</option>
                  <option value="seguridad">Seguridad</option>
                  <option value="climatizacion">Climatización</option>
                  <option value="fontaneria">Fontanería</option>
                  <option value="electricidad">Electricidad</option>
                  <option value="estructura">Estructura</option>
                  <option value="otros">Otros</option>
                </select>
              </div>

              <div>
                <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
                  Prioridad
                </label>
                <select
                  id="priority"
                  value={filters.priority || ''}
                  onChange={(e) => updateFilters({ ...filters, priority: e.target.value || undefined })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Todas las prioridades</option>
                  <option value="baja">Baja</option>
                  <option value="media">Media</option>
                  <option value="alta">Alta</option>
                  <option value="critica">Crítica</option>
                </select>
              </div>

              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                  Estado
                </label>
                <select
                  id="status"
                  value={filters.status || ''}
                  onChange={(e) => updateFilters({ ...filters, status: e.target.value || undefined })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Todos los estados</option>
                  <option value="abierta">Abierta</option>
                  <option value="en_progreso">En progreso</option>
                  <option value="pendiente_repuestos">Pendiente repuestos</option>
                  <option value="cerrada">Cerrada</option>
                  <option value="cancelada">Cancelada</option>
                </select>
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
          <IncidentsTable
            incidents={incidents}
            selectedIds={selectedIds}
            onSelect={handleSelectIncident}
            onSelectAll={handleSelectAllIncidents}
            onView={handleViewIncident}
            onEdit={handleEditIncident}
            onDelete={handleDeleteIncident}
            onClose={handleCloseIncident}
            onAssign={handleAssignIncident}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
}