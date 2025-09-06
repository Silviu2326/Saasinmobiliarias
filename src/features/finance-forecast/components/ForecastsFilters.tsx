import React from 'react';
import { useForecastPeriods, useForecastCategories } from '../hooks';
import { formatDate } from '../utils';
import type { ForecastQuery } from '../types';

interface ForecastsFiltersProps {
  query: ForecastQuery;
  onQueryChange: (updates: Partial<ForecastQuery>) => void;
  className?: string;
}

export const ForecastsFilters: React.FC<ForecastsFiltersProps> = ({
  query,
  onQueryChange,
  className = ''
}) => {
  const { periods } = useForecastPeriods();
  const { categories } = useForecastCategories();

  const handleInputChange = (field: keyof ForecastQuery, value: any) => {
    onQueryChange({ [field]: value });
  };

  const handleDateChange = (field: 'startDate' | 'endDate', value: string) => {
    onQueryChange({ [field]: value });
  };

  const handleAmountChange = (field: 'minAmount' | 'maxAmount', value: string) => {
    const numValue = value === '' ? undefined : parseFloat(value);
    onQueryChange({ [field]: numValue });
  };

  const handleProbabilityChange = (field: 'minProbability' | 'maxProbability', value: string) => {
    const numValue = value === '' ? undefined : parseInt(value);
    onQueryChange({ [field]: numValue });
  };

  const clearFilters = () => {
    onQueryChange({
      periodId: undefined,
      categoryId: undefined,
      type: undefined,
      status: undefined,
      minAmount: undefined,
      maxAmount: undefined,
      minProbability: undefined,
      maxProbability: undefined,
      tags: undefined,
      search: undefined,
      startDate: undefined,
      endDate: undefined
    });
  };

  const hasActiveFilters = Object.values(query).some(value => 
    value !== undefined && value !== '' && value !== 1 && value !== 20 && value !== 'createdAt' && value !== 'desc'
  );

  return (
    <div className={`bg-white shadow rounded-lg p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">Filtros</h3>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            Limpiar filtros
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {/* Búsqueda de texto */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Búsqueda
          </label>
          <input
            type="text"
            value={query.search || ''}
            onChange={(e) => handleInputChange('search', e.target.value)}
            placeholder="Buscar por nombre, descripción..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Período */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Período
          </label>
          <select
            value={query.periodId || ''}
            onChange={(e) => handleInputChange('periodId', e.target.value || undefined)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Todos los períodos</option>
            {periods.map((period) => (
              <option key={period.id} value={period.id}>
                {period.name}
              </option>
            ))}
          </select>
        </div>

        {/* Categoría */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Categoría
          </label>
          <select
            value={query.categoryId || ''}
            onChange={(e) => handleInputChange('categoryId', e.target.value || undefined)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Todas las categorías</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {/* Tipo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tipo
          </label>
          <select
            value={query.type || ''}
            onChange={(e) => handleInputChange('type', e.target.value || undefined)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Todos los tipos</option>
            <option value="income">Ingresos</option>
            <option value="expense">Gastos</option>
          </select>
        </div>

        {/* Estado */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Estado
          </label>
          <select
            value={query.status || ''}
            onChange={(e) => handleInputChange('status', e.target.value || undefined)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Todos los estados</option>
            <option value="draft">Borrador</option>
            <option value="confirmed">Confirmado</option>
            <option value="cancelled">Cancelado</option>
          </select>
        </div>

        {/* Monto mínimo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Monto mínimo
          </label>
          <input
            type="number"
            value={query.minAmount || ''}
            onChange={(e) => handleAmountChange('minAmount', e.target.value)}
            placeholder="0.00"
            min="0"
            step="0.01"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Monto máximo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Monto máximo
          </label>
          <input
            type="number"
            value={query.maxAmount || ''}
            onChange={(e) => handleAmountChange('maxAmount', e.target.value)}
            placeholder="999999.99"
            min="0"
            step="0.01"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Probabilidad mínima */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Probabilidad mínima (%)
          </label>
          <input
            type="number"
            value={query.minProbability || ''}
            onChange={(e) => handleProbabilityChange('minProbability', e.target.value)}
            placeholder="0"
            min="0"
            max="100"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Probabilidad máxima */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Probabilidad máxima (%)
          </label>
          <input
            type="number"
            value={query.maxProbability || ''}
            onChange={(e) => handleProbabilityChange('maxProbability', e.target.value)}
            placeholder="100"
            min="0"
            max="100"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Fecha de inicio */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Fecha de inicio
          </label>
          <input
            type="date"
            value={query.startDate || ''}
            onChange={(e) => handleDateChange('startDate', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Fecha de fin */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Fecha de fin
          </label>
          <input
            type="date"
            value={query.endDate || ''}
            onChange={(e) => handleDateChange('endDate', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Etiquetas */}
      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Etiquetas
        </label>
        <div className="flex flex-wrap gap-2">
          {['venta', 'alquiler', 'marketing', 'operaciones', 'apartamento', 'casa', 'local'].map((tag) => (
            <button
              key={tag}
              onClick={() => {
                const currentTags = query.tags || [];
                const newTags = currentTags.includes(tag)
                  ? currentTags.filter(t => t !== tag)
                  : [...currentTags, tag];
                onQueryChange({ tags: newTags.length > 0 ? newTags : undefined });
              }}
              className={`px-3 py-1 text-sm rounded-full border ${
                (query.tags || []).includes(tag)
                  ? 'bg-blue-100 text-blue-800 border-blue-300'
                  : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};


