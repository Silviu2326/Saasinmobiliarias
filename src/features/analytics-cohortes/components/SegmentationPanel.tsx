import { useState } from "react";
import type { CohortFilters } from "../types";

interface SegmentationPanelProps {
  filters: CohortFilters;
  onFiltersChange: (filters: CohortFilters) => void;
}

const SegmentationPanel = ({ filters, onFiltersChange }: SegmentationPanelProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleInputChange = (field: keyof CohortFilters, value: any) => {
    const newFilters = { ...filters, [field]: value || undefined };
    onFiltersChange(newFilters);
  };

  const clearSegmentation = () => {
    const clearedFilters = { ...filters };
    delete clearedFilters.priceMin;
    delete clearedFilters.priceMax;
    delete clearedFilters.zona;
    delete clearedFilters.tipologia;
    delete clearedFilters.device;
    onFiltersChange(clearedFilters);
  };

  const hasActiveSegmentation = Boolean(
    filters.priceMin || 
    filters.priceMax || 
    filters.zona || 
    filters.tipologia || 
    filters.device
  );

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <h3 className="text-lg font-semibold text-gray-900">Segmentación</h3>
          {hasActiveSegmentation && (
            <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-blue-100 text-blue-800">
              Activa
            </span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          {hasActiveSegmentation && (
            <button
              onClick={clearSegmentation}
              className="px-3 py-1 text-sm text-red-600 hover:text-red-800"
            >
              Limpiar
            </button>
          )}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
          >
            {isExpanded ? "Contraer" : "Expandir"}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="mt-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Precio mínimo (€)
              </label>
              <input
                type="number"
                value={filters.priceMin || ""}
                onChange={(e) => handleInputChange("priceMin", e.target.value ? Number(e.target.value) : undefined)}
                placeholder="100.000"
                min="0"
                step="10000"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Precio máximo (€)
              </label>
              <input
                type="number"
                value={filters.priceMax || ""}
                onChange={(e) => handleInputChange("priceMax", e.target.value ? Number(e.target.value) : undefined)}
                placeholder="500.000"
                min="0"
                step="10000"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Zona
              </label>
              <input
                type="text"
                value={filters.zona || ""}
                onChange={(e) => handleInputChange("zona", e.target.value)}
                placeholder="Centro, Norte, Sur..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipología
              </label>
              <select
                value={filters.tipologia || ""}
                onChange={(e) => handleInputChange("tipologia", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todas</option>
                <option value="piso">Piso</option>
                <option value="casa">Casa</option>
                <option value="atico">Ático</option>
                <option value="duplex">Dúplex</option>
                <option value="chalet">Chalet</option>
                <option value="local">Local</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dispositivo
              </label>
              <select
                value={filters.device || ""}
                onChange={(e) => handleInputChange("device", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos</option>
                <option value="mobile">Móvil</option>
                <option value="desktop">Desktop</option>
                <option value="tablet">Tablet</option>
              </select>
            </div>
          </div>

          <div className="border-t pt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Segmentos predefinidos</h4>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => {
                  onFiltersChange({
                    ...filters,
                    priceMin: 0,
                    priceMax: 200000,
                    tipologia: "piso"
                  });
                }}
                className="px-3 py-1 text-sm bg-blue-50 text-blue-700 rounded hover:bg-blue-100"
              >
                Pisos económicos (&lt;200k)
              </button>
              <button
                onClick={() => {
                  onFiltersChange({
                    ...filters,
                    priceMin: 300000,
                    tipologia: "casa"
                  });
                }}
                className="px-3 py-1 text-sm bg-green-50 text-green-700 rounded hover:bg-green-100"
              >
                Casas premium (&gt;300k)
              </button>
              <button
                onClick={() => {
                  onFiltersChange({
                    ...filters,
                    tipologia: "atico",
                    zona: "Centro"
                  });
                }}
                className="px-3 py-1 text-sm bg-purple-50 text-purple-700 rounded hover:bg-purple-100"
              >
                Áticos centro
              </button>
              <button
                onClick={() => {
                  onFiltersChange({
                    ...filters,
                    device: "mobile"
                  });
                }}
                className="px-3 py-1 text-sm bg-orange-50 text-orange-700 rounded hover:bg-orange-100"
              >
                Solo móvil
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mt-3 text-xs text-gray-500">
        La segmentación aplica filtros adicionales a todas las visualizaciones de cohortes
      </div>
    </div>
  );
};

export default SegmentationPanel;