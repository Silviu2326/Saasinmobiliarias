import React from 'react';
import { LeadFilters as Filters } from '../apis';

interface LeadFiltersProps {
  filters: Filters;
  onChange: (filters: Filters) => void;
}

export default function LeadFilters({ filters, onChange }: LeadFiltersProps) {
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
            placeholder="Nombre, email, teléfono..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Canal
          </label>
          <select
            value={filters.canal || ''}
            onChange={(e) => onChange({ ...filters, canal: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos</option>
            <option value="web">Web</option>
            <option value="portal">Portal</option>
            <option value="whatsapp">WhatsApp</option>
            <option value="referido">Referido</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Estado
          </label>
          <select
            value={filters.estado || ''}
            onChange={(e) => onChange({ ...filters, estado: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos</option>
            <option value="nuevo">Nuevo</option>
            <option value="contactado">Contactado</option>
            <option value="calificado">Calificado</option>
            <option value="perdido">Perdido</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Agente
          </label>
          <input
            type="text"
            value={filters.agente || ''}
            onChange={(e) => onChange({ ...filters, agente: e.target.value })}
            placeholder="Nombre del agente..."
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

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Ordenar por
          </label>
          <select
            value={filters.orderBy || 'createdAt'}
            onChange={(e) => onChange({ ...filters, orderBy: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="createdAt">Fecha creación</option>
            <option value="updatedAt">Última actualización</option>
            <option value="estado">Estado</option>
            <option value="score">Score</option>
          </select>
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