import React, { useState } from 'react';
import { 
  X, 
  Calendar, 
  Users, 
  Building2, 
  DollarSign, 
  FileText,
  Plus,
  Download,
  Edit,
  Trash2
} from 'lucide-react';
import type { Settlement, SettlementLine, Adjustment } from '../types';
import { 
  formatCurrency, 
  formatDate, 
  formatPeriod, 
  getStatusColor, 
  getOriginColor, 
  getSourceColor,
  canModifySettlement 
} from '../utils';

interface SettlementDetailsProps {
  settlement: Settlement;
  lines?: SettlementLine[];
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
  onAddAdjustment: (lineId: string) => void;
  onGeneratePayouts: () => void;
  onExportPDF: () => void;
  isLoading?: boolean;
}

export const SettlementDetails: React.FC<SettlementDetailsProps> = ({
  settlement,
  lines = [],
  isOpen,
  onClose,
  onEdit,
  onAddAdjustment,
  onGeneratePayouts,
  onExportPDF,
  isLoading = false
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'lines' | 'adjustments'>('overview');
  const [expandedLines, setExpandedLines] = useState<Set<string>>(new Set());

  const canEdit = canModifySettlement(settlement.status);

  const toggleLineExpanded = (lineId: string) => {
    setExpandedLines(prev => {
      const next = new Set(prev);
      if (next.has(lineId)) {
        next.delete(lineId);
      } else {
        next.add(lineId);
      }
      return next;
    });
  };

  const allAdjustments = lines.reduce<Adjustment[]>((acc, line) => {
    return acc.concat(line.adjustmentHistory || []);
  }, []).sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime());

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>

        <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-6xl sm:w-full sm:p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <FileText className="h-6 w-6 text-blue-600" />
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  {settlement.name}
                </h3>
                <p className="text-sm text-gray-500">
                  {formatPeriod(settlement.period)} • {settlement.linesCount} líneas
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {canEdit && (
                <button
                  onClick={onEdit}
                  className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
                >
                  <Edit className="h-4 w-4" />
                  Editar
                </button>
              )}
              
              <button
                onClick={onExportPDF}
                className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Exportar
              </button>

              <button
                onClick={onClose}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8">
              {[
                { key: 'overview', label: 'Resumen', icon: DollarSign },
                { key: 'lines', label: `Líneas (${lines.length})`, icon: FileText },
                { key: 'adjustments', label: `Ajustes (${allAdjustments.length})`, icon: Edit },
              ].map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key as any)}
                  className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === key
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="max-h-96 overflow-y-auto">
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Información general */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Información general</h4>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Estado:</span>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(settlement.status)}`}>
                        {settlement.status}
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Origen:</span>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getOriginColor(settlement.origin)}`}>
                        {settlement.origin}
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Período:</span>
                      <span className="text-sm font-medium text-gray-900">
                        {formatPeriod(settlement.period)}
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Creada:</span>
                      <span className="text-sm text-gray-900">
                        {formatDate(settlement.createdAt)}
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Creado por:</span>
                      <span className="text-sm text-gray-900">
                        {settlement.createdByName}
                      </span>
                    </div>

                    {settlement.notes && (
                      <div>
                        <span className="text-sm text-gray-600">Notas:</span>
                        <p className="text-sm text-gray-900 mt-1 p-2 bg-gray-50 rounded">
                          {settlement.notes}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Ámbito */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Ámbito</h4>
                  
                  <div className="space-y-3">
                    {settlement.officeName && (
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-900">{settlement.officeName}</span>
                      </div>
                    )}
                    
                    {settlement.teamName && (
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-900">{settlement.teamName}</span>
                      </div>
                    )}
                    
                    {settlement.agentName && (
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-900">{settlement.agentName}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Importes */}
                <div className="lg:col-span-2">
                  <h4 className="font-medium text-gray-900 mb-4">Resumen económico</h4>
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900">
                          {formatCurrency(settlement.gross)}
                        </div>
                        <div className="text-sm text-gray-600">Importe bruto</div>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-2xl font-bold text-red-600">
                          -{formatCurrency(settlement.withholdings)}
                        </div>
                        <div className="text-sm text-gray-600">Retenciones</div>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {formatCurrency(settlement.net)}
                        </div>
                        <div className="text-sm text-gray-600">Importe neto</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'lines' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-gray-900">Líneas de liquidación</h4>
                  {canEdit && (
                    <button
                      onClick={onGeneratePayouts}
                      className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Generar pagos
                    </button>
                  )}
                </div>

                <div className="space-y-2">
                  {lines.map((line) => (
                    <div key={line.id} className="border border-gray-200 rounded-lg">
                      <div 
                        className="p-4 cursor-pointer hover:bg-gray-50"
                        onClick={() => toggleLineExpanded(line.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSourceColor(line.source)}`}>
                              {line.source}
                            </span>
                            <span className="text-sm font-medium text-gray-900">
                              {line.ref}
                            </span>
                            <span className="text-sm text-gray-500">
                              {line.agentName}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-4">
                            <span className="text-sm font-medium text-gray-900">
                              {formatCurrency(line.netAmount)}
                            </span>
                            {canEdit && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onAddAdjustment(line.id);
                                }}
                                className="p-1 text-gray-400 hover:text-blue-600"
                                title="Agregar ajuste"
                              >
                                <Plus className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </div>
                        
                        {expandedLines.has(line.id) && (
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-gray-600">Fecha:</span>
                                <span className="ml-2 text-gray-900">{formatDate(line.date)}</span>
                              </div>
                              <div>
                                <span className="text-gray-600">Importe base:</span>
                                <span className="ml-2 text-gray-900">{formatCurrency(line.baseAmount)}</span>
                              </div>
                              <div>
                                <span className="text-gray-600">Comisión:</span>
                                <span className="ml-2 text-gray-900">{formatCurrency(line.commissionAmount)}</span>
                              </div>
                              <div>
                                <span className="text-gray-600">Ajustes:</span>
                                <span className="ml-2 text-gray-900">{formatCurrency(line.adjustments)}</span>
                              </div>
                            </div>
                            
                            {line.notes && (
                              <div className="mt-2">
                                <span className="text-sm text-gray-600">Notas:</span>
                                <p className="text-sm text-gray-900 mt-1">{line.notes}</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'adjustments' && (
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Historial de ajustes</h4>
                
                {allAdjustments.length === 0 ? (
                  <div className="text-center py-8">
                    <Edit className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No hay ajustes aplicados</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {allAdjustments.map((adjustment) => (
                      <div key={adjustment.id} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              adjustment.type === 'AMOUNT' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                            }`}>
                              {adjustment.type === 'AMOUNT' ? 'Importe' : 'Porcentaje'}
                            </span>
                            <span className="text-sm font-medium text-gray-900">
                              {adjustment.type === 'AMOUNT' 
                                ? formatCurrency(adjustment.value)
                                : `${adjustment.value}%`
                              }
                            </span>
                          </div>
                          
                          <span className="text-sm text-gray-500">
                            {formatDate(adjustment.appliedAt)}
                          </span>
                        </div>
                        
                        <p className="text-sm text-gray-700 mb-2">
                          {adjustment.reason}
                        </p>
                        
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>Por: {adjustment.appliedByName}</span>
                          <span>Impacto: {formatCurrency(adjustment.amount)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="mt-6 pt-4 border-t border-gray-200 flex justify-end gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cerrar
            </button>
            {canEdit && (
              <button
                onClick={onEdit}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Editar liquidación
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};