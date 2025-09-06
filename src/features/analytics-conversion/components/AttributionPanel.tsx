import React, { useState } from "react";
import { AttributionRow, AttributionModel } from "../types";
import { formatPct, formatMoney, formatNumber, downloadData } from "../utils";

interface AttributionPanelProps {
  data: AttributionRow[];
  loading: boolean;
  onModelChange: (model: AttributionModel) => void;
}

const MODEL_OPTIONS: { value: AttributionModel; label: string; description: string }[] = [
  { value: "last", label: "Last Touch", description: "100% al último punto de contacto" },
  { value: "first", label: "First Touch", description: "100% al primer punto de contacto" },
  { value: "linear", label: "Linear", description: "Crédito igual a todos los puntos" },
  { value: "ushaped", label: "U-Shaped", description: "40% primero, 40% último, 20% resto" },
];

export const AttributionPanel: React.FC<AttributionPanelProps> = ({
  data,
  loading,
  onModelChange,
}) => {
  const [selectedModel, setSelectedModel] = useState<AttributionModel>("last");
  const [viewBy, setViewBy] = useState<"canal" | "campana" | "portal">("canal");

  const handleModelChange = (model: AttributionModel) => {
    setSelectedModel(model);
    onModelChange(model);
  };

  const filteredData = data.filter(row => row.dimension === viewBy);
  const maxContribution = Math.max(...filteredData.map(d => d.contributionPct), 1);

  const handleExport = () => {
    downloadData(filteredData, `attribution-${selectedModel}-${viewBy}`, "CSV");
  };

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
        <h3 className="text-lg font-semibold">Atribución</h3>
        <button
          onClick={handleExport}
          className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
        >
          Exportar CSV
        </button>
      </div>

      {/* Selector de modelo */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
        {MODEL_OPTIONS.map((model) => (
          <button
            key={model.value}
            onClick={() => handleModelChange(model.value)}
            className={`p-2 text-xs font-medium rounded-md transition-all ${
              selectedModel === model.value
                ? "bg-blue-600 text-white shadow-md"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
            title={model.description}
          >
            {model.label}
          </button>
        ))}
      </div>

      {/* Selector de dimensión */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setViewBy("canal")}
          className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
            viewBy === "canal"
              ? "bg-gray-800 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Por Canal
        </button>
        <button
          onClick={() => setViewBy("campana")}
          className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
            viewBy === "campana"
              ? "bg-gray-800 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Por Campaña
        </button>
        <button
          onClick={() => setViewBy("portal")}
          className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
            viewBy === "portal"
              ? "bg-gray-800 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Por Portal
        </button>
      </div>

      {/* Tabla/Barras de atribución */}
      <div className="space-y-3">
        {filteredData.slice(0, 10).map((row) => (
          <div key={row.key} className="border-b border-gray-100 pb-3 last:border-0">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">{row.key}</span>
              <div className="flex items-center gap-4 text-xs">
                <span className="text-gray-500">
                  Leads: <span className="font-semibold">{formatNumber(row.leads)}</span>
                </span>
                <span className="text-gray-500">
                  Contratos: <span className="font-semibold">{formatNumber(row.contracts)}</span>
                </span>
              </div>
            </div>
            
            {/* Barra de contribución */}
            <div className="relative h-6 bg-gray-100 rounded overflow-hidden mb-2">
              <div
                className="absolute h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500"
                style={{ width: `${(row.contributionPct / maxContribution) * 100}%` }}
              />
              <div className="absolute inset-0 flex items-center px-2">
                <span className="text-xs font-medium text-white">
                  {formatPct(row.contributionPct)}
                </span>
              </div>
            </div>
            
            {/* Métricas de coste */}
            <div className="flex gap-4 text-xs">
              {row.cpl !== undefined && (
                <span className="text-gray-500">
                  CPL: <span className="font-semibold text-green-600">{formatMoney(row.cpl)}</span>
                </span>
              )}
              {row.cpa !== undefined && (
                <span className="text-gray-500">
                  CPA: <span className="font-semibold text-blue-600">{formatMoney(row.cpa)}</span>
                </span>
              )}
              <span className="text-gray-500">
                Conv: <span className="font-semibold">
                  {formatPct(row.leads > 0 ? (row.contracts / row.leads) * 100 : 0)}
                </span>
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Resumen */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Mayor contribución:</span>
            <span className="ml-2 font-semibold">{filteredData[0]?.key || "N/A"}</span>
          </div>
          <div>
            <span className="text-gray-500">CPL promedio:</span>
            <span className="ml-2 font-semibold text-green-600">
              {formatMoney(
                filteredData.reduce((sum, d) => sum + (d.cpl || 0), 0) / filteredData.length
              )}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};