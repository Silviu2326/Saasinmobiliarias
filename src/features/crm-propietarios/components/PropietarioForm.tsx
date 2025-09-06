import React, { useState } from 'react';
import { Propietario } from '../apis';

interface PropietarioFormProps {
  propietario?: Propietario;
  onSubmit: (data: Partial<Propietario>) => void;
  onCancel: () => void;
}

export default function PropietarioForm({ propietario, onSubmit, onCancel }: PropietarioFormProps) {
  const [formData, setFormData] = useState<Partial<Propietario>>({
    nombre: propietario?.nombre || '',
    email: propietario?.email || '',
    telefono: propietario?.telefono || '',
    tieneExclusiva: propietario?.tieneExclusiva || false,
    fechaFinExclusiva: propietario?.fechaFinExclusiva || '',
    honorarios: propietario?.honorarios || undefined,
    tipoHonorarios: propietario?.tipoHonorarios || 'porcentaje',
    preferenciaPrecio: propietario?.preferenciaPrecio || '',
    agente: propietario?.agente || '',
    ndaFirmado: propietario?.ndaFirmado || false,
    consentimientoRGPD: propietario?.consentimientoRGPD || false,
    interesDeVenta: propietario?.interesDeVenta || 'medio'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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

      <div className="border-t pt-4">
        <h3 className="text-lg font-medium mb-3">Exclusiva y Condiciones</h3>
        
        <div className="space-y-3">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.tieneExclusiva}
              onChange={(e) => setFormData({ ...formData, tieneExclusiva: e.target.checked })}
              className="mr-2 rounded border-gray-300"
            />
            <span className="text-sm">Tiene exclusiva</span>
          </label>

          {formData.tieneExclusiva && (
            <div className="ml-6 grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha Fin Exclusiva
                </label>
                <input
                  type="date"
                  value={formData.fechaFinExclusiva || ''}
                  onChange={(e) => setFormData({ ...formData, fechaFinExclusiva: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Honorarios
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.honorarios || ''}
                onChange={(e) => setFormData({ ...formData, honorarios: e.target.value ? Number(e.target.value) : undefined })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo Honorarios
              </label>
              <select
                value={formData.tipoHonorarios}
                onChange={(e) => setFormData({ ...formData, tipoHonorarios: e.target.value as 'porcentaje' | 'fijo' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="porcentaje">Porcentaje (%)</option>
                <option value="fijo">Fijo (€)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Interés de Venta
              </label>
              <select
                value={formData.interesDeVenta}
                onChange={(e) => setFormData({ ...formData, interesDeVenta: e.target.value as Propietario['interesDeVenta'] })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="alto">Alto</option>
                <option value="medio">Medio</option>
                <option value="bajo">Bajo</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Preferencia de Precio
            </label>
            <textarea
              value={formData.preferenciaPrecio || ''}
              onChange={(e) => setFormData({ ...formData, preferenciaPrecio: e.target.value })}
              rows={2}
              placeholder="Ej: Dispuesto a bajar un 5% si es venta rápida..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      <div className="border-t pt-4">
        <h3 className="text-lg font-medium mb-3">Documentación y Consentimientos</h3>
        
        <div className="space-y-3">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.ndaFirmado}
              onChange={(e) => setFormData({ ...formData, ndaFirmado: e.target.checked })}
              className="mr-2 rounded border-gray-300"
            />
            <span className="text-sm">NDA Firmado</span>
          </label>

          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.consentimientoRGPD}
              onChange={(e) => setFormData({ ...formData, consentimientoRGPD: e.target.checked })}
              className="mr-2 rounded border-gray-300"
            />
            <span className="text-sm">Consentimiento RGPD</span>
          </label>

          {!formData.consentimientoRGPD && (
            <div className="bg-yellow-50 p-3 rounded-md">
              <p className="text-sm text-yellow-800">
                ⚠️ Es necesario obtener el consentimiento RGPD antes de procesar datos personales
              </p>
            </div>
          )}
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
          {propietario ? 'Actualizar' : 'Crear'} Propietario
        </button>
      </div>
    </form>
  );
}