import React from "react";
import { useCheckoutLinks } from "../hooks";
import { formatMoney, formatDate, getStatusColor, getStatusText } from "../utils";

export function CheckoutLinksTable() {
  const { links, loading, error, createLink, disableLink } = useCheckoutLinks();

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

  return (
    <div className="bg-white border border-gray-200 rounded-lg">
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">Links de Cobro</h3>
          <button className="px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">
            Crear Link
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Concepto</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Importe</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Visitas/Conversión</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Caduca</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {links.map((link) => (
              <tr key={link.id}>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                  {link.concept}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {formatMoney(link.amount, link.currency)}
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(link.status)}`}>
                    {getStatusText(link.status)}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {link.visits} visitas / {link.conversions} conversiones
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {link.expireAt ? formatDate(link.expireAt) : "Sin caducidad"}
                </td>
                <td className="px-6 py-4 text-sm">
                  <button
                    onClick={() => navigator.clipboard.writeText(link.url)}
                    className="text-blue-600 hover:text-blue-900 mr-3"
                    title="Copiar URL"
                  >
                    Copiar
                  </button>
                  {link.status === "active" && (
                    <button
                      onClick={() => disableLink(link.id)}
                      className="text-red-600 hover:text-red-900"
                      title="Desactivar"
                    >
                      Desactivar
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {links.length === 0 && (
        <div className="p-12 text-center">
          <p className="text-gray-500">No hay links de cobro creados</p>
        </div>
      )}
    </div>
  );
}