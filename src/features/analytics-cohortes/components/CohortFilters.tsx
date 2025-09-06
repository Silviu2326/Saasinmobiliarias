import { useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import type { CohortFilters } from "../types";
import { validateCohortFilters } from "../schema";
import { queryStringToFilters, filtersToQueryString } from "../utils";
import { useLocalStorage } from "../hooks";

interface CohortFiltersProps {
  onFiltersChange: (filters: CohortFilters) => void;
}

const CohortFilters = ({ onFiltersChange }: CohortFiltersProps) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [savedViews, setSavedViews] = useLocalStorage<{ name: string; filters: CohortFilters }[]>(
    "cohort-saved-views", 
    []
  );
  
  const initialFilters = queryStringToFilters(searchParams.toString());
  const [filters, setFilters] = useState<CohortFilters>(initialFilters);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [viewName, setViewName] = useState("");

  const updateFilters = useCallback((newFilters: CohortFilters) => {
    const validation = validateCohortFilters(newFilters);
    
    if (validation.success) {
      setFilters(newFilters);
      setErrors({});
      onFiltersChange(newFilters);
      
      const queryString = filtersToQueryString(newFilters);
      setSearchParams(queryString ? `?${queryString}` : "");
    } else {
      const fieldErrors: Record<string, string> = {};
      validation.error.errors.forEach(error => {
        if (error.path.length > 0) {
          fieldErrors[error.path[0]] = error.message;
        }
      });
      setErrors(fieldErrors);
    }
  }, [onFiltersChange, setSearchParams]);

  const handleInputChange = useCallback((field: keyof CohortFilters, value: any) => {
    const newFilters = { ...filters, [field]: value };
    updateFilters(newFilters);
  }, [filters, updateFilters]);

  const applyPreset = useCallback((preset: "6m" | "12m" | "24m" | "ytd") => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1;
    
    let from = "";
    let to = `${currentYear}-${String(currentMonth).padStart(2, "0")}`;
    
    switch (preset) {
      case "6m":
        const sixMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 5, 1);
        from = `${sixMonthsAgo.getFullYear()}-${String(sixMonthsAgo.getMonth() + 1).padStart(2, "0")}`;
        break;
      case "12m":
        const twelveMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 11, 1);
        from = `${twelveMonthsAgo.getFullYear()}-${String(twelveMonthsAgo.getMonth() + 1).padStart(2, "0")}`;
        break;
      case "24m":
        const twentyFourMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 23, 1);
        from = `${twentyFourMonthsAgo.getFullYear()}-${String(twentyFourMonthsAgo.getMonth() + 1).padStart(2, "0")}`;
        break;
      case "ytd":
        from = `${currentYear}-01`;
        break;
    }
    
    updateFilters({ ...filters, from, to, window: 12 });
  }, [filters, updateFilters]);

  const saveView = useCallback(() => {
    if (viewName.trim()) {
      const newView = { name: viewName.trim(), filters };
      setSavedViews(prev => [...prev.filter(v => v.name !== viewName.trim()), newView]);
      setViewName("");
      setShowSaveModal(false);
    }
  }, [viewName, filters, setSavedViews]);

  const loadView = useCallback((view: { name: string; filters: CohortFilters }) => {
    updateFilters(view.filters);
  }, [updateFilters]);

  const clearFilters = useCallback(() => {
    updateFilters({});
  }, [updateFilters]);

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Filtros de Cohortes</h3>
        <div className="flex gap-2">
          <button
            onClick={() => setShowSaveModal(true)}
            className="px-3 py-1 text-sm bg-blue-50 text-blue-700 rounded hover:bg-blue-100"
          >
            Guardar Vista
          </button>
          <button
            onClick={clearFilters}
            className="px-3 py-1 text-sm bg-gray-50 text-gray-700 rounded hover:bg-gray-100"
          >
            Limpiar
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Cohorte desde
          </label>
          <input
            type="month"
            value={filters.from || ""}
            onChange={(e) => handleInputChange("from", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.from && <p className="text-red-500 text-xs mt-1">{errors.from}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Cohorte hasta
          </label>
          <input
            type="month"
            value={filters.to || ""}
            onChange={(e) => handleInputChange("to", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.to && <p className="text-red-500 text-xs mt-1">{errors.to}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Ventana (meses)
          </label>
          <select
            value={filters.window || 12}
            onChange={(e) => handleInputChange("window", Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={3}>3 meses</option>
            <option value={6}>6 meses</option>
            <option value={12}>12 meses</option>
            <option value={18}>18 meses</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Canal
          </label>
          <select
            value={filters.canal || ""}
            onChange={(e) => handleInputChange("canal", e.target.value || undefined)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos</option>
            <option value="web">Web</option>
            <option value="portal">Portal</option>
            <option value="ads">Ads</option>
            <option value="whatsapp">WhatsApp</option>
            <option value="referido">Referido</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Portal
          </label>
          <input
            type="text"
            value={filters.portal || ""}
            onChange={(e) => handleInputChange("portal", e.target.value || undefined)}
            placeholder="Ej: Idealista, Fotocasa"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tipo
          </label>
          <select
            value={filters.tipo || ""}
            onChange={(e) => handleInputChange("tipo", e.target.value || undefined)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos</option>
            <option value="venta">Venta</option>
            <option value="alquiler">Alquiler</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tamaño mínimo
          </label>
          <input
            type="number"
            value={filters.minSize || ""}
            onChange={(e) => handleInputChange("minSize", e.target.value ? Number(e.target.value) : undefined)}
            placeholder="50"
            min="0"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Etapa objetivo
          </label>
          <select
            value={filters.targetStage || "CONTRATO"}
            onChange={(e) => handleInputChange("targetStage", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="VISITA">Visita</option>
            <option value="OFERTA">Oferta</option>
            <option value="RESERVA">Reserva</option>
            <option value="CONTRATO">Contrato</option>
          </select>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <span className="text-sm text-gray-600">Presets:</span>
        {[
          { key: "6m", label: "Últimos 6 meses" },
          { key: "12m", label: "Últimos 12 meses" },
          { key: "24m", label: "Últimos 24 meses" },
          { key: "ytd", label: "Año actual" }
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => applyPreset(key as any)}
            className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
          >
            {label}
          </button>
        ))}
      </div>

      {savedViews.length > 0 && (
        <div>
          <span className="text-sm text-gray-600">Vistas guardadas:</span>
          <div className="flex flex-wrap gap-2 mt-2">
            {savedViews.map((view) => (
              <button
                key={view.name}
                onClick={() => loadView(view)}
                className="px-3 py-1 text-sm bg-blue-50 text-blue-700 rounded hover:bg-blue-100"
              >
                {view.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {showSaveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h4 className="text-lg font-semibold mb-4">Guardar Vista</h4>
            <input
              type="text"
              value={viewName}
              onChange={(e) => setViewName(e.target.value)}
              placeholder="Nombre de la vista"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowSaveModal(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={saveView}
                disabled={!viewName.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CohortFilters;