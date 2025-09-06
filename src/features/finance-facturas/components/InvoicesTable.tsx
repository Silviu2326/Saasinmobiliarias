import React from 'react';
import { 
  Eye, 
  Edit, 
  Send, 
  FileText, 
  CreditCard, 
  FileX, 
  Copy,
  MoreVertical,
  ChevronLeft,
  ChevronRight 
} from 'lucide-react';
import type { Invoice, InvoiceQuery } from '../types';
import { 
  formatCurrency, 
  formatDate, 
  getStatusColor, 
  getTypeColor, 
  canEditInvoice,
  canSendInvoice,
  canCreditNote,
  isOverdue
} from '../utils';

interface InvoicesTableProps {
  invoices: Invoice[];
  isLoading: boolean;
  total: number;
  page: number;
  totalPages: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onSort: (field: string) => void;
  sort?: string;
  selectedInvoices: Set<string>;
  onSelectInvoice: (invoice: Invoice) => void;
  onSelectAll: () => void;
  onRowClick: (invoice: Invoice) => void;
  onView: (invoice: Invoice) => void;
  onEdit: (invoice: Invoice) => void;
  onSend: (invoice: Invoice) => void;
  onPayment: (invoice: Invoice) => void;
  onCreditNote: (invoice: Invoice) => void;
  onCancel: (invoice: Invoice) => void;
  onDuplicate: (invoice: Invoice) => void;
  totalAmounts?: {
    base: number;
    iva: number;
    total: number;
    paid: number;
    pending: number;
  };
}

