import React, { useState } from 'react';
import { Tarea } from '../apis';

interface TareaFormProps {
  tarea?: Tarea;
  onSubmit: (data: Partial<Tarea>) => void;
  onCancel: () => void;
}

export default function TareaForm({ tarea, onSubmit, onCancel }: TareaFormProps) {
  const [formData, setFormData] = useState<Partial<Tarea>>({
    titulo: tarea?.titulo || '',
    descripcion: tarea?.descripcion || '',
    asignadoA: tarea?.asignadoA || '',
    prioridad: tarea?.prioridad || 'media',
    estado: tarea?.estado || 'pendiente',
    fechaVencimiento: tarea?.fechaVencimiento 
      ? new Date(tarea.fechaVencimiento).toISOString().split('T')[0]
      : new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    recordatorioAt: tarea?.recordatorioAt
      ? new Date(tarea.recordatorioAt).toISOString().slice(0, 16)
      : ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const dataToSubmit = {
      ...formData,
      fechaVencimiento: formData.fechaVencimiento 
        ? new Date(formData.fechaVencimiento).toISOString()
        : undefined,
      recordatorioAt: formData.recordatorioAt
        ? new Date(formData.recordatorioAt).toISOString()
        : undefined
    };
    onSubmit(dataToSubmit);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Título *
        </label>
        <input
          type="text"
          required
          value={formData.titulo}
          onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Ej: Llamar a cliente..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Descripción
        </label>
        <textarea
          value={formData.descripcion || ''}
          onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Detalles adicionales de la tarea..."
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Asignado a
          </label>
          <input
            type="text"
            value={formData.asignadoA || ''}
            onChange={(e) => setFormData({ ...formData, asignadoA: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Nombre del responsable..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Prioridad
          </label>
          <select
            value={formData.prioridad}
            onChange={(e) => setFormData({ ...formData, prioridad: e.target.value as Tarea['prioridad'] })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="baja">Baja</option>
            <option value="media">Media</option>
            <option value="alta">Alta</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Estado
          </label>
          <select
            value={formData.estado}
            onChange={(e) => setFormData({ ...formData, estado: e.target.value as Tarea['estado'] })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="pendiente">Pendiente</option>
            <option value="en_progreso">En Progreso</option>
            <option value="hecha">Hecha</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Fecha de Vencimiento *
          </label>
          <input
            type="date"
            required
            value={formData.fechaVencimiento?.split('T')[0] || ''}
            onChange={(e) => setFormData({ ...formData, fechaVencimiento: e.target.value })}
            min={new Date().toISOString().split('T')[0]}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Recordatorio (opcional)
          </label>
          <input
            type="datetime-local"
            value={formData.recordatorioAt || ''}
            onChange={(e) => setFormData({ ...formData, recordatorioAt: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4 border-t">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          {tarea ? 'Actualizar' : 'Crear'} Tarea
        </button>
      </div>
    </form>
  );
}