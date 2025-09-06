import React, { useState } from 'react';
import { useProductivityFilters, useProductivityActivity } from '../hooks';
import { formatDateShort } from '../utils';

const ACTIVITY_TYPES = [
  { key: 'calls', label: 'Llamadas', color: 'bg-blue-500', enabled: true },
  { key: 'emails', label: 'Emails', color: 'bg-green-500', enabled: true },
  { key: 'messages', label: 'Mensajes', color: 'bg-yellow-500', enabled: true },
  { key: 'tasksDone', label: 'Tareas', color: 'bg-purple-500', enabled: true },
  { key: 'visits', label: 'Visitas', color: 'bg-red-500', enabled: true }
];

export function ActivityTimeline() {
  const { filters } = useProductivityFilters();
  const { data, loading, error } = useProductivityActivity(filters);
  const [enabledTypes, setEnabledTypes] = useState<Record<string, boolean>>(
    Object.fromEntries(ACTIVITY_TYPES.map(t => [t.key, t.enabled]))
  );

  const toggleType = (key: string) => {
    setEnabledTypes(prev => ({ ...prev, [key]: !prev[key] }));
  };

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
    ...data.map(d => 
      (enabledTypes.calls ? d.calls : 0) +
      (enabledTypes.emails ? d.emails : 0) +
      (enabledTypes.messages ? d.messages : 0) +
      (enabledTypes.tasksDone ? d.tasksDone : 0) +
      (enabledTypes.visits ? d.visits : 0)
    )
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Timeline de Actividades</h3>
        
        <div className="flex items-center gap-2">
          {ACTIVITY_TYPES.map(type => (
            <button
              key={type.key}
              onClick={() => toggleType(type.key)}
              className={`flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium ${
                enabledTypes[type.key] 
                  ? `${type.color} text-white`
                  : 'bg-gray-100 text-gray-500'
              }`}
            >
              <div className={`h-2 w-2 rounded-full ${enabledTypes[type.key] ? 'bg-white' : 'bg-gray-400'}`}></div>
              {type.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        {data.slice(-14).map((point, index) => {
          const totalValue = 
            (enabledTypes.calls ? point.calls : 0) +
            (enabledTypes.emails ? point.emails : 0) +
            (enabledTypes.messages ? point.messages : 0) +
            (enabledTypes.tasksDone ? point.tasksDone : 0) +
            (enabledTypes.visits ? point.visits : 0);
            
          const widthPct = maxValue > 0 ? (totalValue / maxValue) * 100 : 0;

          return (
            <div key={point.date} className="flex items-center gap-2">
              <div className="w-16 text-xs text-gray-600">
                {formatDateShort(point.date)}
              </div>
              
              <div className="flex-1 relative">
                <div className="h-6 bg-gray-100 rounded-sm overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-sm transition-all duration-300"
                    style={{ width: `${widthPct}%` }}
                  ></div>
                </div>
                
                <div className="absolute inset-0 flex items-center justify-end pr-2">
                  <span className="text-xs font-medium text-gray-700">
                    {totalValue}
                  </span>
                </div>
              </div>
              
              <div className="w-20 text-right">
                <div className="text-xs text-gray-600">
                  {enabledTypes.calls && `${point.calls}📞 `}
                  {enabledTypes.emails && `${point.emails}✉️ `}
                  {enabledTypes.visits && `${point.visits}🏠`}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {data.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No hay datos disponibles para el período seleccionado
        </div>
      )}
    </div>
  );
}