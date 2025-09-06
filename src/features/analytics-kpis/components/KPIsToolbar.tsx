import React from 'react';
import {
  Plus,
  Download,
  Upload,
  RotateCcw,
  Filter,
  BarChart3,
  Settings
} from 'lucide-react';
import type { KPITimeRange } from '../types';

interface KPIsToolbarProps {
  selectedCount: number;
  totalCount: number;
  onNewKPI: () => void;
  onBulkAction: (action: string) => void;
  onExport: () => void;
  onFiltersToggle: () => void;
  onRefresh: () => void;
  showFilters: boolean;
  selectedTimeRange: KPITimeRange | null;
  onTimeRangeChange: (timeRange: KPITimeRange) => void;
  timeRanges: KPITimeRange[];
}

export const KPIsToolbar: React.FC<KPIsToolbarProps> = ({
  selectedCount,
  totalCount,
  onNewKPI,
  onBulkAction,
  onExport,
  onFiltersToggle,
  onRefresh,
  showFilters,
  selectedTimeRange,
  onTimeRangeChange,
  timeRanges
}) => {
  const selectedAmount = selectedCount > 0 ? `(${selectedCount} seleccionados)` : '';
  const totalAmount = totalCount > 0 ? `de ${totalCount} total` : '';

  return (
    <div className="bg-white shadow rounded-lg p-4 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Left side - Actions */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={onNewKPI}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nuevo KPI
          </button>

          {selectedCount > 0 && (
            <>
              <button
                onClick={() => onBulkAction('refresh')}
                className="inline-flex items-center px-3 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Actualizar Seleccionados
              </button>

              <button
                onClick={() => onBulkAction('export')}
                className="inline-flex items-center px-3 py-2 bg-purple-600 text-white text-sm font-medium rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              >
                <Download className="h-4 w-4 mr-2" />
                Exportar Seleccionados
              </button>
            </>
          )}
        </div>

        {/* Right side - Tools and Info */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Time Range Selector */}
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Período:</label>
            <select
              value={selectedTimeRange?.id || ''}
              onChange={(e) => {
                const timeRange = timeRanges.find(tr => tr.id === e.target.value);
                if (timeRange) {
                  onTimeRangeChange(timeRange);
                }
              }}
              className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {timeRanges.map((timeRange) => (
                <option key={timeRange.id} value={timeRange.id}>
                  {timeRange.name}
                </option>
              ))}
            </select>
          </div>

          {/* Selection info */}
          {selectedCount > 0 && (
            <div className="text-sm text-gray-600 px-3 py-1 bg-gray-100 rounded-md">
              {selectedAmount} {totalAmount}
            </div>
          )}

          {/* Action buttons */}
          <button
            onClick={onExport}
            className="inline-flex items-center px-3 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </button>

          <button
            onClick={() => console.log('Import KPIs')}
            className="inline-flex items-center px-3 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            <Upload className="h-4 w-4 mr-2" />
            Importar
          </button>

          <button
            onClick={() => console.log('Analytics dashboard')}
            className="inline-flex items-center px-3 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
          </button>

          <button
            onClick={() => console.log('Settings')}
            className="inline-flex items-center px-3 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            <Settings className="h-4 w-4 mr-2" />
            Configuración
          </button>

          <button
            onClick={onFiltersToggle}
            className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              showFilters
                ? 'bg-blue-100 text-blue-700 hover:bg-blue-200 focus:ring-blue-500'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-500'
            }`}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </button>

          <button
            onClick={onRefresh}
            className="inline-flex items-center px-3 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Additional info row */}
      {selectedCount > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>
              {selectedCount} KPI{selectedCount !== 1 ? 's' : ''} seleccionado{selectedCount !== 1 ? 's' : ''}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => onBulkAction('refresh')}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Actualizar todos
              </button>
              <button
                onClick={() => onBulkAction('export')}
                className="text-purple-600 hover:text-purple-800 font-medium"
              >
                Exportar todos
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


