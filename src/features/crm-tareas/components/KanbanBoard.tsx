import React from 'react';
import { Tarea } from '../apis';

interface KanbanBoardProps {
  tareas: Tarea[];
  onStatusChange: (id: string, estado: Tarea['estado']) => void;
  onEdit: (tarea: Tarea) => void;
}

export default function KanbanBoard({ tareas, onStatusChange, onEdit }: KanbanBoardProps) {
  const columns: { estado: Tarea['estado']; titulo: string; color: string }[] = [
    { estado: 'pendiente', titulo: 'Pendientes', color: 'border-blue-300 bg-blue-50' },
    { estado: 'en_progreso', titulo: 'En Progreso', color: 'border-orange-300 bg-orange-50' },
    { estado: 'hecha', titulo: 'Completadas', color: 'border-green-300 bg-green-50' }
  ];

  const getPrioridadColor = (prioridad: Tarea['prioridad']) => {
    switch (prioridad) {
      case 'alta': return 'border-l-red-500';
      case 'media': return 'border-l-yellow-500';
      case 'baja': return 'border-l-gray-500';
      default: return 'border-l-gray-300';
    }
  };

  const isOverdue = (fechaVencimiento: string, estado: Tarea['estado']) => {
    if (estado === 'hecha') return false;
    return new Date(fechaVencimiento) < new Date();
  };

  const handleDragStart = (e: React.DragEvent, tarea: Tarea) => {
    e.dataTransfer.setData('text/plain', tarea.id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, nuevoEstado: Tarea['estado']) => {
    e.preventDefault();
    const tareaId = e.dataTransfer.getData('text/plain');
    onStatusChange(tareaId, nuevoEstado);
  };

  return (
    <div className="grid grid-cols-3 gap-6">
      {columns.map((column) => {
        const tareasColumna = tareas.filter(t => t.estado === column.estado);
        
        return (
          <div
            key={column.estado}
            className={`border-2 border-dashed rounded-lg p-4 min-h-[500px] ${column.color}`}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, column.estado)}
          >
            <h3 className="font-semibold text-gray-900 mb-4 flex justify-between">
              {column.titulo}
              <span className="bg-white px-2 py-1 rounded-full text-sm">
                {tareasColumna.length}
              </span>
            </h3>
            
            <div className="space-y-3">
              {tareasColumna.map((tarea) => (
                <div
                  key={tarea.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, tarea)}
                  className={`bg-white rounded-lg p-3 shadow-sm border-l-4 cursor-move hover:shadow-md transition-shadow ${getPrioridadColor(tarea.prioridad)} ${
                    isOverdue(tarea.fechaVencimiento, tarea.estado) ? 'ring-2 ring-red-200' : ''
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-sm text-gray-900 pr-2">
                      {tarea.titulo}
                    </h4>
                    <div className="flex gap-1">
                      {tarea.prioridad === 'alta' && <span className="text-red-500 text-xs">🔴</span>}
                      {isOverdue(tarea.fechaVencimiento, tarea.estado) && (
                        <span className="text-red-500 text-xs">⏰</span>
                      )}
                    </div>
                  </div>
                  
                  {tarea.descripcion && (
                    <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                      {tarea.descripcion}
                    </p>
                  )}
                  
                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <div>
                      {tarea.asignadoA && (
                        <span className="bg-gray-100 px-2 py-1 rounded">
                          {tarea.asignadoA}
                        </span>
                      )}
                    </div>
                    <div className={`${isOverdue(tarea.fechaVencimiento, tarea.estado) ? 'text-red-600 font-medium' : ''}`}>
                      {new Date(tarea.fechaVencimiento).toLocaleDateString()}
                    </div>
                  </div>
                  
                  {tarea.entidadVinculada && (
                    <div className="mt-2 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                      {tarea.entidadVinculada.tipo}: {tarea.entidadVinculada.nombre || tarea.entidadVinculada.id.substring(0, 8)}
                    </div>
                  )}
                  
                  <button
                    onClick={() => onEdit(tarea)}
                    className="mt-2 text-xs text-blue-600 hover:text-blue-800"
                  >
                    Editar
                  </button>
                </div>
              ))}
              
              {tareasColumna.length === 0 && (
                <div className="text-center text-gray-400 py-8 text-sm">
                  Arrastra tareas aquí
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}