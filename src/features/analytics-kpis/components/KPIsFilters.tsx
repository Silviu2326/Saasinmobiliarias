import React from 'react';
import { useKPICategories } from '../hooks';
import type { KPIFilter } from '../types';

interface KPIsFiltersProps {
  filter: KPIFilter;
  onFilterChange: (updates: Partial<KPIFilter>) => void;
  className?: string;
}

export const KPIsFilters: React.FC<KPIsFiltersProps> = ({
  filter,
  onFilterChange,
  className = ''
}) => {
  const { categories } = useKPICategories();

  const handleInputChange = (field: keyof KPIFilter, value: any) => {
    onFilterChange({ [field]: value });
  };

  const handleCategoryChange = (categoryId: string, checked: boolean) => {
    const currentCategories = filter.categoryIds || [];
    let newCategories: string[];
    
    if (checked) {
      newCategories = [...currentCategories, categoryId];
    } else {
      newCategories = currentCategories.filter(id => id !== categoryId);
    }
    
    onFilterChange({ categoryIds: newCategories.length > 0 ? newCategories : undefined });
  };

  const clearFilters = () => {
    onFilterChange({
      categoryIds: undefined,
      timeRange: undefined,
      frequency: undefined,
      status: undefined,
      trend: undefined,
      search: undefined
    });
  };

  const hasActiveFilters = Object.values(filter).some(value => 
    value !== undefined && 
    value !== '' && 
    (Array.isArray(value) ? value.length > 0 : true)
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
            value={filter.search || ''}
            onChange={(e) => handleInputChange('search', e.target.value)}
            placeholder="Buscar por nombre, descripción..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Estado */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Estado
          </label>
          <select
            value={filter.status || ''}
            onChange={(e) => handleInputChange('status', e.target.value || undefined)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Todos los estados</option>
            <option value="excellent">Excelente</option>
            <option value="good">Bueno</option>
            <option value="warning">Advertencia</option>
            <option value="critical">Crítico</option>
          </select>
        </div>

        {/* Tendencia */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tendencia
          </label>
          <select
            value={filter.trend || ''}
            onChange={(e) => handleInputChange('trend', e.target.value || undefined)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Todas las tendencias</option>
            <option value="up">Subiendo</option>
            <option value="down">Bajando</option>
            <option value="stable">Estable</option>
          </select>
        </div>

        {/* Frecuencia */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Frecuencia
          </label>
          <select
            value={filter.frequency || ''}
            onChange={(e) => handleInputChange('frequency', e.target.value || undefined)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Todas las frecuencias</option>
            <option value="daily">Diario</option>
            <option value="weekly">Semanal</option>
            <option value="monthly">Mensual</option>
            <option value="quarterly">Trimestral</option>
            <option value="yearly">Anual</option>
          </select>
        </div>
      </div>

      {/* Categorías */}
      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Categorías
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {categories.map((category) => (
            <label key={category.id} className="flex items-center">
              <input
                type="checkbox"
                checked={(filter.categoryIds || []).includes(category.id)}
                onChange={(e) => handleCategoryChange(category.id, e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700 flex items-center">
                <span className="mr-2">{category.icon}</span>
                {category.name}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Rango de tiempo personalizado */}
      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Rango de tiempo personalizado
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Fecha de inicio</label>
            <input
              type="date"
              value={filter.timeRange?.start || ''}
              onChange={(e) => handleInputChange('timeRange', { 
                ...filter.timeRange, 
                start: e.target.value 
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Fecha de fin</label>
            <input
              type="date"
              value={filter.timeRange?.end || ''}
              onChange={(e) => handleInputChange('timeRange', { 
                ...filter.timeRange, 
                end: e.target.value 
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>
    </div>
  );
};


