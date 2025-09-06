import React, { useState, useEffect, useRef } from 'react';
import type { Reserva, ReservaFormData } from './types';

interface ReservaFormProps {
  reserva?: Reserva;
  onSubmit: (data: ReservaFormData) => void;
  onCancel: () => void;
  ofertaId?: string;
  prefilledData?: Partial<ReservaFormData>;
}

export default function ReservaForm({ reserva, onSubmit, onCancel, ofertaId, prefilledData }: ReservaFormProps) {
  const [formData, setFormData] = useState<ReservaFormData>({
    ofertaId: reserva?.ofertaId || ofertaId || prefilledData?.ofertaId || '',
    clienteId: reserva?.clienteId || prefilledData?.clienteId || '',
    propertyId: reserva?.propertyId || prefilledData?.propertyId || '',
    tipo: reserva?.tipo || prefilledData?.tipo || 'senal',
    importe: reserva?.importe || prefilledData?.importe || 0,
    venceEl: reserva?.venceEl || '',
    condiciones: reserva?.condiciones || '',
    notas: reserva?.notas || ''
  });

  const [attachments, setAttachments] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (ofertaId && !reserva) {
      setFormData(prev => ({ ...prev, ofertaId }));
    }
    if (prefilledData) {
      setFormData(prev => ({ ...prev, ...prefilledData }));
    }
  }, [ofertaId, reserva, prefilledData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ ...formData, attachments });
  };

  const handleAttachmentAdd = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setAttachments(prev => [...prev, ...files]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const formatCurrency = (value: string) => {
    const number = value.replace(/\D/g, '');
    return new Intl.NumberFormat('es-CL').format(Number(number));
  };

  const handleImporteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    setFormData({ ...formData, importe: Number(value) });
  };

  const getMinDate = () => {
    const today = new Date();
    today.setDate(today.getDate() + 1);
    return today.toISOString().split('T')[0];
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {ofertaId && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-green-800 font-medium">
              Reserva generada desde oferta: {ofertaId}
            </span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            ID de Oferta
          </label>
          <input
            type="text"
            value={formData.ofertaId || ''}
            onChange={(e) => setFormData({ ...formData, ofertaId: e.target.value || undefined })}
            placeholder="offer-123 (opcional)"
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
            Tipo de Reserva *
          </label>
          <select
            required
            value={formData.tipo}
            onChange={(e) => setFormData({ ...formData, tipo: e.target.value as 'senal' | 'arras' })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="senal">Señal</option>
            <option value="arras">Arras</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Importe {formData.tipo === 'senal' ? 'de la Señal' : 'de las Arras'} *
          </label>
          <div className="relative">
            <span className="absolute left-3 top-2 text-gray-500">$</span>
            <input
              type="text"
              required
              value={formatCurrency(formData.importe.toString())}
              onChange={handleImporteChange}
              placeholder="2,500,000"
              className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {formData.tipo === 'senal' 
              ? 'Cantidad a pagar como señal de reserva' 
              : 'Cantidad a pagar como arras (con penalización si no se cumple)'
            }
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Fecha de Vencimiento *
          </label>
          <input
            type="date"
            required
            min={getMinDate()}
            value={formData.venceEl}
            onChange={(e) => setFormData({ ...formData, venceEl: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            Fecha límite para formalizar la operación
          </p>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Condiciones *
        </label>
        <textarea
          required
          value={formData.condiciones}
          onChange={(e) => setFormData({ ...formData, condiciones: e.target.value })}
          rows={4}
          placeholder={`Ej: ${formData.tipo === 'senal' 
            ? 'Señal del 10% sobre precio de venta final. No reembolsable en caso de desistimiento por parte del comprador.' 
            : 'Arras penitenciales del 10% sobre precio de venta. En caso de incumplimiento por parte del comprador, el vendedor conservará las arras. En caso de incumplimiento por parte del vendedor, deberá devolver el doble de las arras.'
          }`}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Notas Adicionales
        </label>
        <textarea
          value={formData.notas || ''}
          onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
          rows={3}
          placeholder="Información adicional sobre la reserva..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Documentos Adjuntos
        </label>
        <div className="border border-gray-200 rounded-lg p-4">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            onChange={handleAttachmentAdd}
            className="hidden"
          />
          
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
            Adjuntar archivos
          </button>

          {attachments.length > 0 && (
            <div className="mt-3 space-y-2">
              {attachments.map((file, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                  <div className="flex items-center">
                    <svg className="w-4 h-4 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                    </svg>
                    <span className="text-sm text-gray-700">{file.name}</span>
                    <span className="text-xs text-gray-500 ml-2">
                      ({(file.size / 1024).toFixed(1)} KB)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeAttachment(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}

          <p className="text-xs text-gray-500 mt-2">
            Formatos permitidos: PDF, DOC, DOCX, JPG, JPEG, PNG
          </p>
        </div>
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
          {reserva ? 'Actualizar' : 'Crear'} Reserva
        </button>
      </div>
    </form>
  );
}