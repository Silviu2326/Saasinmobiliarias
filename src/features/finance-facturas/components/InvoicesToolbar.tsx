import React from 'react';
import { 
  Plus, 
  Send, 
  Download, 
  Upload, 
  FileText, 
  Calendar,
  RotateCcw 
} from 'lucide-react';
import type { InvoiceQuery } from '../types';
import { formatCurrency } from '../utils';

interface InvoicesToolbarProps {
  onNewInvoice: () => void;
  onSend: () => void;
  onExport: () => void;
  onImport: () => void;
  onCreditNote: () => void;
  onScheduleRecurring: () => void;
  onRefresh: () => void;
  selectedCount: number;
  totalCount: number;
  selectedTotal?: {
    base: number;
    iva: number;
    total: number;
  };
  isLoading: boolean;
  filters: InvoiceQuery;
  onFiltersToggle: () => void;
  showFilters: boolean;
}

export default function InvoicesToolbar({
  onNewInvoice,
  onSend,
  onExport,
  onImport,
  onCreditNote,
  onScheduleRecurring,
  onRefresh,
  selectedCount,
  totalCount,
  selectedTotal,
  isLoading,
  filters,
  onFiltersToggle,
  showFilters
}: InvoicesToolbarProps) {
  const hasSelection = selectedCount > 0;
  const hasOneSelection = selectedCount === 1;

  return (
    <div className="bg-white shadow rounded-lg mb-6">
      <div className="px-4 py-4">
        {/* Barra principal */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Botón Nueva Factura */}
            <button
              onClick={onNewInvoice}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors"
            >
              <Plus className="h-4 w-4" />
              Nueva Factura
            </button>

            <div className="h-6 w-px bg-gray-300" />

            {/* Acciones múltiples */}
            <button
              onClick={onSend}
              disabled={!hasSelection || isLoading}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
            >
              <Send className="h-4 w-4" />
              Enviar ({selectedCount})
            </button>

            <button
              onClick={onCreditNote}
              disabled={!hasOneSelection || isLoading}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
            >
              <FileText className="h-4 w-4" />
              Abono
            </button>

            <button
              onClick={onScheduleRecurring}
              disabled={!hasOneSelection || isLoading}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
            >
              <Calendar className="h-4 w-4" />
              Recurrente
            </button>
          </div>

          <div className="flex items-center gap-2">
            {/* Exportar/Importar */}
            <button
              onClick={onExport}
              disabled={isLoading}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
            >
              <Download className="h-4 w-4" />
              Exportar
            </button>

            <button
              onClick={onImport}
              disabled={isLoading}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
            >
              <Upload className="h-4 w-4" />
              Importar
            </button>

            <div className="h-6 w-px bg-gray-300" />

            {/* Filtros */}
            <button
              onClick={onFiltersToggle}
              className={`px-3 py-2 text-sm border rounded-lg flex items-center gap-2 transition-colors ${
                showFilters
                  ? 'bg-blue-50 border-blue-300 text-blue-700'
                  : 'border-gray-300 hover:bg-gray-50'
              }`}
            >
              Filtros
            </button>

            {/* Actualizar */}
            <button
              onClick={onRefresh}
              disabled={isLoading}
              className={`p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 transition-colors ${
                isLoading ? 'animate-spin' : ''
              }`}
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Información de selección y totales */}
        {(hasSelection || selectedTotal) && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                {hasSelection && (
                  <span>
                    {selectedCount} de {totalCount} facturas seleccionadas
                  </span>
                )}
              </div>
              
              {selectedTotal && (
                <div className="flex items-center gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">Base:</span>
                    <span className="font-medium">{formatCurrency(selectedTotal.base)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">IVA:</span>
                    <span className="font-medium">{formatCurrency(selectedTotal.iva)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">Total:</span>
                    <span className="font-semibold text-gray-900">{formatCurrency(selectedTotal.total)}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Indicadores de filtros activos */}
        {Object.keys(filters).some(key => {
          const value = filters[key as keyof InvoiceQuery];
          return value && key !== 'page' && key !== 'size' && key !== 'sort';
        }) && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-gray-500">Filtros activos:</span>
              
              {filters.q && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                  Búsqueda: {filters.q}
                </span>
              )}
              
              {filters.type && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                  Tipo: {filters.type}
                </span>
              )}
              
              {filters.status && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                  Estado: {filters.status}
                </span>
              )}
              
              {filters.series && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
                  Serie: {filters.series}
                </span>
              )}
              
              {(filters.from || filters.to) && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
                  Fecha: {filters.from && formatDate(filters.from)} - {filters.to && formatDate(filters.to)}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('es-ES');
}