export default function InvoicesTable({
  invoices,
  isLoading,
  total,
  page,
  totalPages,
  pageSize,
  onPageChange,
  onSort,
  sort,
  selectedInvoices,
  onSelectInvoice,
  onSelectAll,
  onRowClick,
  onView,
  onEdit,
  onSend,
  onPayment,
  onCreditNote,
  onCancel,
  onDuplicate,
  totalAmounts
}: InvoicesTableProps) {
  const allSelected = invoices.length > 0 && invoices.every(invoice => selectedInvoices.has(invoice.id));
  const someSelected = invoices.some(invoice => selectedInvoices.has(invoice.id));

  const getSortIcon = (field: string) => {
    if (!sort || !sort.startsWith(field)) return null;
    return sort.endsWith(':desc') ? '↓' : '↑';
  };

  const handleSort = (field: string) => {
    const currentSort = sort?.startsWith(field) ? sort : '';
    const direction = currentSort.endsWith(':desc') ? 'asc' : 'desc';
    onSort(`${field}:${direction}`);
  };

  if (isLoading && invoices.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-500">Cargando facturas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left">
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={(el) => {
                    if (el) el.indeterminate = someSelected && !allSelected;
                  }}
                  onChange={onSelectAll}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('date')}
              >
                <div className="flex items-center gap-1">
                  Fecha
                  <span className="text-gray-400">{getSortIcon('date')}</span>
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('number')}
              >
                <div className="flex items-center gap-1">
                  Número
                  <span className="text-gray-400">{getSortIcon('number')}</span>
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cliente/Proveedor
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tipo
              </th>
              <th 
                className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('base')}
              >
                <div className="flex items-center justify-end gap-1">
                  Base
                  <span className="text-gray-400">{getSortIcon('base')}</span>
                </div>
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                IVA
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ret.
              </th>
              <th 
                className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('total')}
              >
                <div className="flex items-center justify-end gap-1">
                  Total
                  <span className="text-gray-400">{getSortIcon('total')}</span>
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Vencimiento
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {invoices.map((invoice) => {
              const isSelected = selectedInvoices.has(invoice.id);
              const overdue = isOverdue(invoice);
              
              return (
                <tr 
                  key={invoice.id} 
                  className={`hover:bg-gray-50 cursor-pointer transition-colors ${
                    isSelected ? 'bg-blue-50' : ''
                  }`}
                  onClick={(e) => {
                    if (!(e.target as HTMLElement).closest('input, button')) {
                      onRowClick(invoice);
                    }
                  }}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => {
                        e.stopPropagation();
                        onSelectInvoice(invoice);
                      }}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(invoice.date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {invoice.number}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>
                      <div className="font-medium">
                        {invoice.customer?.name || invoice.supplier?.name}
                      </div>
                      <div className="text-gray-500 text-xs">
                        {invoice.customer?.nif || invoice.supplier?.nif}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(invoice.type)}`}>
                      {invoice.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                    {formatCurrency(invoice.base)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                    {formatCurrency(invoice.ivaTotal)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                    {invoice.retTotal > 0 ? formatCurrency(invoice.retTotal) : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                    {formatCurrency(invoice.total)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {invoice.dueDate ? (
                      <div className={overdue ? 'text-red-600 font-medium' : ''}>
                        {formatDate(invoice.dueDate)}
                        {overdue && <span className="ml-1">⚠️</span>}
                      </div>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}>
                      {invoice.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onView(invoice);
                        }}
                        className="text-gray-400 hover:text-gray-600 p-1"
                        title="Ver detalles"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      
                      {canEditInvoice(invoice) && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onEdit(invoice);
                          }}
                          className="text-gray-400 hover:text-blue-600 p-1"
                          title="Editar"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                      )}
                      
                      {canSendInvoice(invoice) && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSend(invoice);
                          }}
                          className="text-gray-400 hover:text-green-600 p-1"
                          title="Enviar"
                        >
                          <Send className="h-4 w-4" />
                        </button>
                      )}
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onPayment(invoice);
                        }}
                        className="text-gray-400 hover:text-green-600 p-1"
                        title="Registrar pago"
                      >
                        <CreditCard className="h-4 w-4" />
                      </button>
                      
                      {canCreditNote(invoice) && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onCreditNote(invoice);
                          }}
                          className="text-gray-400 hover:text-orange-600 p-1"
                          title="Crear abono"
                        >
                          <FileText className="h-4 w-4" />
                        </button>
                      )}
                      
                      <div className="relative group">
                        <button className="text-gray-400 hover:text-gray-600 p-1">
                          <MoreVertical className="h-4 w-4" />
                        </button>
                        <div className="absolute right-0 top-8 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDuplicate(invoice);
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                          >
                            <Copy className="h-4 w-4" />
                            Duplicar
                          </button>
                          {invoice.status !== 'ANULADA' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onCancel(invoice);
                              }}
                              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                            >
                              <FileX className="h-4 w-4" />
                              Anular
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
          
          {/* Footer con totales */}
          {totalAmounts && (
            <tfoot className="bg-gray-50">
              <tr>
                <td colSpan={5} className="px-6 py-4 text-sm font-medium text-gray-900">
                  Totales ({total} facturas)
                </td>
                <td className="px-6 py-4 text-sm font-bold text-gray-900 text-right">
                  {formatCurrency(totalAmounts.base)}
                </td>
                <td className="px-6 py-4 text-sm font-bold text-gray-900 text-right">
                  {formatCurrency(totalAmounts.iva)}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 text-right">-</td>
                <td className="px-6 py-4 text-sm font-bold text-gray-900 text-right">
                  {formatCurrency(totalAmounts.total)}
                </td>
                <td colSpan={3} className="px-6 py-4 text-sm text-gray-500">
                  <div className="flex gap-4 justify-end">
                    <span>Cobrado: {formatCurrency(totalAmounts.paid)}</span>
                    <span>Pendiente: {formatCurrency(totalAmounts.pending)}</span>
                  </div>
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => onPageChange(page - 1)}
              disabled={page === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            <button
              onClick={() => onPageChange(page + 1)}
              disabled={page === totalPages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Siguiente
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Mostrando <span className="font-medium">{(page - 1) * pageSize + 1}</span> a{' '}
                <span className="font-medium">{Math.min(page * pageSize, total)}</span> de{' '}
                <span className="font-medium">{total}</span> resultados
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <button
                  onClick={() => onPageChange(page - 1)}
                  disabled={page === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                
                {/* Números de página */}
                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 7) {
                    pageNum = i + 1;
                  } else if (page <= 4) {
                    pageNum = i + 1;
                  } else if (page >= totalPages - 3) {
                    pageNum = totalPages - 6 + i;
                  } else {
                    pageNum = page - 3 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => onPageChange(pageNum)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        pageNum === page
                          ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                
                <button
                  onClick={() => onPageChange(page + 1)}
                  disabled={page === totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Estado vacío */}
      {invoices.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <FileText className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Sin facturas</h3>
          <p className="mt-1 text-sm text-gray-500">
            No se encontraron facturas que coincidan con los criterios de búsqueda.
          </p>
        </div>
      )}
    </div>
  );
}