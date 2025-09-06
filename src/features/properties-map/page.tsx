import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { PropertyMapPoint, MapFilters, MapSettings } from './types';
import { getMapProperties, generateMockMapProperties, CITY_COORDINATES } from './apis';
import { mapFiltersToQueryString, queryStringToMapFilters } from './utils';

import MapToolbar from './components/MapToolbar';
import MapFiltersComponent from './components/MapFilters';
import PropertiesMap from './components/PropertiesMap';
import MarkerCard from './components/MarkerCard';

export default function PropertiesMapPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [properties, setProperties] = useState<PropertyMapPoint[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedProperty, setSelectedProperty] = useState<PropertyMapPoint | null>(null);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

  // Parse filters from URL
  const filters: MapFilters = queryStringToMapFilters(searchParams.toString());

  // Map settings
  const [settings, setSettings] = useState<MapSettings>({
    clusterEnabled: true,
    searchRadius: 10,
    centerCity: filters.ciudad || 'Madrid',
    zoom: 11
  });

  // Mock data for development - memoized to prevent regeneration
  const mockData = useMemo(() => generateMockMapProperties(100), []);
  
  // Prevent bounds update loops
  const boundsUpdateRef = useRef(false);

  const showNotification = (type: 'success' | 'error' | 'info', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  const updateFilters = useCallback((newFilters: MapFilters) => {
    const queryString = mapFiltersToQueryString(newFilters);
    setSearchParams(queryString ? `?${queryString}` : '');
  }, [setSearchParams]);

  const clearFilters = () => {
    setSearchParams('');
  };

  // Load properties with better dependency management
  const loadProperties = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // In development, use mock data
      const result = await getMapProperties(filters);
      
      // If no real data, use mock data
      if (result.length === 0) {
        let filtered = mockData;

        // Apply client-side filtering for mock data
        if (filters.ciudad) {
          filtered = filtered.filter(p => p.city === filters.ciudad);
        }
        if (filters.tipo) {
          filtered = filtered.filter(p => p.type === filters.tipo);
        }
        if (filters.estado) {
          filtered = filtered.filter(p => p.status === filters.estado);
        }
        if (filters.priceMin) {
          filtered = filtered.filter(p => p.price >= filters.priceMin!);
        }
        if (filters.priceMax) {
          filtered = filtered.filter(p => p.price <= filters.priceMax!);
        }
        if (filters.habitaciones) {
          filtered = filtered.filter(p => p.habitaciones === filters.habitaciones);
        }
        if (filters.q) {
          const query = filters.q.toLowerCase();
          filtered = filtered.filter(p => 
            p.title.toLowerCase().includes(query) ||
            (p.address && p.address.toLowerCase().includes(query)) ||
            (p.city && p.city.toLowerCase().includes(query))
          );
        }

        setProperties(filtered);
      } else {
        setProperties(result);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar los datos');
      setProperties(mockData); // Fallback to mock data
    } finally {
      setIsLoading(false);
    }
  }, [
    filters.ciudad,
    filters.tipo,
    filters.estado,
    filters.priceMin,
    filters.priceMax,
    filters.habitaciones,
    filters.q,
    mockData
  ]); // Exclude bounds from dependencies to prevent loops

  // Load properties when filters change
  useEffect(() => {
    loadProperties();
  }, [loadProperties]);

  // Update map center when city filter changes
  useEffect(() => {
    if (filters.ciudad && CITY_COORDINATES[filters.ciudad]) {
      const cityCoords = CITY_COORDINATES[filters.ciudad];
      setSettings(prev => ({
        ...prev,
        centerCity: filters.ciudad!,
        zoom: cityCoords.zoom
      }));
    }
  }, [filters.ciudad]);

  const handlePropertySelect = (property: PropertyMapPoint) => {
    setSelectedProperty(property);
  };

  const handleBoundsChange = useCallback((bounds: any) => {
    if (bounds && !boundsUpdateRef.current) {
      boundsUpdateRef.current = true;
      // Only update bounds if they're significantly different to prevent loops
      const currentBounds = filters.bounds;
      const boundsChanged = !currentBounds || 
        Math.abs(bounds.north - (currentBounds.north || 0)) > 0.001 ||
        Math.abs(bounds.south - (currentBounds.south || 0)) > 0.001 ||
        Math.abs(bounds.east - (currentBounds.east || 0)) > 0.001 ||
        Math.abs(bounds.west - (currentBounds.west || 0)) > 0.001;
      
      if (boundsChanged) {
        updateFilters({
          ...filters,
          bounds
        });
      }
      
      // Reset flag after a delay
      setTimeout(() => {
        boundsUpdateRef.current = false;
      }, 500);
    }
  }, [filters, updateFilters]);

  const handleExport = async () => {
    try {
      showNotification('info', 'Exportando propiedades del mapa...');
      
      // Simulate export
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Create CSV content
      const csvContent = [
        'ID,Título,Latitud,Longitud,Precio,Estado,Tipo,Dirección,Ciudad,M²,Habitaciones',
        ...properties.map(p => [
          p.id,
          `"${p.title}"`,
          p.lat,
          p.lng,
          p.price,
          p.status,
          p.type,
          `"${p.address || ''}"`,
          p.city || '',
          p.m2 || '',
          p.habitaciones || ''
        ].join(','))
      ].join('\n');

      // Download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `propiedades-mapa-${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      
      showNotification('success', 'Propiedades exportadas correctamente');
    } catch (error) {
      showNotification('error', `Error en la exportación: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  };

  const handleViewList = () => {
    // Navigate to properties list with current filters
    const queryString = mapFiltersToQueryString(filters);
    navigate(`/properties${queryString ? `?${queryString}` : ''}`);
  };

  if (error && properties.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error al cargar el mapa</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadProperties}
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
              <h1 className="text-2xl font-bold text-gray-900">Mapa de Inmuebles</h1>
              <p className="text-gray-600">
                Visualiza tu cartera de inmuebles en el mapa
                {properties.length > 0 && (
                  <span className="ml-2 text-sm">
                    ({properties.length} inmueble{properties.length !== 1 ? 's' : ''}
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

      <div className="flex h-[calc(100vh-120px)]">
        {/* Sidebar */}
        <div className="w-80 bg-white shadow-lg flex flex-col">
          {/* Toolbar */}
          <MapToolbar
            selectedCount={selectedProperty ? 1 : 0}
            clusterEnabled={settings.clusterEnabled}
            onClusterToggle={(enabled) => setSettings(prev => ({ ...prev, clusterEnabled: enabled }))}
            searchRadius={settings.searchRadius}
            onSearchRadiusChange={(radius) => setSettings(prev => ({ ...prev, searchRadius: radius }))}
            onExport={handleExport}
            onViewList={handleViewList}
          />

          {/* Filters */}
          <MapFiltersComponent
            filters={filters}
            onChange={updateFilters}
            onClear={clearFilters}
          />

          {/* Properties list */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-900">
                  Propiedades en el mapa ({properties.length})
                </h3>
                {isLoading && (
                  <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                )}
              </div>
              
              <div className="space-y-3">
                {properties.map(property => (
                  <MarkerCard
                    key={property.id}
                    property={property}
                    onClick={() => handlePropertySelect(property)}
                  />
                ))}
                
                {properties.length === 0 && !isLoading && (
                  <div className="text-center py-8 text-gray-500">
                    <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <p>No se encontraron propiedades</p>
                    <p className="text-sm mt-1">Prueba a ajustar los filtros</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Map */}
        <div className="flex-1 relative">
          <PropertiesMap
            properties={properties}
            settings={settings}
            onPropertySelect={handlePropertySelect}
            onBoundsChange={handleBoundsChange}
            selectedPropertyId={selectedProperty?.id}
          />

          {/* Property details overlay */}
          {selectedProperty && (
            <div className="absolute top-4 left-4 w-80 bg-white rounded-lg shadow-lg z-10">
              <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-medium text-gray-900">{selectedProperty.title}</h3>
                  <button
                    onClick={() => setSelectedProperty(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <MarkerCard
                  property={selectedProperty}
                  onClick={() => {}}
                />

                <div className="mt-3 flex space-x-2">
                  <button
                    onClick={() => navigate(`/properties?id=${selectedProperty.id}`)}
                    className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
                  >
                    Ver detalles
                  </button>
                  <button
                    onClick={() => navigate(`/properties?edit=${selectedProperty.id}`)}
                    className="flex-1 px-3 py-2 border border-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-50"
                  >
                    Editar
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}