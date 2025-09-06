import React, { useState } from "react";
import { PortalPerf } from "../types";
import { formatPct, formatMoney, formatNumber } from "../utils";

interface PortalPerformanceProps {
  portals: PortalPerf[];
  loading: boolean;
}

export const PortalPerformance: React.FC<PortalPerformanceProps> = ({ portals, loading }) => {
  const [sortBy, setSortBy] = useState<"convContract" | "leads" | "cpl">("convContract");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const handleSort = (column: "convContract" | "leads" | "cpl") => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder(column === "cpl" ? "asc" : "desc");
    }
  };

  const sortedPortals = [...portals].sort((a, b) => {
    const comparison = a[sortBy] - b[sortBy];
    return sortOrder === "asc" ? comparison : -comparison;
  });

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-20 bg-gray-100 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Rendimiento por Portal</h3>
        <div className="flex gap-2 text-xs">
          <button
            onClick={() => handleSort("convContract")}
            className={`px-2 py-1 rounded transition-colors ${
              sortBy === "convContract" ? "bg-blue-100 text-blue-700" : "hover:bg-gray-100"
            }`}
          >
            Conv. {sortBy === "convContract" && (sortOrder === "desc" ? "↓" : "↑")}
          </button>
          <button
            onClick={() => handleSort("leads")}
            className={`px-2 py-1 rounded transition-colors ${
              sortBy === "leads" ? "bg-blue-100 text-blue-700" : "hover:bg-gray-100"
            }`}
          >
            Leads {sortBy === "leads" && (sortOrder === "desc" ? "↓" : "↑")}
          </button>
          <button
            onClick={() => handleSort("cpl")}
            className={`px-2 py-1 rounded transition-colors ${
              sortBy === "cpl" ? "bg-blue-100 text-blue-700" : "hover:bg-gray-100"
            }`}
          >
            CPL {sortBy === "cpl" && (sortOrder === "asc" ? "↑" : "↓")}
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {sortedPortals.map((portal) => {
          const totalContracts = (portal.leads * portal.convContract) / 100;
          
          return (
            <div
              key={portal.portal}
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-semibold text-gray-900">{portal.portal}</h4>
                  <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                    <span>Leads: {formatNumber(portal.leads)}</span>
                    <span>Contratos: {formatNumber(Math.round(totalContracts))}</span>
                    {portal.duplicatesPct && portal.duplicatesPct > 0 && (
                      <span className="text-red-600">
                        Duplicados: {formatPct(portal.duplicatesPct)}
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="text-right">
                  <div className={`text-lg font-bold ${
                    portal.convContract > 12 ? "text-green-600" :
                    portal.convContract > 8 ? "text-yellow-600" : "text-red-600"
                  }`}>
                    {formatPct(portal.convContract)}
                  </div>
                  <div className="text-xs text-gray-500">Conv. total</div>
                </div>
              </div>

              {/* Embudo mini por portal */}
              <div className="grid grid-cols-4 gap-2 mb-3">
                <div className="text-center">
                  <div className="text-sm font-medium text-blue-600">
                    {formatPct(portal.convVisit)}
                  </div>
                  <div className="text-xs text-gray-500">→ Visita</div>
                </div>
                <div className="text-center">
                  <div className="text-sm font-medium text-purple-600">
                    {formatPct(portal.convOffer)}
                  </div>
                  <div className="text-xs text-gray-500">→ Oferta</div>
                </div>
                <div className="text-center">
                  <div className="text-sm font-medium text-green-600">
                    {formatPct(portal.convContract)}
                  </div>
                  <div className="text-xs text-gray-500">→ Contrato</div>
                </div>
                <div className="text-center">
                  <div className="text-sm font-medium text-gray-700">
                    {formatNumber(Math.round(totalContracts))}
                  </div>
                  <div className="text-xs text-gray-500">Total</div>
                </div>
              </div>

              {/* Métricas de coste */}
              <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                <div className="flex gap-6 text-sm">
                  {portal.cpl && (
                    <div>
                      <span className="text-gray-500">CPL:</span>
                      <span className={`ml-1 font-semibold ${
                        portal.cpl < 15 ? "text-green-600" :
                        portal.cpl < 25 ? "text-yellow-600" : "text-red-600"
                      }`}>
                        {formatMoney(portal.cpl)}
                      </span>
                    </div>
                  )}
                  {portal.cpa && (
                    <div>
                      <span className="text-gray-500">CPA:</span>
                      <span className={`ml-1 font-semibold ${
                        portal.cpa < 150 ? "text-green-600" :
                        portal.cpa < 250 ? "text-yellow-600" : "text-red-600"
                      }`}>
                        {formatMoney(portal.cpa)}
                      </span>
                    </div>
                  )}
                  <div>
                    <span className="text-gray-500">ROI:</span>
                    <span className="ml-1 font-semibold text-blue-600">
                      {portal.cpa && totalContracts > 0 
                        ? formatPct(((totalContracts * 1000) / (portal.leads * portal.cpa)) * 100) // Asumiendo 1000€ valor por contrato
                        : "N/A"
                      }
                    </span>
                  </div>
                </div>

                {/* Indicator de rendimiento */}
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-gray-300"></div>
                  <div className={`w-2 h-2 rounded-full ${
                    portal.convContract > 12 ? "bg-green-500" :
                    portal.convContract > 8 ? "bg-yellow-500" : "bg-red-500"
                  }`}></div>
                  <div className="w-2 h-2 rounded-full bg-gray-300"></div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Resumen */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Mejor portal:</span>
            <span className="ml-2 font-semibold text-green-600">
              {sortedPortals[0]?.portal} ({formatPct(sortedPortals[0]?.convContract || 0)})
            </span>
          </div>
          <div>
            <span className="text-gray-500">CPL promedio:</span>
            <span className="ml-2 font-semibold">
              {formatMoney(
                portals.reduce((sum, p) => sum + (p.cpl || 0), 0) / portals.length
              )}
            </span>
          </div>
          <div>
            <span className="text-gray-500">Total leads:</span>
            <span className="ml-2 font-semibold">
              {formatNumber(portals.reduce((sum, p) => sum + p.leads, 0))}
            </span>
          </div>
          <div>
            <span className="text-gray-500">Conv. promedio:</span>
            <span className="ml-2 font-semibold text-blue-600">
              {formatPct(
                portals.reduce((sum, p) => sum + p.convContract, 0) / portals.length
              )}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};