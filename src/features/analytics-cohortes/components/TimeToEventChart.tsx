import { useState, useMemo } from "react";
import type { CohortFilters, EventType } from "../types";
import { useTimeToEvent } from "../hooks";
import { formatMonth, formatDays } from "../utils";

interface TimeToEventChartProps {
  filters: CohortFilters;
}

const TimeToEventChart = ({ filters }: TimeToEventChartProps) => {
  const [eventType, setEventType] = useState<EventType>("CONTRATO");
  const { data, loading, error } = useTimeToEvent(filters, eventType);

  const chartData = useMemo(() => {
    const maxP90 = Math.max(...data.map(d => d.p90), 0);
    const maxDays = Math.ceil(maxP90 / 10) * 10 || 100;
    
    return {
      points: data.map(d => ({
        cohort: d.cohort,
        p50: d.p50,
        p90: d.p90,
        count: d.count
      })),
      maxDays
    };
  }, [data]);

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
          <div className="h-64 bg-gray-100 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="text-center py-8">
          <div className="text-red-500 mb-2">⚠️</div>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Tiempo a Evento</h3>
        <select
          value={eventType}
          onChange={(e) => setEventType(e.target.value as EventType)}
          className="px-3 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="VISITA">Visita</option>
          <option value="OFERTA">Oferta</option>
          <option value="CONTRATO">Contrato</option>
        </select>
      </div>

      {data.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No hay datos para mostrar
        </div>
      ) : (
        <div className="space-y-4">
          <div className="relative">
            <svg width="100%" height="300" viewBox="0 0 800 300" className="overflow-visible">
              <defs>
                <pattern id="grid-tte" width="40" height="25" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 25" fill="none" stroke="#f3f4f6" strokeWidth="1"/>
                </pattern>
              </defs>
              
              <rect width="800" height="300" fill="url(#grid-tte)" />
              
              {chartData.points.map((point, index) => {
                const x = 80 + (index * (720 - 80)) / Math.max(chartData.points.length - 1, 1);
                const p50Y = 250 - (point.p50 * 200) / chartData.maxDays;
                const p90Y = 250 - (point.p90 * 200) / chartData.maxDays;
                
                return (
                  <g key={point.cohort}>
                    <line 
                      x1={x} 
                      y1={p50Y} 
                      x2={x} 
                      y2={p90Y} 
                      stroke="#94A3B8" 
                      strokeWidth="2"
                    />
                    
                    <circle
                      cx={x}
                      cy={p50Y}
                      r="6"
                      fill="#3B82F6"
                      className="cursor-pointer hover:r-8 transition-all"
                    >
                      <title>
                        {formatMonth(point.cohort)}
                        {'\n'}p50: {formatDays(point.p50)}
                        {'\n'}Eventos: {point.count}
                      </title>
                    </circle>
                    
                    <circle
                      cx={x}
                      cy={p90Y}
                      r="4"
                      fill="#EF4444"
                      className="cursor-pointer hover:r-6 transition-all"
                    >
                      <title>
                        {formatMonth(point.cohort)}
                        {'\n'}p90: {formatDays(point.p90)}
                        {'\n'}Eventos: {point.count}
                      </title>
                    </circle>
                    
                    <text 
                      x={x} 
                      y="270" 
                      textAnchor="middle" 
                      className="text-xs fill-gray-600"
                      transform={`rotate(-45 ${x} 270)`}
                    >
                      {formatMonth(point.cohort)}
                    </text>
                  </g>
                );
              })}
              
              <g className="y-axis">
                <line x1="80" y1="50" x2="80" y2="250" stroke="#6b7280" strokeWidth="1"/>
                {[0, 25, 50, 75, 100].filter(val => val <= chartData.maxDays).map(days => {
                  const y = 250 - (days * 200) / chartData.maxDays;
                  return (
                    <g key={days}>
                      <line x1="75" y1={y} x2="80" y2={y} stroke="#6b7280" strokeWidth="1"/>
                      <text x="70" y={y + 4} textAnchor="end" className="text-xs fill-gray-600">
                        {days}d
                      </text>
                    </g>
                  );
                })}
                <text x="20" y="150" textAnchor="middle" className="text-sm fill-gray-700" transform="rotate(-90 20 150)">
                  Días
                </text>
              </g>
            </svg>
          </div>
          
          <div className="flex items-center justify-center space-x-8 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span className="text-gray-700">p50 (Mediana)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-red-500"></div>
              <span className="text-gray-700">p90</span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
            {chartData.points.slice(-4).map(point => (
              <div key={point.cohort} className="text-center">
                <div className="text-sm font-medium text-gray-900">
                  {formatMonth(point.cohort)}
                </div>
                <div className="text-xs text-gray-600">
                  p50: {formatDays(point.p50)}
                </div>
                <div className="text-xs text-gray-600">
                  p90: {formatDays(point.p90)}
                </div>
                <div className="text-xs text-blue-600">
                  {point.count} eventos
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-4 text-xs text-gray-500 space-y-1">
        <p>• p50 = 50% de los usuarios alcanzan el evento en este tiempo o menos</p>
        <p>• p90 = 90% de los usuarios alcanzan el evento en este tiempo o menos</p>
        <p>• La línea conecta p50 y p90 para cada cohorte</p>
      </div>
    </div>
  );
};

export default TimeToEventChart;