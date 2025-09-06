import React from "react";
import { usePaymentMethods } from "../hooks";
import { getMethodName, formatMoney, formatPercent } from "../utils";

export function PaymentMethodsTable() {
  const { methods, loading, error, updateMethod } = usePaymentMethods();

  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-12 bg-gray-100 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Métodos de Pago</h3>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Método</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">3DS</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Límites</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Coste</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {methods.map((method) => (
              <tr key={method.id}>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                  {getMethodName(method.name)}
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                    method.enabled ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                  }`}>
                    {method.enabled ? "Activo" : "Inactivo"}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {method.requires3ds ? "Requerido" : "Opcional"}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {method.minAmount ? formatMoney(method.minAmount) : "Sin mín"} - {method.maxAmount ? formatMoney(method.maxAmount) : "Sin máx"}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {method.feePct && formatPercent(method.feePct)} + {method.feeFixed ? formatMoney(method.feeFixed) : "€0"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}