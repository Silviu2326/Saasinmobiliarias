import React, { useState } from "react";
import { StageStats } from "../types";
import { formatPct, formatDays, formatNumber, getTrendIcon, getTrendColor } from "../utils";

interface StageTableProps {
  stages: StageStats[];
  loading: boolean;
}

export const StageTable: React.FC<StageTableProps> = ({ stages, loading }) => {
  const [sortBy, setSortBy] = useState<"stage" | "stageRate" | "avgDays">("stage");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const handleSort = (column: "stage" | "stageRate" | "avgDays") => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
  };

  const sortedStages = [...stages].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case "stage":
        comparison = a.stage.localeCompare(b.stage);
        break;
      case "stageRate":
        comparison = a.stageRate - b.stageRate;
        break;
      case "avgDays":
        comparison = a.avgDays - b.avgDays;
        break;
    }
    
    return sortOrder === "asc" ? comparison : -comparison;
  });

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-2">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-10 bg-gray-100 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h3 className="text-lg font-semibold mb-4">Detalle por Etapa</h3>
      
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-50"
                onClick={() => handleSort("stage")}
              >
                <div className="flex items-center gap-1">
                  Etapa
                  {sortBy === "stage" && (
                    <span className="text-gray-400">{sortOrder === "asc" ? "↑" : "↓"}</span>
                  )}
                </div>
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Volumen
              </th>
              <th
                className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-50"
                onClick={() => handleSort("stageRate")}
              >
                <div className="flex items-center justify-end gap-1">
                  % Etapa
                  {sortBy === "stageRate" && (
                    <span className="text-gray-400">{sortOrder === "asc" ? "↑" : "↓"}</span>
                  )}
                </div>
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                % Acum.
              </th>
              <th
                className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-50"
                onClick={() => handleSort("avgDays")}
              >
                <div className="flex items-center justify-end gap-1">
                  Tiempo medio
                  {sortBy === "avgDays" && (
                    <span className="text-gray-400">{sortOrder === "asc" ? "↑" : "↓"}</span>
                  )}
                </div>
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Variación
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {sortedStages.map((stage) => (
              <tr key={stage.stage} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 text-sm font-medium text-gray-900">
                  {stage.stage}
                </td>
                <td className="px-4 py-3 text-sm text-right text-gray-700">
                  {formatNumber(stage.count)}
                </td>
                <td className="px-4 py-3 text-sm text-right">
                  <span className={`font-medium ${
                    stage.stageRate > 70 ? "text-green-600" :
                    stage.stageRate > 40 ? "text-yellow-600" :
                    "text-red-600"
                  }`}>
                    {formatPct(stage.stageRate)}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-right text-gray-700">
                  {formatPct(stage.cumulativeRate)}
                </td>
                <td className="px-4 py-3 text-sm text-right text-gray-700">
                  {formatDays(stage.avgDays)}
                </td>
                <td className="px-4 py-3 text-sm text-right">
                  {stage.deltaPct !== undefined && (
                    <span className={`inline-flex items-center gap-1 font-medium ${getTrendColor(stage.deltaPct)}`}>
                      <span>{getTrendIcon(stage.deltaPct)}</span>
                      <span>{Math.abs(stage.deltaPct).toFixed(1)}%</span>
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Resumen */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Total leads:</span>
            <span className="ml-2 font-semibold">{formatNumber(stages[0]?.count || 0)}</span>
          </div>
          <div>
            <span className="text-gray-500">Total contratos:</span>
            <span className="ml-2 font-semibold">{formatNumber(stages[stages.length - 1]?.count || 0)}</span>
          </div>
          <div>
            <span className="text-gray-500">Conv. global:</span>
            <span className="ml-2 font-semibold text-blue-600">
              {formatPct(stages[stages.length - 1]?.cumulativeRate || 0)}
            </span>
          </div>
          <div>
            <span className="text-gray-500">Tiempo total:</span>
            <span className="ml-2 font-semibold">
              {formatDays(stages[stages.length - 1]?.avgDays || 0)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};