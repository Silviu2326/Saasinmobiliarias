import type { CohortKpis } from "../types";
import { formatPct, formatNumber, formatDays, formatMonth, getVariation, getVariationColor, getVariationIcon } from "../utils";

interface KpisStripProps {
  kpis: CohortKpis;
  loading?: boolean;
}

const KpisStrip = ({ kpis, loading = false }: KpisStripProps) => {
  if (loading) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
              <div className="h-6 bg-gray-100 rounded w-16"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const kpiItems = [
    {
      label: "% Contrato Promedio",
      value: formatPct(kpis.avgContractPct),
      description: "Conversión media de todas las cohortes",
      icon: "📈",
      color: kpis.avgContractPct >= 20 ? "text-green-600" : kpis.avgContractPct >= 15 ? "text-yellow-600" : "text-red-600"
    },
    {
      label: "Tamaño Medio Cohorte",
      value: formatNumber(kpis.avgCohortSize),
      description: "Leads promedio por cohorte",
      icon: "👥",
      color: "text-blue-600"
    },
    {
      label: "Tiempo a Contrato",
      value: formatDays(kpis.medianTtC),
      description: "Mediana de días hasta contrato",
      icon: "⏱️",
      color: kpis.medianTtC <= 45 ? "text-green-600" : kpis.medianTtC <= 70 ? "text-yellow-600" : "text-red-600"
    },
    {
      label: "Mejor Cohorte",
      value: formatMonth(kpis.bestCohort),
      description: "Cohorte con mayor conversión",
      icon: "🏆",
      color: "text-green-600"
    },
    {
      label: "Total Contratos",
      value: formatNumber(kpis.totalContracts),
      description: `De ${formatNumber(kpis.totalLeads)} leads totales`,
      icon: "✅",
      color: "text-purple-600"
    }
  ];

  const mockPreviousKpis = {
    avgContractPct: kpis.avgContractPct - 1.2,
    avgCohortSize: kpis.avgCohortSize - 45,
    medianTtC: kpis.medianTtC + 3,
    totalContracts: kpis.totalContracts - 28
  };

  const variations = {
    avgContractPct: getVariation(kpis.avgContractPct, mockPreviousKpis.avgContractPct),
    avgCohortSize: getVariation(kpis.avgCohortSize, mockPreviousKpis.avgCohortSize),
    medianTtC: -getVariation(kpis.medianTtC, mockPreviousKpis.medianTtC), // Negative because lower is better
    totalContracts: getVariation(kpis.totalContracts, mockPreviousKpis.totalContracts)
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">KPIs de Cohortes</h3>
        <div className="text-sm text-gray-500">
          Comparación con período anterior
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {kpiItems.map((item, index) => {
          let variation: number | undefined;
          
          switch (index) {
            case 0:
              variation = variations.avgContractPct;
              break;
            case 1:
              variation = variations.avgCohortSize;
              break;
            case 2:
              variation = variations.medianTtC;
              break;
            case 4:
              variation = variations.totalContracts;
              break;
            default:
              variation = undefined;
          }

          return (
            <div
              key={item.label}
              className="relative p-4 bg-gradient-to-br from-gray-50 to-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-lg">{item.icon}</span>
                    <p className="text-sm font-medium text-gray-600">{item.label}</p>
                  </div>
                  
                  <p className={`text-2xl font-bold ${item.color} mb-1`}>
                    {item.value}
                  </p>
                  
                  <p className="text-xs text-gray-500">
                    {item.description}
                  </p>

                  {variation !== undefined && (
                    <div className="flex items-center mt-2 space-x-1">
                      <span className={`text-xs ${getVariationColor(variation)}`}>
                        {getVariationIcon(variation)} {Math.abs(variation).toFixed(1)}%
                      </span>
                      <span className="text-xs text-gray-400">vs anterior</span>
                    </div>
                  )}
                </div>
              </div>

              {index === 3 && kpis.worstCohort !== "-" && (
                <div className="mt-2 pt-2 border-t border-gray-100">
                  <div className="flex items-center space-x-1">
                    <span className="text-sm">📉</span>
                    <span className="text-xs text-gray-500">Peor:</span>
                    <span className="text-xs text-red-600">{formatMonth(kpis.worstCohort)}</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-xs text-gray-500 mb-1">Conversión Global</p>
            <p className="text-lg font-semibold text-blue-600">
              {formatPct((kpis.totalContracts / kpis.totalLeads) * 100)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Leads Analizados</p>
            <p className="text-lg font-semibold text-gray-700">
              {formatNumber(kpis.totalLeads)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Contratos Logrados</p>
            <p className="text-lg font-semibold text-green-600">
              {formatNumber(kpis.totalContracts)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Eficiencia</p>
            <p className="text-lg font-semibold text-purple-600">
              {kpis.medianTtC > 0 ? (kpis.totalContracts / kpis.medianTtC * 30).toFixed(1) : "0"}/mes
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KpisStrip;