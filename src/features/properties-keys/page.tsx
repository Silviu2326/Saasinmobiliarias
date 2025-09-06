import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PropertyKey, KeyFilters, KeyFormData } from './types';
import { generateMockKeys, exportKeys } from './apis';
import { queryStringToFilters, filtersToQueryString } from './utils';

import KeysToolbar from './components/KeysToolbar';
import KeysFilters from './components/KeysFilters';
import KeysTable from './components/KeysTable';

export default function PropertiesKeysPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [keys, setKeys] = useState<PropertyKey[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isMovementModalOpen, setIsMovementModalOpen] = useState(false);
  const [editingKey, setEditingKey] = useState<PropertyKey | null>(null);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

  // Parse filters from URL
  const filters: KeyFilters = queryStringToFilters(searchParams.toString());

  // Mock data for development
  const [mockData] = useState(() => generateMockKeys(50));

  const showNotification = (type: 'success' | 'error' | 'info', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  const updateFilters = useCallback((newFilters: KeyFilters) => {
    const queryString = filtersToQueryString(newFilters);
    setSearchParams(queryString ? `?${queryString}` : '');
  }, [setSearchParams]);

  const clearFilters = () => {
    setSearchParams('');
  };

  // Load keys
  const loadKeys = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // In development, use filtered mock data
      let filtered = mockData;

      if (filters.q) {
        const query = filters.q.toLowerCase();
        filtered = filtered.filter(key => 
          key.keyCode.toLowerCase().includes(query) ||
          key.propertyTitle.toLowerCase().includes(query) ||
          key.propertyAddress.toLowerCase().includes(query) ||
          (key.description && key.description.toLowerCase().includes(query))
        );
      }

      if (filters.keyCode) {
        filtered = filtered.filter(key => 
          key.keyCode.toLowerCase().includes(filters.keyCode!.toLowerCase())
        );
      }

      if (filters.propertyId) {
        filtered = filtered.filter(key => key.propertyId === filters.propertyId);
      }

      if (filters.location) {
        filtered = filtered.filter(key => key.location === filters.location);
      }

      if (filters.status) {
        filtered = filtered.filter(key => key.status === filters.status);
      }

      if (filters.assignedTo) {
        filtered = filtered.filter(key => 
          key.assignedTo && key.assignedTo.toLowerCase().includes(filters.assignedTo!.toLowerCase())
        );
      }

      if (filters.dateFrom) {
        filtered = filtered.filter(key => 
          key.createdAt >= filters.dateFrom!
        );
      }

      if (filters.dateTo) {
        filtered = filtered.filter(key => 
          key.createdAt <= filters.dateTo!
        );
      }

      setKeys(filtered);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar los datos');
      setKeys(mockData); // Fallback to mock data
    } finally {
      setIsLoading(false);
    }
  }, [filters, mockData]);

  // Load keys when filters change
  useEffect(() => {
    loadKeys();
  }, [loadKeys]);

  const handleSelectKey = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleSelectAllKeys = () => {
    if (selectedIds.size === keys.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(keys.map(k => k.id)));
    }
  };

  const handleNewKey = () => {
    setEditingKey(null);
    setIsFormModalOpen(true);
  };

  const handleEditKey = (key: PropertyKey) => {
    setEditingKey(key);
    setIsFormModalOpen(true);
  };

  const handleViewKey = (key: PropertyKey) => {
    console.log('View key:', key);
    showNotification('info', `Viendo detalles de ${key.keyCode}`);
  };

  const handleDeleteKey = async (id: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta llave?')) {
      try {
        showNotification('success', 'Llave eliminada correctamente');
        loadKeys();
      } catch (error) {
        showNotification('error', `Error al eliminar: ${error instanceof Error ? error.message : 'Error desconocido'}`);
      }
    }
  };

  const handleDuplicateKey = async (key: PropertyKey) => {
    try {
      showNotification('success', `Llave ${key.keyCode} duplicada correctamente`);
      loadKeys();
    } catch (error) {
      showNotification('error', `Error al duplicar: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    
    if (window.confirm(`¿Estás seguro de que quieres eliminar ${selectedIds.size} llave${selectedIds.size > 1 ? 's' : ''}?`)) {
      try {
        showNotification('success', `${selectedIds.size} llave${selectedIds.size > 1 ? 's' : ''} eliminada${selectedIds.size > 1 ? 's' : ''} correctamente`);
        setSelectedIds(new Set());
        loadKeys();
      } catch (error) {
        showNotification('error', `Error al eliminar: ${error instanceof Error ? error.message : 'Error desconocido'}`);
      }
    }
  };

  const handleExport = async () => {
    try {
      await exportKeys(filters);
      showNotification('success', 'Llaves exportadas correctamente');
    } catch (error) {
      showNotification('error', `Error en la exportación: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  };

  const handleNewMovement = () => {
    setIsMovementModalOpen(true);
  };

  if (error && keys.length === 0) {
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
            onClick={loadKeys}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Gestión de Llaves</h1>
              <p className="text-gray-600">
                Controla el acceso y ubicación de las llaves de tus propiedades
                {keys.length > 0 && (
                  <span className="ml-2 text-sm">
                    ({keys.length} llave{keys.length !== 1 ? 's' : ''}
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
          {/* Toolbar */}
          <div className="bg-white rounded-lg shadow-sm">
            <KeysToolbar
              selectedCount={selectedIds.size}
              onNew={handleNewKey}
              onExport={handleExport}
              onBulkDelete={handleBulkDelete}
              onNewMovement={handleNewMovement}
            />
          </div>

          {/* Filters */}
          <KeysFilters
            filters={filters}
            onChange={updateFilters}
            onClear={clearFilters}
          />

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-lg">🔑</span>
                  </div>
                </div>
                <div className="ml-4">
                  <div className="text-2xl font-bold text-gray-900">{keys.length}</div>
                  <div className="text-sm text-gray-600">Total llaves</div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-lg">✅</span>
                  </div>
                </div>
                <div className="ml-4">
                  <div className="text-2xl font-bold text-gray-900">
                    {keys.filter(k => k.status === 'disponible').length}
                  </div>
                  <div className="text-sm text-gray-600">Disponibles</div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                    <span className="text-lg">📤</span>
                  </div>
                </div>
                <div className="ml-4">
                  <div className="text-2xl font-bold text-gray-900">
                    {keys.filter(k => k.status === 'entregada').length}
                  </div>
                  <div className="text-sm text-gray-600">Entregadas</div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                    <span className="text-lg">❌</span>
                  </div>
                </div>
                <div className="ml-4">
                  <div className="text-2xl font-bold text-gray-900">
                    {keys.filter(k => k.status === 'perdida').length}
                  </div>
                  <div className="text-sm text-gray-600">Perdidas</div>
                </div>
              </div>
            </div>
          </div>

          {/* Table */}
          <KeysTable
            keys={keys}
            selectedIds={selectedIds}
            onSelect={handleSelectKey}
            onSelectAll={handleSelectAllKeys}
            onView={handleViewKey}
            onEdit={handleEditKey}
            onDelete={handleDeleteKey}
            onDuplicate={handleDuplicateKey}
            isLoading={isLoading}
          />

          {/* Pagination placeholder */}
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 rounded-lg shadow-sm">
            <div className="flex-1 flex justify-between sm:hidden">
              <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                Anterior
              </button>
              <button className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                Siguiente
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Mostrando <span className="font-medium">1</span> a <span className="font-medium">{keys.length}</span> de{' '}
                  <span className="font-medium">{keys.length}</span> resultados
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                    <span className="sr-only">Anterior</span>
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                  <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                    1
                  </button>
                  <button className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                    <span className="sr-only">Siguiente</span>
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                </nav>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals would be rendered here in a real implementation */}
      {isFormModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingKey ? 'Editar llave' : 'Nueva llave'}
              </h2>
            </div>
            <div className="p-6">
              <p className="text-gray-600 mb-4">
                Formulario de {editingKey ? 'edición' : 'creación'} de llave (placeholder)
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setIsFormModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    setIsFormModalOpen(false);
                    showNotification('success', editingKey ? 'Llave actualizada' : 'Llave creada');
                  }}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  {editingKey ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isMovementModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Nuevo movimiento</h2>
            </div>
            <div className="p-6">
              <p className="text-gray-600 mb-4">
                Formulario de registro de movimiento de llave (placeholder)
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setIsMovementModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    setIsMovementModalOpen(false);
                    showNotification('success', 'Movimiento registrado');
                  }}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Registrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}