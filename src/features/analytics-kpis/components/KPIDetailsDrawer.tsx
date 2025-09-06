import React from 'react';
import { X, Edit, Trash2, BarChart3, Target, TrendingUp, Calendar, Tag } from 'lucide-react';
import { useKPIMetric, useKPICategories, useKPIGoals, useKPIAnalysis } from '../hooks';
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

interface KPIDetailsDrawerProps {
  metricId: string;
  onClose: () => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export const KPIDetailsDrawer: React.FC<KPIDetailsDrawerProps> = ({
  metricId,
  onClose,
  onEdit,
  onDelete
}) => {
  const { metric, loading } = useKPIMetric(metricId);
  const { categories } = useKPICategories();
  const { goals } = useKPIGoals(metricId);
  const { analysis } = useKPIAnalysis(metricId);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div className="relative top-0 mx-auto w-96 shadow-lg rounded-md bg-white m-8">
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Cargando...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!metric) {
    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div className="relative top-0 mx-auto w-96 shadow-lg rounded-md bg-white m-8">
          <div className="p-8 text-center">
            <div className="text-red-500 text-xl mb-2">Error</div>
            <div className="text-gray-600 mb-4">No se pudo cargar el KPI</div>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    );
  }

  const category = categories.find(c => c.id === metric.categoryId);

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-0 mx-auto w-full max-w-4xl shadow-lg rounded-md bg-white m-8">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Detalles del KPI</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Basic Info */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Información Básica</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Nombre</label>
                <p className="text-sm text-gray-900">{metric.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Descripción</label>
                <p className="text-sm text-gray-900">{metric.description || 'Sin descripción'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Categoría</label>
                <div className="flex items-center">
                  <span className="mr-2">{category?.icon}</span>
                  <span className="text-sm text-gray-900">{category?.name || 'Categoría desconocida'}</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Fórmula</label>
                <p className="text-sm text-gray-900 font-mono bg-gray-100 p-2 rounded">{metric.formula}</p>
              </div>
            </div>
          </div>

          {/* Current Values */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Valores Actuales</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Valor Actual</label>
                <p className="text-2xl font-bold text-gray-900">
                  {formatNumber(metric.currentValue)} {metric.unit}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Valor Anterior</label>
                <p className="text-lg font-medium text-gray-900">
                  {formatNumber(metric.previousValue)} {metric.unit}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Objetivo</label>
                <p className="text-lg font-medium text-gray-900">
                  {metric.target ? `${formatNumber(metric.target)} ${metric.unit}` : 'No definido'}
                </p>
              </div>
            </div>
          </div>

          {/* Performance Indicators */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Indicadores de Rendimiento</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Cambio (%)</label>
                <div className="flex items-center">
                  <span className={`text-lg font-bold ${getChangeColor(metric.changePercentage)}`}>
                    {getChangeIcon(metric.changePercentage)} {formatPercentage(metric.changePercentage)}
                  </span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Estado</label>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getKPIStatusBgColor(metric.status)} ${getKPIStatusColor(metric.status)}`}>
                  {getKPIStatusText(metric.status)}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Tendencia</label>
                <div className="flex items-center">
                  <span className={`text-sm font-medium ${getKPITrendColor(metric.trend)}`}>
                    {getKPITrendIcon(metric.trend)} {getKPITrendText(metric.trend)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Configuration */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Configuración</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Frecuencia</label>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 ${getKPIFrequencyColor(metric.frequency)}`}>
                  {getKPIFrequencyText(metric.frequency)}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Unidad</label>
                <p className="text-sm text-gray-900">{metric.unit}</p>
              </div>
            </div>
          </div>

          {/* Goals */}
          {goals.length > 0 && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Objetivos</h3>
              <div className="space-y-3">
                {goals.map((goal) => (
                  <div key={goal.id} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{goal.name}</h4>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        goal.status === 'completed' ? 'bg-green-100 text-green-800' :
                        goal.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                        goal.status === 'overdue' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {goal.status === 'completed' ? 'Completado' :
                         goal.status === 'in_progress' ? 'En Progreso' :
                         goal.status === 'overdue' ? 'Retrasado' :
                         'No Iniciado'}
                      </span>
                    </div>
                    {goal.description && (
                      <p className="text-sm text-gray-600 mb-2">{goal.description}</p>
                    )}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Objetivo:</span> {formatNumber(goal.targetValue)} {metric.unit}
                      </div>
                      <div>
                        <span className="text-gray-500">Actual:</span> {formatNumber(goal.currentValue)} {metric.unit}
                      </div>
                      <div>
                        <span className="text-gray-500">Progreso:</span> {goal.progress.toFixed(1)}%
                      </div>
                      <div>
                        <span className="text-gray-500">Fecha límite:</span> {new Date(goal.endDate).toLocaleDateString('es-ES')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Analysis */}
          {analysis && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Análisis</h3>
              
              {/* Insights */}
              {analysis.insights.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-md font-medium text-gray-800 mb-2">Insights</h4>
                  <div className="space-y-2">
                    {analysis.insights.map((insight) => (
                      <div key={insight.id} className="bg-blue-50 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-blue-900">{insight.title}</span>
                          <span className="text-xs text-blue-600">Confianza: {insight.confidence}%</span>
                        </div>
                        <p className="text-sm text-blue-800">{insight.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommendations */}
              {analysis.recommendations.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-md font-medium text-gray-800 mb-2">Recomendaciones</h4>
                  <div className="space-y-2">
                    {analysis.recommendations.map((rec) => (
                      <div key={rec.id} className="bg-green-50 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-green-900">{rec.title}</span>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            rec.priority === 'critical' ? 'bg-red-100 text-red-800' :
                            rec.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                            rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {rec.priority === 'critical' ? 'Crítica' :
                             rec.priority === 'high' ? 'Alta' :
                             rec.priority === 'medium' ? 'Media' :
                             'Baja'}
                          </span>
                        </div>
                        <p className="text-sm text-green-800">{rec.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Metadata */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Metadatos</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Fecha de creación</label>
                <p className="text-gray-900">{new Date(metric.createdAt).toLocaleString('es-ES')}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Última actualización</label>
                <p className="text-gray-900">{new Date(metric.lastUpdated).toLocaleString('es-ES')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex space-x-3">
            <button
              onClick={() => onEdit(metric.id)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </button>
            <button
              onClick={() => console.log('View analytics for:', metric.id)}
              className="inline-flex items-center px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Analytics
            </button>
          </div>
          <button
            onClick={() => onDelete(metric.id)}
            className="inline-flex items-center px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
};


