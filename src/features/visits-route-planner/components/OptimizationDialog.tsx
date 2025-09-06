import React, { useState } from 'react';
import { RouteOptimizationSettings } from '../types';

interface OptimizationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onOptimize: (settings: RouteOptimizationSettings) => void;
  currentSettings: RouteOptimizationSettings;
  isLoading: boolean;
}

export default function OptimizationDialog({
  isOpen,
  onClose,
  onOptimize,
  currentSettings,
  isLoading
}: OptimizationDialogProps) {
  const [settings, setSettings] = useState<RouteOptimizationSettings>(currentSettings);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onOptimize(settings);
  };

  const handleReset = () => {
    setSettings({
      startLocation: {
        lat: 40.4168,
        lng: -3.7038,
        address: 'Oficina Central, Madrid',
        name: 'Oficina'
      },
      startTime: '09:00',
      averageVisitDuration: 60,
      averageSpeedKmh: 30,
      includeTrafficBuffer: true,
      trafficBufferPercent: 20,
      prioritizeTimeWindows: true
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-screen overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Configuración de Optimización</h2>
              <p className="text-sm text-gray-600">
                Ajusta los parámetros para optimizar tu ruta
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
              disabled={isLoading}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Start Location */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Punto de Inicio</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Nombre/Descripción
                  </label>
                  <input
                    type="text"
                    value={settings.startLocation.name || ''}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      startLocation: { ...prev.startLocation, name: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ej: Oficina Central"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Hora de inicio
                  </label>
                  <input
                    type="time"
                    value={settings.startTime}
                    onChange={(e) => setSettings(prev => ({ ...prev, startTime: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div className="mt-3">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Dirección
                </label>
                <input
                  type="text"
                  value={settings.startLocation.address || ''}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    startLocation: { ...prev.startLocation, address: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Dirección completa"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 mt-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Latitud
                  </label>
                  <input
                    type="number"
                    step="0.000001"
                    value={settings.startLocation.lat}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      startLocation: { ...prev.startLocation, lat: parseFloat(e.target.value) || 0 }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Longitud
                  </label>
                  <input
                    type="number"
                    step="0.000001"
                    value={settings.startLocation.lng}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      startLocation: { ...prev.startLocation, lng: parseFloat(e.target.value) || 0 }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Visit Parameters */}
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Parámetros de Visita</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Duración promedio (minutos)
                  </label>
                  <input
                    type="number"
                    min="15"
                    max="240"
                    value={settings.averageVisitDuration}
                    onChange={(e) => setSettings(prev => ({ ...prev, averageVisitDuration: parseInt(e.target.value) || 60 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Tiempo estimado por visita
                  </p>
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Velocidad promedio (km/h)
                  </label>
                  <input
                    type="number"
                    min="10"
                    max="80"
                    value={settings.averageSpeedKmh}
                    onChange={(e) => setSettings(prev => ({ ...prev, averageSpeedKmh: parseInt(e.target.value) || 30 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Velocidad de desplazamiento urbano
                  </p>
                </div>
              </div>
            </div>

            {/* Traffic and Time Windows */}
            <div className="bg-yellow-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Tráfico y Ventanas Horarias</h3>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="includeTrafficBuffer"
                    checked={settings.includeTrafficBuffer}
                    onChange={(e) => setSettings(prev => ({ ...prev, includeTrafficBuffer: e.target.checked }))}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="includeTrafficBuffer" className="text-sm text-gray-700">
                    Incluir margen por tráfico
                  </label>
                </div>

                {settings.includeTrafficBuffer && (
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Margen de tráfico (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={settings.trafficBufferPercent}
                      onChange={(e) => setSettings(prev => ({ ...prev, trafficBufferPercent: parseInt(e.target.value) || 20 }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Tiempo adicional para compensar el tráfico
                    </p>
                  </div>
                )}

                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="prioritizeTimeWindows"
                    checked={settings.prioritizeTimeWindows}
                    onChange={(e) => setSettings(prev => ({ ...prev, prioritizeTimeWindows: e.target.checked }))}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="prioritizeTimeWindows" className="text-sm text-gray-700">
                    Priorizar ventanas horarias
                  </label>
                </div>
                <p className="text-xs text-gray-500 ml-7 -mt-3">
                  Optimizar para cumplir con las horas programadas
                </p>
              </div>
            </div>

            {/* Constraints */}
            <div className="bg-red-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Restricciones (Opcional)</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Distancia máxima (km)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={settings.maxRouteDistance || ''}
                    onChange={(e) => setSettings(prev => ({ ...prev, maxRouteDistance: e.target.value ? parseInt(e.target.value) : undefined }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Sin límite"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Tiempo máximo (horas)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={settings.maxRouteTime || ''}
                    onChange={(e) => setSettings(prev => ({ ...prev, maxRouteTime: e.target.value ? parseInt(e.target.value) : undefined }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Sin límite"
                  />
                </div>
              </div>
            </div>

            {/* Algorithm Info */}
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-green-600 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <div>
                  <h4 className="text-sm font-medium text-green-800">Algoritmo del Vecino Más Cercano</h4>
                  <p className="text-xs text-green-700 mt-1">
                    Utiliza un algoritmo heurístico que selecciona la siguiente visita más cercana,
                    considerando la distancia, prioridad y ventanas horarias para optimizar la ruta.
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between space-x-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={handleReset}
                className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                Restaurar valores por defecto
              </button>
              
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isLoading}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      <span>Optimizando...</span>
                    </div>
                  ) : (
                    'Optimizar Ruta'
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}