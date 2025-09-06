import React, { useState, useEffect } from 'react';
import type { Contract, ContractFormData } from './types';

interface ContractFormProps {
  contract?: Contract;
  onSubmit: (data: ContractFormData) => void;
  onCancel: () => void;
  reservaId?: string;
}

export default function ContractForm({ contract, onSubmit, onCancel, reservaId }: ContractFormProps) {
  const [formData, setFormData] = useState<ContractFormData>({
    tipo: contract?.tipo || 'compraventa',
    propertyId: contract?.propertyId || '',
    clienteId: contract?.clienteId || '',
    propietarioId: contract?.propietarioId || undefined,
    honorarios: contract?.honorarios || 0,
    fechaInicio: contract?.fechaInicio || '',
    fechaVencimiento: contract?.fechaVencimiento || '',
    fechasClaves: contract?.fechasClaves || {},
    notas: contract?.notas || '',
    reservaId: contract?.reservaId || reservaId
  });

  const [newFechaKey, setNewFechaKey] = useState('');
  const [newFechaValue, setNewFechaValue] = useState('');

  useEffect(() => {
    if (reservaId && !contract) {
      setFormData(prev => ({ ...prev, reservaId }));
    }
  }, [reservaId, contract]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const addFechaClave = () => {
    if (newFechaKey.trim() && newFechaValue.trim()) {
      setFormData({
        ...formData,
        fechasClaves: {
          ...formData.fechasClaves,
          [newFechaKey.trim()]: newFechaValue.trim()
        }
      });
      setNewFechaKey('');
      setNewFechaValue('');
    }
  };

  const removeFechaClave = (key: string) => {
    const newFechas = { ...formData.fechasClaves };
    delete newFechas[key];
    setFormData({ ...formData, fechasClaves: newFechas });
  };

  const formatCurrency = (value: string) => {
    const number = value.replace(/\D/g, '');
    return new Intl.NumberFormat('es-CL').format(Number(number));
  };

  const handleHonorariosChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    setFormData({ ...formData, honorarios: Number(value) });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {reservaId && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-blue-800 font-medium">
              Contrato generado desde reserva: {reservaId}
            </span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tipo de Contrato *
          </label>
          <select
            required
            value={formData.tipo}
            onChange={(e) => setFormData({ ...formData, tipo: e.target.value as ContractFormData['tipo'] })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="compraventa">Compraventa</option>
            <option value="alquiler">Alquiler</option>
            <option value="exclusiva">Exclusiva</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            ID Propiedad *
          </label>
          <input
            type="text"
            required
            value={formData.propertyId}
            onChange={(e) => setFormData({ ...formData, propertyId: e.target.value })}
            placeholder="prop-123"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            ID Cliente *
          </label>
          <input
            type="text"
            required
            value={formData.clienteId}
            onChange={(e) => setFormData({ ...formData, clienteId: e.target.value })}
            placeholder="client-123"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            ID Propietario
          </label>
          <input
            type="text"
            value={formData.propietarioId || ''}
            onChange={(e) => setFormData({ ...formData, propietarioId: e.target.value || undefined })}
            placeholder="owner-123 (opcional)"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Honorarios *
          </label>
          <div className="relative">
            <span className="absolute left-3 top-2 text-gray-500">$</span>
            <input
              type="text"
              required
              value={formatCurrency(formData.honorarios.toString())}
              onChange={handleHonorariosChange}
              placeholder="5,000,000"
              className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Fecha de Inicio
          </label>
          <input
            type="date"
            value={formData.fechaInicio || ''}
            onChange={(e) => setFormData({ ...formData, fechaInicio: e.target.value || undefined })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Fecha de Vencimiento
          </label>
          <input
            type="date"
            value={formData.fechaVencimiento || ''}
            onChange={(e) => setFormData({ ...formData, fechaVencimiento: e.target.value || undefined })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Fechas Clave
        </label>
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
            <input
              type="text"
              value={newFechaKey}
              onChange={(e) => setNewFechaKey(e.target.value)}
              placeholder="Nombre de la fecha (ej: Escritura)"
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="date"
              value={newFechaValue}
              onChange={(e) => setNewFechaValue(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={addFechaClave}
              className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
            >
              Añadir Fecha
            </button>
          </div>

          <div className="space-y-2">
            {Object.entries(formData.fechasClaves || {}).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between bg-gray-50 p-3 rounded">
                <div>
                  <span className="font-medium text-gray-700">{key}:</span>{' '}
                  <span className="text-gray-600">{new Date(value).toLocaleDateString()}</span>
                </div>
                <button
                  type="button"
                  onClick={() => removeFechaClave(key)}
                  className="text-red-500 hover:text-red-700"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>

          {Object.keys(formData.fechasClaves || {}).length === 0 && (
            <p className="text-gray-500 text-sm">No hay fechas clave definidas</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Notas
        </label>
        <textarea
          value={formData.notas || ''}
          onChange={(e) => setFormData({ ...formData, notas: e.target.value || undefined })}
          rows={4}
          placeholder="Información adicional sobre el contrato..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          {contract ? 'Actualizar' : 'Crear'} Contrato
        </button>
      </div>
    </form>
  );
}