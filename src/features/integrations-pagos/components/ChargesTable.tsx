import React, { useState } from "react";
import { useCharges } from "../hooks";
import { formatMoney, formatDate, getStatusColor, getStatusText, getMethodName, buildCsv, exportToFile } from "../utils";
import { RefundDialog } from "./RefundDialog";
import type { ChargeFilters, Charge } from "../types";

interface ChargesTableProps {
  filters?: ChargeFilters;
}

export function ChargesTable({ filters }: ChargesTableProps) {
  const { charges, pagination, loading, error, refetch, refundCharge, downloadReceipt } = useCharges(filters);
  const [selectedCharge, setSelectedCharge] = useState<Charge | null>(null);
  const [showRefundDialog, setShowRefundDialog] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const handleRefund = async (amount?: number, reason?: string) => {
    if (!selectedCharge) return;
    
    try {
      setActionLoading("refund");
      await refundCharge(selectedCharge.id, { amount, reason });
      setShowRefundDialog(false);
      setSelectedCharge(null);
      refetch();
    } catch (error) {
      console.error("Error refunding charge:", error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDownloadReceipt = async (charge: Charge) => {
    try {
      setActionLoading(charge.id);
      await downloadReceipt(charge.id);
    } catch (error) {
      console.error("Error downloading receipt:", error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleExportCsv = () => {
    const csvData = buildCsv(charges, [
      "id", "createdAt", "customer", "customerEmail", "amount", "currency", 
      "method", "providerId", "status", "ref.invoiceId", "ref.contractId"
    ]);
    
    const filename = `cobros_${new Date().toISOString().split('T')[0]}.csv`;
    exportToFile(csvData, filename);
  };

  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-12 bg-gray-100 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600">Error al cargar cobros: {error}</p>
        <button 
          onClick={refetch}
          className="mt-2 text-red-700 hover:text-red-900 text-sm underline"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white border border-gray-200 rounded-lg">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Cobros</h3>
            <button
              onClick={handleExportCsv}
              className="px-3 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              disabled={charges.length === 0}
            >
              Exportar CSV
            </button>
          </div>
          <div className="mt-2 text-sm text-gray-600">
            {pagination.total} cobros encontrados
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Importe
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Método
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Proveedor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Referencia
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {charges.map((charge) => (
                <tr key={charge.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(charge.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{charge.customer}</div>
                    {charge.customerEmail && (
                      <div className="text-sm text-gray-500">{charge.customerEmail}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {formatMoney(charge.amount, charge.currency)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {getMethodName(charge.method)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                    {charge.providerId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(charge.status)}`}>
                      {getStatusText(charge.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {charge.ref?.invoiceId && (
                      <div className="text-blue-600 hover:text-blue-800 cursor-pointer">
                        {charge.ref.invoiceId}
                      </div>
                    )}
                    {charge.ref?.contractId && (
                      <div className="text-purple-600 hover:text-purple-800 cursor-pointer">
                        {charge.ref.contractId}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleDownloadReceipt(charge)}
                        className="text-blue-600 hover:text-blue-900 disabled:opacity-50"
                        disabled={actionLoading === charge.id}
                        title="Descargar recibo"
                      >
                        {actionLoading === charge.id ? (
                          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"></circle>
                            <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" className="opacity-75"></path>
                          </svg>
                        ) : (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                          </svg>
                        )}
                      </button>

                      {charge.status === "succeeded" && (
                        <button
                          onClick={() => {
                            setSelectedCharge(charge);
                            setShowRefundDialog(true);
                          }}
                          className="text-orange-600 hover:text-orange-900"
                          title="Reembolsar"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                          </svg>
                        </button>
                      )}

                      <button
                        className="text-gray-600 hover:text-gray-900"
                        title="Ver detalles"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Página {pagination.page} de {pagination.pages}
            </div>
            <div className="flex space-x-2">
              <button
                disabled={pagination.page === 1}
                className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
              >
                Anterior
              </button>
              <button
                disabled={pagination.page === pagination.pages}
                className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {charges.length === 0 && (
          <div className="p-12 text-center">
            <div className="w-12 h-12 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <h3 className="text-sm font-medium text-gray-900 mb-2">No hay cobros</h3>
            <p className="text-sm text-gray-500">Los cobros aparecerán aquí una vez que empiecen a llegar.</p>
          </div>
        )}
      </div>

      {/* Refund Dialog */}
      <RefundDialog
        isOpen={showRefundDialog}
        onClose={() => {
          setShowRefundDialog(false);
          setSelectedCharge(null);
        }}
        onRefund={handleRefund}
        charge={selectedCharge}
        loading={actionLoading === "refund"}
      />
    </>
  );
}