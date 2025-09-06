import React from "react";
import { CohortRow } from "../types";
import { formatPct, formatNumber } from "../utils";

interface CohortsTableProps {
  cohorts: CohortRow[];
  loading: boolean;
}

export const CohortsTable: React.FC<CohortsTableProps> = ({ cohorts, loading }) => {
  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-2">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-12 bg-gray-100 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const getHeatmapColor = (value: number, max: number): string => {
    const intensity = value / max;
    if (intensity > 0.8) return "bg-green-600 text-white";
    if (intensity > 0.6) return "bg-green-400 text-white";
    if (intensity > 0.4) return "bg-green-200 text-green-800";
    if (intensity > 0.2) return "bg-yellow-200 text-yellow-800";
    return "bg-red-200 text-red-800";
  };

  const maxVisit = Math.max(...cohorts.map(c => c.visitPct));
  const maxOffer = Math.max(...cohorts.map(c => c.offerPct));
  const maxContract = Math.max(...cohorts.map(c => c.contractPct));

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h3 className="text-lg font-semibold mb-4">Análisis de Cohortes</h3>
      
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Mes
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Leads
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                % a Visita
                <div className="text-xs font-normal text-gray-400">(M+1)</div>
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                % a Oferta
                <div className="text-xs font-normal text-gray-400">(M+2)</div>
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                % a Contrato
                <div className="text-xs font-normal text-gray-400">(M+3)</div>
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Conv. Acum.
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {cohorts.map((cohort) => (
              <tr key={cohort.month} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 text-sm font-medium text-gray-900">
                  {new Date(cohort.month + "-01").toLocaleDateString("es-ES", {
                    month: "short",
                    year: "numeric",
                  })}
                </td>
                <td className="px-4 py-3 text-sm text-right text-gray-700">
                  {formatNumber(cohort.leads)}
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={`inline-block px-2 py-1 text-xs font-medium rounded ${
                    getHeatmapColor(cohort.visitPct, maxVisit)
                  }`}>
                    {formatPct(cohort.visitPct)}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={`inline-block px-2 py-1 text-xs font-medium rounded ${
                    getHeatmapColor(cohort.offerPct, maxOffer)
                  }`}>
                    {formatPct(cohort.offerPct)}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={`inline-block px-2 py-1 text-xs font-medium rounded ${
                    getHeatmapColor(cohort.contractPct, maxContract)
                  }`}>
                    {formatPct(cohort.contractPct)}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className="text-sm font-semibold text-blue-600">
                    {formatPct(cohort.cumContractPct)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Insights */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Métricas de cohorte */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Métricas por Cohorte</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Mejor cohorte:</span>
                <span className="font-semibold">
                  {cohorts.sort((a, b) => b.cumContractPct - a.cumContractPct)[0]?.month || "N/A"}
                  <span className="ml-1 text-green-600">
                    ({formatPct(cohorts.sort((a, b) => b.cumContractPct - a.cumContractPct)[0]?.cumContractPct || 0)})
                  </span>
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Conv. promedio:</span>
                <span className="font-semibold text-blue-600">
                  {formatPct(
                    cohorts.reduce((sum, c) => sum + c.cumContractPct, 0) / cohorts.length
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Total leads:</span>
                <span className="font-semibold">
                  {formatNumber(cohorts.reduce((sum, c) => sum + c.leads, 0))}
                </span>
              </div>
            </div>
          </div>

          {/* Tendencias */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Tendencias</h4>
            <div className="space-y-2 text-sm">
              {cohorts.length >= 2 && (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Tendencia visitas:</span>
                    <span className={`font-semibold ${
                      cohorts[cohorts.length - 1].visitPct > cohorts[0].visitPct
                        ? "text-green-600" : "text-red-600"
                    }`}>
                      {cohorts[cohorts.length - 1].visitPct > cohorts[0].visitPct ? "↑" : "↓"}
                      {Math.abs(cohorts[cohorts.length - 1].visitPct - cohorts[0].visitPct).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Tendencia contratos:</span>
                    <span className={`font-semibold ${
                      cohorts[cohorts.length - 1].cumContractPct > cohorts[0].cumContractPct
                        ? "text-green-600" : "text-red-600"
                    }`}>
                      {cohorts[cohorts.length - 1].cumContractPct > cohorts[0].cumContractPct ? "↑" : "↓"}
                      {Math.abs(cohorts[cohorts.length - 1].cumContractPct - cohorts[0].cumContractPct).toFixed(1)}%
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Leyenda del heatmap */}
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <div className="text-sm font-medium text-gray-700 mb-2">Leyenda del Heatmap:</div>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="inline-block px-2 py-1 bg-green-600 text-white rounded">Excelente (80%+)</span>
            <span className="inline-block px-2 py-1 bg-green-400 text-white rounded">Bueno (60-80%)</span>
            <span className="inline-block px-2 py-1 bg-green-200 text-green-800 rounded">Regular (40-60%)</span>
            <span className="inline-block px-2 py-1 bg-yellow-200 text-yellow-800 rounded">Bajo (20-40%)</span>
            <span className="inline-block px-2 py-1 bg-red-200 text-red-800 rounded">Muy Bajo (&lt;20%)</span>
          </div>
        </div>
      </div>
    </div>
  );
};