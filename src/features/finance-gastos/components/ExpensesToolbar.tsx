import React from 'react';
import { 
  Plus, 
  CheckCircle, 
  Download, 
  Upload, 
  FileText, 
  Calendar,
  RotateCcw,
  Filter
} from 'lucide-react';
import type { ExpenseQuery } from '../types';
import { formatCurrency } from '../utils';

interface ExpensesToolbarProps {
  onNewExpense: () => void;
  onApprove: () => void;
  onExport: () => void;
  onImport: () => void;
  selectedCount: number;
  totalCount: number;
  selectedTotal?: {
    base: number;
    iva: number;
    total: number;
    paid: number;
    balance: number;
  };
  isLoading: boolean;
  filters: ExpenseQuery;
  onFiltersToggle: () => void;
  showFilters: boolean;
}

export default function ExpensesToolbar({
  onNewExpense,
  onApprove,
  onExport,
  onImport,
  selectedCount,
  totalCount,
  selectedTotal,
  isLoading,
  filters,
  onFiltersToggle,
  showFilters
}: ExpensesToolbarProps) {
  const hasSelection = selectedCount > 0;
  const hasOneSelection = selectedCount === 1;

  return (
    <div className="bg-white shadow rounded-lg mb-6">
      <div className="px-4 py-4">
        {/* Barra principal */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Botón Nuevo Gasto */}
            <button
              onClick={onNewExpense}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors"
            >
              <Plus className="h-4 w-4" />
              Nuevo Gasto
            </button>

            <div className="h-6 w-px bg-gray-300" />

            {/* Acciones múltiples */}
            <button
              onClick={onApprove}
              disabled={!hasSelection || isLoading}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
            >
              <CheckCircle className="h-4 w-4" />
              Aprobar ({selectedCount})
            </button>

            <button
              onClick={onExport}
              disabled={isLoading}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
            >
              <Download className="h-4 w-4" />
              Exportar
            </button>

            <button
              onClick={onImport}
              disabled={isLoading}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
            >
              <Upload className="h-4 w-4" />
              Importar
            </button>
          </div>

          <div className="flex items-center gap-2">
            {/* Botón de filtros */}
            <button
              onClick={onFiltersToggle}
              className={`px-3 py-2 text-sm rounded-lg flex items-center gap-2 transition-colors ${
                showFilters
                  ? 'bg-blue-100 text-blue-700 border border-blue-200'
                  : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Filter className="h-4 w-4" />
              Filtros
            </button>

            {/* Botón de refrescar */}
            <button
              onClick={() => window.location.reload()}
              disabled={isLoading}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
            >
              <RotateCcw className="h-4 w-4" />
              Refrescar
            </button>
          </div>
        </div>

        {/* Información de selección */}
        {hasSelection && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <span className="text-sm text-gray-600">
                  {selectedCount} de {totalCount} gastos seleccionados
                </span>
                
                {selectedTotal && (
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-gray-600">
                      Base: <span className="font-medium">{formatCurrency(selectedTotal.base)}</span>
                    </span>
                    <span className="text-gray-600">
                      IVA: <span className="font-medium">{formatCurrency(selectedTotal.iva)}</span>
                    </span>
                    <span className="text-gray-600">
                      Total: <span className="font-medium text-blue-600">{formatCurrency(selectedTotal.total)}</span>
                    </span>
                    <span className="text-gray-600">
                      Pagado: <span className="font-medium text-green-600">{formatCurrency(selectedTotal.paid)}</span>
                    </span>
                    <span className="text-gray-600">
                      Pendiente: <span className="font-medium text-yellow-600">{formatCurrency(selectedTotal.balance)}</span>
                    </span>
                  </div>
                )}
              </div>

              <button
                onClick={() => window.location.reload()}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Limpiar selección
              </button>
            </div>
          </div>
        )}

        {/* Información de filtros activos */}
        {Object.keys(filters).some(key => 
          key !== 'page' && key !== 'size' && key !== 'sort' && filters[key as keyof ExpenseQuery]
        ) && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Filtros activos:</span>
              <div className="flex flex-wrap gap-2">
                {filters.q && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Búsqueda: {filters.q}
                  </span>
                )}
                {filters.status && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Estado: {filters.status}
                  </span>
                )}
                {filters.type && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    Tipo: {filters.type}
                  </span>
                )}
                {filters.from && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                    Desde: {filters.from}
                  </span>
                )}
                {filters.to && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                    Hasta: {filters.to}
                  </span>
                )}
                {filters.minAmount && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                    Min: {formatCurrency(filters.minAmount)}
                  </span>
                )}
                {filters.maxAmount && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                    Max: {formatCurrency(filters.maxAmount)}
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

