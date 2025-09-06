import React, { useState } from 'react';
import { useProductivityFilters, useLeaderboard } from '../hooks';
import { ComponentProps } from '../types';
import { formatDurationH, formatPct, getRankingBadge, scoreAgent } from '../utils';

export function AgentLeaderboard({ onAgentClick }: ComponentProps) {
  const { filters } = useProductivityFilters();
  const [sortMode, setSortMode] = useState<'activity' | 'results'>('activity');
  const { data, loading, error } = useLeaderboard(filters, sortMode);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-6 w-48 bg-gray-200 rounded animate-pulse"></div>
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 bg-gray-100 rounded animate-pulse"></div>
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

  const sortedData = [...data].sort((a, b) => {
    if (sortMode === 'activity') {
      return b.activities - a.activities;
    } else {
      return (b.offers + b.contracts * 2) - (a.offers + a.contracts * 2);
    }
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Ranking de Agentes</h3>
        
        <div className="flex rounded-md bg-gray-100 p-1">
          <button
            onClick={() => setSortMode('activity')}
            className={`rounded px-3 py-1 text-sm font-medium transition-colors ${
              sortMode === 'activity'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Actividad
          </button>
          <button
            onClick={() => setSortMode('results')}
            className={`rounded px-3 py-1 text-sm font-medium transition-colors ${
              sortMode === 'results'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Resultados
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <div className="grid grid-cols-8 gap-2 px-3 py-2 text-xs font-medium text-gray-500 bg-gray-50 rounded">
          <div className="col-span-2">Agente</div>
          <div className="text-center">Actividades</div>
          <div className="text-center">1er contacto</div>
          <div className="text-center">Visitas</div>
          <div className="text-center">Ofertas</div>
          <div className="text-center">Contratos</div>
          <div className="text-center">SLA %</div>
        </div>
        
        {sortedData.map((agent, index) => {
          const ranking = getRankingBadge(index + 1);
          const calculatedScore = scoreAgent(agent);
          
          return (
            <div
              key={agent.agentId}
              onClick={() => onAgentClick?.(agent.agentId)}
              className="grid grid-cols-8 gap-2 px-3 py-3 bg-white rounded-lg border hover:bg-gray-50 cursor-pointer transition-colors"
            >
              <div className="col-span-2 flex items-center gap-2">
                <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${ranking.color}`}>
                  {ranking.label}
                </span>
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    {agent.agentName}
                  </div>
                  <div className="text-xs text-gray-500">
                    Score: {calculatedScore}
                  </div>
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-sm font-medium text-gray-900">
                  {agent.activities}
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-sm text-gray-900">
                  {formatDurationH(agent.firstContactP50)}
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-sm font-medium text-gray-900">
                  {agent.visits}
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-sm font-medium text-blue-600">
                  {agent.offers}
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-sm font-medium text-green-600">
                  {agent.contracts}
                </div>
              </div>
              
              <div className="text-center">
                <div className={`text-sm font-medium ${
                  agent.slaPct >= 95 ? 'text-green-600' : 
                  agent.slaPct >= 85 ? 'text-yellow-600' : 
                  'text-red-600'
                }`}>
                  {formatPct(agent.slaPct)}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {sortedData.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No hay datos disponibles
        </div>
      )}
    </div>
  );
}