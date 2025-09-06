import React from 'react';
import { 
  ChevronUp, 
  ChevronDown, 
  ChevronLeft, 
  ChevronRight,
  Eye,
  Edit,
  Trash2,
  MoreVertical,
  FileText
} from 'lucide-react';
import type { Settlement, SettlementQuery } from '../types';
import { 
  formatCurrency, 
  formatDate, 
  formatPeriod, 
  getStatusColor, 
  getOriginColor,
  canModifySettlement,
  canDeleteSettlement
} from '../utils';

interface SettlementsTableProps {
  settlements: Settlement[];
  isLoading: boolean;
  total: number;
  page: number;
  totalPages: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onSort: (sort: string) => void;
  sort?: string;
  selectedSettlements: Set<string>;
  onSelectSettlement: (settlementId: string) => void;
  onSelectAll: (checked: boolean) => void;
  onRowClick: (settlement: Settlement) => void;
  onView: (settlement: Settlement) => void;
  onEdit: (settlement: Settlement) => void;
  onDelete: (settlement: Settlement) => void;
  onDuplicate?: (settlement: Settlement) => void;
}

export const SettlementsTable: React.FC<SettlementsTableProps> = ({
  settlements,
  isLoading,
  total,
  page,
  totalPages,
  pageSize,
  onPageChange,
  onSort,
  sort,
  selectedSettlements,
  onSelectSettlement,
  onSelectAll,
  onRowClick,
  onView,
  onEdit,
  onDelete,
  onDuplicate
}) => {
  const getSortIcon = (field: string) => {
    if (!sort || !sort.startsWith(field)) return null;
    return sort.includes('desc') ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />;
  };

  const handleSort = (field: string) => {
    const isCurrentSort = sort?.startsWith(field);
    const isDesc = sort?.includes('desc');
    const newSort = isCurrentSort && !isDesc ? `${field}:desc` : field;
    onSort(newSort);
  };

  const isAllSelected = settlements.length > 0 && settlements.every(s => selectedSettlements.has(s.id));
  const isIndeterminate = selectedSettlements.size > 0 && !isAllSelected;

  const renderActionMenu = (settlement: Settlement) => {
    const canEdit = canModifySettlement(settlement.status);
    const canRemove = canDeleteSettlement(settlement.status);

    return (
      <div className="relative group">
        <button className="p-1 rounded hover:bg-gray-100 group-hover:visible invisible">
          <MoreVertical className="h-4 w-4" />
        </button>
        
        <div className="absolute right-0 top-8 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none group-hover:pointer-events-auto">
          <div className="py-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onView(settlement);
              }}
              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
            >
              <Eye className="h-4 w-4" />
              Ver detalles
            </button>
            
            {canEdit && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(settlement);
                }}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
              >
                <Edit className="h-4 w-4" />
                Editar
              </button>
            )}
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDuplicate?.(settlement);
              }}
              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
            >
              <FileText className="h-4 w-4" />
              Duplicar
            </button>
            
            {canRemove && (
              <>
                <div className="border-t border-gray-100 my-1"></div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(settlement);
                  }}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-red-50 text-red-600 flex items-center gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Eliminar
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (isLoading && settlements.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-500 mt-2">Cargando liquidaciones...</p>
        </div>
      </div>
    );
  }

  if (!isLoading && settlements.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-8 text-center">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-lg mb-2">No hay liquidaciones</p>
          <p className="text-gray-400 text-sm">
            No se encontraron liquidaciones que coincidan con los filtros aplicados.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Header de la tabla */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left w-12">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  ref={(el) => {
                    if (el) el.indeterminate = isIndeterminate;
                  }}
                  onChange={(e) => onSelectAll(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </th>
              
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                onClick={() => handleSort('name')}
              >
                <div className="flex items-center gap-1">
                  Nombre
                  {getSortIcon('name')}
                </div>
              </th>
              
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                onClick={() => handleSort('period')}
              >
                <div className="flex items-center gap-1">
                  Período
                  {getSortIcon('period')}
                </div>
              </th>
              
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ámbito
              </th>
              
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                onClick={() => handleSort('origin')}
              >
                <div className="flex items-center gap-1">
                  Origen
                  {getSortIcon('origin')}
                </div>
              </th>
              
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                onClick={() => handleSort('linesCount')}
              >
                <div className="flex items-center gap-1">
                  Líneas
                  {getSortIcon('linesCount')}
                </div>
              </th>
              
              <th 
                className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                onClick={() => handleSort('gross')}
              >
                <div className="flex items-center justify-end gap-1">
                  Bruto
                  {getSortIcon('gross')}
                </div>
              </th>
              
              <th 
                className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                onClick={() => handleSort('net')}
              >
                <div className="flex items-center justify-end gap-1">
                  Neto
                  {getSortIcon('net')}
                </div>
              </th>
              
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                onClick={() => handleSort('status')}
              >
                <div className="flex items-center gap-1">
                  Estado
                  {getSortIcon('status')}
                </div>
              </th>
              
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                onClick={() => handleSort('createdAt')}
              >
                <div className="flex items-center gap-1">
                  Creada
                  {getSortIcon('createdAt')}
                </div>
              </th>
              
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          
          <tbody className="bg-white divide-y divide-gray-200">
            {settlements.map((settlement) => (
              <tr
                key={settlement.id}
                className={`hover:bg-gray-50 cursor-pointer transition-colors ${
                  selectedSettlements.has(settlement.id) ? 'bg-blue-50' : ''
                }`}
                onClick={() => onRowClick(settlement)}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={selectedSettlements.has(settlement.id)}
                    onChange={(e) => {
                      e.stopPropagation();
                      onSelectSettlement(settlement.id);
                    }}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {settlement.name}
                  </div>
                  <div className="text-sm text-gray-500">
                    {settlement.createdByName}
                  </div>
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-900">
                    {formatPeriod(settlement.period)}
                  </span>
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {settlement.officeName && (
                      <div className="font-medium">{settlement.officeName}</div>
                    )}
                    {settlement.teamName && (
                      <div className="text-gray-500">{settlement.teamName}</div>
                    )}
                    {settlement.agentName && (
                      <div className="text-gray-500">{settlement.agentName}</div>
                    )}
                  </div>
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getOriginColor(settlement.origin)}`}>
                    {settlement.origin}
                  </span>
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {settlement.linesCount.toLocaleString()}
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                  <div className="font-medium text-gray-900">
                    {formatCurrency(settlement.gross)}
                  </div>
                  {settlement.withholdings > 0 && (
                    <div className="text-gray-500 text-xs">
                      -{formatCurrency(settlement.withholdings)} ret.
                    </div>
                  )}
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900">
                  {formatCurrency(settlement.net)}
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(settlement.status)}`}>
                    {settlement.status}
                  </span>
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(settlement.createdAt)}
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div onClick={(e) => e.stopPropagation()}>
                    {renderActionMenu(settlement)}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center text-sm text-gray-700">
            <span>
              Mostrando {((page - 1) * pageSize) + 1} a {Math.min(page * pageSize, total)} de {total} resultados
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
              className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed rounded-md"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            
            <div className="flex items-center gap-1">
              {/* Páginas */}
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (page <= 3) {
                  pageNum = i + 1;
                } else if (page >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = page - 2 + i;
                }
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => onPageChange(pageNum)}
                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium rounded-md ${
                      page === pageNum
                        ? 'border-blue-500 bg-blue-50 text-blue-600'
                        : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            
            <button
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
              className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed rounded-md"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Indicador de carga */}
      {isLoading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center">
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="text-sm text-gray-600">Actualizando...</span>
          </div>
        </div>
      )}
    </div>
  );
};