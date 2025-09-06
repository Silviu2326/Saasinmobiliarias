import React from 'react';
import type { ContractsFilters } from './types';

interface ContractsFiltersProps {
  filters: ContractsFilters;
  onChange: (filters: ContractsFilters) => void;
}

export default function ContractsFilters({ filters, onChange }: ContractsFiltersProps) {
  return (
    <div className="bg-gray-50 p-4 rounded-lg space-y-3">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Buscar
          </label>
          <input
            type="text"
            value={filters.q || ''}
            onChange={(e) => onChange({ ...filters, q: e.target.value })}
            placeholder="Cliente, propiedad, dirección..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tipo
          </label>
          <select
            value={filters.tipo || 'all'}
            onChange={(e) => onChange({ ...filters, tipo: e.target.value as any })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Todos</option>
            <option value="compraventa">Compraventa</option>
            <option value="alquiler">Alquiler</option>
            <option value="exclusiva">Exclusiva</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Estado
          </label>
          <select
            value={filters.estado || 'all'}
            onChange={(e) => onChange({ ...filters, estado: e.target.value as any })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Todos</option>
            <option value="borrador">Borrador</option>
            <option value="generado">Generado</option>
            <option value="firmado">Firmado</option>
            <option value="anulado">Anulado</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Propiedad ID
          </label>
          <input
            type="text"
            value={filters.propertyId || ''}
            onChange={(e) => onChange({ ...filters, propertyId: e.target.value })}
            placeholder="ID de propiedad..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Cliente ID
          </label>
          <input
            type="text"
            value={filters.clienteId || ''}
            onChange={(e) => onChange({ ...filters, clienteId: e.target.value })}
            placeholder="ID de cliente..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Desde
          </label>
          <input
            type="date"
            value={filters.fechaDesde || ''}
            onChange={(e) => onChange({ ...filters, fechaDesde: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Hasta
          </label>
          <input
            type="date"
            value={filters.fechaHasta || ''}
            onChange={(e) => onChange({ ...filters, fechaHasta: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-end">
          <button
            onClick={() => onChange({})}
            className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
          >
            Limpiar filtros
          </button>
        </div>
      </div>
    </div>
  );
}