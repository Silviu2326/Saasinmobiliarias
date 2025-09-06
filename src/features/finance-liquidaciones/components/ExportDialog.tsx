import React, { useState } from 'react';
import { X, Download, FileText, FileSpreadsheet, File } from 'lucide-react';
import type { SettlementQuery } from '../types';

interface ExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (format: 'csv' | 'json' | 'pdf', options: {
    includeLines: boolean;
    includeAdjustments: boolean;
    dateRange?: { from: string; to: string };
  }) => void;
  filters: SettlementQuery;
  totalRecords: number;
}

export const ExportDialog: React.FC<ExportDialogProps> = ({
  isOpen,
  onClose,
  onExport,
  filters,
  totalRecords
}) => {
  const [selectedFormat, setSelectedFormat] = useState<'csv' | 'json' | 'pdf'>('csv');
  const [options, setOptions] = useState({
    includeLines: false,
    includeAdjustments: false,
    customDateRange: false,
    dateFrom: '',
    dateTo: ''
  });

  const handleExport = () => {
    const exportOptions = {
      includeLines: options.includeLines,
      includeAdjustments: options.includeAdjustments,
      dateRange: options.customDateRange ? {
        from: options.dateFrom,
        to: options.dateTo
      } : undefined
    };

    onExport(selectedFormat, exportOptions);
    onClose();
  };

  const formatOptions = [
    {
      value: 'csv',
      label: 'CSV (Excel)',
      icon: FileSpreadsheet,
      description: 'Formato compatible con Excel y hojas de cálculo'
    },
    {
      value: 'json',
      label: 'JSON',
      icon: File,
      description: 'Formato estructurado para integraciones'
    },
    {
      value: 'pdf',
      label: 'PDF',
      icon: FileText,
      description: 'Documento imprimible con formato'
    }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>

        <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-2 rounded-full">
                <Download className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">Exportar liquidaciones</h3>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="mb-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-700">
                Se exportarán <strong>{totalRecords}</strong> liquidaciones según los filtros aplicados.
              </p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Formato */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3">Formato de exportación</h4>
              <div className="space-y-2">
                {formatOptions.map((format) => {
                  const Icon = format.icon;
                  return (
                    <label
                      key={format.value}
                      className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="format"
                        value={format.value}
                        checked={selectedFormat === format.value}
                        onChange={(e) => setSelectedFormat(e.target.value as any)}
                        className="mr-3"
                      />
                      <Icon className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">{format.label}</div>
                        <div className="text-xs text-gray-500">{format.description}</div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Opciones de contenido */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3">Contenido a incluir</h4>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={options.includeLines}
                    onChange={(e) => setOptions({ ...options, includeLines: e.target.checked })}
                    className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Incluir líneas de liquidación detalladas</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={options.includeAdjustments}
                    onChange={(e) => setOptions({ ...options, includeAdjustments: e.target.checked })}
                    className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Incluir historial de ajustes</span>
                </label>
              </div>
            </div>

            {/* Rango de fechas personalizado */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-gray-900">Rango de fechas</h4>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={options.customDateRange}
                    onChange={(e) => setOptions({ ...options, customDateRange: e.target.checked })}
                    className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-xs text-gray-600">Personalizar</span>
                </label>
              </div>
              
              {options.customDateRange ? (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Desde</label>
                    <input
                      type="date"
                      value={options.dateFrom}
                      onChange={(e) => setOptions({ ...options, dateFrom: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Hasta</label>
                    <input
                      type="date"
                      value={options.dateTo}
                      onChange={(e) => setOptions({ ...options, dateTo: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500">
                  Se usará el rango de fechas de los filtros actuales
                </p>
              )}
            </div>

            {/* Vista previa */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Vista previa de la exportación</h4>
              <div className="space-y-1 text-sm text-gray-600">
                <p>• Formato: {formatOptions.find(f => f.value === selectedFormat)?.label}</p>
                <p>• Registros: {totalRecords} liquidaciones</p>
                {options.includeLines && <p>• Incluye líneas detalladas</p>}
                {options.includeAdjustments && <p>• Incluye historial de ajustes</p>}
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleExport}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Exportar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};