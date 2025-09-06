import React, { useState } from 'react';
import { MapFilters } from '../types';
import { CITY_COORDINATES } from '../apis';

interface MapFiltersProps {
  filters: MapFilters;
  onChange: (filters: MapFilters) => void;
  onClear: () => void;
}

export default function MapFiltersComponent({
  filters,
  onChange,
  onClear
}: MapFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const hasActiveFilters = Object.values(filters).some(value => 
    value !== undefined && value !== '' && value !== null
  );

  const updateFilter = (key: keyof MapFilters, value: any) => {
    onChange({
      ...filters,
      [key]: value || undefined
    });
  };

  return (
    <div className="bg-white border-b border-gray-200">
      {/* Filter toggle */}
      <div className="px-6 py-3 border-b border-gray-100">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center justify-between w-full text-left"
        >
          <div className="flex items-center space-x-2">
            <h3 className="text-sm font-medium text-gray-900">Filtros</h3>
            {hasActiveFilters && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Activos
              </span>
            )}
          </div>
          <svg
            className={`w-5 h-5 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Filter content */}
      {isExpanded && (
        <div className="px-6 py-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                Búsqueda
              </label>
              <input
                type="text"
                id="search"
                placeholder="Título, dirección..."
                value={filters.q || ''}
                onChange={(e) => updateFilter('q', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* City */}
            <div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                Ciudad
              </label>
              <select
                id="city"
                value={filters.ciudad || ''}
                onChange={(e) => updateFilter('ciudad', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todas las ciudades</option>
                {Object.keys(CITY_COORDINATES).map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>

            {/* Property Type */}
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                Tipo
              </label>
              <select
                id="type"
                value={filters.tipo || ''}
                onChange={(e) => updateFilter('tipo', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos los tipos</option>
                <option value="piso">Piso</option>
                <option value="atico">Ático</option>
                <option value="duplex">Dúplex</option>
                <option value="casa">Casa</option>
                <option value="chalet">Chalet</option>
                <option value="estudio">Estudio</option>
                <option value="loft">Loft</option>
                <option value="local">Local</option>
                <option value="oficina">Oficina</option>
              </select>
            </div>

            {/* Status */}
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                Estado
              </label>
              <select
                id="status"
                value={filters.estado || ''}
                onChange={(e) => updateFilter('estado', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos los estados</option>
                <option value="borrador">Borrador</option>
                <option value="activo">Activo</option>
                <option value="vendido">Vendido</option>
                <option value="alquilado">Alquilado</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Price range */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label htmlFor="price-min" className="block text-sm font-medium text-gray-700 mb-1">
                  Precio min (€)
                </label>
                <input
                  type="number"
                  id="price-min"
                  placeholder="0"
                  value={filters.priceMin || ''}
                  onChange={(e) => updateFilter('priceMin', e.target.value ? Number(e.target.value) : undefined)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label htmlFor="price-max" className="block text-sm font-medium text-gray-700 mb-1">
                  Precio max (€)
                </label>
                <input
                  type="number"
                  id="price-max"
                  placeholder="Sin límite"
                  value={filters.priceMax || ''}
                  onChange={(e) => updateFilter('priceMax', e.target.value ? Number(e.target.value) : undefined)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Rooms */}
            <div>
              <label htmlFor="rooms" className="block text-sm font-medium text-gray-700 mb-1">
                Habitaciones
              </label>
              <select
                id="rooms"
                value={filters.habitaciones || ''}
                onChange={(e) => updateFilter('habitaciones', e.target.value ? Number(e.target.value) : undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Cualquier número</option>
                <option value={1}>1 habitación</option>
                <option value={2}>2 habitaciones</option>
                <option value={3}>3 habitaciones</option>
                <option value={4}>4 habitaciones</option>
                <option value={5}>5+ habitaciones</option>
              </select>
            </div>

            {/* Clear filters */}
            <div className="flex items-end">
              {hasActiveFilters && (
                <button
                  onClick={onClear}
                  className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Limpiar filtros
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}