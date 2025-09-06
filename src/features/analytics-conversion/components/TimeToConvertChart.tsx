import React, { useState } from "react";
import { TimeStats, ConversionTo } from "../types";
import { formatDays } from "../utils";

interface TimeToConvertChartProps {
  timeStats: TimeStats[];
  loading: boolean;
}

export const TimeToConvertChart: React.FC<TimeToConvertChartProps> = ({ timeStats, loading }) => {
  const [conversionTo, setConversionTo] = useState<ConversionTo>("CONTRATO");

  const filteredStats = timeStats.filter(stat => stat.to === conversionTo);
  const maxP90 = Math.max(...filteredStats.map(s => s.p90), 1);

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-48 bg-gray-100 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Tiempo a Conversión</h3>
        <div className="flex gap-2">
          <button
            onClick={() => setConversionTo("OFERTA")}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
              conversionTo === "OFERTA"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            A Oferta
          </button>
          <button
            onClick={() => setConversionTo("CONTRATO")}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
              conversionTo === "CONTRATO"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            A Contrato
          </button>
        </div>
      </div>

      {/* Gráfico de barras */}
      <div className="space-y-4">
        {filteredStats.map((stat) => (
          <div key={stat.stage} className="relative">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">{stat.stage}</span>
              <div className="flex gap-4 text-xs">
                <span className="text-gray-500">
                  P50: <span className="font-semibold text-blue-600">{formatDays(stat.p50)}</span>
                </span>
                <span className="text-gray-500">
                  P90: <span className="font-semibold text-orange-600">{formatDays(stat.p90)}</span>
                </span>
              </div>
            </div>
            
            {/* Barra combinada P50 + P90 */}
            <div className="relative h-8 bg-gray-100 rounded-lg overflow-hidden">
              {/* P90 (naranja, fondo) */}
              <div
                className="absolute h-full bg-orange-200 transition-all duration-500"
                style={{ width: `${(stat.p90 / maxP90) * 100}%` }}
              />
              
              {/* P50 (azul, encima) */}
              <div
                className="absolute h-full bg-blue-500 transition-all duration-500"
                style={{ width: `${(stat.p50 / maxP90) * 100}%` }}
              />
              
              {/* Etiquetas dentro de las barras */}
              <div
                className="absolute top-1/2 transform -translate-y-1/2 text-xs font-medium text-white"
                style={{ left: `${(stat.p50 / maxP90) * 50}%` }}
              >
                {formatDays(stat.p50)}
              </div>
              
              {stat.p90 - stat.p50 > maxP90 * 0.1 && (
                <div
                  className="absolute top-1/2 transform -translate-y-1/2 text-xs font-medium text-orange-700"
                  style={{ left: `${((stat.p50 + stat.p90) / 2 / maxP90) * 100}%` }}
                >
                  {formatDays(stat.p90)}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Leyenda */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500 rounded"></div>
            <span className="text-gray-600">
              Mediana (P50) - 50% de conversiones
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-orange-200 rounded"></div>
            <span className="text-gray-600">
              Percentil 90 - 90% de conversiones
            </span>
          </div>
        </div>
        
        {/* Insights */}
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <div className="flex items-start gap-2">
            <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="text-sm text-gray-700">
              <span className="font-medium">Insight:</span> El 50% de las conversiones a {conversionTo.toLowerCase()} 
              ocurren en menos de {formatDays(Math.max(...filteredStats.map(s => s.p50)))}, 
              mientras que el 90% se completa en {formatDays(Math.max(...filteredStats.map(s => s.p90)))}.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};