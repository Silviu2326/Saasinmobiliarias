import React, { useState } from 'react';
import { Cliente } from '../apis';

interface ClienteFormProps {
  cliente?: Cliente;
  onSubmit: (data: Partial<Cliente>) => void;
  onCancel: () => void;
}

export default function ClienteForm({ cliente, onSubmit, onCancel }: ClienteFormProps) {
  const [formData, setFormData] = useState<Partial<Cliente>>({
    nombre: cliente?.nombre || '',
    email: cliente?.email || '',
    telefono: cliente?.telefono || '',
    tipo: cliente?.tipo || 'comprador',
    presupuestoMin: cliente?.presupuestoMin || undefined,
    presupuestoMax: cliente?.presupuestoMax || undefined,
    zonasInteres: cliente?.zonasInteres || [],
    tipologias: cliente?.tipologias || [],
    requisitos: cliente?.requisitos || {},
    preferenciaEstado: cliente?.preferenciaEstado || 'indiferente',
    agente: cliente?.agente || '',
    etiquetas: cliente?.etiquetas || [],
    estadoRelacion: cliente?.estadoRelacion || 'activo'
  });

  const [newZona, setNewZona] = useState('');
  const [newEtiqueta, setNewEtiqueta] = useState('');

  const tipologiasDisponibles = [
    'piso', 'atico', 'duplex', 'casa', 'chalet', 
    'estudio', 'loft', 'planta_baja', 'local'
  ];

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

  const addEtiqueta = () => {
    if (newEtiqueta.trim() && !formData.etiquetas?.includes(newEtiqueta)) {
      setFormData({
        ...formData,
        etiquetas: [...(formData.etiquetas || []), newEtiqueta.trim()]
      });
      setNewEtiqueta('');
    }
  };

  const removeEtiqueta = (etiqueta: string) => {
    setFormData({
      ...formData,
      etiquetas: formData.etiquetas?.filter(e => e !== etiqueta) || []
    });
  };

  const toggleTipologia = (tipologia: string) => {
    const tipologias = formData.tipologias || [];
    if (tipologias.includes(tipologia)) {
      setFormData({
        ...formData,
        tipologias: tipologias.filter(t => t !== tipologia)
      });
    } else {
      setFormData({
        ...formData,
        tipologias: [...tipologias, tipologia]
      });
    }
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
            Tipo de Cliente
          </label>
          <select
            value={formData.tipo}
            onChange={(e) => setFormData({ ...formData, tipo: e.target.value as Cliente['tipo'] })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="comprador">Comprador</option>
            <option value="inquilino">Inquilino</option>
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
            Preferencia Estado
          </label>
          <select
            value={formData.preferenciaEstado}
            onChange={(e) => setFormData({ ...formData, preferenciaEstado: e.target.value as Cliente['preferenciaEstado'] })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="reformar">A reformar</option>
            <option value="entrar_vivir">Entrar a vivir</option>
            <option value="indiferente">Indiferente</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Estado Relación
          </label>
          <select
            value={formData.estadoRelacion}
            onChange={(e) => setFormData({ ...formData, estadoRelacion: e.target.value as Cliente['estadoRelacion'] })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="activo">Activo</option>
            <option value="en_pausa">En pausa</option>
            <option value="ganado">Ganado</option>
            <option value="perdido">Perdido</option>
          </select>
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
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tipologías de interés
        </label>
        <div className="grid grid-cols-3 gap-2">
          {tipologiasDisponibles.map(tipo => (
            <label key={tipo} className="flex items-center">
              <input
                type="checkbox"
                checked={formData.tipologias?.includes(tipo) || false}
                onChange={() => toggleTipologia(tipo)}
                className="mr-2 rounded border-gray-300"
              />
              <span className="text-sm capitalize">{tipo.replace('_', ' ')}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            m² Mínimos
          </label>
          <input
            type="number"
            value={formData.requisitos?.m2Min || ''}
            onChange={(e) => setFormData({
              ...formData,
              requisitos: { ...formData.requisitos, m2Min: e.target.value ? Number(e.target.value) : undefined }
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Habitaciones Mín
          </label>
          <input
            type="number"
            value={formData.requisitos?.habitaciones || ''}
            onChange={(e) => setFormData({
              ...formData,
              requisitos: { ...formData.requisitos, habitaciones: e.target.value ? Number(e.target.value) : undefined }
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Baños Mín
          </label>
          <input
            type="number"
            value={formData.requisitos?.banos || ''}
            onChange={(e) => setFormData({
              ...formData,
              requisitos: { ...formData.requisitos, banos: e.target.value ? Number(e.target.value) : undefined }
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Requisitos adicionales
        </label>
        <div className="grid grid-cols-2 gap-2">
          {['garaje', 'ascensor', 'terraza', 'piscina'].map(req => (
            <label key={req} className="flex items-center">
              <input
                type="checkbox"
                checked={formData.requisitos?.[req as keyof typeof formData.requisitos] as boolean || false}
                onChange={(e) => setFormData({
                  ...formData,
                  requisitos: { ...formData.requisitos, [req]: e.target.checked }
                })}
                className="mr-2 rounded border-gray-300"
              />
              <span className="text-sm capitalize">{req}</span>
            </label>
          ))}
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
              className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100"
            >
              {zona}
              <button
                type="button"
                onClick={() => removeZona(zona)}
                className="ml-2 text-blue-600 hover:text-red-500"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Etiquetas
        </label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={newEtiqueta}
            onChange={(e) => setNewEtiqueta(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addEtiqueta())}
            placeholder="Añadir etiqueta..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="button"
            onClick={addEtiqueta}
            className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
          >
            Añadir
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {formData.etiquetas?.map((etiqueta) => (
            <span
              key={etiqueta}
              className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100"
            >
              {etiqueta}
              <button
                type="button"
                onClick={() => removeEtiqueta(etiqueta)}
                className="ml-2 text-green-600 hover:text-red-500"
              >
                ×
              </button>
            </span>
          ))}
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
          {cliente ? 'Actualizar' : 'Crear'} Cliente
        </button>
      </div>
    </form>
  );
}