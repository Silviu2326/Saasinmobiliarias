import React from 'react';
import type { Reserva } from './types';

interface ReservasTableProps {
  reservas: Reserva[];
  selectedIds: Set<string>;
  onSelectToggle: (id: string) => void;
  onSelectAll: () => void;
  onEdit: (reserva: Reserva) => void;
  onDelete: (id: string) => void;
  onSign: (id: string) => void;
  onCancel: (id: string) => void;
  onViewDetails: (reserva: Reserva) => void;
  onGenerateContract?: (reserva: Reserva) => void;
}

export default function ReservasTable({
  reservas,
  selectedIds,
  onSelectToggle,
  onSelectAll,
  onEdit,
  onDelete,
  onSign,
  onCancel,
  onViewDetails,
  onGenerateContract
}: ReservasTableProps) {
  const getStatusColor = (estado: Reserva['estado']) => {
    switch (estado) {
      case 'borrador': return 'bg-gray-100 text-gray-800';
      case 'firmada': return 'bg-green-100 text-green-800';
      case 'cancelada': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTipoIcon = (tipo: Reserva['tipo']) => {
    switch (tipo) {
      case 'senal': return '💰';
      case 'arras': return '🔒';
      default: return '📄';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(amount);
  };

  const getVencimientoStatus = (venceEl: string) => {
    const today = new Date();
    const dueDate = new Date(venceEl);
    const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
    
    if (diffDays < 0) {
      return { color: 'text-red-600', text: `Vencida (${Math.abs(diffDays)} días)` };
    } else if (diffDays <= 7) {
      return { color: 'text-yellow-600', text: `${diffDays} días` };
    } else {
      return { color: 'text-green-600', text: `${diffDays} días` };
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full bg-white border border-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left">
              <input
                type="checkbox"
                checked={selectedIds.size === reservas.length && reservas.length > 0}
                onChange={onSelectAll}
                className="rounded border-gray-300"
              />
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Fecha</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Propiedad</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Cliente</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Tipo</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Importe</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Estado</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Vencimiento</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {reservas.map((reserva) => {
            const vencimientoStatus = getVencimientoStatus(reserva.venceEl);
            
            return (
              <tr key={reserva.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(reserva.id)}
                    onChange={() => onSelectToggle(reserva.id)}
                    className="rounded border-gray-300"
                  />
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  <div>{new Date(reserva.createdAt).toLocaleDateString()}</div>
                  {reserva.signedAt && (
                    <div className="text-xs text-green-600">
                      Firmado: {new Date(reserva.signedAt).toLocaleDateString()}
                    </div>
                  )}
                  {reserva.canceledAt && (
                    <div className="text-xs text-red-600">
                      Cancelado: {new Date(reserva.canceledAt).toLocaleDateString()}
                    </div>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div>
                    <div className="font-medium text-gray-900">{reserva.propertyTitle}</div>
                    <div className="text-sm text-gray-500">{reserva.propertyAddress}</div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div>
                    <div className="font-medium text-gray-900">{reserva.clienteNombre}</div>
                    {reserva.clienteEmail && (
                      <div className="text-sm text-gray-500">{reserva.clienteEmail}</div>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center">
                    <span className="text-xl mr-2" title={reserva.tipo}>
                      {getTipoIcon(reserva.tipo)}
                    </span>
                    <span className="text-sm font-medium capitalize">{reserva.tipo}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">
                  {formatCurrency(reserva.importe)}
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(reserva.estado)}`}>
                    {reserva.estado}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm">
                  <div>{new Date(reserva.venceEl).toLocaleDateString()}</div>
                  <div className={`text-xs ${vencimientoStatus.color}`}>
                    {vencimientoStatus.text}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    <button
                      onClick={() => onViewDetails(reserva)}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                      title="Ver detalles"
                    >
                      Ver
                    </button>
                    
                    {reserva.estado === 'borrador' && (
                      <>
                        <button
                          onClick={() => onSign(reserva.id)}
                          className="text-green-600 hover:text-green-800 text-sm"
                          title="Firmar reserva"
                        >
                          Firmar
                        </button>
                        <button
                          onClick={() => onEdit(reserva)}
                          className="text-blue-600 hover:text-blue-800 text-sm"
                          title="Editar reserva"
                        >
                          Editar
                        </button>
                      </>
                    )}
                    
                    {reserva.estado === 'firmada' && onGenerateContract && (
                      <button
                        onClick={() => onGenerateContract(reserva)}
                        className="text-purple-600 hover:text-purple-800 text-sm"
                        title="Generar contrato"
                      >
                        Contrato
                      </button>
                    )}
                    
                    {reserva.estado !== 'cancelada' && (
                      <button
                        onClick={() => onCancel(reserva.id)}
                        className="text-yellow-600 hover:text-yellow-800 text-sm"
                        title="Cancelar reserva"
                      >
                        Cancelar
                      </button>
                    )}
                    
                    <button
                      onClick={() => onDelete(reserva.id)}
                      className="text-red-600 hover:text-red-800 text-sm"
                      title="Eliminar reserva"
                    >
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {reservas.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No se encontraron reservas
        </div>
      )}
    </div>
  );
}