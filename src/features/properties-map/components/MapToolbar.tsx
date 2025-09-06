import React from 'react';

interface MapToolbarProps {
  selectedCount: number;
  clusterEnabled: boolean;
  onClusterToggle: (enabled: boolean) => void;
  searchRadius: number;
  onSearchRadiusChange: (radius: number) => void;
  onExport: () => void;
  onViewList: () => void;
  isExporting?: boolean;
}

export default function MapToolbar({
  selectedCount,
  clusterEnabled,
  onClusterToggle,
  searchRadius,
  onSearchRadiusChange,
  onExport,
  onViewList,
  isExporting = false
}: MapToolbarProps) {
  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-6">
          {/* Cluster toggle */}
          <div className="flex items-center">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={clusterEnabled}
                onChange={(e) => onClusterToggle(e.target.checked)}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="ml-2 text-sm font-medium text-gray-700">
                Agrupar propiedades
              </span>
            </label>
          </div>

          {/* Search radius */}
          <div className="flex items-center space-x-2">
            <label htmlFor="search-radius" className="text-sm font-medium text-gray-700">
              Radio de búsqueda:
            </label>
            <select
              id="search-radius"
              value={searchRadius}
              onChange={(e) => onSearchRadiusChange(Number(e.target.value))}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={1}>1 km</option>
              <option value={2}>2 km</option>
              <option value={5}>5 km</option>
              <option value={10}>10 km</option>
              <option value={20}>20 km</option>
              <option value={50}>50 km</option>
            </select>
          </div>

          {/* Selected count */}
          {selectedCount > 0 && (
            <div className="text-sm text-gray-600">
              {selectedCount} propiedad{selectedCount !== 1 ? 'es' : ''} seleccionada{selectedCount !== 1 ? 's' : ''}
            </div>
          )}
        </div>

        <div className="flex items-center space-x-3">
          {/* Export button */}
          <button
            onClick={onExport}
            disabled={isExporting}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isExporting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Exportando...
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Exportar
              </>
            )}
          </button>

          {/* View list button */}
          <button
            onClick={onViewList}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
            Ver lista
          </button>
        </div>
      </div>
    </div>
  );
}