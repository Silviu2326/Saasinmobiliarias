import React from 'react';
import { 
  Edit, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  Eye, 
  ChevronLeft, 
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from 'lucide-react';
import type { Expense } from '../types';
import { 
  formatCurrency, 
  formatDate, 
  getExpenseStatusColor, 
  getExpenseStatusText,
  getExpenseTypeColor,
  getExpenseTypeText,
  isExpenseOverdue,
  getExpenseBalance,
  isExpenseFullyPaid,
  getExpensePaymentPercentage
} from '../utils';

interface ExpensesTableProps {
  expenses: Expense[];
  isLoading: boolean;
  selectedItems: Set<string>;
  onSelectItem: (expense: Expense) => void;
  onSelectAll: (expenses: Expense[]) => void;
  isSelected: (expense: Expense) => boolean;
  onExpenseSelect: (expense: Expense) => void;
  onExpenseEdit: (expense: Expense) => void;
  onExpenseDelete: (expense: Expense) => void;
  onExpenseApprove: (expense: Expense) => void;
  onExpenseReject: (expense: Expense) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function ExpensesTable({
  expenses,
  isLoading,
  selectedItems,
  onSelectItem,
  onSelectAll,
  isSelected,
  onExpenseSelect,
  onExpenseEdit,
  onExpenseDelete,
  onExpenseApprove,
  onExpenseReject,
  currentPage,
  totalPages,
  onPageChange
}: ExpensesTableProps) {
  const allSelected = expenses.length > 0 && expenses.every(expense => isSelected(expense));
  const someSelected = expenses.some(expense => isSelected(expense));

  const handleSelectAll = () => {
    if (allSelected) {
      onSelectAll([]);
    } else {
      onSelectAll(expenses);
    }
  };

  const canApprove = (expense: Expense) => expense.status === 'PENDING';
  const canReject = (expense: Expense) => expense.status === 'PENDING';
  const canEdit = (expense: Expense) => expense.status === 'PENDING';
  const canDelete = (expense: Expense) => expense.status === 'PENDING';

  if (isLoading) {
    return (
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando gastos...</p>
          </div>
        </div>
      </div>
    );
  }

  if (expenses.length === 0) {
    return (
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-12">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 text-gray-400">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No hay gastos</h3>
            <p className="mt-1 text-sm text-gray-500">
              No se encontraron gastos que coincidan con los criterios de búsqueda.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg">
      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left">
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={input => input && (input.indeterminate = someSelected && !allSelected)}
                  onChange={handleSelectAll}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Número
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fecha
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Proveedor
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Categoría
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tipo
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Pago
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {expenses.map((expense) => (
              <tr 
                key={expense.id} 
                className={`hover:bg-gray-50 cursor-pointer ${isSelected(expense) ? 'bg-blue-50' : ''}`}
                onClick={() => onExpenseSelect(expense)}
              >
                {/* Checkbox */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={isSelected(expense)}
                    onChange={(e) => {
                      e.stopPropagation();
                      onSelectItem(expense);
                    }}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </td>

                {/* Número */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {expense.series}-{expense.number}
                  </div>
                  {expense.dueDate && isExpenseOverdue(expense) && (
                    <div className="text-xs text-red-600 font-medium">
                      Vencido
                    </div>
                  )}
                </td>

                {/* Fecha */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{formatDate(expense.date)}</div>
                  {expense.dueDate && (
                    <div className="text-xs text-gray-500">
                      Vence: {formatDate(expense.dueDate)}
                    </div>
                  )}
                </td>

                {/* Proveedor */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {expense.supplier?.name || 'Sin proveedor'}
                  </div>
                  {expense.supplier?.nif && (
                    <div className="text-xs text-gray-500">{expense.supplier.nif}</div>
                  )}
                </td>

                {/* Categoría */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{expense.category.name}</div>
                  {expense.category.description && (
                    <div className="text-xs text-gray-500">{expense.category.description}</div>
                  )}
                </td>

                {/* Tipo */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getExpenseTypeColor(expense.type)}`}>
                    {getExpenseTypeText(expense.type)}
                  </span>
                </td>

                {/* Total */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {formatCurrency(expense.total)}
                  </div>
                  <div className="text-xs text-gray-500">
                    Base: {formatCurrency(expense.base)}
                  </div>
                </td>

                {/* Estado */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getExpenseStatusColor(expense.status)}`}>
                    {getExpenseStatusText(expense.status)}
                  </span>
                </td>

                {/* Pago */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {formatCurrency(expense.paid)} / {formatCurrency(expense.total)}
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                    <div 
                      className={`h-2 rounded-full ${
                        isExpenseFullyPaid(expense) ? 'bg-green-600' : 'bg-yellow-500'
                      }`}
                      style={{ width: `${getExpensePaymentPercentage(expense)}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {getExpensePaymentPercentage(expense)}% pagado
                  </div>
                </td>

                {/* Acciones */}
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onExpenseSelect(expense);
                      }}
                      className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-100"
                      title="Ver detalles"
                    >
                      <Eye className="h-4 w-4" />
                    </button>

                    {canEdit(expense) && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onExpenseEdit(expense);
                        }}
                        className="text-indigo-600 hover:text-indigo-900 p-1 rounded hover:bg-indigo-100"
                        title="Editar"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                    )}

                    {canApprove(expense) && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onExpenseApprove(expense);
                        }}
                        className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-100"
                        title="Aprobar"
                      >
                        <CheckCircle className="h-4 w-4" />
                      </button>
                    )}

                    {canReject(expense) && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onExpenseReject(expense);
                        }}
                        className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-100"
                        title="Rechazar"
                      >
                        <XCircle className="h-4 w-4" />
                      </button>
                    )}

                    {canDelete(expense) && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onExpenseDelete(expense);
                        }}
                        className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-100"
                        title="Eliminar"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Siguiente
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Mostrando página <span className="font-medium">{currentPage}</span> de{' '}
                <span className="font-medium">{totalPages}</span>
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => onPageChange(1)}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">Primera</span>
                  <ChevronsLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={() => onPageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">Anterior</span>
                  <ChevronLeft className="h-5 w-5" />
                </button>
                
                {/* Páginas */}
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => onPageChange(pageNum)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        pageNum === currentPage
                          ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <button
                  onClick={() => onPageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">Siguiente</span>
                  <ChevronRight className="h-5 w-5" />
                </button>
                <button
                  onClick={() => onPageChange(totalPages)}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">Última</span>
                  <ChevronsRight className="h-5 w-5" />
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

