import React from 'react';
import {
  Plus,
  Download,
  Upload,
  RotateCcw,
  Filter,
  CheckCircle,
  Trash2
} from 'lucide-react';

interface ForecastsToolbarProps {
  selectedCount: number;
  totalCount: number;
  onNewForecast: () => void;
  onBulkAction: (action: string) => void;
  onExport: () => void;
  onFiltersToggle: () => void;
  onRefresh: () => void;
  showFilters: boolean;
}

export const ForecastsToolbar: React.FC<ForecastsToolbarProps> = ({
  selectedCount,
  totalCount,
  onNewForecast,
  onBulkAction,
  onExport,
  onFiltersToggle,
  onRefresh,
  showFilters
}) => {
  const selectedAmount = selectedCount > 0 ? `(${selectedCount} seleccionados)` : '';
  const totalAmount = totalCount > 0 ? `de ${totalCount} total` : '';

  return (
    <div className="bg-white shadow rounded-lg p-4 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Left side - Actions */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={onNewForecast}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Forecast
          </button>

          {selectedCount > 0 && (
            <>
              <button
                onClick={() => onBulkAction('approve')}
                className="inline-flex items-center px-3 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Aprobar Seleccionados
              </button>

              <button
                onClick={() => onBulkAction('delete')}
                className="inline-flex items-center px-3 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Eliminar Seleccionados
              </button>
            </>
          )}
        </div>

        {/* Right side - Tools and Info */}
        <div className="flex flex-wrap items-center gap-3">
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
            onClick={() => console.log('Import forecasts')}
            className="inline-flex items-center px-3 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            <Upload className="h-4 w-4 mr-2" />
            Importar
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
              {selectedCount} forecast{selectedCount !== 1 ? 's' : ''} seleccionado{selectedCount !== 1 ? 's' : ''}
            </span>
            <button
              onClick={() => onBulkAction('approve')}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Aprobar todos
            </button>
          </div>
        </div>
      )}
    </div>
  );
};


