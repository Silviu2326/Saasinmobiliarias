import React from 'react';
import { CheckinVisit } from '../types';
import { sortVisitsByUrgency } from '../utils';
import CheckinCard from './CheckinCard';

interface CheckinListProps {
  visits: CheckinVisit[];
  onCheckin: (visit: CheckinVisit) => void;
  onCheckout: (visit: CheckinVisit) => void;
  onViewDetails: (visit: CheckinVisit) => void;
  isLoading: boolean;
  showMapMode: boolean;
}

export default function CheckinList({
  visits,
  onCheckin,
  onCheckout,
  onViewDetails,
  isLoading,
  showMapMode
}: CheckinListProps) {
  const sortedVisits = sortVisitsByUrgency(visits);

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center space-x-3">
            <svg className="animate-spin w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span className="text-gray-600">Cargando visitas de hoy...</span>
          </div>
        </div>
      </div>
    );
  }

  if (showMapMode) {
    return (
      <div className="flex-1 p-6">
        <div className="bg-gray-100 rounded-lg h-96 flex items-center justify-center">
          <div className="text-center">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Vista de Mapa</h3>
            <p className="text-gray-600 mb-4">
              Aquí se mostraría un mapa interactivo con las ubicaciones de las visitas
            </p>
            <div className="text-sm text-gray-500">
              📍 Modo simulado - No requiere servicios de mapas externos
            </div>
          </div>
        </div>

        {/* Map legend */}
        <div className="mt-4 bg-white rounded-lg border border-gray-200 p-4">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Leyenda del Mapa</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-xs text-gray-600">Vencidas</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span className="text-xs text-gray-600">Próximas</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-xs text-gray-600">En curso</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-xs text-gray-600">Completadas</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (visits.length === 0) {
    return (
      <div className="flex-1 p-6">
        <div className="text-center py-12">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay visitas programadas</h3>
          <p className="text-gray-600">
            No tienes visitas programadas para hoy. ¡Perfecto para planificar el día siguiente!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-medium text-gray-900">
            Visitas de Hoy ({visits.length})
          </h2>
          <p className="text-sm text-gray-600">
            Ordenadas por urgencia y horario
          </p>
        </div>
        
        {/* Quick filters */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1 text-xs">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-gray-600">Urgente</span>
          </div>
          <div className="flex items-center space-x-1 text-xs">
            <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
            <span className="text-gray-600">Próxima</span>
          </div>
          <div className="flex items-center space-x-1 text-xs">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <span className="text-gray-600">En curso</span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {sortedVisits.map((visit) => (
          <CheckinCard
            key={visit.id}
            visit={visit}
            onCheckin={onCheckin}
            onCheckout={onCheckout}
            onViewDetails={onViewDetails}
          />
        ))}
      </div>

      {/* Footer info */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center space-x-4">
            <span>📱 GPS simulado activo</span>
            <span>🔄 Actualización automática cada 5min</span>
          </div>
          <div className="flex items-center space-x-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
            <span>Los tiempos se actualizan en tiempo real</span>
          </div>
        </div>
      </div>
    </div>
  );
}