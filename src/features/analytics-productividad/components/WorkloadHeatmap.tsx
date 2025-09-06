import React, { useState } from 'react';
import { getHeatmapColor } from '../utils';

type HeatmapType = 'calls' | 'emails' | 'tasks' | 'visits';

const DAYS = ['Dom', 'Lun', 'Mar', 'Mi\u00e9', 'Jue', 'Vie', 'S\u00e1b'];
const HOURS = Array.from({ length: 24 }, (_, i) => i);

const TYPE_LABELS: Record<HeatmapType, string> = {
  calls: 'Llamadas',
  emails: 'Emails',
  tasks: 'Tareas',
  visits: 'Visitas'
};

// Simulated heatmap data
const generateHeatmapData = (type: HeatmapType) => {
  const data: number[][] = [];
  
  for (let day = 0; day < 7; day++) {
    const dayData: number[] = [];
    for (let hour = 0; hour < 24; hour++) {
      let intensity = 0;
      
      // Business hours have higher intensity
      if (hour >= 9 && hour <= 18 && day >= 1 && day <= 5) {
        intensity = Math.random() * 100;
      } else if (hour >= 8 && hour <= 20 && day >= 1 && day <= 5) {
        intensity = Math.random() * 50;
      } else {
        intensity = Math.random() * 20;
      }
      
      // Adjust by type
      switch (type) {
        case 'calls':
          intensity *= 1.2;
          break;
        case 'emails':
          intensity *= 0.8;
          break;
        case 'visits':
          intensity = day >= 1 && day <= 5 && hour >= 10 && hour <= 17 ? intensity * 0.3 : 0;
          break;
        case 'tasks':
          intensity *= 0.9;
          break;
      }
      
      dayData.push(Math.round(intensity));
    }
    data.push(dayData);
  }
  
  return data;
};

export function WorkloadHeatmap() {
  const [selectedType, setSelectedType] = useState<HeatmapType>('calls');
  const data = generateHeatmapData(selectedType);
  
  const maxIntensity = Math.max(...data.flat());
  const minIntensity = Math.min(...data.flat());

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Mapa de Calor - Carga de Trabajo</h3>
        
        <div className="flex rounded-md bg-gray-100 p-1">
          {(Object.keys(TYPE_LABELS) as HeatmapType[]).map(type => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`rounded px-3 py-1 text-sm font-medium transition-colors ${
                selectedType === type
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {TYPE_LABELS[type]}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        {/* Hour labels */}
        <div className="flex">
          <div className="w-12"></div>
          {HOURS.filter((_, i) => i % 2 === 0).map(hour => (
            <div key={hour} className="w-6 text-xs text-gray-500 text-center">
              {hour === 0 ? '24' : hour}
            </div>
          ))}
        </div>
        
        {/* Heatmap grid */}
        {DAYS.map((day, dayIndex) => (
          <div key={day} className="flex items-center">
            <div className="w-12 text-xs font-medium text-gray-700">
              {day}
            </div>
            
            <div className="flex gap-px">
              {data[dayIndex].map((intensity, hourIndex) => {
                const color = getHeatmapColor(intensity, maxIntensity);
                
                return (
                  <div
                    key={hourIndex}
                    className={`w-3 h-6 ${color} hover:ring-2 hover:ring-blue-400 cursor-pointer transition-all`}
                    title={`${day} ${hourIndex}:00 - ${TYPE_LABELS[selectedType]}: ${intensity}`}
                  ></div>
                );
              })}
            </div>
          </div>
        ))}
        
        {/* Legend */}
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <span>Bajo</span>
          <div className="flex gap-px">
            <div className="w-3 h-3 bg-blue-50"></div>
            <div className="w-3 h-3 bg-blue-100"></div>
            <div className="w-3 h-3 bg-blue-200"></div>
            <div className="w-3 h-3 bg-blue-300"></div>
            <div className="w-3 h-3 bg-blue-400"></div>
          </div>
          <span>Alto ({maxIntensity})</span>
        </div>
        
        <div className="text-xs text-gray-500">
          Mostrando intensidad de {TYPE_LABELS[selectedType].toLowerCase()} por d\u00eda de la semana y hora del d\u00eda.
        </div>
      </div>
    </div>
  );
}