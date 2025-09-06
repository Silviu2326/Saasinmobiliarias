import React from 'react';
import { PropertyFilters } from '../types';

interface PropertiesFiltersProps {
  filters: PropertyFilters;
  onChange: (filters: PropertyFilters) => void;
  onClear: () => void;
}

export default function PropertiesFilters({ filters, onChange, onClear }: PropertiesFiltersProps) {
  const updateFilter = (key: keyof PropertyFilters, value: any) => {
    onChange({
      ...filters,
      [key]: value === '' ? undefined : value,
      page: 0 // Reset page when filters change
    });
  };

  return (
    <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {/* Búsqueda */}
        <div className="xl:col-span-2">
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
            Buscar
          </label>
          <input
            type="text"
            id="search"
            placeholder="Título, dirección..."
            value={filters.q || ''}
            onChange={(e) => updateFilter('q', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
          />
        </div>

        {/* Estado */}
        <div>
          <label htmlFor="estado" className="block text-sm font-medium text-gray-700 mb-1">
            Estado
          </label>
          <select
            id="estado"
            value={filters.estado || ''}
            onChange={(e) => updateFilter('estado', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
          >
            <option value="">Todos</option>
            <option value="borrador">Borrador</option>
            <option value="activo">Activo</option>
            <option value="vendido">Vendido</option>
            <option value="alquilado">Alquilado</option>
          </select>
        </div>

        {/* Tipo */}
        <div>
          <label htmlFor="tipo" className="block text-sm font-medium text-gray-700 mb-1">
            Tipo
          </label>
          <select
            id="tipo"
            value={filters.tipo || ''}
            onChange={(e) => updateFilter('tipo', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
          >
            <option value="">Todos</option>
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

        {/* Ciudad */}
        <div>
          <label htmlFor="ciudad" className="block text-sm font-medium text-gray-700 mb-1">
            Ciudad
          </label>
          <select
            id="ciudad"
            value={filters.ciudad || ''}
            onChange={(e) => updateFilter('ciudad', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
          >
            <option value="">Todas</option>
            <option value="Madrid">Madrid</option>
            <option value="Barcelona">Barcelona</option>
            <option value="Valencia">Valencia</option>
            <option value="Sevilla">Sevilla</option>
            <option value="Bilbao">Bilbao</option>
            <option value="Málaga">Málaga</option>
            <option value="Zaragoza">Zaragoza</option>
            <option value="Murcia">Murcia</option>
          </select>
        </div>

        {/* Habitaciones */}
        <div>
          <label htmlFor="habitaciones" className="block text-sm font-medium text-gray-700 mb-1">
            Habitaciones
          </label>
          <select
            id="habitaciones"
            value={filters.habitaciones || ''}
            onChange={(e) => updateFilter('habitaciones', e.target.value ? Number(e.target.value) : undefined)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
          >
            <option value="">Todas</option>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
            <option value="5">5+</option>
          </select>
        </div>

        {/* Precio Mínimo */}
        <div>
          <label htmlFor="priceMin" className="block text-sm font-medium text-gray-700 mb-1">
            Precio Mín
          </label>
          <input
            type="number"
            id="priceMin"
            placeholder="€"
            value={filters.priceMin || ''}
            onChange={(e) => updateFilter('priceMin', e.target.value ? Number(e.target.value) : undefined)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
          />
        </div>

        {/* Precio Máximo */}
        <div>
          <label htmlFor="priceMax" className="block text-sm font-medium text-gray-700 mb-1">
            Precio Máx
          </label>
          <input
            type="number"
            id="priceMax"
            placeholder="€"
            value={filters.priceMax || ''}
            onChange={(e) => updateFilter('priceMax', e.target.value ? Number(e.target.value) : undefined)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
          />
        </div>

        {/* Agente */}
        <div>
          <label htmlFor="agente" className="block text-sm font-medium text-gray-700 mb-1">
            Agente
          </label>
          <select
            id="agente"
            value={filters.agente || ''}
            onChange={(e) => updateFilter('agente', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
          >
            <option value="">Todos</option>
            <option value="Ana García">Ana García</option>
            <option value="Carlos López">Carlos López</option>
            <option value="María Rodríguez">María Rodríguez</option>
            <option value="Juan Martín">Juan Martín</option>
            <option value="Laura Sánchez">Laura Sánchez</option>
          </select>
        </div>

        {/* Filtros adicionales */}
        <div className="flex items-center space-x-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={filters.exclusiva || false}
              onChange={(e) => updateFilter('exclusiva', e.target.checked || undefined)}
              className="rounded border-gray-300 text-blue-600 shadow-sm focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">Exclusiva</span>
          </label>

          <label className="flex items-center">
            <input
              type="checkbox"
              checked={filters.portalSync || false}
              onChange={(e) => updateFilter('portalSync', e.target.checked || undefined)}
              className="rounded border-gray-300 text-blue-600 shadow-sm focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">En portales</span>
          </label>
        </div>

        {/* Botón limpiar */}
        <div className="flex items-end">
          <button
            onClick={onClear}
            className="w-full px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            Limpiar filtros
          </button>
        </div>
      </div>

      {/* Contador de resultados */}
      {Object.keys(filters).some(key => filters[key as keyof PropertyFilters] !== undefined) && (
        <div className="mt-3 text-sm text-gray-600">
          Filtros activos: {Object.keys(filters).filter(key => filters[key as keyof PropertyFilters] !== undefined).length}
        </div>
      )}
    </div>
  );
}