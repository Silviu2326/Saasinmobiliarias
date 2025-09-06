import React, { useState } from "react";
import { DropoffReason, Stage } from "../types";
import { formatPct, getTrendIcon, getTrendColor } from "../utils";

interface DropoffReasonsProps {
  dropoffs: DropoffReason[];
  loading: boolean;
}

const STAGE_OPTIONS: { value: Stage | "all"; label: string }[] = [
  { value: "all", label: "Todas las etapas" },
  { value: "CONTACTADO", label: "Contactado" },
  { value: "VISITA", label: "Visita" },
  { value: "OFERTA", label: "Oferta" },
  { value: "RESERVA", label: "Reserva" },
];

export const DropoffReasons: React.FC<DropoffReasonsProps> = ({ dropoffs, loading }) => {
  const [selectedStage, setSelectedStage] = useState<Stage | "all">("all");

  const filteredDropoffs = selectedStage === "all"
    ? dropoffs
    : dropoffs.filter(d => d.stage === selectedStage);

  // Agrupar por razón y sumar shares si es necesario
  const groupedDropoffs = filteredDropoffs.reduce((acc, curr) => {
    const existing = acc.find(d => d.reason === curr.reason);
    if (existing) {
      existing.share += curr.share;
      existing.trend = curr.trend; // Tomar el último trend
    } else {
      acc.push({ ...curr });
    }
    return acc;
  }, [] as DropoffReason[]);

  // Ordenar por share descendente
  const sortedDropoffs = groupedDropoffs.sort((a, b) => b.share - a.share);

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-12 bg-gray-100 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Motivos de Caída</h3>
        <select
          value={selectedStage}
          onChange={(e) => setSelectedStage(e.target.value as Stage | "all")}
          className="px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {STAGE_OPTIONS.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-3">
        {sortedDropoffs.slice(0, 8).map((dropoff, index) => (
          <div key={`${dropoff.stage}-${dropoff.reason}`} className="relative">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">
                  {index + 1}. {dropoff.reason}
                </span>
                {selectedStage === "all" && (
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                    {dropoff.stage}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-900">
                  {formatPct(dropoff.share)}
                </span>
                {dropoff.trend !== undefined && dropoff.trend !== 0 && (
                  <span className={`text-xs ${getTrendColor(dropoff.trend, true)}`}>
                    {getTrendIcon(dropoff.trend)}
                  </span>
                )}
              </div>
            </div>
            
            {/* Barra de progreso */}
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === 0 ? "bg-red-500" :
                  index === 1 ? "bg-orange-500" :
                  index === 2 ? "bg-yellow-500" :
                  "bg-gray-400"
                }`}
                style={{ width: `${dropoff.share}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Resumen */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Principal motivo:</span>
            <span className="ml-2 font-semibold">
              {sortedDropoffs[0]?.reason || "N/A"}
            </span>
          </div>
          <div>
            <span className="text-gray-500">% atribuido:</span>
            <span className="ml-2 font-semibold text-red-600">
              {formatPct(sortedDropoffs.reduce((sum, d) => sum + d.share, 0))}
            </span>
          </div>
        </div>

        {/* Tags de motivos más comunes */}
        <div className="mt-3 flex flex-wrap gap-2">
          {sortedDropoffs.slice(0, 5).map((dropoff) => (
            <span
              key={`tag-${dropoff.reason}`}
              className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors cursor-pointer"
            >
              {dropoff.reason} ({formatPct(dropoff.share)})
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};