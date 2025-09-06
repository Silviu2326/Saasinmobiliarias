import React from 'react';
import { X, Edit, Trash2, CheckCircle, XCircle, Calendar, DollarSign, User, FileText } from 'lucide-react';
import type { Expense } from '../types';
import { 
  formatCurrency, 
  formatDate, 
  formatDateTime,
  getExpenseStatusColor, 
  getExpenseStatusText,
  getExpenseTypeColor,
  getExpenseTypeText,
  getPaymentMethodText,
  getRecurrenceFrequencyText,
  isExpenseOverdue,
  getExpenseBalance,
  isExpenseFullyPaid,
  getExpensePaymentPercentage
} from '../utils';

interface ExpenseDetailsDrawerProps {
  expense: Expense | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (expense: Expense) => void;
  onDelete: (expense: Expense) => void;
  onApprove: (expense: Expense) => void;
  onReject: (expense: Expense) => void;
}

export default function ExpenseDetailsDrawer({
  expense,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  onApprove,
  onReject
}: ExpenseDetailsDrawerProps) {
  if (!expense) return null;

  const canApprove = expense.status === 'PENDING';
  const canReject = expense.status === 'PENDING';
  const canEdit = expense.status === 'PENDING';
  const canDelete = expense.status === 'PENDING';

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div className={`fixed inset-y-0 right-0 w-96 bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h2 className="text-lg font-medium text-gray-900">
                Gasto {expense.series}-{expense.number}
              </h2>
              <p className="text-sm text-gray-500">
                {formatDate(expense.date)}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* Estado y tipo */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getExpenseStatusColor(expense.status)}`}>
                  {getExpenseStatusText(expense.status)}
                </span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getExpenseTypeColor(expense.type)}`}>
                  {getExpenseTypeText(expense.type)}
                </span>
              </div>
              
              {expense.dueDate && isExpenseOverdue(expense) && (
                <div className="text-sm text-red-600 font-medium">
                  ⚠️ Gasto vencido
                </div>
              )}
            </div>

            {/* Información básica */}
            <div className="space-y-4 mb-6">
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">Información básica</h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">Número:</span>
                    <span className="text-sm font-medium">{expense.series}-{expense.number}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">Fecha:</span>
                    <span className="text-sm font-medium">{formatDate(expense.date)}</span>
                  </div>
                  
                  {expense.dueDate && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">Vencimiento:</span>
                      <span className="text-sm font-medium">{formatDate(expense.dueDate)}</span>
                    </div>
                  )}
                  
                  {expense.paymentMethod && (
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">Método de pago:</span>
                      <span className="text-sm font-medium">{getPaymentMethodText(expense.paymentMethod)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Proveedor */}
            {expense.supplier && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-900 mb-2">Proveedor</h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="font-medium">{expense.supplier.name}</div>
                  {expense.supplier.nif && (
                    <div className="text-sm text-gray-600">NIF: {expense.supplier.nif}</div>
                  )}
                  {expense.supplier.address && (
                    <div className="text-sm text-gray-600">{expense.supplier.address}</div>
                  )}
                  {expense.supplier.city && (
                    <div className="text-sm text-gray-600">
                      {expense.supplier.city}
                      {expense.supplier.zipCode && `, ${expense.supplier.zipCode}`}
                      {expense.supplier.country && `, ${expense.supplier.country}`}
                    </div>
                  )}
                  {expense.supplier.email && (
                    <div className="text-sm text-gray-600">{expense.supplier.email}</div>
                  )}
                  {expense.supplier.phone && (
                    <div className="text-sm text-gray-600">{expense.supplier.phone}</div>
                  )}
                </div>
              </div>
            )}

            {/* Categoría */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-900 mb-2">Categoría</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="font-medium">{expense.category.name}</div>
                {expense.category.description && (
                  <div className="text-sm text-gray-600 mt-1">{expense.category.description}</div>
                )}
                {expense.category.budget && (
                  <div className="text-sm text-gray-600 mt-1">
                    Presupuesto: {formatCurrency(expense.category.budget)}
                  </div>
                )}
              </div>
            </div>

            {/* Líneas del gasto */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-900 mb-2">Líneas del gasto</h3>
              <div className="space-y-2">
                {expense.lines.map((line, index) => (
                  <div key={line.id} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-medium">{line.concept}</div>
                      <div className="text-right">
                        <div className="font-medium">{formatCurrency(line.total)}</div>
                        <div className="text-sm text-gray-500">
                          {line.qty} × {formatCurrency(line.price)}
                        </div>
                      </div>
                    </div>
                    
                    {line.description && (
                      <div className="text-sm text-gray-600 mb-2">{line.description}</div>
                    )}
                    
                    <div className="grid grid-cols-3 gap-4 text-sm text-gray-500">
                      <div>Base: {formatCurrency(line.baseAmount)}</div>
                      <div>IVA ({line.iva}%): {formatCurrency(line.ivaAmount)}</div>
                      {line.ret && line.ret > 0 && (
                        <div>Ret ({line.ret}%): {formatCurrency(line.retAmount || 0)}</div>
                      )}
                    </div>
                    
                    {line.discount && line.discount > 0 && (
                      <div className="text-sm text-green-600 mt-1">
                        Descuento: {line.discount}%
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Totales */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-900 mb-2">Totales</h3>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Base imponible:</span>
                  <span className="font-medium">{formatCurrency(expense.base)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">IVA total:</span>
                  <span className="font-medium">{formatCurrency(expense.ivaTotal)}</span>
                </div>
                {expense.retTotal > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Retenciones:</span>
                    <span className="font-medium">{formatCurrency(expense.retTotal)}</span>
                  </div>
                )}
                <div className="border-t pt-2">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total:</span>
                    <span className="text-blue-600">{formatCurrency(expense.total)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Estado de pago */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-900 mb-2">Estado de pago</h3>
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Pagado:</span>
                  <span className="font-medium text-green-600">{formatCurrency(expense.paid)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Pendiente:</span>
                  <span className="font-medium text-yellow-600">{formatCurrency(getExpenseBalance(expense))}</span>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className={`h-3 rounded-full ${
                      isExpenseFullyPaid(expense) ? 'bg-green-600' : 'bg-yellow-500'
                    }`}
                    style={{ width: `${getExpensePaymentPercentage(expense)}%` }}
                  ></div>
                </div>
                
                <div className="text-center text-sm text-gray-600">
                  {getExpensePaymentPercentage(expense)}% pagado
                </div>
              </div>
            </div>

            {/* Información adicional */}
            {(expense.notes || expense.recurrence || expense.references) && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-900 mb-2">Información adicional</h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  {expense.notes && (
                    <div>
                      <span className="text-sm font-medium text-gray-600">Notas:</span>
                      <div className="text-sm text-gray-900 mt-1">{expense.notes}</div>
                    </div>
                  )}
                  
                  {expense.recurrence && (
                    <div>
                      <span className="text-sm font-medium text-gray-600">Recurrencia:</span>
                      <div className="text-sm text-gray-900 mt-1">
                        {getRecurrenceFrequencyText(expense.recurrence.freq)}
                        {expense.recurrence.day && ` - Día ${expense.recurrence.day}`}
                        {expense.recurrence.until && ` hasta ${formatDate(expense.recurrence.until)}`}
                      </div>
                    </div>
                  )}
                  
                  {expense.references && (
                    <div>
                      <span className="text-sm font-medium text-gray-600">Referencias:</span>
                      <div className="text-sm text-gray-900 mt-1 space-y-1">
                        {expense.references.contractId && (
                          <div>Contrato: {expense.references.contractId}</div>
                        )}
                        {expense.references.operationId && (
                          <div>Operación: {expense.references.operationId}</div>
                        )}
                        {expense.references.propertyId && (
                          <div>Propiedad: {expense.references.propertyId}</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Metadatos */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-900 mb-2">Metadatos</h3>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm text-gray-600">
                <div>Creado: {formatDateTime(expense.createdAt)}</div>
                <div>Actualizado: {formatDateTime(expense.updatedAt)}</div>
                {expense.createdBy && (
                  <div>Creado por: {expense.createdBy}</div>
                )}
                {expense.updatedBy && (
                  <div>Actualizado por: {expense.updatedBy}</div>
                )}
                {expense.approvedBy && (
                  <div>Aprobado por: {expense.approvedBy}</div>
                )}
                {expense.approvedAt && (
                  <div>Aprobado: {formatDateTime(expense.approvedAt)}</div>
                )}
              </div>
            </div>
          </div>

          {/* Footer con acciones */}
          <div className="border-t border-gray-200 p-6">
            <div className="flex items-center gap-2">
              {canEdit && (
                <button
                  onClick={() => onEdit(expense)}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  <Edit className="h-4 w-4 mr-2 inline" />
                  Editar
                </button>
              )}
              
              {canApprove && (
                <button
                  onClick={() => onApprove(expense)}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  <CheckCircle className="h-4 w-4 mr-2 inline" />
                  Aprobar
                </button>
              )}
              
              {canReject && (
                <button
                  onClick={() => onReject(expense)}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  <XCircle className="h-4 w-4 mr-2 inline" />
                  Rechazar
                </button>
              )}
              
              {canDelete && (
                <button
                  onClick={() => onDelete(expense)}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  <Trash2 className="h-4 w-4 mr-2 inline" />
                  Eliminar
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

