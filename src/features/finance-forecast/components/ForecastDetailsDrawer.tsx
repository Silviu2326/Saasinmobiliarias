import React from 'react';
import { X, Edit, Trash2, CheckCircle, XCircle, Calendar, Tag, FileText } from 'lucide-react';
import { useForecast, useForecastPeriods, useForecastCategories } from '../hooks';
import {
  formatCurrency,
  formatDate,
  formatDateTime,
  getForecastTypeColor,
  getForecastTypeText,
  getForecastStatusColor,
  getForecastStatusText,
  getProbabilityColor,
  getProbabilityText
} from '../utils';

interface ForecastDetailsDrawerProps {
  forecastId: string;
  onClose: () => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export const ForecastDetailsDrawer: React.FC<ForecastDetailsDrawerProps> = ({
  forecastId,
  onClose,
  onEdit,
  onDelete
}) => {
  const { forecast, loading } = useForecast(forecastId);
  const { periods } = useForecastPeriods();
  const { categories } = useForecastCategories();

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

  if (!forecast) {
    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div className="relative top-0 mx-auto w-96 shadow-lg rounded-md bg-white m-8">
          <div className="p-8 text-center">
            <div className="text-red-500 text-xl mb-2">Error</div>
            <div className="text-gray-600 mb-4">No se pudo cargar el forecast</div>
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

  const period = periods.find(p => p.id === forecast.periodId);
  const category = categories.find(c => c.id === forecast.categoryId);

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-0 mx-auto w-full max-w-2xl shadow-lg rounded-md bg-white m-8">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Detalles del Forecast</h2>
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
                <p className="text-sm text-gray-900">{forecast.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Descripción</label>
                <p className="text-sm text-gray-900">{forecast.description || 'Sin descripción'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Tipo</label>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getForecastTypeColor(forecast.type)}`}>
                  {getForecastTypeText(forecast.type)}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Estado</label>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getForecastStatusColor(forecast.status)}`}>
                  {getForecastStatusText(forecast.status)}
                </span>
              </div>
            </div>
          </div>

          {/* Financial Info */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Información Financiera</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Monto</label>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(forecast.amount, forecast.currency)}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Moneda</label>
                <p className="text-sm text-gray-900">{forecast.currency}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Probabilidad</label>
                <div className="flex items-center">
                  <span className={`text-lg font-bold ${getProbabilityColor(forecast.probability)}`}>
                    {forecast.probability}%
                  </span>
                  <span className="ml-2 text-xs text-gray-500">
                    ({getProbabilityText(forecast.probability)})
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Classification */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Clasificación</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Período</label>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-sm text-gray-900">{period?.name || 'Período desconocido'}</span>
                </div>
                {period && (
                  <p className="text-xs text-gray-500 mt-1">
                    {formatDate(period.startDate)} - {formatDate(period.endDate)}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Categoría</label>
                <div className="flex items-center">
                  <div
                    className="w-4 h-4 rounded-full mr-2"
                    style={{ backgroundColor: category?.color || '#6B7280' }}
                  ></div>
                  <span className="text-sm text-gray-900">{category?.name || 'Categoría desconocida'}</span>
                </div>
                {category?.description && (
                  <p className="text-xs text-gray-500 mt-1">{category.description}</p>
                )}
              </div>
            </div>
          </div>

          {/* Tags */}
          {forecast.tags.length > 0 && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Etiquetas</h3>
              <div className="flex flex-wrap gap-2">
                {forecast.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    <Tag className="h-3 w-3 mr-1" />
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {forecast.notes && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Notas</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-start">
                  <FileText className="h-4 w-4 text-gray-400 mr-2 mt-0.5" />
                  <p className="text-sm text-gray-700">{forecast.notes}</p>
                </div>
              </div>
            </div>
          )}

          {/* Metadata */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Metadatos</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Fecha de creación</label>
                <p className="text-gray-900">{formatDateTime(forecast.createdAt)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Última actualización</label>
                <p className="text-gray-900">{formatDateTime(forecast.updatedAt)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex space-x-3">
            <button
              onClick={() => onEdit(forecast.id)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </button>
            {forecast.status === 'draft' && (
              <>
                <button
                  onClick={() => {
                    console.log('Approve forecast:', forecast.id);
                    onClose();
                  }}
                  className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Aprobar
                </button>
                <button
                  onClick={() => {
                    console.log('Reject forecast:', forecast.id);
                    onClose();
                  }}
                  className="inline-flex items-center px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Rechazar
                </button>
              </>
            )}
          </div>
          <button
            onClick={() => onDelete(forecast.id)}
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


