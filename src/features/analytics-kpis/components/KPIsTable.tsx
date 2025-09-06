import React from 'react';
import {
  Eye,
  Edit,
  Trash2,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react';
import { useKPICategories } from '../hooks';
import {
  formatNumber,
  formatPercentage,
  getKPIStatusColor,
  getKPIStatusText,
  getKPIStatusBgColor,
  getKPITrendColor,
  getKPITrendIcon,
  getKPITrendText,
  getKPIFrequencyText,
  getKPIFrequencyColor,
  getChangeColor,
  getChangeIcon
} from '../utils';
import type { KPIMetric } from '../types';

interface KPIsTableProps {
  metrics: KPIMetric[];
  loading: boolean;
  selectedIds: Set<string>;
  isAllSelected: boolean;
  isIndeterminate: boolean;
  onToggleAll: () => void;
  onToggleItem: (id: string) => void;
  onKPISelect: (metric: KPIMetric) => void;
  onKPIEdit: (id: string) => void;
  onKPIDelete: (id: string) => void;
  onKPIView: (id: string) => void;
}

export const KPIsTable: React.FC<KPIsTableProps> = ({
  metrics,
  loading,
  selectedIds,
  isAllSelected,
  isIndeterminate,
  onToggleAll,
  onToggleItem,
  onKPISelect,
  onKPIEdit,
  onKPIDelete,
  onKPIView
}) => {
  const { categories } = useKPICategories();

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category?.name || 'Categoría desconocida';
  };

  const getCategoryIcon = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category?.icon || '📊';
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
          <span className="ml-3 text-gray-600">Cargando KPIs...</span>
        </div>
      </div>
    );
  }

  if (metrics.length === 0) {
    return (
      <div className="bg-white shadow rounded-lg p-8 text-center">
        <div className="text-gray-500">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No hay KPIs</h3>
          <p className="mt-1 text-sm text-gray-500">
            No se encontraron KPIs que coincidan con los criterios de búsqueda.
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
                KPI
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Categoría
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Valor Actual
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Objetivo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cambio
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tendencia
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Frecuencia
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Última Actualización
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {metrics.map((metric) => (
              <tr
                key={metric.id}
                className={`hover:bg-gray-50 ${
                  selectedIds.has(metric.id) ? 'bg-blue-50' : ''
                }`}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(metric.id)}
                    onChange={() => onToggleItem(metric.id)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-700">
                          {metric.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900 cursor-pointer hover:text-blue-600" onClick={() => onKPISelect(metric)}>
                        {metric.name}
                      </div>
                      {metric.description && (
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {metric.description}
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <span className="mr-2">{getCategoryIcon(metric.categoryId)}</span>
                    <span className="text-sm text-gray-900">
                      {getCategoryName(metric.categoryId)}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                  {formatNumber(metric.currentValue)} {metric.unit}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {metric.target ? `${formatNumber(metric.target)} ${metric.unit}` : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <span className={`text-sm font-medium ${getChangeColor(metric.changePercentage)}`}>
                      {getChangeIcon(metric.changePercentage)} {formatPercentage(metric.changePercentage)}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getKPIStatusBgColor(metric.status)} ${getKPIStatusColor(metric.status)}`}>
                    {getKPIStatusText(metric.status)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <span className={`text-sm font-medium ${getKPITrendColor(metric.trend)}`}>
                      {getKPITrendIcon(metric.trend)} {getKPITrendText(metric.trend)}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 ${getKPIFrequencyColor(metric.frequency)}`}>
                    {getKPIFrequencyText(metric.frequency)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(metric.lastUpdated).toLocaleDateString('es-ES')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end space-x-2">
                    <button
                      onClick={() => onKPIView(metric.id)}
                      className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-100"
                      title="Ver detalles"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onKPISelect(metric)}
                      className="text-indigo-600 hover:text-indigo-900 p-1 rounded hover:bg-indigo-100"
                      title="Ver análisis"
                    >
                      <BarChart3 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onKPIEdit(metric.id)}
                      className="text-indigo-600 hover:text-indigo-900 p-1 rounded hover:bg-indigo-100"
                      title="Editar"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onKPIDelete(metric.id)}
                      className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-100"
                      title="Eliminar"
                    >
                      <Trash2 className="h-4 w-4" />
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


