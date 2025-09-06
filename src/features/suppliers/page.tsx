import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Supplier, SupplierFilters, SupplierFormData } from './types';
import { generateMockSuppliers, exportSuppliers } from './apis';
import { queryStringToFilters, filtersToQueryString, sortSuppliers } from './utils';

import SuppliersToolbar from './components/SuppliersToolbar';
import SuppliersTable from './components/SuppliersTable';

export default function SuppliersPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [filteredSuppliers, setFilteredSuppliers] = useState<Supplier[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState('nombre');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

  // Parse filters from URL - memoized to prevent unnecessary re-renders
  const filters: SupplierFilters = useMemo(() => queryStringToFilters(searchParams.toString()), [searchParams]);

  // Mock data for development
  const [mockData] = useState(() => generateMockSuppliers(50));

  const showNotification = (type: 'success' | 'error' | 'info', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  const updateFilters = useCallback((newFilters: SupplierFilters) => {
    const queryString = filtersToQueryString(newFilters);
    setSearchParams(queryString ? `?${queryString}` : '');
  }, [setSearchParams]);

  const clearFilters = () => {
    setSearchParams('');
  };

  // Memoize filter values to prevent unnecessary re-renders
  const memoizedFilters = useMemo(() => ({
    q: filters.q,
    categoria: filters.categoria,
    zona: filters.zona,
    estado: filters.estado,
    rating: filters.rating,
    dateFrom: filters.dateFrom,
    dateTo: filters.dateTo
  }), [filters.q, filters.categoria, filters.zona, filters.estado, filters.rating, filters.dateFrom, filters.dateTo]);

  // Load and filter suppliers
  const loadSuppliers = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // In development, use mock data
      let filtered = [...mockData];

      // Apply filters
      if (memoizedFilters.q) {
        const query = memoizedFilters.q.toLowerCase();
        filtered = filtered.filter(supplier => 
          supplier.nombre.toLowerCase().includes(query) ||
          supplier.email.toLowerCase().includes(query) ||
          supplier.telefono.includes(query) ||
          supplier.categorias.some(cat => cat.toLowerCase().includes(query)) ||
          supplier.zonas.some(zona => zona.toLowerCase().includes(query))
        );
      }

      if (memoizedFilters.categoria) {
        filtered = filtered.filter(supplier => 
          supplier.categorias.includes(memoizedFilters.categoria as any)
        );
      }

      if (memoizedFilters.zona) {
        filtered = filtered.filter(supplier => 
          supplier.zonas.some(zona => zona.toLowerCase().includes(memoizedFilters.zona!.toLowerCase()))
        );
      }

      if (memoizedFilters.estado) {
        filtered = filtered.filter(supplier => supplier.estado === memoizedFilters.estado);
      }

      if (memoizedFilters.rating) {
        filtered = filtered.filter(supplier => supplier.rating >= memoizedFilters.rating!);
      }

      if (memoizedFilters.dateFrom) {
        filtered = filtered.filter(supplier => 
          supplier.createdAt >= memoizedFilters.dateFrom!
        );
      }

      if (memoizedFilters.dateTo) {
        filtered = filtered.filter(supplier => 
          supplier.createdAt <= memoizedFilters.dateTo!
        );
      }

      // Apply sorting
      const sorted = sortSuppliers(filtered, sortBy, sortOrder);

      setSuppliers(mockData);
      setFilteredSuppliers(sorted);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar los datos');
      setSuppliers(mockData);
      setFilteredSuppliers(mockData);
    } finally {
      setIsLoading(false);
    }
  }, [memoizedFilters, mockData, sortBy, sortOrder]);

  // Debounced version of loadSuppliers to prevent excessive API calls
  const debouncedLoadSuppliers = useMemo(() => {
    const debounce = (func: () => void, delay: number) => {
      let timeoutId: NodeJS.Timeout;
      return () => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(func, delay);
      };
    };
    return debounce(loadSuppliers, 300);
  }, [loadSuppliers]);

  // Load suppliers when filters or sorting change
  useEffect(() => {
    debouncedLoadSuppliers();
  }, [debouncedLoadSuppliers]);

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const handleSelectSupplier = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleSelectAllSuppliers = () => {
    if (selectedIds.size === filteredSuppliers.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredSuppliers.map(s => s.id)));
    }
  };

  const handleNewSupplier = () => {
    showNotification('info', 'Función disponible próximamente');
  };

  const handleEditSupplier = (supplier: Supplier) => {
    showNotification('info', `Editando proveedor: ${supplier.nombre}`);
  };

  const handleViewSupplier = (supplier: Supplier) => {
    showNotification('info', `Viendo detalles de: ${supplier.nombre}`);
  };

  const handleDeleteSupplier = async (id: string) => {
    const supplier = filteredSuppliers.find(s => s.id === id);
    if (window.confirm(`¿Estás seguro de que quieres eliminar a ${supplier?.nombre}?`)) {
      try {
        showNotification('success', 'Proveedor eliminado correctamente');
        loadSuppliers();
      } catch (error) {
        showNotification('error', `Error al eliminar: ${error instanceof Error ? error.message : 'Error desconocido'}`);
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    
    if (window.confirm(`¿Estás seguro de que quieres eliminar ${selectedIds.size} proveedor${selectedIds.size > 1 ? 'es' : ''}?`)) {
      try {
        showNotification('success', `${selectedIds.size} proveedor${selectedIds.size > 1 ? 'es' : ''} eliminado${selectedIds.size > 1 ? 's' : ''} correctamente`);
        setSelectedIds(new Set());
        loadSuppliers();
      } catch (error) {
        showNotification('error', `Error al eliminar: ${error instanceof Error ? error.message : 'Error desconocido'}`);
      }
    }
  };

  const handleImport = async (file: File) => {
    try {
      showNotification('info', 'Importando proveedores...');
      // Simulate import
      await new Promise(resolve => setTimeout(resolve, 2000));
      showNotification('success', 'Proveedores importados correctamente');
      loadSuppliers();
    } catch (error) {
      showNotification('error', `Error en la importación: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  };

  const handleExport = async () => {
    try {
      await exportSuppliers(filters);
      showNotification('success', 'Proveedores exportados correctamente');
    } catch (error) {
      showNotification('error', `Error en la exportación: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  };

  const handleAttachProperty = () => {
    showNotification('info', 'Función de vinculación disponible próximamente');
  };

  if (error && filteredSuppliers.length === 0) {
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
            onClick={loadSuppliers}
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
    total: filteredSuppliers.length,
    active: filteredSuppliers.filter(s => s.estado === 'activo').length,
    inactive: filteredSuppliers.filter(s => s.estado === 'inactivo').length,
    avgRating: filteredSuppliers.length > 0 
      ? Math.round((filteredSuppliers.reduce((sum, s) => sum + s.rating, 0) / filteredSuppliers.length) * 10) / 10 
      : 0
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Proveedores</h1>
              <p className="text-gray-600">
                Gestiona tu red de proveedores de servicios
                {filteredSuppliers.length > 0 && (
                  <span className="ml-2 text-sm">
                    ({filteredSuppliers.length} proveedor{filteredSuppliers.length !== 1 ? 'es' : ''}
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-lg">👥</span>
                  </div>
                </div>
                <div className="ml-4">
                  <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
                  <div className="text-sm text-gray-600">Total proveedores</div>
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
                  <div className="text-2xl font-bold text-gray-900">{stats.active}</div>
                  <div className="text-sm text-gray-600">Activos</div>
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
                  <div className="text-2xl font-bold text-gray-900">{stats.inactive}</div>
                  <div className="text-sm text-gray-600">Inactivos</div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                    <span className="text-lg">⭐</span>
                  </div>
                </div>
                <div className="ml-4">
                  <div className="text-2xl font-bold text-gray-900">{stats.avgRating}</div>
                  <div className="text-sm text-gray-600">Rating promedio</div>
                </div>
              </div>
            </div>
          </div>

          {/* Toolbar */}
          <div className="bg-white rounded-lg shadow-sm">
            <SuppliersToolbar
              selectedCount={selectedIds.size}
              onNew={handleNewSupplier}
              onImport={handleImport}
              onExport={handleExport}
              onBulkDelete={handleBulkDelete}
              onAttachProperty={handleAttachProperty}
            />
          </div>

          {/* Basic filters */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div>
                <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                  Búsqueda
                </label>
                <input
                  type="text"
                  id="search"
                  placeholder="Nombre, email, teléfono..."
                  value={filters.q || ''}
                  onChange={(e) => updateFilters({ ...filters, q: e.target.value || undefined })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="categoria" className="block text-sm font-medium text-gray-700 mb-1">
                  Categoría
                </label>
                <select
                  id="categoria"
                  value={filters.categoria || ''}
                  onChange={(e) => updateFilters({ ...filters, categoria: e.target.value || undefined })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Todas las categorías</option>
                  <option value="foto">📸 Fotografía</option>
                  <option value="reforma">🔨 Reformas</option>
                  <option value="limpieza">🧹 Limpieza</option>
                  <option value="legales">⚖️ Legales</option>
                  <option value="otros">🔧 Otros</option>
                </select>
              </div>

              <div>
                <label htmlFor="zona" className="block text-sm font-medium text-gray-700 mb-1">
                  Zona
                </label>
                <input
                  type="text"
                  id="zona"
                  placeholder="Madrid, Barcelona..."
                  value={filters.zona || ''}
                  onChange={(e) => updateFilters({ ...filters, zona: e.target.value || undefined })}
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
                  <option value="activo">Activo</option>
                  <option value="inactivo">Inactivo</option>
                </select>
              </div>

              <div>
                <label htmlFor="rating" className="block text-sm font-medium text-gray-700 mb-1">
                  Rating mínimo
                </label>
                <select
                  id="rating"
                  value={filters.rating || ''}
                  onChange={(e) => updateFilters({ ...filters, rating: e.target.value ? Number(e.target.value) : undefined })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Cualquier rating</option>
                  <option value="4">⭐⭐⭐⭐ 4+ estrellas</option>
                  <option value="3">⭐⭐⭐ 3+ estrellas</option>
                  <option value="2">⭐⭐ 2+ estrellas</option>
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
          <SuppliersTable
            suppliers={filteredSuppliers}
            selectedIds={selectedIds}
            onSelect={handleSelectSupplier}
            onSelectAll={handleSelectAllSuppliers}
            onView={handleViewSupplier}
            onEdit={handleEditSupplier}
            onDelete={handleDeleteSupplier}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSort={handleSort}
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
                  Mostrando <span className="font-medium">1</span> a <span className="font-medium">{filteredSuppliers.length}</span> de{' '}
                  <span className="font-medium">{filteredSuppliers.length}</span> resultados
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
    </div>
  );
}