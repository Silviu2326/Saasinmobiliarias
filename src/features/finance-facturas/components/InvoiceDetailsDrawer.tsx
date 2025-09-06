import React, { useState } from 'react';
import { X, FileText, CreditCard, Send, Edit } from 'lucide-react';
import type { Invoice } from '../types';
import { formatCurrency, formatDate, getStatusColor, canEditInvoice } from '../utils';

interface InvoiceDetailsDrawerProps {
  invoice: Invoice | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (invoice: Invoice) => void;
  onSend: (invoice: Invoice) => void;
  onPayment: (invoice: Invoice) => void;
  onCreditNote: (invoice: Invoice) => void;
  isLoading?: boolean;
}

export default function InvoiceDetailsDrawer({
  invoice,
  isOpen,
  onClose,
  onEdit,
  onSend,
  onPayment,
  onCreditNote,
  isLoading = false
}: InvoiceDetailsDrawerProps) {
  const [activeTab, setActiveTab] = useState<'details' | 'lines' | 'payments' | 'documents'>('details');

  if (!isOpen || !invoice) return null;

  const tabs = [
    { id: 'details', label: 'Resumen', icon: FileText },
    { id: 'lines', label: 'Líneas', icon: FileText },
    { id: 'payments', label: 'Pagos', icon: CreditCard },
    { id: 'documents', label: 'Documentos', icon: FileText }
  ];

  return (
    <div className="fixed inset-0 overflow-hidden z-50">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} />
        
        <section className="absolute inset-y-0 right-0 pl-10 max-w-full flex">
          <div className="w-screen max-w-2xl">
            <div className="h-full flex flex-col bg-white shadow-xl">
              {/* Header */}
              <div className="px-4 py-6 bg-gray-50 sm:px-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-lg font-medium text-gray-900">
                      Factura {invoice.number}
                    </h2>
                    <p className="mt-1 text-sm text-gray-500">
                      {invoice.customer?.name || invoice.supplier?.name} • {formatDate(invoice.date)}
                    </p>
                  </div>
                  <div className="ml-3 h-7 flex items-center">
                    <button
                      onClick={onClose}
                      className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:ring-2 focus:ring-blue-500"
                    >
                      <X className="h-6 w-6" />
                    </button>
                  </div>
                </div>
                
                {/* Status and actions */}
                <div className="mt-4 flex items-center justify-between">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}>
                    {invoice.status}
                  </span>
                  
                  <div className="flex items-center gap-2">
                    {canEditInvoice(invoice) && (
                      <button
                        onClick={() => onEdit(invoice)}
                        className="bg-white border border-gray-300 rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                      >
                        <Edit className="h-4 w-4" />
                        Editar
                      </button>
                    )}
                    
                    <button
                      onClick={() => onSend(invoice)}
                      className="bg-blue-600 border border-transparent rounded-md px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 flex items-center gap-2"
                    >
                      <Send className="h-4 w-4" />
                      Enviar
                    </button>
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="border-b border-gray-200">
                <nav className="flex -mb-px px-4 sm:px-6">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`${
                        activeTab === tab.id
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 mr-8`}
                    >
                      <tab.icon className="h-4 w-4" />
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
                {activeTab === 'details' && (
                  <div className="space-y-6">
                    {/* Información general */}
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Información General</h3>
                      <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Tipo</dt>
                          <dd className="mt-1 text-sm text-gray-900">{invoice.type}</dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Serie</dt>
                          <dd className="mt-1 text-sm text-gray-900">{invoice.series}</dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Fecha</dt>
                          <dd className="mt-1 text-sm text-gray-900">{formatDate(invoice.date)}</dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Vencimiento</dt>
                          <dd className="mt-1 text-sm text-gray-900">
                            {invoice.dueDate ? formatDate(invoice.dueDate) : 'Sin vencimiento'}
                          </dd>
                        </div>
                      </dl>
                    </div>

                    {/* Cliente/Proveedor */}
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">
                        {invoice.type === 'VENTA' ? 'Cliente' : 'Proveedor'}
                      </h3>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="font-medium text-gray-900">
                          {invoice.customer?.name || invoice.supplier?.name}
                        </p>
                        <p className="text-sm text-gray-600">
                          {invoice.customer?.nif || invoice.supplier?.nif}
                        </p>
                        {(invoice.customer?.email || invoice.supplier?.email) && (
                          <p className="text-sm text-gray-600">
                            {invoice.customer?.email || invoice.supplier?.email}
                          </p>
                        )}
                        {(invoice.customer?.address || invoice.supplier?.address) && (
                          <p className="text-sm text-gray-600 mt-2">
                            {invoice.customer?.address || invoice.supplier?.address}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Totales */}
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Importes</h3>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <dl className="space-y-2">
                          <div className="flex justify-between">
                            <dt className="text-sm text-gray-600">Base imponible</dt>
                            <dd className="text-sm font-medium text-gray-900">{formatCurrency(invoice.base)}</dd>
                          </div>
                          <div className="flex justify-between">
                            <dt className="text-sm text-gray-600">IVA</dt>
                            <dd className="text-sm font-medium text-gray-900">{formatCurrency(invoice.ivaTotal)}</dd>
                          </div>
                          {invoice.retTotal > 0 && (
                            <div className="flex justify-between">
                              <dt className="text-sm text-gray-600">Retención IRPF</dt>
                              <dd className="text-sm font-medium text-red-600">-{formatCurrency(invoice.retTotal)}</dd>
                            </div>
                          )}
                          <div className="flex justify-between border-t border-gray-200 pt-2">
                            <dt className="text-base font-medium text-gray-900">Total</dt>
                            <dd className="text-base font-bold text-gray-900">{formatCurrency(invoice.total)}</dd>
                          </div>
                          {invoice.paid > 0 && (
                            <>
                              <div className="flex justify-between">
                                <dt className="text-sm text-gray-600">Pagado</dt>
                                <dd className="text-sm font-medium text-green-600">{formatCurrency(invoice.paid)}</dd>
                              </div>
                              <div className="flex justify-between">
                                <dt className="text-sm font-medium text-gray-700">Pendiente</dt>
                                <dd className={`text-sm font-medium ${invoice.balance > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                                  {formatCurrency(invoice.balance)}
                                </dd>
                              </div>
                            </>
                          )}
                        </dl>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'lines' && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Líneas de Factura</h3>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Concepto</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Cant.</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Precio</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">IVA</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {invoice.lines.map((line) => (
                            <tr key={line.id}>
                              <td className="px-4 py-4 text-sm text-gray-900">
                                <div>
                                  <div className="font-medium">{line.concept}</div>
                                  {line.description && (
                                    <div className="text-gray-500 text-xs">{line.description}</div>
                                  )}
                                </div>
                              </td>
                              <td className="px-4 py-4 text-sm text-gray-900 text-right">{line.qty}</td>
                              <td className="px-4 py-4 text-sm text-gray-900 text-right">{formatCurrency(line.price)}</td>
                              <td className="px-4 py-4 text-sm text-gray-900 text-right">{line.iva}%</td>
                              <td className="px-4 py-4 text-sm font-medium text-gray-900 text-right">{formatCurrency(line.total)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {activeTab === 'payments' && (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium text-gray-900">Pagos</h3>
                      <button
                        onClick={() => onPayment(invoice)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center gap-2"
                      >
                        <CreditCard className="h-4 w-4" />
                        Registrar Pago
                      </button>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Saldo pendiente:</span>
                        <span className={`text-lg font-bold ${invoice.balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                          {formatCurrency(invoice.balance)}
                        </span>
                      </div>
                    </div>
                    {invoice.paid > 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <CreditCard className="h-8 w-8 mx-auto mb-2" />
                        <p>Historial de pagos disponible próximamente</p>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <p>No hay pagos registrados</p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'documents' && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Documentos</h3>
                    <div className="text-center py-8 text-gray-500">
                      <FileText className="h-8 w-8 mx-auto mb-2" />
                      <p>Funcionalidad de documentos disponible próximamente</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer Actions */}
              <div className="flex-shrink-0 px-4 py-4 bg-gray-50 flex justify-end gap-3 sm:px-6">
                <button
                  onClick={() => onPayment(invoice)}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 flex items-center gap-2"
                >
                  <CreditCard className="h-4 w-4" />
                  Pago
                </button>
                <button
                  onClick={() => onCreditNote(invoice)}
                  className="bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-700 flex items-center gap-2"
                >
                  <FileText className="h-4 w-4" />
                  Abono
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}