import React, { useState } from "react";
import { ConversionFilters as ConversionFiltersType } from "../types";
import { getDateRangePresets } from "../utils";
import { useSavedViews } from "../hooks";

interface ConversionFiltersProps {
  filters: ConversionFiltersType;
  onFiltersChange: (filters: Partial<ConversionFiltersType>) => void;
  onReset: () => void;
}

export const ConversionFilters: React.FC<ConversionFiltersProps> = ({
  filters,
  onFiltersChange,
  onReset,
}) => {
  const [showCustomDate, setShowCustomDate] = useState(false);
  const [viewName, setViewName] = useState("");
  const { views, saveView, deleteView } = useSavedViews();
  const presets = getDateRangePresets();

  const handlePresetClick = (preset: { from: string; to: string }) => {
    onFiltersChange({ from: preset.from, to: preset.to });
    setShowCustomDate(false);
  };

  const handleSaveView = () => {
    if (viewName.trim()) {
      saveView(viewName, filters);
      setViewName("");
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm space-y-4">
      {/* Rango de fechas */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => handlePresetClick(presets.today)}
          className="px-3 py-1.5 text-sm font-medium bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
        >
          Hoy
        </button>
        <button
          onClick={() => handlePresetClick(presets.last7Days)}
          className="px-3 py-1.5 text-sm font-medium bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
        >
          7 días
        </button>
        <button
          onClick={() => handlePresetClick(presets.last30Days)}
          className="px-3 py-1.5 text-sm font-medium bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
        >
          30 días
        </button>
        <button
          onClick={() => handlePresetClick(presets.currentQuarter)}
          className="px-3 py-1.5 text-sm font-medium bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
        >
          Trimestre
        </button>
        <button
          onClick={() => handlePresetClick(presets.yearToDate)}
          className="px-3 py-1.5 text-sm font-medium bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
        >
          YTD
        </button>
        <button
          onClick={() => setShowCustomDate(!showCustomDate)}
          className="px-3 py-1.5 text-sm font-medium bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
        >
          Personalizado
        </button>
      </div>

      {/* Fechas personalizadas */}
      {showCustomDate && (
        <div className="flex gap-2">
          <input
            type="date"
            value={filters.from || ""}
            onChange={(e) => onFiltersChange({ from: e.target.value })}
            className="px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="date"
            value={filters.to || ""}
            onChange={(e) => onFiltersChange({ to: e.target.value })}
            className="px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      )}

      {/* Filtros principales */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        <select
          value={filters.canal || ""}
          onChange={(e) => onFiltersChange({ canal: e.target.value as any || undefined })}
          className="px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Canal</option>
          <option value="web">Web</option>
          <option value="portal">Portal</option>
          <option value="whatsapp">WhatsApp</option>
          <option value="referido">Referido</option>
          <option value="ads">Ads</option>
        </select>

        <input
          type="text"
          placeholder="Campaña"
          value={filters.campana || ""}
          onChange={(e) => onFiltersChange({ campana: e.target.value || undefined })}
          className="px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <input
          type="text"
          placeholder="Portal"
          value={filters.portal || ""}
          onChange={(e) => onFiltersChange({ portal: e.target.value || undefined })}
          className="px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <input
          type="text"
          placeholder="Agente"
          value={filters.agente || ""}
          onChange={(e) => onFiltersChange({ agente: e.target.value || undefined })}
          className="px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <input
          type="text"
          placeholder="Equipo"
          value={filters.equipo || ""}
          onChange={(e) => onFiltersChange({ equipo: e.target.value || undefined })}
          className="px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <input
          type="text"
          placeholder="Oficina"
          value={filters.oficina || ""}
          onChange={(e) => onFiltersChange({ oficina: e.target.value || undefined })}
          className="px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <select
          value={filters.dispositivo || ""}
          onChange={(e) => onFiltersChange({ dispositivo: e.target.value as any || undefined })}
          className="px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Dispositivo</option>
          <option value="mobile">Móvil</option>
          <option value="desktop">Escritorio</option>
        </select>

        <select
          value={filters.tipo || ""}
          onChange={(e) => onFiltersChange({ tipo: e.target.value as any || undefined })}
          className="px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Tipo</option>
          <option value="venta">Venta</option>
          <option value="alquiler">Alquiler</option>
        </select>

        <select
          value={filters.origen || ""}
          onChange={(e) => onFiltersChange({ origen: e.target.value as any || undefined })}
          className="px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Origen</option>
          <option value="landing">Landing</option>
          <option value="chatbot">Chatbot</option>
          <option value="portales">Portales</option>
        </select>
      </div>

      {/* Acciones y vistas guardadas */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={onReset}
          className="px-4 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
        >
          Limpiar filtros
        </button>

        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Nombre de la vista"
            value={viewName}
            onChange={(e) => setViewName(e.target.value)}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleSaveView}
            disabled={!viewName.trim()}
            className="px-4 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Guardar vista
          </button>
        </div>

        {views.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {views.map((view, index) => (
              <div key={index} className="flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-md">
                <button
                  onClick={() => onFiltersChange(view.filters)}
                  className="text-sm font-medium hover:text-blue-600 transition-colors"
                >
                  {view.name}
                </button>
                <button
                  onClick={() => deleteView(index)}
                  className="ml-1 text-gray-500 hover:text-red-600 transition-colors"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};