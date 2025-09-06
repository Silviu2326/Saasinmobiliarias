import React, { useState } from 'react';
import { 
  Plus, 
  Download, 
  Calculator, 
  Lock, 
  Search,
  Filter,
  RefreshCw,
  Settings,
  MoreVertical
} from 'lucide-react';
import type { SettlementQuery } from '../types';

interface SettlementsToolbarProps {
  onNewSettlement: () => void;
  onExport: (format: 'csv' | 'json' | 'pdf') => void;
  onRecalculate: () => void;
  onClosePeriod: () => void;
  onRefresh: () => void;
  selectedCount: number;
  totalCount: number;
  isLoading?: boolean;
  filters: SettlementQuery;
  onFiltersToggle: () => void;
  showFilters: boolean;
}

export const SettlementsToolbar: React.FC<SettlementsToolbarProps> = ({
  onNewSettlement,
  onExport,
  onRecalculate,
  onClosePeriod,
  onRefresh,
  selectedCount,
  totalCount,
  isLoading = false,
  filters,
  onFiltersToggle,
  showFilters
}) => {
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showActionsMenu, setShowActionsMenu] = useState(false);

  const hasActiveFilters = Boolean(
    filters.period || 
    filters.status || 
    filters.office || 
    filters.agent || 
    filters.team || 
    filters.origin ||
    filters.q
  );

  const handleExport = (format: 'csv' | 'json' | 'pdf') => {
    onExport(format);
    setShowExportMenu(false);
  };

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Lado izquierdo - Título y contadores */}
        <div className="flex items-center gap-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Liquidaciones
            </h2>
            <p className="text-sm text-gray-500">
              {selectedCount > 0 ? (
                <span className="text-blue-600 font-medium">
                  {selectedCount} seleccionadas de {totalCount}
                </span>
              ) : (
                `${totalCount} liquidaciones encontradas`
              )}
            </p>
          </div>
          
          {hasActiveFilters && (
            <div className="px-2 py-1 bg-blue-50 border border-blue-200 rounded-md">
              <span className="text-xs font-medium text-blue-700">
                Filtros activos
              </span>
            </div>
          )}
        </div>

        {/* Lado derecho - Acciones */}
        <div className="flex items-center gap-2">
          {/* Botón de filtros */}
          <button
            onClick={onFiltersToggle}
            className={`px-3 py-2 border rounded-lg hover:bg-gray-50 flex items-center gap-2 transition-colors ${
              showFilters ? 'bg-gray-50 border-gray-300' : 'border-gray-200'
            }`}
            title="Mostrar/ocultar filtros"
          >
            <Filter className="h-4 w-4" />
            <span className="hidden sm:inline">Filtros</span>
          </button>

          {/* Botón de refrescar */}
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center gap-2 transition-colors disabled:opacity-50"
            title="Actualizar lista"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Actualizar</span>
          </button>

          {/* Menú de exportación */}
          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center gap-2 transition-colors"
              title="Exportar datos"
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Exportar</span>
            </button>

            {showExportMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                <div className="py-1">
                  <button
                    onClick={() => handleExport('csv')}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Exportar como CSV
                  </button>
                  <button
                    onClick={() => handleExport('json')}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Exportar como JSON
                  </button>
                  <button
                    onClick={() => handleExport('pdf')}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Exportar como PDF
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Menú de acciones adicionales */}
          <div className="relative">
            <button
              onClick={() => setShowActionsMenu(!showActionsMenu)}
              className="px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center gap-2 transition-colors"
              title="Más acciones"
            >
              <MoreVertical className="h-4 w-4" />
            </button>

            {showActionsMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                <div className="py-1">
                  <button
                    onClick={() => {
                      onRecalculate();
                      setShowActionsMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                  >
                    <Calculator className="h-4 w-4" />
                    Recalcular seleccionadas
                  </button>
                  <button
                    onClick={() => {
                      onClosePeriod();
                      setShowActionsMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                  >
                    <Lock className="h-4 w-4" />
                    Cerrar período
                  </button>
                  <div className="border-t border-gray-100 my-1"></div>
                  <button
                    onClick={() => {
                      setShowActionsMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                  >
                    <Settings className="h-4 w-4" />
                    Configuración
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Botón principal - Nueva liquidación */}
          <button
            onClick={onNewSettlement}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors font-medium"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Nueva liquidación</span>
            <span className="sm:hidden">Nueva</span>
          </button>
        </div>
      </div>

      {/* Información adicional cuando hay selección */}
      {selectedCount > 0 && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm font-medium text-blue-900">
                {selectedCount} liquidaciones seleccionadas
              </span>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-blue-700">
              <span>Acciones disponibles:</span>
              <button
                onClick={onRecalculate}
                className="px-2 py-1 bg-white border border-blue-200 rounded hover:bg-blue-50 transition-colors"
              >
                Recalcular
              </button>
              <button
                onClick={() => onExport('csv')}
                className="px-2 py-1 bg-white border border-blue-200 rounded hover:bg-blue-50 transition-colors"
              >
                Exportar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Click outside handlers */}
      {(showExportMenu || showActionsMenu) && (
        <div 
          className="fixed inset-0 z-0" 
          onClick={() => {
            setShowExportMenu(false);
            setShowActionsMenu(false);
          }}
        />
      )}
    </div>
  );
};