import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Property, PropertyFilters, PropertyFormData } from './types';
import { usePropertiesQuery, usePropertiesMutations } from './hooks';
import { queryStringToFilters, filtersToQueryString } from './utils';

import PropertiesToolbar from './components/PropertiesToolbar';
import PropertiesFilters from './components/PropertiesFilters';
import PropertiesTable from './components/PropertiesTable';
import PropertyForm from './components/PropertyForm';
import PropertyDetailsDrawer from './components/PropertyDetailsDrawer';

export default function PropertiesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState('updatedAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

  // Parse filters from URL
  const filters: PropertyFilters = queryStringToFilters(searchParams.toString());

  // Add sorting and pagination to filters - memoize to prevent unnecessary re-renders
  const queryFilters: PropertyFilters = useMemo(() => ({
    ...filters,
    sort: `${sortBy}:${sortOrder}`,
    size: 20
  }), [filters, sortBy, sortOrder]);

  const { properties, isLoading, error, refetch } = usePropertiesQuery({
    filters: queryFilters
  });

  const {
    createMutation,
    updateMutation,
    deleteMutation,
    publishMutation,
    bulkDeleteMutation,
    exportMutation,
    importMutation
  } = usePropertiesMutations();

  // Use properties from API (now includes mock data)
  const displayProperties = properties;

  const showNotification = (type: 'success' | 'error' | 'info', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  const updateFilters = useCallback((newFilters: PropertyFilters) => {
    const queryString = filtersToQueryString(newFilters);
    setSearchParams(queryString ? `?${queryString}` : '');
  }, [setSearchParams]);

  const clearFilters = () => {
    setSearchParams('');
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const handleSelectProperty = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleSelectAllProperties = () => {
    if (selectedIds.size === displayProperties.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(displayProperties.map(p => p.id)));
    }
  };

  // Form handlers
  const handleNewProperty = () => {
    setEditingProperty(null);
    setIsFormModalOpen(true);
  };

  const handleEditProperty = (property: Property) => {
    setEditingProperty(property);
    setIsFormModalOpen(true);
  };

  const handleFormSubmit = async (data: PropertyFormData) => {
    try {
      if (editingProperty) {
        await updateMutation.mutate(editingProperty.id, data);
        showNotification('success', 'Inmueble actualizado correctamente');
      } else {
        await createMutation.mutate(data);
        showNotification('success', 'Inmueble creado correctamente');
      }
      setIsFormModalOpen(false);
      setEditingProperty(null);
      refetch();
    } catch (error) {
      showNotification('error', `Error: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  };

  const handleFormCancel = () => {
    setIsFormModalOpen(false);
    setEditingProperty(null);
  };

  // Property actions
  const handleViewProperty = (property: Property) => {
    setSelectedProperty(property);
    setIsDrawerOpen(true);
  };

  const handleDeleteProperty = async (id: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este inmueble?')) {
      try {
        await deleteMutation.mutate(id);
        showNotification('success', 'Inmueble eliminado correctamente');
        refetch();
      } catch (error) {
        showNotification('error', `Error al eliminar: ${error instanceof Error ? error.message : 'Error desconocido'}`);
      }
    }
  };

  const handlePublishProperty = async (id: string) => {
    try {
      await publishMutation.mutate(id);
      showNotification('success', 'Inmueble publicado en portales');
      refetch();
    } catch (error) {
      showNotification('error', `Error al publicar: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    
    if (window.confirm(`¿Estás seguro de que quieres eliminar ${selectedIds.size} inmueble${selectedIds.size > 1 ? 's' : ''}?`)) {
      try {
        await bulkDeleteMutation.mutate(Array.from(selectedIds));
        showNotification('success', `${selectedIds.size} inmueble${selectedIds.size > 1 ? 's' : ''} eliminado${selectedIds.size > 1 ? 's' : ''} correctamente`);
        setSelectedIds(new Set());
        refetch();
      } catch (error) {
        showNotification('error', `Error al eliminar: ${error instanceof Error ? error.message : 'Error desconocido'}`);
      }
    }
  };

  const handlePublishSelected = async () => {
    if (selectedIds.size === 0) return;
    
    try {
      // Simulate publishing selected properties
      for (const id of Array.from(selectedIds)) {
        await publishMutation.mutate(id);
      }
      showNotification('success', `${selectedIds.size} inmueble${selectedIds.size > 1 ? 's' : ''} publicado${selectedIds.size > 1 ? 's' : ''} en portales`);
      setSelectedIds(new Set());
      refetch();
    } catch (error) {
      showNotification('error', `Error al publicar: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  };

  // Import/Export handlers
  const handleImport = async (file: File) => {
    try {
      const result = await importMutation.mutate(file);
      showNotification('success', `Importación completada: ${result.success} inmuebles importados, ${result.errors} errores`);
      refetch();
    } catch (error) {
      showNotification('error', `Error en la importación: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  };

  const handleExport = async () => {
    try {
      await exportMutation.mutate(filters);
      showNotification('info', 'Exportación iniciada. El archivo se descargará automáticamente.');
    } catch (error) {
      showNotification('error', `Error en la exportación: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setSelectedProperty(null);
  };

  const handleDrawerEdit = () => {
    if (selectedProperty) {
      handleEditProperty(selectedProperty);
      handleCloseDrawer();
    }
  };

  const handleDrawerPublish = () => {
    if (selectedProperty) {
      handlePublishProperty(selectedProperty.id);
    }
  };

  if (error) {
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
            onClick={() => refetch()}
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
              <h1 className="text-2xl font-bold text-gray-900">Inmuebles</h1>
              <p className="text-gray-600">
                Gestiona tu cartera de inmuebles
                {displayProperties.length > 0 && (
                  <span className="ml-2 text-sm">
                    ({displayProperties.length} inmueble{displayProperties.length !== 1 ? 's' : ''})
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
            <PropertiesToolbar
              selectedCount={selectedIds.size}
              onNew={handleNewProperty}
              onImport={handleImport}
              onExport={handleExport}
              onPublishSelected={handlePublishSelected}
              onBulkDelete={handleBulkDelete}
              isImporting={importMutation.isLoading}
              isExporting={exportMutation.isLoading}
              isPublishing={publishMutation.isLoading}
            />
          </div>

          {/* Filters */}
          <PropertiesFilters
            filters={filters}
            onChange={updateFilters}
            onClear={clearFilters}
          />

          {/* Table */}
          <PropertiesTable
            properties={displayProperties}
            selectedIds={selectedIds}
            onSelect={handleSelectProperty}
            onSelectAll={handleSelectAllProperties}
            onView={handleViewProperty}
            onEdit={handleEditProperty}
            onDelete={handleDeleteProperty}
            onPublish={handlePublishProperty}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSort={handleSort}
            isLoading={isLoading}
          />

          {/* Pagination would go here */}
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
                  Mostrando <span className="font-medium">1</span> a <span className="font-medium">{displayProperties.length}</span> de{' '}
                  <span className="font-medium">{displayProperties.length}</span> resultados
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

      {/* Property Form Modal */}
      {isFormModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingProperty ? 'Editar inmueble' : 'Nuevo inmueble'}
              </h2>
            </div>
            <div className="px-6 py-4">
              <PropertyForm
                property={editingProperty}
                onSubmit={handleFormSubmit}
                onCancel={handleFormCancel}
                isLoading={createMutation.isLoading || updateMutation.isLoading}
              />
            </div>
          </div>
        </div>
      )}

      {/* Property Details Drawer */}
      <PropertyDetailsDrawer
        property={selectedProperty}
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        onEdit={handleDrawerEdit}
        onPublish={handleDrawerPublish}
      />
    </div>
  );
}