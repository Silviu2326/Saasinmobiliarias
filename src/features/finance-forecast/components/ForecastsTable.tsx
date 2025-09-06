import React from 'react';
import {
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  MoreHorizontal
} from 'lucide-react';
import { useForecastPeriods, useForecastCategories } from '../hooks';
import {
  formatCurrency,
  formatDate,
  getForecastTypeColor,
  getForecastTypeText,
  getForecastStatusColor,
  getForecastStatusText,
  getProbabilityColor,
  getProbabilityText
} from '../utils';
import type { ForecastItem } from '../types';

interface ForecastsTableProps {
  forecasts: ForecastItem[];
  loading: boolean;
  selectedIds: Set<string>;
  isAllSelected: boolean;
  isIndeterminate: boolean;
  onToggleAll: () => void;
  onToggleItem: (id: string) => void;
  onForecastSelect: (forecast: ForecastItem) => void;
  onForecastEdit: (id: string) => void;
  onForecastDelete: (id: string) => void;
  onForecastApprove: (id: string) => void;
  onForecastReject: (id: string) => void;
}

export const ForecastsTable: React.FC<ForecastsTableProps> = ({
  forecasts,
  loading,
  selectedIds,
  isAllSelected,
  isIndeterminate,
  onToggleAll,
  onToggleItem,
  onForecastSelect,
  onForecastEdit,
  onForecastDelete,
  onForecastApprove,
  onForecastReject
}) => {
  const { periods } = useForecastPeriods();
  const { categories } = useForecastCategories();

  const getPeriodName = (periodId: string) => {
    const period = periods.find(p => p.id === periodId);
    return period?.name || 'Período desconocido';
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category?.name || 'Categoría desconocida';
  };

  const getCategoryColor = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category?.color || '#6B7280';
  };

  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Cargando forecasts...</span>
        </div>
      </div>
    );
  }

  if (forecasts.length === 0) {
    return (
      <div className="bg-white shadow rounded-lg p-8 text-center">
        <div className="text-gray-500">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No hay forecasts</h3>
          <p className="mt-1 text-sm text-gray-500">
            No se encontraron forecasts que coincidan con los criterios de búsqueda.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  ref={(input) => {
                    if (input) input.indeterminate = isIndeterminate;
                  }}
                  onChange={onToggleAll}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Forecast
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Período
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Categoría
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tipo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Monto
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Probabilidad
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fecha
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {forecasts.map((forecast) => (
              <tr
                key={forecast.id}
                className={`hover:bg-gray-50 ${
                  selectedIds.has(forecast.id) ? 'bg-blue-50' : ''
                }`}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(forecast.id)}
                    onChange={() => onToggleItem(forecast.id)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-700">
                          {forecast.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900 cursor-pointer hover:text-blue-600" onClick={() => onForecastSelect(forecast)}>
                        {forecast.name}
                      </div>
                      {forecast.description && (
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {forecast.description}
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {getPeriodName(forecast.periodId)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div
                      className="w-3 h-3 rounded-full mr-2"
                      style={{ backgroundColor: getCategoryColor(forecast.categoryId) }}
                    ></div>
                    <span className="text-sm text-gray-900">
                      {getCategoryName(forecast.categoryId)}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getForecastTypeColor(forecast.type)}`}>
                    {getForecastTypeText(forecast.type)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                  {formatCurrency(forecast.amount, forecast.currency)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <span className={`text-sm font-medium ${getProbabilityColor(forecast.probability)}`}>
                      {forecast.probability}%
                    </span>
                    <span className="ml-2 text-xs text-gray-500">
                      ({getProbabilityText(forecast.probability)})
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getForecastStatusColor(forecast.status)}`}>
                    {getForecastStatusText(forecast.status)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(forecast.createdAt)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end space-x-2">
                    <button
                      onClick={() => onForecastSelect(forecast)}
                      className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-100"
                      title="Ver detalles"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onForecastEdit(forecast.id)}
                      className="text-indigo-600 hover:text-indigo-900 p-1 rounded hover:bg-indigo-100"
                      title="Editar"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    {forecast.status === 'draft' && (
                      <>
                        <button
                          onClick={() => onForecastApprove(forecast.id)}
                          className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-100"
                          title="Aprobar"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => onForecastReject(forecast.id)}
                          className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-100"
                          title="Rechazar"
                        >
                          <XCircle className="h-4 w-4" />
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => onForecastDelete(forecast.id)}
                      className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-100"
                      title="Eliminar"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <button className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100">
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};


