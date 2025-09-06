import React from 'react';
import { useProductivityFilters, useResponseTimes } from '../hooks';
import { formatDurationH } from '../utils';

export function ResponseTimeChart() {
  const { filters } = useProductivityFilters();
  const { data, loading, error } = useResponseTimes(filters);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-6 w-48 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-64 bg-gray-100 rounded animate-pulse"></div>
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

  const maxValue = Math.max(
    ...data.flatMap(d => [d.p50FirstContact, d.p90FirstContact, d.p50FirstVisit, d.p90FirstVisit])
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Tiempos de Respuesta</h3>
        
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-blue-500 rounded"></div>
            <span>P50 1er contacto</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-blue-300 rounded"></div>
            <span>P90 1er contacto</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span>P50 1era visita</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-green-300 rounded"></div>
            <span>P90 1era visita</span>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {data.map((agent, index) => {
          const p50ContactWidth = (agent.p50FirstContact / maxValue) * 100;
          const p90ContactWidth = (agent.p90FirstContact / maxValue) * 100;
          const p50VisitWidth = (agent.p50FirstVisit / maxValue) * 100;
          const p90VisitWidth = (agent.p90FirstVisit / maxValue) * 100;

          return (
            <div key={agent.agentId || index} className="space-y-2">
              <div className="text-sm font-medium text-gray-900">
                {agent.agentName || `Agente ${index + 1}`}
              </div>
              
              <div className="space-y-1">
                {/* First Contact Times */}
                <div className="flex items-center gap-2">
                  <div className="w-20 text-xs text-gray-600">1er contacto</div>
                  <div className="flex-1 relative h-4 bg-gray-100 rounded-sm overflow-hidden">
                    <div 
                      className="absolute top-0 left-0 h-2 bg-blue-500 rounded-sm"
                      style={{ width: `${p50ContactWidth}%` }}
                    ></div>
                    <div 
                      className="absolute bottom-0 left-0 h-2 bg-blue-300 rounded-sm"
                      style={{ width: `${p90ContactWidth}%` }}
                    ></div>
                  </div>
                  <div className="w-16 text-xs text-gray-600 text-right">
                    {formatDurationH(agent.p50FirstContact)}
                  </div>
                </div>
                
                {/* First Visit Times */}
                <div className="flex items-center gap-2">
                  <div className="w-20 text-xs text-gray-600">1era visita</div>
                  <div className="flex-1 relative h-4 bg-gray-100 rounded-sm overflow-hidden">
                    <div 
                      className="absolute top-0 left-0 h-2 bg-green-500 rounded-sm"
                      style={{ width: `${p50VisitWidth}%` }}
                    ></div>
                    <div 
                      className="absolute bottom-0 left-0 h-2 bg-green-300 rounded-sm"
                      style={{ width: `${p90VisitWidth}%` }}
                    ></div>
                  </div>
                  <div className="w-16 text-xs text-gray-600 text-right">
                    {formatDurationH(agent.p50FirstVisit)}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {data.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No hay datos disponibles para el per\u00edodo seleccionado
        </div>
      )}
      
      <div className="text-xs text-gray-500">
        P50: mediana (50% de los casos son menores). P90: 90% de los casos son menores.
      </div>
    </div>
  );
}