import React from 'react';
import type { Contract } from './types';

interface ContractsTableProps {
  contracts: Contract[];
  selectedIds: Set<string>;
  onSelectToggle: (id: string) => void;
  onSelectAll: () => void;
  onEdit: (contract: Contract) => void;
  onDelete: (id: string) => void;
  onGenerate: (id: string) => void;
  onSign: (id: string) => void;
  onViewDetails: (contract: Contract) => void;
}

export default function ContractsTable({
  contracts,
  selectedIds,
  onSelectToggle,
  onSelectAll,
  onEdit,
  onDelete,
  onGenerate,
  onSign,
  onViewDetails
}: ContractsTableProps) {
  const getStatusColor = (estado: Contract['estado']) => {
    switch (estado) {
      case 'borrador': return 'bg-gray-100 text-gray-800';
      case 'generado': return 'bg-blue-100 text-blue-800';
      case 'firmado': return 'bg-green-100 text-green-800';
      case 'anulado': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTipoIcon = (tipo: Contract['tipo']) => {
    switch (tipo) {
      case 'compraventa': return '🏠';
      case 'alquiler': return '🔑';
      case 'exclusiva': return '⭐';
      default: return '📄';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(amount);
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full bg-white border border-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left">
              <input
                type="checkbox"
                checked={selectedIds.size === contracts.length && contracts.length > 0}
                onChange={onSelectAll}
                className="rounded border-gray-300"
              />
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Fecha</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Tipo</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Propiedad</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Cliente</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Estado</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Versión</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Honorarios</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {contracts.map((contract) => (
            <tr key={contract.id} className="hover:bg-gray-50">
              <td className="px-4 py-3">
                <input
                  type="checkbox"
                  checked={selectedIds.has(contract.id)}
                  onChange={() => onSelectToggle(contract.id)}
                  className="rounded border-gray-300"
                />
              </td>
              <td className="px-4 py-3 text-sm text-gray-600">
                <div>{new Date(contract.createdAt).toLocaleDateString()}</div>
                {contract.signedAt && (
                  <div className="text-xs text-green-600">
                    Firmado: {new Date(contract.signedAt).toLocaleDateString()}
                  </div>
                )}
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center">
                  <span className="text-xl mr-2" title={contract.tipo}>
                    {getTipoIcon(contract.tipo)}
                  </span>
                  <span className="text-sm font-medium capitalize">{contract.tipo}</span>
                </div>
              </td>
              <td className="px-4 py-3">
                <div>
                  <div className="font-medium text-gray-900">{contract.propertyTitle}</div>
                  <div className="text-sm text-gray-500">{contract.propertyAddress}</div>
                </div>
              </td>
              <td className="px-4 py-3">
                <div>
                  <div className="font-medium text-gray-900">{contract.clienteNombre}</div>
                  {contract.clienteEmail && (
                    <div className="text-sm text-gray-500">{contract.clienteEmail}</div>
                  )}
                </div>
              </td>
              <td className="px-4 py-3">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(contract.estado)}`}>
                  {contract.estado}
                </span>
              </td>
              <td className="px-4 py-3 text-sm text-gray-600">
                v{contract.version}
              </td>
              <td className="px-4 py-3 text-sm font-medium text-gray-900">
                {formatCurrency(contract.honorarios)}
              </td>
              <td className="px-4 py-3">
                <div className="flex gap-1">
                  <button
                    onClick={() => onViewDetails(contract)}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                    title="Ver detalles"
                  >
                    Ver
                  </button>
                  
                  {contract.estado === 'borrador' && (
                    <button
                      onClick={() => onGenerate(contract.id)}
                      className="text-green-600 hover:text-green-800 text-sm"
                      title="Generar contrato"
                    >
                      Generar
                    </button>
                  )}
                  
                  {contract.estado === 'generado' && (
                    <button
                      onClick={() => onSign(contract.id)}
                      className="text-purple-600 hover:text-purple-800 text-sm"
                      title="Firmar contrato"
                    >
                      Firmar
                    </button>
                  )}
                  
                  <button
                    onClick={() => onEdit(contract)}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                    title="Editar contrato"
                  >
                    Editar
                  </button>
                  
                  <button
                    onClick={() => onDelete(contract.id)}
                    className="text-red-600 hover:text-red-800 text-sm"
                    title="Eliminar contrato"
                  >
                    Eliminar
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {contracts.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No se encontraron contratos
        </div>
      )}
    </div>
  );
}