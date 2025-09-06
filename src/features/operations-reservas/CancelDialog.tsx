import React, { useState } from 'react';
import type { ReservaCancelData } from './types';

interface CancelDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: ReservaCancelData) => Promise<void>;
  isLoading: boolean;
  reservaTitle?: string;
}

export default function CancelDialog({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
  reservaTitle
}: CancelDialogProps) {
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!reason.trim()) {
      setError('Debe especificar una razón para la cancelación');
      return;
    }

    try {
      await onConfirm({
        reason: reason.trim(),
        notes: notes.trim() || undefined
      });
      handleClose();
    } catch (error) {
      console.error('Error canceling reserva:', error);
      setError('Error al cancelar la reserva. Inténtelo de nuevo.');
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setReason('');
      setNotes('');
      setError('');
      onClose();
    }
  };

  const commonReasons = [
    'El cliente se ha retractado',
    'Problemas de financiación del cliente',
    'Cambio en las condiciones del mercado',
    'Documentación incompleta o incorrecta',
    'El propietario ha retirado la propiedad',
    'Aparición de defectos en la propiedad',
    'Falta de acuerdo en las condiciones finales',
    'Vencimiento del plazo de reserva',
    'Incumplimiento de las condiciones pactadas'
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-3">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Cancelar Reserva</h2>
                {reservaTitle && (
                  <p className="text-sm text-gray-600">{reservaTitle}</p>
                )}
              </div>
            </div>
            <button
              onClick={handleClose}
              disabled={isLoading}
              className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-yellow-600 mt-0.5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <div className="text-sm text-yellow-800">
                <p className="font-medium">Esta acción no se puede deshacer</p>
                <p>La reserva será marcada como cancelada y no se podrá firmar ni modificar posteriormente.</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Reason selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Motivo de cancelación *
              </label>
              <select
                value={reason}
                onChange={(e) => {
                  setReason(e.target.value);
                  setError('');
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                disabled={isLoading}
              >
                <option value="">Seleccione un motivo...</option>
                {commonReasons.map((commonReason, index) => (
                  <option key={index} value={commonReason}>
                    {commonReason}
                  </option>
                ))}
                <option value="Otro">Otro motivo</option>
              </select>
            </div>

            {/* Custom reason input */}
            {reason === 'Otro' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Especificar motivo *
                </label>
                <input
                  type="text"
                  value={notes.split('\n')[0] || ''}
                  onChange={(e) => {
                    const customReason = e.target.value;
                    setReason(customReason);
                    if (notes.includes('\n')) {
                      setNotes(customReason + '\n' + notes.split('\n').slice(1).join('\n'));
                    } else {
                      setNotes(customReason);
                    }
                    setError('');
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="Describa el motivo de cancelación..."
                  disabled={isLoading}
                />
              </div>
            )}

            {/* Additional notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notas adicionales
              </label>
              <textarea
                value={reason === 'Otro' ? notes.split('\n').slice(1).join('\n') : notes}
                onChange={(e) => {
                  if (reason === 'Otro') {
                    setNotes(reason + '\n' + e.target.value);
                  } else {
                    setNotes(e.target.value);
                  }
                }}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="Información adicional sobre la cancelación..."
                disabled={isLoading}
              />
              <p className="mt-1 text-xs text-gray-500">
                Detalles adicionales que puedan ser relevantes para el seguimiento
              </p>
            </div>

            {error && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-3">
                {error}
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={handleClose}
                disabled={isLoading}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isLoading || !reason.trim()}
                className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    <span>Cancelando...</span>
                  </div>
                ) : (
                  'Confirmar Cancelación'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}