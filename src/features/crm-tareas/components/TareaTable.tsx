import React from 'react';
import { Tarea } from '../apis';

interface TareaTableProps {
  tareas: Tarea[];
  selectedIds: Set<string>;
  onSelectToggle: (id: string) => void;
  onSelectAll: () => void;
  onEdit: (tarea: Tarea) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, estado: Tarea['estado']) => void;
}

export default function TareaTable({
  tareas,
  selectedIds,
  onSelectToggle,
  onSelectAll,
  onEdit,
  onDelete,
  onStatusChange
}: TareaTableProps) {
  const getPrioridadColor = (prioridad: Tarea['prioridad']) => {
    switch (prioridad) {
      case 'alta': return 'bg-red-100 text-red-800';
      case 'media': return 'bg-yellow-100 text-yellow-800';
      case 'baja': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getEstadoColor = (estado: Tarea['estado']) => {
    switch (estado) {
      case 'pendiente': return 'bg-blue-100 text-blue-800';
      case 'en_progreso': return 'bg-orange-100 text-orange-800';
      case 'hecha': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getVencimientoStatus = (fechaVencimiento: string, estado: Tarea['estado']) => {
    if (estado === 'hecha') return null;
    
    const vencimiento = new Date(fechaVencimiento);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    if (vencimiento < hoy) {
      return { texto: 'Atrasada', clase: 'text-red-600 font-medium' };
    } else if (vencimiento.toDateString() === hoy.toDateString()) {
      return { texto: 'Hoy', clase: 'text-orange-600 font-medium' };
    } else {
      const diasRestantes = Math.ceil((vencimiento.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
      if (diasRestantes <= 7) {
        return { texto: `${diasRestantes}d`, clase: 'text-yellow-600' };
      }
    }
    
    return null;
  };

  const getPrioridadIcon = (prioridad: Tarea['prioridad']) => {
    switch (prioridad) {
      case 'alta': return '🔴';
      case 'media': return '🟡';
      case 'baja': return '⚫';
      default: return '⚫';
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
                checked={selectedIds.size === tareas.length && tareas.length > 0}
                onChange={onSelectAll}
                className="rounded border-gray-300"
              />
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Título</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Prioridad</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Estado</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Asignado</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Vencimiento</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Entidad</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {tareas.map((tarea) => {
            const vencimientoStatus = getVencimientoStatus(tarea.fechaVencimiento, tarea.estado);
            
            return (
              <tr key={tarea.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(tarea.id)}
                    onChange={() => onSelectToggle(tarea.id)}
                    className="rounded border-gray-300"
                  />
                </td>
                <td className="px-4 py-3">
                  <div>
                    <div className="font-medium text-gray-900">{tarea.titulo}</div>
                    {tarea.descripcion && (
                      <div className="text-sm text-gray-500 truncate max-w-xs">
                        {tarea.descripcion}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{getPrioridadIcon(tarea.prioridad)}</span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPrioridadColor(tarea.prioridad)}`}>
                      {tarea.prioridad}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <select
                    value={tarea.estado}
                    onChange={(e) => onStatusChange(tarea.id, e.target.value as Tarea['estado'])}
                    className={`px-2 py-1 text-xs font-medium rounded-full border-0 cursor-pointer ${getEstadoColor(tarea.estado)}`}
                  >
                    <option value="pendiente">Pendiente</option>
                    <option value="en_progreso">En Progreso</option>
                    <option value="hecha">Hecha</option>
                  </select>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {tarea.asignadoA || '-'}
                </td>
                <td className="px-4 py-3">
                  <div className="text-sm">
                    <div className="text-gray-600">
                      {new Date(tarea.fechaVencimiento).toLocaleDateString()}
                    </div>
                    {vencimientoStatus && (
                      <div className={`text-xs ${vencimientoStatus.clase}`}>
                        {vencimientoStatus.texto}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {tarea.entidadVinculada ? (
                    <div>
                      <div className="font-medium">{tarea.entidadVinculada.tipo}</div>
                      <div className="text-xs text-gray-500">
                        {tarea.entidadVinculada.nombre || tarea.entidadVinculada.id}
                      </div>
                    </div>
                  ) : '-'}
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => onEdit(tarea)}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => onDelete(tarea.id)}
                      className="text-red-600 hover:text-red-800 text-sm"
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
      {tareas.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No se encontraron tareas
        </div>
      )}
    </div>
  );
}