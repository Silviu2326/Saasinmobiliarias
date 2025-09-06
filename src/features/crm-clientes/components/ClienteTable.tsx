import React from 'react';
import { Cliente } from '../apis';

interface ClienteTableProps {
  clientes: Cliente[];
  onEdit: (cliente: Cliente) => void;
  onDelete: (id: string) => void;
  onViewMatches: (cliente: Cliente) => void;
}

export default function ClienteTable({
  clientes,
  onEdit,
  onDelete,
  onViewMatches
}: ClienteTableProps) {
  const getTipoColor = (tipo: Cliente['tipo']) => {
    return tipo === 'comprador' 
      ? 'bg-green-100 text-green-800' 
      : 'bg-blue-100 text-blue-800';
  };

  const getEstadoColor = (estado: Cliente['estadoRelacion']) => {
    switch (estado) {
      case 'activo': return 'bg-green-100 text-green-800';
      case 'en_pausa': return 'bg-yellow-100 text-yellow-800';
      case 'ganado': return 'bg-blue-100 text-blue-800';
      case 'perdido': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatPresupuesto = (min?: number, max?: number) => {
    if (!min && !max) return '-';
    const formatNum = (n: number) => new Intl.NumberFormat('es-ES').format(n);
    if (!min) return `hasta ${formatNum(max!)}€`;
    if (!max) return `desde ${formatNum(min)}€`;
    return `${formatNum(min)} - ${formatNum(max)}€`;
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full bg-white border border-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Nombre</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Tipo</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Presupuesto</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Zonas</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Agente</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Estado</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Actualizado</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {clientes.map((cliente) => (
            <tr key={cliente.id} className="hover:bg-gray-50">
              <td className="px-4 py-3">
                <div>
                  <div className="font-medium text-gray-900">{cliente.nombre}</div>
                  <div className="text-sm text-gray-500">{cliente.email}</div>
                  <div className="text-sm text-gray-500">{cliente.telefono}</div>
                </div>
              </td>
              <td className="px-4 py-3">
                <span className={`px-2 py-1 inline-flex text-xs font-medium rounded-full ${getTipoColor(cliente.tipo)}`}>
                  {cliente.tipo}
                </span>
              </td>
              <td className="px-4 py-3 text-sm text-gray-600">
                {formatPresupuesto(cliente.presupuestoMin, cliente.presupuestoMax)}
              </td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap gap-1">
                  {cliente.zonasInteres.slice(0, 2).map((zona) => (
                    <span key={zona} className="text-xs bg-gray-100 px-2 py-1 rounded">
                      {zona}
                    </span>
                  ))}
                  {cliente.zonasInteres.length > 2 && (
                    <span className="text-xs text-gray-500">
                      +{cliente.zonasInteres.length - 2}
                    </span>
                  )}
                </div>
              </td>
              <td className="px-4 py-3 text-sm text-gray-600">
                {cliente.agente || '-'}
              </td>
              <td className="px-4 py-3">
                <span className={`px-2 py-1 inline-flex text-xs font-medium rounded-full ${getEstadoColor(cliente.estadoRelacion)}`}>
                  {cliente.estadoRelacion.replace('_', ' ')}
                </span>
              </td>
              <td className="px-4 py-3 text-sm text-gray-600">
                {new Date(cliente.updatedAt).toLocaleDateString()}
              </td>
              <td className="px-4 py-3">
                <div className="flex gap-2">
                  <button
                    onClick={() => onViewMatches(cliente)}
                    className="text-purple-600 hover:text-purple-800 text-sm"
                  >
                    Matches
                  </button>
                  <button
                    onClick={() => onEdit(cliente)}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => onDelete(cliente.id)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Eliminar
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {clientes.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No se encontraron clientes
        </div>
      )}
    </div>
  );
}