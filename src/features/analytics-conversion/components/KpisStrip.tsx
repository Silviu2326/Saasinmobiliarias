import React from "react";
import { KpiData } from "../types";
import { formatPct, formatMoney, getTrendIcon, getTrendColor } from "../utils";

interface KpisStripProps {
  kpis: KpiData | null;
  loading: boolean;
}

export const KpisStrip: React.FC<KpisStripProps> = ({ kpis, loading }) => {
  if (loading) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-full"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!kpis) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="text-center text-gray-500">No hay datos disponibles</div>
      </div>
    );
  }

  const kpiItems = [
    {
      label: "Conv. Global",
      value: formatPct(kpis.conversionGlobal),
      trend: kpis.deltaPrevPeriod?.conversionGlobal,
      color: "text-blue-600",
      icon: "🎯",
    },
    {
      label: "Lead → Visita",
      value: formatPct(kpis.conversionLeadVisit),
      color: "text-purple-600",
      icon: "👥",
    },
    {
      label: "Visita → Oferta",
      value: formatPct(kpis.conversionVisitOffer),
      color: "text-indigo-600",
      icon: "💼",
    },
    {
      label: "Oferta → Reserva",
      value: formatPct(kpis.conversionOfferReserva),
      color: "text-green-600",
      icon: "📋",
    },
    {
      label: "Reserva → Contrato",
      value: formatPct(kpis.conversionReservaContrato),
      color: "text-emerald-600",
      icon: "✅",
    },
    {
      label: "CPL",
      value: formatMoney(kpis.cpl),
      trend: kpis.deltaPrevPeriod?.cpl,
      color: "text-orange-600",
      icon: "💰",
      inverse: true, // Para CPL, valores más bajos son mejores
    },
    {
      label: "CPA",
      value: formatMoney(kpis.cpa),
      trend: kpis.deltaPrevPeriod?.cpa,
      color: "text-red-600",
      icon: "🎯",
      inverse: true,
    },
    {
      label: "Tiempo 1er Contacto",
      value: `${kpis.avgFirstContactH.toFixed(1)}h`,
      color: "text-gray-600",
      icon: "⏱️",
    },
  ];

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm">
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
        {kpiItems.map((kpi) => (
          <div
            key={kpi.label}
            className="text-center p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center justify-center gap-1 mb-1">
              <span className="text-sm text-gray-600 font-medium">{kpi.label}</span>
              {kpi.icon && <span className="text-xs">{kpi.icon}</span>}
            </div>
            
            <div className={`text-2xl font-bold ${kpi.color}`}>
              {kpi.value}
            </div>
            
            {kpi.trend !== undefined && (
              <div className={`text-xs mt-1 font-medium flex items-center justify-center gap-1 ${
                getTrendColor(kpi.trend, kpi.inverse)
              }`}>
                <span>{getTrendIcon(kpi.trend)}</span>
                <span>{Math.abs(kpi.trend).toFixed(1)}%</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Resumen rápido */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span>
              Conversión global: <strong className="text-blue-600">{formatPct(kpis.conversionGlobal)}</strong>
              {kpis.deltaPrevPeriod?.conversionGlobal !== undefined && (
                <span className={`ml-1 ${getTrendColor(kpis.deltaPrevPeriod.conversionGlobal)}`}>
                  ({kpis.deltaPrevPeriod.conversionGlobal > 0 ? "+" : ""}
                  {kpis.deltaPrevPeriod.conversionGlobal.toFixed(1)}%)
                </span>
              )}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
            <span>
              Coste por lead: <strong className="text-orange-600">{formatMoney(kpis.cpl)}</strong>
              {kpis.deltaPrevPeriod?.cpl !== undefined && (
                <span className={`ml-1 ${getTrendColor(kpis.deltaPrevPeriod.cpl, true)}`}>
                  ({kpis.deltaPrevPeriod.cpl > 0 ? "+" : ""}
                  {kpis.deltaPrevPeriod.cpl.toFixed(1)}%)
                </span>
              )}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span>
              Coste por contrato: <strong className="text-red-600">{formatMoney(kpis.cpa)}</strong>
              {kpis.deltaPrevPeriod?.cpa !== undefined && (
                <span className={`ml-1 ${getTrendColor(kpis.deltaPrevPeriod.cpa, true)}`}>
                  ({kpis.deltaPrevPeriod.cpa > 0 ? "+" : ""}
                  {kpis.deltaPrevPeriod.cpa.toFixed(1)}%)
                </span>
              )}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};