import React, { useState } from 'react';
import { InmuebleCartera } from '../apis';

interface InmuebleFormProps {
  inmueble?: InmuebleCartera;
  onSubmit: (data: Partial<InmuebleCartera>) => void;
  onCancel: () => void;
}

export default function InmuebleForm({ inmueble, onSubmit, onCancel }: InmuebleFormProps) {
  const [formData, setFormData] = useState<Partial<InmuebleCartera>>({
    referencia: inmueble?.referencia || '',
    titulo: inmueble?.titulo || '',
    direccion: inmueble?.direccion || '',
    zona: inmueble?.zona || '',
    tipologia: inmueble?.tipologia || 'piso',
    operacion: inmueble?.operacion || 'venta',
    precio: inmueble?.precio || 0,
    m2: inmueble?.m2 || 0,
    habitaciones: inmueble?.habitaciones || 0,
    banos: inmueble?.banos || 0,
    planta: inmueble?.planta || undefined,
    estado: inmueble?.estado || 'activo',
    exclusiva: inmueble?.exclusiva || false,
    fechaFinExclusiva: inmueble?.fechaFinExclusiva || '',
    propietarioNombre: inmueble?.propietarioNombre || '',
    propietarioTelefono: inmueble?.propietarioTelefono || '',
    propietarioEmail: inmueble?.propietarioEmail || '',
    agenteCaptacion: inmueble?.agenteCaptacion || '',
    agenteComercial: inmueble?.agenteComercial || '',
    equipo: inmueble?.equipo || '',
    caracteristicas: inmueble?.caracteristicas || {},
    publicado: inmueble?.publicado || false,
    destacado: inmueble?.destacado || false,
    notas: inmueble?.notas || '',
    notasInternas: inmueble?.notasInternas || ''
  });

  const [activeTab, setActiveTab] = useState<'basico' | 'propietario' | 'comercial' | 'marketing'>('basico');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const toggleCaracteristica = (caracteristica: string) => {
    setFormData({
      ...formData,
      caracteristicas: {
        ...formData.caracteristicas,
        [caracteristica]: !formData.caracteristicas?.[caracteristica as keyof typeof formData.caracteristicas]
      }
    });
  };

  const tabs = [
    { key: 'basico', label: 'Datos Básicos' },
    { key: 'propietario', label: 'Propietario' },
    { key: 'comercial', label: 'Comercial' },
    { key: 'marketing', label: 'Marketing' }
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.key
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {activeTab === 'basico' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Referencia *
              </label>
              <input
                type="text"
                required
                value={formData.referencia}
                onChange={(e) => setFormData({ ...formData, referencia: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estado
              </label>
              <select
                value={formData.estado}
                onChange={(e) => setFormData({ ...formData, estado: e.target.value as InmuebleCartera['estado'] })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="activo">Activo</option>
                <option value="reservado">Reservado</option>
                <option value="vendido">Vendido</option>
                <option value="retirado">Retirado</option>
                <option value="en_proceso">En Proceso</option>
              </select>
            </div>
          </div>

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
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dirección *
              </label>
              <input
                type="text"
                required
                value={formData.direccion}
                onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Zona *
              </label>
              <input
                type="text"
                required
                value={formData.zona}
                onChange={(e) => setFormData({ ...formData, zona: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipología
              </label>
              <select
                value={formData.tipologia}
                onChange={(e) => setFormData({ ...formData, tipologia: e.target.value as InmuebleCartera['tipologia'] })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="piso">Piso</option>
                <option value="atico">Ático</option>
                <option value="duplex">Dúplex</option>
                <option value="casa">Casa</option>
                <option value="chalet">Chalet</option>
                <option value="estudio">Estudio</option>
                <option value="loft">Loft</option>
                <option value="planta_baja">Planta Baja</option>
                <option value="local">Local</option>
                <option value="oficina">Oficina</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Operación
              </label>
              <select
                value={formData.operacion}
                onChange={(e) => setFormData({ ...formData, operacion: e.target.value as InmuebleCartera['operacion'] })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="venta">Venta</option>
                <option value="alquiler">Alquiler</option>
                <option value="venta_alquiler">Venta/Alquiler</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Precio *
              </label>
              <input
                type="number"
                required
                value={formData.precio}
                onChange={(e) => setFormData({ ...formData, precio: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                m² *
              </label>
              <input
                type="number"
                required
                value={formData.m2}
                onChange={(e) => setFormData({ ...formData, m2: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Habitaciones
              </label>
              <input
                type="number"
                value={formData.habitaciones}
                onChange={(e) => setFormData({ ...formData, habitaciones: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Baños
              </label>
              <input
                type="number"
                value={formData.banos}
                onChange={(e) => setFormData({ ...formData, banos: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Características
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                'garaje', 'ascensor', 'terraza', 'balcon', 'piscina', 'jardin',
                'trastero', 'aireAcondicionado', 'calefaccion', 'amueblado', 'reformado'
              ].map(caracteristica => (
                <label key={caracteristica} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.caracteristicas?.[caracteristica as keyof typeof formData.caracteristicas] as boolean || false}
                    onChange={() => toggleCaracteristica(caracteristica)}
                    className="mr-2 rounded border-gray-300"
                  />
                  <span className="text-sm capitalize">{caracteristica.replace(/([A-Z])/g, ' $1')}</span>
                </label>
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
        </div>
      )}

      {activeTab === 'propietario' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre del Propietario *
            </label>
            <input
              type="text"
              required
              value={formData.propietarioNombre}
              onChange={(e) => setFormData({ ...formData, propietarioNombre: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Teléfono
              </label>
              <input
                type="tel"
                value={formData.propietarioTelefono}
                onChange={(e) => setFormData({ ...formData, propietarioTelefono: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={formData.propietarioEmail}
                onChange={(e) => setFormData({ ...formData, propietarioEmail: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="border-t pt-4">
            <label className="flex items-center mb-3">
              <input
                type="checkbox"
                checked={formData.exclusiva}
                onChange={(e) => setFormData({ ...formData, exclusiva: e.target.checked })}
                className="mr-2 rounded border-gray-300"
              />
              <span className="text-sm font-medium">Inmueble en exclusiva</span>
            </label>

            {formData.exclusiva && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha fin de exclusiva
                </label>
                <input
                  type="date"
                  value={formData.fechaFinExclusiva || ''}
                  onChange={(e) => setFormData({ ...formData, fechaFinExclusiva: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'comercial' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Agente Captación
              </label>
              <input
                type="text"
                value={formData.agenteCaptacion || ''}
                onChange={(e) => setFormData({ ...formData, agenteCaptacion: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Agente Comercial
              </label>
              <input
                type="text"
                value={formData.agenteComercial || ''}
                onChange={(e) => setFormData({ ...formData, agenteComercial: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Equipo
            </label>
            <input
              type="text"
              value={formData.equipo || ''}
              onChange={(e) => setFormData({ ...formData, equipo: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notas Internas
            </label>
            <textarea
              value={formData.notasInternas || ''}
              onChange={(e) => setFormData({ ...formData, notasInternas: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Notas privadas del equipo..."
            />
          </div>
        </div>
      )}

      {activeTab === 'marketing' && (
        <div className="space-y-4">
          <div className="flex gap-6">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.publicado}
                onChange={(e) => setFormData({ ...formData, publicado: e.target.checked })}
                className="mr-2 rounded border-gray-300"
              />
              <span className="text-sm font-medium">Publicado</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.destacado}
                onChange={(e) => setFormData({ ...formData, destacado: e.target.checked })}
                className="mr-2 rounded border-gray-300"
              />
              <span className="text-sm font-medium">Destacado</span>
            </label>
          </div>
        </div>
      )}

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
          {inmueble ? 'Actualizar' : 'Crear'} Inmueble
        </button>
      </div>
    </form>
  );
}