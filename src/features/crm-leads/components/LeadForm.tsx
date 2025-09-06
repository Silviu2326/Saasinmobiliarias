import React, { useState } from 'react';
import { Lead } from '../apis';

interface LeadFormProps {
  lead?: Lead;
  onSubmit: (data: Partial<Lead>) => void;
  onCancel: () => void;
}

export default function LeadForm({ lead, onSubmit, onCancel }: LeadFormProps) {
  const [formData, setFormData] = useState<Partial<Lead>>({
    nombre: lead?.nombre || '',
    email: lead?.email || '',
    telefono: lead?.telefono || '',
    canal: lead?.canal || 'web',
    origen: lead?.origen || '',
    estado: lead?.estado || 'nuevo',
    interes: lead?.interes || 'compra',
    presupuestoMin: lead?.presupuestoMin || undefined,
    presupuestoMax: lead?.presupuestoMax || undefined,
    zonasInteres: lead?.zonasInteres || [],
    notas: lead?.notas || '',
    agente: lead?.agente || ''
  });

  const [newZona, setNewZona] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const addZona = () => {
    if (newZona.trim() && !formData.zonasInteres?.includes(newZona)) {
      setFormData({
        ...formData,
        zonasInteres: [...(formData.zonasInteres || []), newZona.trim()]
      });
      setNewZona('');
    }
  };

  const removeZona = (zona: string) => {
    setFormData({
      ...formData,
      zonasInteres: formData.zonasInteres?.filter(z => z !== zona) || []
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nombre *
          </label>
          <input
            type="text"
            required
            value={formData.nombre}
            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email *
          </label>
          <input
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Teléfono *
          </label>
          <input
            type="tel"
            required
            value={formData.telefono}
            onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Canal
          </label>
          <select
            value={formData.canal}
            onChange={(e) => setFormData({ ...formData, canal: e.target.value as Lead['canal'] })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="web">Web</option>
            <option value="portal">Portal</option>
            <option value="whatsapp">WhatsApp</option>
            <option value="referido">Referido</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Estado
          </label>
          <select
            value={formData.estado}
            onChange={(e) => setFormData({ ...formData, estado: e.target.value as Lead['estado'] })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="nuevo">Nuevo</option>
            <option value="contactado">Contactado</option>
            <option value="calificado">Calificado</option>
            <option value="perdido">Perdido</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Interés
          </label>
          <select
            value={formData.interes}
            onChange={(e) => setFormData({ ...formData, interes: e.target.value as Lead['interes'] })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="compra">Compra</option>
            <option value="alquiler">Alquiler</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Presupuesto Mín
          </label>
          <input
            type="number"
            value={formData.presupuestoMin || ''}
            onChange={(e) => setFormData({ ...formData, presupuestoMin: e.target.value ? Number(e.target.value) : undefined })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Presupuesto Máx
          </label>
          <input
            type="number"
            value={formData.presupuestoMax || ''}
            onChange={(e) => setFormData({ ...formData, presupuestoMax: e.target.value ? Number(e.target.value) : undefined })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Origen/Campaña
          </label>
          <input
            type="text"
            value={formData.origen || ''}
            onChange={(e) => setFormData({ ...formData, origen: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Agente Asignado
          </label>
          <input
            type="text"
            value={formData.agente || ''}
            onChange={(e) => setFormData({ ...formData, agente: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Zonas de Interés
        </label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={newZona}
            onChange={(e) => setNewZona(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addZona())}
            placeholder="Añadir zona..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="button"
            onClick={addZona}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Añadir
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {formData.zonasInteres?.map((zona) => (
            <span
              key={zona}
              className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100"
            >
              {zona}
              <button
                type="button"
                onClick={() => removeZona(zona)}
                className="ml-2 text-gray-500 hover:text-red-500"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Notas
        </label>
        <textarea
          value={formData.notas || ''}
          onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="flex justify-end gap-2 pt-4">
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
          {lead ? 'Actualizar' : 'Crear'} Lead
        </button>
      </div>
    </form>
  );
}