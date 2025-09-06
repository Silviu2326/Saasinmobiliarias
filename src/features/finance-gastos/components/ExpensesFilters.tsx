import React, { useState, useEffect } from 'react';
import { X, Search, Calendar, DollarSign, Filter } from 'lucide-react';
import type { ExpenseQuery } from '../types';
import { useExpenseCategories, useSuppliers } from '../hooks';

interface ExpensesFiltersProps {
  filters: ExpenseQuery;
  onFiltersChange: (filters: ExpenseQuery) => void;
  onFiltersReset: () => void;
}

export default function ExpensesFilters({
  filters,
  onFiltersChange,
  onFiltersReset
}: ExpensesFiltersProps) {
  const [localFilters, setLocalFilters] = useState<ExpenseQuery>(filters);
  const { categories } = useExpenseCategories();
  const { suppliers } = useSuppliers();

  // Sincronizar filtros locales con los del padre
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const updateLocalFilter = (field: keyof ExpenseQuery, value: any) => {
    setLocalFilters(prev => ({ ...prev, [field]: value }));
  };

  const applyFilters = () => {
    onFiltersChange(localFilters);
  };

  const clearFilters = () => {
    const clearedFilters = {
      page: 1,
      size: filters.size,
      sort: filters.sort
    };
    setLocalFilters(clearedFilters);
    onFiltersReset();
  };

  const hasActiveFilters = Object.keys(filters).some(key => 
    key !== 'page' && key !== 'size' && key !== 'sort' && filters[key as keyof ExpenseQuery]
  );

  return (
    <div className="bg-white shadow rounded-lg mb-6">
      <div className="px-4 py-4">
        {/* Header de filtros */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-gray-500" />
            <h3 className="text-lg font-medium text-gray-900">Filtros</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={clearFilters}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Limpiar todo
            </button>
            <button
              onClick={applyFilters}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
            >
              Aplicar filtros
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Búsqueda de texto */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Búsqueda
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={localFilters.q || ''}
                onChange={(e) => updateLocalFilter('q', e.target.value)}
                placeholder="Buscar por número, proveedor..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Estado */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estado
            </label>
            <select
              value={localFilters.status || ''}
              onChange={(e) => updateLocalFilter('status', e.target.value || undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Todos los estados</option>
              <option value="PENDING">Pendiente</option>
              <option value="APPROVED">Aprobado</option>
              <option value="REJECTED">Rechazado</option>
              <option value="PAID">Pagado</option>
              <option value="CANCELLED">Cancelado</option>
            </select>
          </div>

          {/* Tipo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo
            </label>
            <select
              value={localFilters.type || ''}
              onChange={(e) => updateLocalFilter('type', e.target.value || undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Todos los tipos</option>
              <option value="OPERATIONAL">Operacional</option>
              <option value="MARKETING">Marketing</option>
              <option value="ADMINISTRATIVE">Administrativo</option>
              <option value="MAINTENANCE">Mantenimiento</option>
              <option value="INSURANCE">Seguros</option>
              <option value="UTILITIES">Servicios</option>
              <option value="OTHER">Otros</option>
            </select>
          </div>

          {/* Serie */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Serie
            </label>
            <input
              type="text"
              value={localFilters.series || ''}
              onChange={(e) => updateLocalFilter('series', e.target.value || undefined)}
              placeholder="Ej: G, F, etc."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Proveedor */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Proveedor
            </label>
            <select
              value={localFilters.supplierId || ''}
              onChange={(e) => updateLocalFilter('supplierId', e.target.value || undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Todos los proveedores</option>
              {suppliers.map(supplier => (
                <option key={supplier.id} value={supplier.id}>
                  {supplier.name}
                </option>
              ))}
            </select>
          </div>

          {/* Categoría */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Categoría
            </label>
            <select
              value={localFilters.categoryId || ''}
              onChange={(e) => updateLocalFilter('categoryId', e.target.value || undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Todas las categorías</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Fecha desde */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha desde
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="date"
                value={localFilters.from || ''}
                onChange={(e) => updateLocalFilter('from', e.target.value || undefined)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Fecha hasta */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha hasta
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="date"
                value={localFilters.to || ''}
                onChange={(e) => updateLocalFilter('to', e.target.value || undefined)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Fecha de vencimiento desde */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Vencimiento desde
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="date"
                value={localFilters.dueFrom || ''}
                onChange={(e) => updateLocalFilter('dueFrom', e.target.value || undefined)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Fecha de vencimiento hasta */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Vencimiento hasta
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="date"
                value={localFilters.dueTo || ''}
                onChange={(e) => updateLocalFilter('dueTo', e.target.value || undefined)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Estado de pago */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estado de pago
            </label>
            <select
              value={localFilters.paid === undefined ? '' : localFilters.paid.toString()}
              onChange={(e) => updateLocalFilter('paid', e.target.value === '' ? undefined : e.target.value === 'true')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Todos</option>
              <option value="true">Pagado</option>
              <option value="false">Pendiente</option>
            </select>
          </div>

          {/* Importe mínimo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Importe mínimo
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="number"
                step="0.01"
                min="0"
                value={localFilters.minAmount || ''}
                onChange={(e) => updateLocalFilter('minAmount', e.target.value ? parseFloat(e.target.value) : undefined)}
                placeholder="0.00"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Importe máximo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Importe máximo
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="number"
                step="0.01"
                min="0"
                value={localFilters.maxAmount || ''}
                onChange={(e) => updateLocalFilter('maxAmount', e.target.value ? parseFloat(e.target.value) : undefined)}
                placeholder="0.00"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Filtros activos */}
        {hasActiveFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Filtros aplicados:</span>
              <div className="flex flex-wrap gap-2">
                {filters.q && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Búsqueda: {filters.q}
                    <button
                      onClick={() => updateLocalFilter('q', undefined)}
                      className="ml-1 hover:bg-blue-200 rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {filters.status && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Estado: {filters.status}
                    <button
                      onClick={() => updateLocalFilter('status', undefined)}
                      className="ml-1 hover:bg-green-200 rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {filters.type && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    Tipo: {filters.type}
                    <button
                      onClick={() => updateLocalFilter('type', undefined)}
                      className="ml-1 hover:bg-purple-200 rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {filters.from && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                    Desde: {filters.from}
                    <button
                      onClick={() => updateLocalFilter('from', undefined)}
                      className="ml-1 hover:bg-orange-200 rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {filters.to && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                    Hasta: {filters.to}
                    <button
                      onClick={() => updateLocalFilter('to', undefined)}
                      className="ml-1 hover:bg-orange-200 rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {filters.minAmount && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                    Min: €{filters.minAmount}
                    <button
                      onClick={() => updateLocalFilter('minAmount', undefined)}
                      className="ml-1 hover:bg-indigo-200 rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {filters.maxAmount && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                    Max: €{filters.maxAmount}
                    <button
                      onClick={() => updateLocalFilter('maxAmount', undefined)}
                      className="ml-1 hover:bg-indigo-200 rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

