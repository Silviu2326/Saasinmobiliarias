import { Search, X } from "lucide-react";
import { CommissionsFilters } from "../types";
import { generatePeriodOptions } from "../utils";

interface CommissionsFiltersProps {
  filters: CommissionsFilters;
  onFiltersChange: (filters: Partial<CommissionsFilters>) => void;
  onClear: () => void;
}

export default function CommissionsFiltersComponent({
  filters,
  onFiltersChange,
  onClear,
}: CommissionsFiltersProps) {
  const periodOptions = generatePeriodOptions(12);

  const handleInputChange = (field: keyof CommissionsFilters) => 
    (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      onFiltersChange({ [field]: event.target.value || undefined });
    };

  const hasActiveFilters = Object.values(filters).some(value => 
    value !== undefined && value !== null && value !== ""
  );

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Buscar por ref o agente..."
            value={filters.q || ""}
            onChange={handleInputChange("q")}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>

        <select
          value={filters.period || ""}
          onChange={handleInputChange("period")}
          className="block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        >
          <option value="">Periodo</option>
          {periodOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <select
          value={filters.agent || ""}
          onChange={handleInputChange("agent")}
          className="block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        >
          <option value="">Agente</option>
          <option value="agent1">Juan Pérez</option>
          <option value="agent2">María García</option>
          <option value="agent3">Carlos López</option>
        </select>

        <select
          value={filters.office || ""}
          onChange={handleInputChange("office")}
          className="block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        >
          <option value="">Oficina</option>
          <option value="office1">Madrid Centro</option>
          <option value="office2">Barcelona</option>
          <option value="office3">Valencia</option>
        </select>

        <select
          value={filters.status || ""}
          onChange={handleInputChange("status")}
          className="block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        >
          <option value="">Estado</option>
          <option value="PENDIENTE">Pendiente</option>
          <option value="APROBADO">Aprobado</option>
          <option value="LIQUIDADO">Liquidado</option>
        </select>

        <select
          value={filters.type || ""}
          onChange={handleInputChange("type")}
          className="block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        >
          <option value="">Tipo</option>
          <option value="VENTA">Venta</option>
          <option value="ALQUILER">Alquiler</option>
        </select>
      </div>

      <div className="flex flex-wrap gap-2 mt-3">
        <div className="flex items-center gap-2">
          <input
            type="date"
            placeholder="Desde"
            value={filters.from || ""}
            onChange={handleInputChange("from")}
            className="block w-36 px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
          <span className="text-gray-400">hasta</span>
          <input
            type="date"
            placeholder="Hasta"
            value={filters.to || ""}
            onChange={handleInputChange("to")}
            className="block w-36 px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>

        {hasActiveFilters && (
          <button
            onClick={onClear}
            className="inline-flex items-center gap-2 px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <X className="w-4 h-4" />
            Limpiar
          </button>
        )}
      </div>
    </div>
  );
}