import React from 'react';
import { useProductivityFilters, useFieldStats } from '../hooks';
import { ComponentProps } from '../types';
import { formatPct, formatNumber } from '../utils';

export function FieldOpsPanel({ onAgentClick }: ComponentProps) {
  const { filters } = useProductivityFilters();
  const { data, loading, error } = useFieldStats(filters);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-6 w-48 bg-gray-200 rounded animate-pulse"></div>
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 bg-gray-100 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600">Error: {error}</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-8 text-gray-500">
        No hay datos disponibles
      </div>
    );
  }

  const visitsRatio = data.plannedVisits > 0 ? (data.doneVisits / data.plannedVisits) * 100 : 0;
  const avgKmsPerVisit = data.doneVisits > 0 && data.kms ? data.kms / data.doneVisits : 0;
  const avgHoursPerDay = data.routeHours ? data.routeHours / 30 : 0; // Assuming 30 days

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900">Operaciones de Campo</h3>
      
      {/* Metrics Grid */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg bg-blue-50 p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-blue-600">Check-ins</div>
              <div className="text-2xl font-semibold text-blue-900">
                {data.checkins}
              </div>
            </div>
            <div className="text-3xl text-blue-400">📍</div>
          </div>
        </div>
        
        <div className="rounded-lg bg-green-50 p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-green-600">Visitas Realizadas</div>
              <div className="text-2xl font-semibold text-green-900">
                {data.doneVisits}/{data.plannedVisits}
              </div>
              <div className="text-xs text-green-600">
                {formatPct(visitsRatio)}
              </div>
            </div>
            <div className="text-3xl text-green-400">🏠</div>
          </div>
        </div>
        
        <div className="rounded-lg bg-yellow-50 p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-yellow-600">Tiempo en Ruta</div>
              <div className="text-2xl font-semibold text-yellow-900">
                {data.routeHours || 0}h
              </div>
              <div className="text-xs text-yellow-600">
                ~{avgHoursPerDay.toFixed(1)}h/día
              </div>
            </div>
            <div className="text-3xl text-yellow-400">⏱️</div>
          </div>
        </div>
        
        <div className="rounded-lg bg-purple-50 p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-purple-600">Distancia</div>
              <div className="text-2xl font-semibold text-purple-900">
                {formatNumber(data.kms || 0)} km
              </div>
              <div className="text-xs text-purple-600">
                ~{avgKmsPerVisit.toFixed(0)} km/visita
              </div>
            </div>
            <div className="text-3xl text-purple-400">🚗</div>
          </div>
        </div>
      </div>
      
      {/* Performance Indicators */}
      <div className="space-y-2">
        <div className="text-sm font-medium text-gray-700">Indicadores de Rendimiento</div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between rounded-lg border bg-white p-3">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${
                visitsRatio >= 90 ? 'bg-green-500' : 
                visitsRatio >= 75 ? 'bg-yellow-500' : 
                'bg-red-500'
              }`}></div>
              <span className="text-sm font-medium">Ratio de Visitas</span>
            </div>
            <div className={`text-sm font-medium ${
              visitsRatio >= 90 ? 'text-green-600' : 
              visitsRatio >= 75 ? 'text-yellow-600' : 
              'text-red-600'
            }`}>
              {formatPct(visitsRatio)}
            </div>
          </div>
          
          <div className="flex items-center justify-between rounded-lg border bg-white p-3">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${
                avgHoursPerDay <= 6 ? 'bg-green-500' : 
                avgHoursPerDay <= 8 ? 'bg-yellow-500' : 
                'bg-red-500'
              }`}></div>
              <span className="text-sm font-medium">Eficiencia Temporal</span>
            </div>
            <div className="text-sm text-gray-600">
              {avgHoursPerDay.toFixed(1)}h/día
            </div>
          </div>
          
          <div className="flex items-center justify-between rounded-lg border bg-white p-3">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${
                avgKmsPerVisit <= 15 ? 'bg-green-500' : 
                avgKmsPerVisit <= 25 ? 'bg-yellow-500' : 
                'bg-red-500'
              }`}></div>
              <span className="text-sm font-medium">Optimización de Rutas</span>
            </div>
            <div className="text-sm text-gray-600">
              {avgKmsPerVisit.toFixed(0)} km/visita
            </div>
          </div>
        </div>
      </div>
      
      {/* Mini Map Placeholder */}
      <div className="rounded-lg border bg-gray-50 p-4">
        <div className="text-sm font-medium text-gray-700 mb-2">Mapa de Actividad</div>
        <div className="h-32 bg-gray-200 rounded flex items-center justify-center">
          <div className="text-center text-gray-500">
            <div className="text-2xl mb-1">🗺️</div>
            <div className="text-xs">Visualización de rutas</div>
            <div className="text-xs">{data.checkins} check-ins registrados</div>
          </div>
        </div>
      </div>
      
      <div className="text-xs text-gray-500">
        Datos de campo basados en check-ins GPS y visitas programadas vs. realizadas.
      </div>
    </div>
  );
}