import React from 'react';
import { Lead } from '../apis';

interface LeadTableProps {
  leads: Lead[];
  selectedIds: Set<string>;
  onSelectToggle: (id: string) => void;
  onSelectAll: () => void;
  onEdit: (lead: Lead) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, estado: Lead['estado']) => void;
}

export default function LeadTable({
  leads,
  selectedIds,
  onSelectToggle,
  onSelectAll,
  onEdit,
  onDelete,
  onStatusChange
}: LeadTableProps) {
  const getStatusColor = (estado: Lead['estado']) => {
    switch (estado) {
      case 'nuevo': return 'bg-blue-100 text-blue-800';
      case 'contactado': return 'bg-yellow-100 text-yellow-800';
      case 'calificado': return 'bg-green-100 text-green-800';
      case 'perdido': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCanalIcon = (canal: Lead['canal']) => {
    switch (canal) {
      case 'web': return '🌐';
      case 'portal': return '🏢';
      case 'whatsapp': return '💬';
      case 'referido': return '👥';
      default: return '📧';
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
                checked={selectedIds.size === leads.length && leads.length > 0}
                onChange={onSelectAll}
                className="rounded border-gray-300"
              />
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Nombre</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Canal</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Estado</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Agente</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Score</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Creado</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {leads.map((lead) => (
            <tr key={lead.id} className="hover:bg-gray-50">
              <td className="px-4 py-3">
                <input
                  type="checkbox"
                  checked={selectedIds.has(lead.id)}
                  onChange={() => onSelectToggle(lead.id)}
                  className="rounded border-gray-300"
                />
              </td>
              <td className="px-4 py-3">
                <div>
                  <div className="font-medium text-gray-900">{lead.nombre}</div>
                  <div className="text-sm text-gray-500">{lead.email}</div>
                  <div className="text-sm text-gray-500">{lead.telefono}</div>
                </div>
              </td>
              <td className="px-4 py-3">
                <span className="text-xl" title={lead.canal}>
                  {getCanalIcon(lead.canal)}
                </span>
              </td>
              <td className="px-4 py-3">
                <select
                  value={lead.estado}
                  onChange={(e) => onStatusChange(lead.id, e.target.value as Lead['estado'])}
                  className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(lead.estado)} border-0 cursor-pointer`}
                >
                  <option value="nuevo">Nuevo</option>
                  <option value="contactado">Contactado</option>
                  <option value="calificado">Calificado</option>
                  <option value="perdido">Perdido</option>
                </select>
              </td>
              <td className="px-4 py-3 text-sm text-gray-600">
                {lead.agente || '-'}
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center">
                  <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${lead.score || 0}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-600">{lead.score || 0}</span>
                </div>
              </td>
              <td className="px-4 py-3 text-sm text-gray-600">
                {new Date(lead.createdAt).toLocaleDateString()}
              </td>
              <td className="px-4 py-3">
                <div className="flex gap-2">
                  <button
                    onClick={() => onEdit(lead)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => onDelete(lead.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Eliminar
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {leads.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No se encontraron leads
        </div>
      )}
    </div>
  );
}