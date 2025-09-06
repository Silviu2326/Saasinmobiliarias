import { useMemo } from "react";
import type { HeatCell, CohortFilters } from "../types";
import { buildHeatmapMatrix, getHeatmapColor, getHeatmapTextColor, formatPct, formatMonth } from "../utils";
import { useHeatmap } from "../hooks";

interface CohortHeatmapProps {
  filters: CohortFilters;
  onCellClick?: (cohort: string, monthRel: number, stage: string) => void;
}

const CohortHeatmap = ({ filters, onCellClick }: CohortHeatmapProps) => {
  const { data, loading, error } = useHeatmap(filters);
  
  const { matrix, maxMonths, cohorts } = useMemo(() => {
    const window = filters.window || 12;
    const matrixData = buildHeatmapMatrix(data, window);
    const uniqueCohorts = [...new Set(data.map(cell => cell.cohort))].sort();
    
    return {
      matrix: matrixData,
      maxMonths: window,
      cohorts: uniqueCohorts
    };
  }, [data, filters.window]);

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-64 mb-4"></div>
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-8 bg-gray-100 rounded"></div>
            ))}
          </div>
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
        <h3 className="text-lg font-semibold text-gray-900">
          Heatmap de Cohortes - {filters.targetStage || "CONTRATO"}
        </h3>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <span>0%</span>
            <div className="flex space-x-1">
              <div className="w-4 h-4 bg-gray-50 border"></div>
              <div className="w-4 h-4 bg-red-50 border"></div>
              <div className="w-4 h-4 bg-orange-50 border"></div>
              <div className="w-4 h-4 bg-yellow-50 border"></div>
              <div className="w-4 h-4 bg-green-50 border"></div>
              <div className="w-4 h-4 bg-green-100 border"></div>
              <div className="w-4 h-4 bg-green-200 border"></div>
            </div>
            <span>100%</span>
          </div>
        </div>
      </div>

      {data.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No hay datos para mostrar con los filtros actuales
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="sticky left-0 bg-white z-10 px-3 py-2 text-left text-sm font-medium text-gray-700 border-r">
                  Cohorte
                </th>
                {[...Array(maxMonths + 1)].map((_, monthRel) => (
                  <th
                    key={monthRel}
                    className="px-3 py-2 text-center text-sm font-medium text-gray-700"
                  >
                    M{monthRel}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {matrix.map((row, rowIndex) => {
                const cohort = cohorts[rowIndex];
                return (
                  <tr key={cohort} className="hover:bg-gray-50">
                    <td className="sticky left-0 bg-white z-10 px-3 py-2 text-sm font-medium text-gray-900 border-r">
                      {formatMonth(cohort)}
                    </td>
                    {row.map((cell, monthRel) => (
                      <td
                        key={monthRel}
                        className={`relative px-3 py-2 text-center text-sm cursor-pointer transition-colors ${
                          cell ? getHeatmapColor(cell.pct) : "bg-gray-50"
                        } hover:ring-2 hover:ring-blue-400`}
                        onClick={() => {
                          if (cell && onCellClick) {
                            onCellClick(cell.cohort, cell.monthRel, cell.stage);
                          }
                        }}
                        title={
                          cell
                            ? `Cohorte: ${formatMonth(cell.cohort)}\nMes: ${monthRel}\n% Avance: ${formatPct(cell.pct)}\nCantidad: ${cell.count}/${cell.totalSize}`
                            : "Sin datos"
                        }
                      >
                        {cell ? (
                          <span className={getHeatmapTextColor(cell.pct)}>
                            {formatPct(cell.pct)}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-4 text-xs text-gray-500 space-y-1">
        <p>• Haz clic en una celda para ver los detalles de esa cohorte y mes relativo</p>
        <p>• Los colores representan el % de avance a la etapa objetivo</p>
        <p>• M0 = mes de adquisición del lead, M1 = siguiente mes, etc.</p>
      </div>
    </div>
  );
};

export default CohortHeatmap;