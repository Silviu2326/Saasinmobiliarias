import React from 'react';
import { useProductivityFilters, useTasksStats } from '../hooks';
import { ComponentProps } from '../types';
import { formatPct, formatDays } from '../utils';

export function TasksCompletionPanel({ onAgentClick }: ComponentProps) {
  const { filters } = useProductivityFilters();
  const { data, loading, error } = useTasksStats(filters);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-6 w-48 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-32 bg-gray-100 rounded animate-pulse"></div>
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-12 bg-gray-100 rounded animate-pulse"></div>
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

  // Calculate totals
  const totalCreated = data.reduce((acc, t) => acc + t.created, 0);
  const totalCompleted = data.reduce((acc, t) => acc + t.completed, 0);
  const totalOnTime = data.reduce((acc, t) => acc + t.onTime, 0);
  const totalLate = data.reduce((acc, t) => acc + t.late, 0);
  const totalPending = totalCreated - totalCompleted;

  const onTimePct = totalCompleted > 0 ? (totalOnTime / totalCompleted) * 100 : 0;
  const latePct = totalCompleted > 0 ? (totalLate / totalCompleted) * 100 : 0;
  const pendingPct = totalCreated > 0 ? (totalPending / totalCreated) * 100 : 0;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900">Cumplimiento de Tareas</h3>
      
      {/* Donut Chart Simulation */}
      <div className="flex items-center justify-center">
        <div className="relative w-32 h-32">
          <svg className="w-32 h-32 transform -rotate-90">
            <circle
              cx="64"
              cy="64"
              r="56"
              stroke="#e5e7eb"
              strokeWidth="16"
              fill="none"
            />
            
            {/* On-time arc */}
            <circle
              cx="64"
              cy="64"
              r="56"
              stroke="#10b981"
              strokeWidth="16"
              fill="none"
              strokeDasharray={`${(onTimePct / 100) * 351.86} 351.86`}
              strokeDashoffset="0"
            />
            
            {/* Late arc */}
            <circle
              cx="64"
              cy="64"
              r="56"
              stroke="#f59e0b"
              strokeWidth="16"
              fill="none"
              strokeDasharray={`${(latePct / 100) * 351.86} 351.86`}
              strokeDashoffset={`-${(onTimePct / 100) * 351.86}`}
            />
          </svg>
          
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-xl font-semibold text-gray-900">
                {formatPct(onTimePct, 0)}
              </div>
              <div className="text-xs text-gray-500">on-time</div>
            </div>
          </div>
        </div>
        
        <div className="ml-6 space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-700">On-time: {totalOnTime}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span className="text-sm text-gray-700">Tarde: {totalLate}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
            <span className="text-sm text-gray-700">Pendientes: {totalPending}</span>
          </div>
        </div>
      </div>
      
      {/* Agent Table */}
      <div className="space-y-2">
        <div className="text-sm font-medium text-gray-700">Por Agente</div>
        
        <div className="space-y-1">
          <div className="grid grid-cols-6 gap-2 px-3 py-2 text-xs font-medium text-gray-500 bg-gray-50 rounded">
            <div className="col-span-2">Agente</div>
            <div className="text-center">Creadas</div>
            <div className="text-center">Completadas</div>
            <div className="text-center">On-time %</div>
            <div className="text-center">Atraso Prom.</div>
          </div>
          
          {data.map((agent) => {
            const completionRate = agent.created > 0 ? (agent.completed / agent.created) * 100 : 0;
            const onTimeRate = agent.completed > 0 ? (agent.onTime / agent.completed) * 100 : 0;
            
            return (
              <div
                key={agent.agentId}
                onClick={() => onAgentClick?.(agent.agentId)}
                className="grid grid-cols-6 gap-2 px-3 py-2 bg-white rounded border hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <div className="col-span-2">
                  <div className="text-sm font-medium text-gray-900">
                    {agent.agentName}
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatPct(completionRate, 0)} completadas
                  </div>
                </div>
                
                <div className="text-center text-sm text-gray-900">
                  {agent.created}
                </div>
                
                <div className="text-center text-sm text-gray-900">
                  {agent.completed}
                </div>
                
                <div className={`text-center text-sm font-medium ${
                  onTimeRate >= 90 ? 'text-green-600' : 
                  onTimeRate >= 75 ? 'text-yellow-600' : 
                  'text-red-600'
                }`}>
                  {formatPct(onTimeRate, 0)}
                </div>
                
                <div className="text-center text-sm text-gray-900">
                  {agent.avgDelayDays > 0 ? formatDays(agent.avgDelayDays) : '-'}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      {data.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No hay datos disponibles
        </div>
      )}
    </div>
  );
}