import React, { useState, useEffect } from 'react';
import { Search, X, Calendar, Filter, Users, Building2, User } from 'lucide-react';
import type { InvoiceQuery, InvoiceStatus, InvoiceType } from '../types';

interface InvoicesFiltersProps {
  filters: InvoiceQuery;
  onFiltersChange: (filters: InvoiceQuery) => void;
  onReset: () => void;
  isLoading: boolean;
}

export default function InvoicesFilters({
  filters,
  onFiltersChange,
  onReset,
  isLoading
}: InvoicesFiltersProps) {
  const [localFilters, setLocalFilters] = useState<InvoiceQuery>(filters);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleChange = (field: keyof InvoiceQuery, value: any) => {
    const newFilters = { ...localFilters, [field]: value, page: 1 };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleReset = () => {
    const resetFilters: InvoiceQuery = { page: 1, size: filters.size, sort: filters.sort };
    setLocalFilters(resetFilters);
    onReset();
  };

  const statusOptions: { value: InvoiceStatus; label: string }[] = [
    { value: 'BORRADOR', label: 'Borrador' },
    { value: 'EMITIDA', label: 'Emitida' },
    { value: 'ENVIADA', label: 'Enviada' },
    { value: 'PAGADA', label: 'Pagada' },
    { value: 'VENCIDA', label: 'Vencida' },
    { value: 'ANULADA', label: 'Anulada' }
  ];

  const typeOptions: { value: InvoiceType; label: string }[] = [
    { value: 'VENTA', label: 'Venta' },
    { value: 'COMPRA', label: 'Compra' }
  ];

  const seriesOptions = ['FAC', 'REC', 'PRO', 'ABN']; // Series comunes

  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900">Filtros</h3>
        </div>
        <button
          onClick={handleReset}
          className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
        >
          <X className="h-4 w-4" />
          Limpiar
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Búsqueda */}
        <div className="lg:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Búsqueda
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Número, cliente, NIF..."
              value={localFilters.q || ''}
              onChange={(e) => handleChange('q', e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Tipo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tipo
          </label>
          <select
            value={localFilters.type || ''}
            onChange={(e) => handleChange('type', e.target.value || undefined)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={isLoading}
          >
            <option value="">Todos</option>
            {typeOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Estado */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Estado
          </label>
          <select
            value={localFilters.status || ''}
            onChange={(e) => handleChange('status', e.target.value || undefined)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={isLoading}
          >
            <option value="">Todos</option>
            {statusOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Serie */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Serie
          </label>
          <select
            value={localFilters.series || ''}
            onChange={(e) => handleChange('series', e.target.value || undefined)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={isLoading}
          >
            <option value="">Todas</option>
            {seriesOptions.map(series => (
              <option key={series} value={series}>
                {series}
              </option>
            ))}
          </select>
        </div>

        {/* Fecha desde */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Fecha desde
          </label>
          <input
            type="date"
            value={localFilters.from || ''}
            onChange={(e) => handleChange('from', e.target.value || undefined)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={isLoading}
          />
        </div>

        {/* Fecha hasta */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Fecha hasta
          </label>
          <input
            type="date"
            value={localFilters.to || ''}
            onChange={(e) => handleChange('to', e.target.value || undefined)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={isLoading}
          />
        </div>

        {/* Vencimiento desde */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Vencimiento desde
          </label>
          <input
            type="date"
            value={localFilters.dueFrom || ''}
            onChange={(e) => handleChange('dueFrom', e.target.value || undefined)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={isLoading}
          />
        </div>

        {/* Vencimiento hasta */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Vencimiento hasta
          </label>
          <input
            type="date"
            value={localFilters.dueTo || ''}
            onChange={(e) => handleChange('dueTo', e.target.value || undefined)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={isLoading}
          />
        </div>

        {/* Pagada */}
        <div className="lg:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Estado de pago
          </label>
          <select
            value={localFilters.paid !== undefined ? (localFilters.paid ? 'true' : 'false') : ''}
            onChange={(e) => {
              const value = e.target.value;
              handleChange('paid', value === '' ? undefined : value === 'true');
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={isLoading}
          >
            <option value="">Todas</option>
            <option value="true">Pagadas</option>
            <option value="false">Pendientes</option>
          </select>
        </div>
      </div>

      {/* Resumen de filtros activos */}
      <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-gray-200">
        <span className="text-sm text-gray-500">Filtros activos:</span>
        
        {localFilters.q && (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
            Búsqueda: {localFilters.q}
            <button 
              onClick={() => handleChange('q', undefined)}
              className="hover:bg-blue-200 rounded-full p-0.5"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        )}
        
        {localFilters.type && (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
            Tipo: {localFilters.type}
            <button 
              onClick={() => handleChange('type', undefined)}
              className="hover:bg-green-200 rounded-full p-0.5"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        )}
        
        {localFilters.status && (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
            Estado: {localFilters.status}
            <button 
              onClick={() => handleChange('status', undefined)}
              className="hover:bg-purple-200 rounded-full p-0.5"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        )}
        
        {localFilters.series && (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
            Serie: {localFilters.series}
            <button 
              onClick={() => handleChange('series', undefined)}
              className="hover:bg-orange-200 rounded-full p-0.5"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        )}
        
        {(localFilters.from || localFilters.to) && (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
            Fecha: {localFilters.from || '...'} - {localFilters.to || '...'}
            <button 
              onClick={() => {
                handleChange('from', undefined);
                handleChange('to', undefined);
              }}
              className="hover:bg-gray-200 rounded-full p-0.5"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        )}
        
        {localFilters.paid !== undefined && (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
            {localFilters.paid ? 'Pagadas' : 'Pendientes'}
            <button 
              onClick={() => handleChange('paid', undefined)}
              className="hover:bg-yellow-200 rounded-full p-0.5"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        )}
        
        {Object.keys(localFilters).length <= 3 && (
          <span className="text-xs text-gray-400">Sin filtros activos</span>
        )}
      </div>
    </div>
  );
}