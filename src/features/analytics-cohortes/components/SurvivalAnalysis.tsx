import { useState, useMemo } from "react";
import type { CohortFilters } from "../types";
import { useSurvival } from "../hooks";
import { formatMonth } from "../utils";

interface SurvivalAnalysisProps {
  filters: CohortFilters;
}

const SurvivalAnalysis = ({ filters }: SurvivalAnalysisProps) => {
  const { data, loading, error } = useSurvival(filters);
  const [selectedCohorts, setSelectedCohorts] = useState<string[]>([]);

  const { cohorts, chartData } = useMemo(() => {
    const uniqueCohorts = [...new Set(data.map(d => d.cohort))].sort();
    const displayCohorts = selectedCohorts.length > 0 
      ? selectedCohorts 
      : uniqueCohorts.slice(-3);
    
    const chartPoints: { [cohort: string]: Array<{ x: number; y: number; atRisk: number; events: number }> } = {};
    
    displayCohorts.forEach(cohort => {
      const cohortData = data.filter(d => d.cohort === cohort).sort((a, b) => a.monthRel - b.monthRel);
      chartPoints[cohort] = cohortData.map(point => ({
        x: point.monthRel,
        y: point.survival,
        atRisk: point.atRisk,
        events: point.events
      }));
    });
    
    return {
      cohorts: uniqueCohorts,
      chartData: chartPoints
    };
  }, [data, selectedCohorts]);

  const colors = [
    "#3B82F6", // blue
    "#EF4444", // red  
    "#10B981", // green
    "#F59E0B"  // amber
  ];

  const handleCohortToggle = (cohort: string) => {
    setSelectedCohorts(prev => {
      const newSelection = prev.includes(cohort)
        ? prev.filter(c => c !== cohort)
        : [...prev, cohort].slice(-3); // Max 3 cohorts
      return newSelection;
    });
  };

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

  const selectedCohortsForDisplay = selectedCohorts.length > 0 ? selectedCohorts : cohorts.slice(-3);

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Análisis de Supervivencia</h3>
        <div className="text-sm text-gray-600">
          % sin contrato por mes
        </div>
      </div>

      <div className="mb-4">
        <p className="text-sm text-gray-600 mb-2">
          Seleccionar cohortes (máx. 3):
        </p>
        <div className="flex flex-wrap gap-2">
          {cohorts.map(cohort => (
            <button
              key={cohort}
              onClick={() => handleCohortToggle(cohort)}
              className={`px-3 py-1 text-xs rounded transition-colors ${
                selectedCohortsForDisplay.includes(cohort)
                  ? "bg-blue-100 text-blue-800 border-blue-300 border"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {formatMonth(cohort)}
            </button>
          ))}
        </div>
      </div>

      {Object.keys(chartData).length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No hay datos para mostrar
        </div>
      ) : (
        <div className="space-y-4">
          <div className="relative">
            <svg width="100%" height="300" viewBox="0 0 800 300" className="overflow-visible">
              <defs>
                <pattern id="grid-survival" width="40" height="25" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 25" fill="none" stroke="#f3f4f6" strokeWidth="1"/>
                </pattern>
              </defs>
              
              <rect width="800" height="300" fill="url(#grid-survival)" />
              
              <g className="chart-area">
                {Object.entries(chartData).map(([cohort, points], index) => {
                  const color = colors[index % colors.length];
                  
                  const pathData = points.map((point, i) => {
                    const x = 80 + (point.x * (720 - 80)) / Math.max(12, points.length);
                    const y = 250 - ((point.y - 75) * 200) / 25; // Scale from 75-100%
                    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                  }).join(' ');
                  
                  return (
                    <g key={cohort}>
                      <path
                        d={pathData}
                        stroke={color}
                        strokeWidth="2"
                        fill="none"
                        className="drop-shadow-sm"
                      />
                      {points.map((point, i) => {
                        const x = 80 + (point.x * (720 - 80)) / Math.max(12, points.length);
                        const y = 250 - ((point.y - 75) * 200) / 25;
                        return (
                          <circle
                            key={i}
                            cx={x}
                            cy={y}
                            r="4"
                            fill={color}
                            className="cursor-pointer hover:r-6 transition-all"
                          >
                            <title>
                              {formatMonth(cohort)} - M{point.x}
                              {'\n'}Supervivencia: {point.y.toFixed(1)}%
                              {'\n'}En riesgo: {point.atRisk}
                              {'\n'}Eventos: {point.events}
                            </title>
                          </circle>
                        );
                      })}
                    </g>
                  );
                })}
              </g>
              
              <g className="x-axis">
                <line x1="80" y1="250" x2="720" y2="250" stroke="#6b7280" strokeWidth="1"/>
                {[0, 3, 6, 9, 12].map(month => {
                  const x = 80 + (month * (720 - 80)) / 12;
                  return (
                    <g key={month}>
                      <line x1={x} y1="250" x2={x} y2="255" stroke="#6b7280" strokeWidth="1"/>
                      <text x={x} y="270" textAnchor="middle" className="text-xs fill-gray-600">
                        M{month}
                      </text>
                    </g>
                  );
                })}
                <text x="400" y="290" textAnchor="middle" className="text-sm fill-gray-700">
                  Mes Relativo
                </text>
              </g>
              
              <g className="y-axis">
                <line x1="80" y1="50" x2="80" y2="250" stroke="#6b7280" strokeWidth="1"/>
                {[75, 80, 85, 90, 95, 100].map(pct => {
                  const y = 250 - ((pct - 75) * 200) / 25;
                  return (
                    <g key={pct}>
                      <line x1="75" y1={y} x2="80" y2={y} stroke="#6b7280" strokeWidth="1"/>
                      <text x="70" y={y + 4} textAnchor="end" className="text-xs fill-gray-600">
                        {pct}%
                      </text>
                    </g>
                  );
                })}
                <text x="20" y="150" textAnchor="middle" className="text-sm fill-gray-700" transform="rotate(-90 20 150)">
                  % Supervivencia
                </text>
              </g>
            </svg>
          </div>
          
          <div className="flex items-center justify-center mt-4 space-x-6">
            {Object.entries(chartData).map(([cohort, points], index) => (
              <div key={cohort} className="flex items-center space-x-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: colors[index % colors.length] }}
                />
                <span className="text-sm text-gray-700">{formatMonth(cohort)}</span>
                <span className="text-xs text-gray-500">
                  ({points[points.length - 1]?.y.toFixed(1)}%)
                </span>
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
            {Object.entries(chartData).map(([cohort, points]) => {
              const latestPoint = points[points.length - 1];
              return (
                <div key={cohort} className="text-center p-3 bg-gray-50 rounded">
                  <div className="font-medium text-gray-900">
                    {formatMonth(cohort)}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    Supervivencia actual: {latestPoint?.y.toFixed(1)}%
                  </div>
                  <div className="text-xs text-gray-500">
                    {latestPoint?.atRisk} en riesgo
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="mt-4 text-xs text-gray-500 space-y-1">
        <p>• Supervivencia = % de leads que aún no han llegado a contrato</p>
        <p>• Una curva que baja rápido indica mayor conversión temprana</p>
        <p>• Útil para comparar velocidad de conversión entre cohortes</p>
      </div>
    </div>
  );
};

export default SurvivalAnalysis;