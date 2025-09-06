import React, { useState, useEffect } from 'react';
import { OffersFilters } from '../types';
import { OFFER_ESTADOS, VENCIMIENTO_OPTIONS } from '../schema';
import { generateMockClients, generateMockProperties, generateMockAgents } from '../apis';
import { debounce } from '../utils';

interface OffersFiltersProps {
  filters: OffersFilters;
  onFiltersChange: (filters: Partial<OffersFilters>) => void;
  onReset: () => void;
}

export default function OffersFiltersComponent({
  filters,
  onFiltersChange,
  onReset
}: OffersFiltersProps) {
  const [localQuery, setLocalQuery] = useState(filters.q || '');
  const [clients] = useState(generateMockClients());
  const [properties] = useState(generateMockProperties());
  const [agents] = useState(generateMockAgents());

  // Debounced search
  const debouncedSearch = React.useMemo(
    () => debounce((query: string) => {
      onFiltersChange({ q: query });
    }, 300),
    [onFiltersChange]
  );

  useEffect(() => {
    if (localQuery !== filters.q) {
      debouncedSearch(localQuery);
    }
  }, [localQuery, filters.q, debouncedSearch]);

  const hasActiveFilters = Object.entries(filters).some(([key, value]) => {
    if (key === 'page' || key === 'limit') return false;
    return value !== undefined && value !== '' && value !== 'all';
  });

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-gray-900">Filtros</h3>
          {hasActiveFilters && (
            <button
              onClick={onReset}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Limpiar filtros
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {/* Search */}
          <div className="lg:col-span-2">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Buscar
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                value={localQuery}
                onChange={(e) => setLocalQuery(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Cliente, propiedad, condiciones..."
              />
            </div>
          </div>

          {/* Estado */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Estado
            </label>
            <select
              value={filters.estado || 'all'}
              onChange={(e) => onFiltersChange({ estado: e.target.value as any })}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {OFFER_ESTADOS.map(estado => (
                <option key={estado.value} value={estado.value}>
                  {estado.label}
                </option>
              ))}
            </select>
          </div>

          {/* Vencimiento */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Vencimiento
            </label>
            <select
              value={filters.vencimiento || 'all'}
              onChange={(e) => onFiltersChange({ vencimiento: e.target.value as any })}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {VENCIMIENTO_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Cliente */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Cliente
            </label>
            <select
              value={filters.clienteId || ''}
              onChange={(e) => onFiltersChange({ clienteId: e.target.value || undefined })}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Todos los clientes</option>
              {clients.map(client => (
                <option key={client.id} value={client.id}>
                  {client.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Propiedad */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Propiedad
            </label>
            <select
              value={filters.propertyId || ''}
              onChange={(e) => onFiltersChange({ propertyId: e.target.value || undefined })}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Todas las propiedades</option>
              {properties.map(property => (
                <option key={property.id} value={property.id}>
                  {property.title}
                </option>
              ))}
            </select>
          </div>

          {/* Agente */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Agente
            </label>
            <select
              value={filters.agenteId || ''}
              onChange={(e) => onFiltersChange({ agenteId: e.target.value || undefined })}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Todos los agentes</option>
              {agents.map(agent => (
                <option key={agent.id} value={agent.id}>
                  {agent.nombre}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Advanced filters - Second row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4 pt-4 border-t border-gray-100">
          {/* Rango de precios */}
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Rango de precio
            </label>
            <div className="flex space-x-2">
              <input
                type="number"
                min="0"
                step="1000"
                value={filters.precioMin || ''}
                onChange={(e) => onFiltersChange({ precioMin: e.target.value ? parseInt(e.target.value) : undefined })}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Precio mínimo"
              />
              <span className="flex items-center text-gray-500">-</span>
              <input
                type="number"
                min="0"
                step="1000"
                value={filters.precioMax || ''}
                onChange={(e) => onFiltersChange({ precioMax: e.target.value ? parseInt(e.target.value) : undefined })}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Precio máximo"
              />
            </div>
          </div>

          {/* Rango de fechas */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Fecha desde
            </label>
            <input
              type="date"
              value={filters.fechaDesde || ''}
              onChange={(e) => onFiltersChange({ fechaDesde: e.target.value || undefined })}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Fecha hasta
            </label>
            <input
              type="date"
              value={filters.fechaHasta || ''}
              onChange={(e) => onFiltersChange({ fechaHasta: e.target.value || undefined })}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Active filters display */}
        {hasActiveFilters && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-gray-500">Filtros activos:</span>
              
              {filters.q && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                  Búsqueda: "{filters.q}"
                  <button
                    onClick={() => {
                      setLocalQuery('');
                      onFiltersChange({ q: undefined });
                    }}
                    className="ml-1 text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              )}

              {filters.estado && filters.estado !== 'all' && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                  Estado: {OFFER_ESTADOS.find(e => e.value === filters.estado)?.label}
                  <button
                    onClick={() => onFiltersChange({ estado: 'all' })}
                    className="ml-1 text-green-600 hover:text-green-800"
                  >
                    ×
                  </button>
                </span>
              )}

              {filters.vencimiento && filters.vencimiento !== 'all' && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">
                  Vencimiento: {VENCIMIENTO_OPTIONS.find(v => v.value === filters.vencimiento)?.label}
                  <button
                    onClick={() => onFiltersChange({ vencimiento: 'all' })}
                    className="ml-1 text-yellow-600 hover:text-yellow-800"
                  >
                    ×
                  </button>
                </span>
              )}

              {filters.clienteId && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
                  Cliente: {clients.find(c => c.id === filters.clienteId)?.nombre}
                  <button
                    onClick={() => onFiltersChange({ clienteId: undefined })}
                    className="ml-1 text-purple-600 hover:text-purple-800"
                  >
                    ×
                  </button>
                </span>
              )}

              {filters.propertyId && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-indigo-100 text-indigo-800">
                  Propiedad: {properties.find(p => p.id === filters.propertyId)?.title}
                  <button
                    onClick={() => onFiltersChange({ propertyId: undefined })}
                    className="ml-1 text-indigo-600 hover:text-indigo-800"
                  >
                    ×
                  </button>
                </span>
              )}

              {(filters.precioMin || filters.precioMax) && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800">
                  Precio: {filters.precioMin ? `${filters.precioMin}€` : '0€'} - {filters.precioMax ? `${filters.precioMax}€` : '∞'}
                  <button
                    onClick={() => onFiltersChange({ precioMin: undefined, precioMax: undefined })}
                    className="ml-1 text-gray-600 hover:text-gray-800"
                  >
                    ×
                  </button>
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}