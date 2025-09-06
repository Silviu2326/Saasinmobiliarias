import { useState, useMemo } from "react";
import type { CohortFilters, Stage } from "../types";
import { useStageMatrix } from "../hooks";
import { formatMonth, formatPct, getHeatmapColor, getHeatmapTextColor } from "../utils";

interface StageProgressionMatrixProps {
  filters: CohortFilters;
  onCellClick?: (cohort: string, monthRel: number, stage: Stage) => void;
}

const STAGES: Stage[] = ["LEAD", "VISITA", "OFERTA", "RESERVA", "CONTRATO"];

const StageProgressionMatrix = ({ filters, onCellClick }: StageProgressionMatrixProps) => {
  const { data, loading, error } = useStageMatrix(filters);
  const [cumulative, setCumulative] = useState(false);
  const [selectedCohorts, setSelectedCohorts] = useState<string[]>([]);

  const { matrix, cohorts, maxMonths } = useMemo(() => {
    const window = filters.window || 6;
    const uniqueCohorts = [...new Set(data.map(d => d.cohort))].sort();
    const displayCohorts = selectedCohorts.length > 0 
      ? selectedCohorts 
      : uniqueCohorts.slice(-3);
    
    const matrixData: { [key: string]: { [monthRel: number]: { [stage: string]: number } } } = {};
    
    displayCohorts.forEach(cohort => {
      matrixData[cohort] = {};
      for (let month = 0; month <= window; month++) {
        matrixData[cohort][month] = {};
        STAGES.forEach(stage => {
          const cell = data.find(d => 
            d.cohort === cohort && 
            d.monthRel === month && 
            d.stage === stage
          );
          matrixData[cohort][month][stage] = cell ? cell.pctInMonth : 0;
        });
      }
    });

    if (cumulative) {
      displayCohorts.forEach(cohort => {
        STAGES.forEach(stage => {
          let runningSum = 0;
          for (let month = 0; month <= window; month++) {
            runningSum += matrixData[cohort][month][stage];
            matrixData[cohort][month][stage] = runningSum;
          }
        });
      });
    }
    
    return {
      matrix: matrixData,
      cohorts: displayCohorts,
      maxMonths: window
    };
  }, [data, selectedCohorts, cumulative, filters.window]);

  const allCohorts = useMemo(() => {
    return [...new Set(data.map(d => d.cohort))].sort();
  }, [data]);

  const handleCohortToggle = (cohort: string) => {
    setSelectedCohorts(prev => {
      const newSelection = prev.includes(cohort)
        ? prev.filter(c => c !== cohort)
        : [...prev, cohort].slice(-4); // Max 4 cohorts
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

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Matriz de Progresión por Etapas</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCumulative(!cumulative)}
            className={`px-3 py-1 text-sm rounded transition-colors ${
              cumulative 
                ? "bg-blue-100 text-blue-800 border border-blue-300"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {cumulative ? "Acumulado" : "Por mes"}
          </button>
        </div>
      </div>

      <div className="mb-4">
        <p className="text-sm text-gray-600 mb-2">
          Seleccionar cohortes (máx. 4):
        </p>
        <div className="flex flex-wrap gap-2">
          {allCohorts.map(cohort => (
            <button
              key={cohort}
              onClick={() => handleCohortToggle(cohort)}
              className={`px-2 py-1 text-xs rounded transition-colors ${
                cohorts.includes(cohort)
                  ? "bg-blue-100 text-blue-800 border-blue-300 border"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {formatMonth(cohort)}
            </button>
          ))}
        </div>
      </div>

      {cohorts.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No hay datos para mostrar con los filtros actuales
        </div>
      ) : (
        <div className="space-y-6">
          {cohorts.map(cohort => (
            <div key={cohort} className="border rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-4 py-2 border-b">
                <h4 className="font-medium text-gray-900">{formatMonth(cohort)}</h4>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="sticky left-0 bg-white z-10 px-3 py-2 text-left text-sm font-medium text-gray-700 border-r">
                        Etapa
                      </th>
                      {[...Array(maxMonths + 1)].map((_, monthRel) => (
                        <th
                          key={monthRel}
                          className="px-3 py-2 text-center text-sm font-medium text-gray-700 min-w-[60px]"
                        >
                          M{monthRel}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {STAGES.map(stage => (
                      <tr key={stage} className="hover:bg-gray-50">
                        <td className="sticky left-0 bg-white z-10 px-3 py-2 text-sm font-medium text-gray-900 border-r">
                          {stage}
                        </td>
                        {[...Array(maxMonths + 1)].map((_, monthRel) => {
                          const value = matrix[cohort]?.[monthRel]?.[stage] || 0;
                          return (
                            <td
                              key={monthRel}
                              className={`px-3 py-2 text-center text-sm cursor-pointer transition-colors ${
                                value > 0 ? getHeatmapColor(value) : "bg-gray-50"
                              } hover:ring-2 hover:ring-blue-400`}
                              onClick={() => onCellClick?.(cohort, monthRel, stage)}
                              title={`${formatMonth(cohort)} - ${stage} - M${monthRel}\n${cumulative ? 'Acumulado' : 'En el mes'}: ${formatPct(value)}`}
                            >
                              <span className={value > 0 ? getHeatmapTextColor(value) : "text-gray-400"}>
                                {value > 0 ? formatPct(value) : "-"}
                              </span>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 text-xs text-gray-500 space-y-1">
        <p>• Muestra el % de la cohorte que alcanza cada etapa en cada mes relativo</p>
        <p>• "Por mes": % que alcanza la etapa exactamente en ese mes</p>
        <p>• "Acumulado": % total que ha alcanzado la etapa hasta ese mes</p>
        <p>• Haz clic en una celda para ver los detalles</p>
      </div>
    </div>
  );
};

export default StageProgressionMatrix;