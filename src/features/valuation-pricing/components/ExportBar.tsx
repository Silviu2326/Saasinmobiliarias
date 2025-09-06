import React, { useState } from 'react';
import { Download, FileText, FileSpreadsheet, Image, MoreHorizontal } from 'lucide-react';
import type { ExportOptions } from '../types';

interface ExportBarProps {
  onExport: (options: ExportOptions) => void;
  onApplyToChannels: () => void;
  onSaveScenario: () => void;
  loading?: boolean;
}

const ExportBar: React.FC<ExportBarProps> = ({
  onExport,
  onApplyToChannels,
  onSaveScenario,
  loading = false
}) => {
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  const handleExport = (format: 'CSV' | 'JSON' | 'PDF' | 'XLSX') => {
    const options: ExportOptions = {
      format,
      sections: {
        subject: true,
        recommendations: true,
        scenarios: true,
        competitors: true,
        audit: false,
        metrics: true
      },
      includeCharts: format === 'PDF',
      includeRawData: format === 'JSON' || format === 'XLSX'
    };
    onExport(options);
    setShowExportMenu(false);
  };

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Pricing — Estrategia de precio de salida
          </h2>
          <p className="text-sm text-gray-500">
            Define la estrategia óptima usando análisis de mercado, elasticidad y competencia
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Export Menu */}
          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              Exportar
            </button>
            
            {showExportMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                <div className="py-2">
                  <button
                    onClick={() => handleExport('PDF')}
                    className="flex items-center gap-3 w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <FileText className="w-4 h-4" />
                    Informe PDF
                  </button>
                  <button
                    onClick={() => handleExport('XLSX')}
                    className="flex items-center gap-3 w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                    Hoja Excel
                  </button>
                  <button
                    onClick={() => handleExport('CSV')}
                    className="flex items-center gap-3 w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <FileText className="w-4 h-4" />
                    Datos CSV
                  </button>
                  <button
                    onClick={() => handleExport('JSON')}
                    className="flex items-center gap-3 w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <FileText className="w-4 h-4" />
                    JSON completo
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Apply to Channels Button */}
          <button
            onClick={onApplyToChannels}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
          >
            <Image className="w-4 h-4" />
            Aplicar a portales
          </button>

          {/* Save Scenario Button */}
          <button
            onClick={onSaveScenario}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50"
          >
            Guardar escenario
          </button>

          {/* More Actions Menu */}
          <div className="relative">
            <button
              onClick={() => setShowMoreMenu(!showMoreMenu)}
              disabled={loading}
              className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors disabled:opacity-50"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
            
            {showMoreMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                <div className="py-2">
                  <button
                    onClick={() => {
                      // TODO: Implement duplicate scenario
                      setShowMoreMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                  >
                    Duplicar escenario
                  </button>
                  <button
                    onClick={() => {
                      // TODO: Implement print view
                      setShowMoreMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                  >
                    Vista de impresión
                  </button>
                  <button
                    onClick={() => {
                      // TODO: Implement share functionality
                      setShowMoreMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                  >
                    Compartir análisis
                  </button>
                  <hr className="my-1 border-gray-200" />
                  <button
                    onClick={() => {
                      // TODO: Implement settings
                      setShowMoreMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                  >
                    Configuración
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Stats Bar */}
      <div className="mt-4 flex items-center gap-6 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          <span>Análisis actualizado hace 5 min</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span>12 comparables activos</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
          <span>3 escenarios guardados</span>
        </div>
      </div>

      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center">
          <div className="flex items-center gap-2 text-gray-600">
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <span>Procesando...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExportBar;