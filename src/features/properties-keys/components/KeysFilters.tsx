import React, { useState } from 'react';
import { KeyFilters } from '../types';

interface KeysFiltersProps {
  filters: KeyFilters;
  onChange: (filters: KeyFilters) => void;
  onClear: () => void;
}

export default function KeysFilters({
  filters,
  onChange,
  onClear
}: KeysFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const hasActiveFilters = Object.values(filters).some(value => 
    value !== undefined && value !== '' && value !== null
  );

  const updateFilter = (key: keyof KeyFilters, value: any) => {
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
                placeholder="Código, propiedad..."
                value={filters.q || ''}
                onChange={(e) => updateFilter('q', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Key Code */}
            <div>
              <label htmlFor="keyCode" className="block text-sm font-medium text-gray-700 mb-1">
                Código de llave
              </label>
              <input
                type="text"
                id="keyCode"
                placeholder="K0001"
                value={filters.keyCode || ''}
                onChange={(e) => updateFilter('keyCode', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Location */}
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                Ubicación
              </label>
              <select
                id="location"
                value={filters.location || ''}
                onChange={(e) => updateFilter('location', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todas las ubicaciones</option>
                <option value="oficina">Oficina</option>
                <option value="inmobiliaria">Inmobiliaria</option>
                <option value="propietario">Propietario</option>
                <option value="inquilino">Inquilino</option>
                <option value="agente">Agente</option>
                <option value="otro">Otro</option>
              </select>
            </div>

            {/* Status */}
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                Estado
              </label>
              <select
                id="status"
                value={filters.status || ''}
                onChange={(e) => updateFilter('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos los estados</option>
                <option value="disponible">Disponible</option>
                <option value="entregada">Entregada</option>
                <option value="perdida">Perdida</option>
                <option value="duplicada">Duplicada</option>
                <option value="retirada">Retirada</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Property ID */}
            <div>
              <label htmlFor="propertyId" className="block text-sm font-medium text-gray-700 mb-1">
                ID Propiedad
              </label>
              <input
                type="text"
                id="propertyId"
                placeholder="prop-123"
                value={filters.propertyId || ''}
                onChange={(e) => updateFilter('propertyId', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Assigned To */}
            <div>
              <label htmlFor="assignedTo" className="block text-sm font-medium text-gray-700 mb-1">
                Asignada a
              </label>
              <input
                type="text"
                id="assignedTo"
                placeholder="Nombre del responsable"
                value={filters.assignedTo || ''}
                onChange={(e) => updateFilter('assignedTo', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
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

          {/* Date range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="dateFrom" className="block text-sm font-medium text-gray-700 mb-1">
                Fecha desde
              </label>
              <input
                type="date"
                id="dateFrom"
                value={filters.dateFrom || ''}
                onChange={(e) => updateFilter('dateFrom', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label htmlFor="dateTo" className="block text-sm font-medium text-gray-700 mb-1">
                Fecha hasta
              </label>
              <input
                type="date"
                id="dateTo"
                value={filters.dateTo || ''}
                onChange={(e) => updateFilter('dateTo', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}