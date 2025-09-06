import React, { useState } from 'react';
import { ExportOptions } from '../types';

interface ExportBarProps {
  onExport: (options: ExportOptions) => Promise<void>;
  isExporting?: boolean;
  dateRange?: { from: string; to: string };
}

export default function ExportBar({ onExport, isExporting = false, dateRange }: ExportBarProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleExport = async (format: ExportOptions['format'], includeCharts = false) => {
    const options: ExportOptions = {
      format,
      includeCharts,
      dateRange
    };

    try {
      await onExport(options);
      setIsOpen(false);
    } catch (error) {
      console.error('Error exporting:', error);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className={`mb-2 transition-all duration-200 ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'}`}>
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 min-w-48">
          <div className="space-y-2">
            <div className="text-sm font-medium text-gray-800 mb-3">
              Exportar datos
            </div>
            
            <button
              onClick={() => handleExport('CSV')}
              disabled={isExporting}
              className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Exportar CSV
            </button>

            <button
              onClick={() => handleExport('JSON')}
              disabled={isExporting}
              className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
              Exportar JSON
            </button>

            <button
              onClick={() => handleExport('PNG', true)}
              disabled={isExporting}
              className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-4 h-4 mr-2 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Exportar Gráficos (PNG)
            </button>

            <div className="border-t border-gray-100 pt-2 mt-2">
              <div className="text-xs text-gray-500">
                {dateRange ? (
                  <>Período: {dateRange.from} - {dateRange.to}</>
                ) : (
                  'Exportará todos los datos disponibles'
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isExporting}
        className="inline-flex items-center px-4 py-3 bg-indigo-600 text-white text-sm font-medium rounded-full shadow-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isExporting ? (
          <>
            <svg className="w-4 h-4 mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
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
    </div>
  );
}