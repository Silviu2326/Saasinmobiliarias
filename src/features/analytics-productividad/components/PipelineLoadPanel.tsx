import React from 'react';
import { useProductivityFilters, usePipelineLoad } from '../hooks';
import { ComponentProps } from '../types';
import { formatDays, detectOverload } from '../utils';

export function PipelineLoadPanel({ onAgentClick }: ComponentProps) {
  const { filters } = useProductivityFilters();
  const { data, loading, error } = usePipelineLoad(filters);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-6 w-48 bg-gray-200 rounded animate-pulse"></div>
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
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

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900">Carga del Pipeline</h3>
      
      <div className="space-y-3">
        {data.map((agent) => {
          const isOverloaded = detectOverload(agent);
          
          return (
            <div
              key={agent.agentId}
              onClick={() => onAgentClick?.(agent.agentId)}
              className={`rounded-lg border p-4 cursor-pointer transition-colors hover:bg-gray-50 ${
                isOverloaded ? 'border-red-200 bg-red-50' : 'border-gray-200 bg-white'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="text-sm font-medium text-gray-900">
                    {agent.agentName}
                  </div>
                  {isOverloaded && (
                    <div className="rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-800">
                      ⚠️ Sobrecarga
                    </div>
                  )}
                </div>
                
                <div className="text-right text-xs text-gray-500">
                  <div>Edad promedio: {formatDays(agent.avgAgeDays)}</div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-3">
                <div className="text-center">
                  <div className={`text-xl font-semibold ${
                    agent.activeLeads > 50 ? 'text-red-600' : 
                    agent.activeLeads > 35 ? 'text-yellow-600' : 
                    'text-green-600'
                  }`}>
                    {agent.activeLeads}
                  </div>
                  <div className="text-xs text-gray-600">Leads Activos</div>
                </div>
                
                <div className="text-center">
                  <div className={`text-xl font-semibold ${
                    agent.openDeals > 12 ? 'text-red-600' : 
                    agent.openDeals > 8 ? 'text-yellow-600' : 
                    'text-blue-600'
                  }`}>
                    {agent.openDeals}
                  </div>
                  <div className="text-xs text-gray-600">Deals Abiertos</div>
                </div>
              </div>
              
              {/* Pipeline by Stage */}
              <div className="space-y-1">
                <div className="text-xs font-medium text-gray-700">Por Etapa:</div>
                <div className="flex flex-wrap gap-1">
                  {agent.byStage.map((stage, index) => {
                    const colors = ['bg-blue-100 text-blue-800', 'bg-green-100 text-green-800', 'bg-yellow-100 text-yellow-800', 'bg-purple-100 text-purple-800'];
                    const colorClass = colors[index % colors.length];
                    
                    return (
                      <div 
                        key={stage.stage}
                        className={`rounded px-2 py-1 text-xs font-medium ${colorClass}`}
                      >
                        {stage.stage}: {stage.count}
                        <span className="text-xs opacity-75"> ({formatDays(stage.avgAgeDays)})</span>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              {/* Load Progress Bar */}
              <div className="mt-3">
                <div className="flex justify-between text-xs text-gray-600 mb-1">
                  <span>Carga de trabajo</span>
                  <span>{agent.activeLeads}/60 leads</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-300 ${
                      agent.activeLeads > 50 ? 'bg-red-500' : 
                      agent.activeLeads > 35 ? 'bg-yellow-500' : 
                      'bg-green-500'
                    }`}
                    style={{ width: `${Math.min((agent.activeLeads / 60) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {data.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No hay datos disponibles
        </div>
      )}
      
      {/* Summary */}
      <div className="rounded-lg bg-gray-50 p-4">
        <div className="text-sm font-medium text-gray-700 mb-2">Resumen</div>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-lg font-semibold text-gray-900">
              {data.reduce((acc, a) => acc + a.activeLeads, 0)}
            </div>
            <div className="text-xs text-gray-600">Total Leads</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-blue-600">
              {data.reduce((acc, a) => acc + a.openDeals, 0)}
            </div>
            <div className="text-xs text-gray-600">Total Deals</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-red-600">
              {data.filter(a => detectOverload(a)).length}
            </div>
            <div className="text-xs text-gray-600">Sobrecargados</div>
          </div>
        </div>
      </div>
      
      <div className="text-xs text-gray-500">
        Sobrecarga: &gt;60 leads activos, &gt;15 deals abiertos o edad promedio &gt;21 días.
      </div>
    </div>
  );
}