import { useState, useMemo } from "react";
import type { CohortFilters } from "../types";
import { useCohorts } from "../hooks";
import { formatPct, formatDays, formatMonth, formatNumber } from "../utils";

interface CohortTableProps {
  filters: CohortFilters;
  onRowClick?: (cohort: string) => void;
}

type SortField = "cohort" | "size" | "contractPctCum" | "timeToContractP50";
type SortDirection = "asc" | "desc";

const CohortTable = ({ filters, onRowClick }: CohortTableProps) => {
  const { data, loading, error } = useCohorts(filters);
  const [sortField, setSortField] = useState<SortField>("contractPctCum");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortField) {
        case "cohort":
          aValue = a.cohort;
          bValue = b.cohort;
          break;
        case "size":
          aValue = a.size;
          bValue = b.size;
          break;
        case "contractPctCum":
          aValue = a.contractPctCum;
          bValue = b.contractPctCum;
          break;
        case "timeToContractP50":
          aValue = a.timeToContractP50 || 0;
          bValue = b.timeToContractP50 || 0;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }, [data, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return "↕️";
    return sortDirection === "asc" ? "↑" : "↓";
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
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
        <h3 className="text-lg font-semibold text-gray-900">Tabla Detallada por Cohorte</h3>
        <div className="text-sm text-gray-600">
          Total: {data.length} cohortes
        </div>
      </div>

      {data.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No hay datos para mostrar con los filtros actuales
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th 
                  className="sticky left-0 bg-gray-50 z-10 px-4 py-3 text-left text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("cohort")}
                >
                  <div className="flex items-center space-x-1">
                    <span>Cohorte</span>
                    <span className="text-xs">{getSortIcon("cohort")}</span>
                  </div>
                </th>
                <th 
                  className="px-4 py-3 text-center text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("size")}
                >
                  <div className="flex items-center justify-center space-x-1">
                    <span>Tamaño</span>
                    <span className="text-xs">{getSortIcon("size")}</span>
                  </div>
                </th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">
                  % Visita M+1
                </th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">
                  % Visita M+2
                </th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">
                  % Oferta M+1
                </th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">
                  % Oferta M+2
                </th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">
                  % Contrato M+1
                </th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">
                  % Contrato M+2
                </th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">
                  % Contrato M+3
                </th>
                <th 
                  className="px-4 py-3 text-center text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("contractPctCum")}
                >
                  <div className="flex items-center justify-center space-x-1">
                    <span>% Contrato (Acum)</span>
                    <span className="text-xs">{getSortIcon("contractPctCum")}</span>
                  </div>
                </th>
                <th 
                  className="px-4 py-3 text-center text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("timeToContractP50")}
                >
                  <div className="flex items-center justify-center space-x-1">
                    <span>TtC p50</span>
                    <span className="text-xs">{getSortIcon("timeToContractP50")}</span>
                  </div>
                </th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">
                  TtC p90
                </th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">
                  Canal Top
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {sortedData.map((row) => (
                <tr 
                  key={row.cohort}
                  className="hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => onRowClick?.(row.cohort)}
                >
                  <td className="sticky left-0 bg-white z-10 px-4 py-3 text-sm font-medium text-gray-900 border-r">
                    {formatMonth(row.cohort)}
                  </td>
                  <td className="px-4 py-3 text-sm text-center text-gray-900">
                    {formatNumber(row.size)}
                  </td>
                  <td className="px-4 py-3 text-sm text-center text-gray-600">
                    {formatPct(row.visitPctM1)}
                  </td>
                  <td className="px-4 py-3 text-sm text-center text-gray-600">
                    {formatPct(row.visitPctM2)}
                  </td>
                  <td className="px-4 py-3 text-sm text-center text-gray-600">
                    {formatPct(row.offerPctM1)}
                  </td>
                  <td className="px-4 py-3 text-sm text-center text-gray-600">
                    {formatPct(row.offerPctM2)}
                  </td>
                  <td className="px-4 py-3 text-sm text-center text-gray-600">
                    {formatPct(row.contractPctM1)}
                  </td>
                  <td className="px-4 py-3 text-sm text-center text-gray-600">
                    {formatPct(row.contractPctM2)}
                  </td>
                  <td className="px-4 py-3 text-sm text-center text-gray-600">
                    {formatPct(row.contractPctM3)}
                  </td>
                  <td className="px-4 py-3 text-sm text-center font-medium">
                    <span className={`inline-flex items-center px-2 py-1 rounded text-xs ${
                      row.contractPctCum >= 25 
                        ? "bg-green-100 text-green-800"
                        : row.contractPctCum >= 15 
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                    }`}>
                      {formatPct(row.contractPctCum)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-center text-gray-600">
                    {formatDays(row.timeToContractP50)}
                  </td>
                  <td className="px-4 py-3 text-sm text-center text-gray-600">
                    {formatDays(row.timeToContractP90)}
                  </td>
                  <td className="px-4 py-3 text-sm text-center">
                    {row.topChannel && (
                      <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-blue-100 text-blue-800">
                        {row.topChannel}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-4 text-xs text-gray-500 space-y-1">
        <p>• Haz clic en una fila para ver detalles de la cohorte</p>
        <p>• Haz clic en las cabeceras para ordenar</p>
        <p>• TtC = Tiempo hasta Contrato (días), p50/p90 = percentil 50/90</p>
        <p>• M+N = N meses después de la fecha de adquisición del lead</p>
      </div>
    </div>
  );
};

export default CohortTable;