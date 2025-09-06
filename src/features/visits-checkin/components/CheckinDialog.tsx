import React, { useState, useEffect } from 'react';
import { CheckinVisit, CheckinFeedback } from '../types';
import { simulateGeolocation } from '../apis';
import { formatCoordinates } from '../utils';

interface CheckinDialogProps {
  visit: CheckinVisit | null;
  isOpen: boolean;
  type: 'in' | 'out';
  onClose: () => void;
  onSubmit: (data: {
    visitId: string;
    type: 'in' | 'out';
    lat: number;
    lng: number;
    notes?: string;
    feedback?: CheckinFeedback;
  }) => void;
  isLoading: boolean;
}

export default function CheckinDialog({
  visit,
  isOpen,
  type,
  onClose,
  onSubmit,
  isLoading
}: CheckinDialogProps) {
  const [notes, setNotes] = useState('');
  const [feedback, setFeedback] = useState<CheckinFeedback | undefined>();
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  const isCheckout = type === 'out';
  const title = isCheckout ? 'Check-out de Visita' : 'Check-in de Visita';
  const actionLabel = isCheckout ? 'Finalizar Visita' : 'Iniciar Visita';

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (!isOpen) {
      setNotes('');
      setFeedback(undefined);
      setLocation(null);
      setGpsError(null);
    } else if (visit) {
      // Auto-get location when dialog opens
      handleGetLocation();
    }
  }, [isOpen, visit]);

  const handleGetLocation = async () => {
    setGpsLoading(true);
    setGpsError(null);
    
    try {
      const coords = await simulateGeolocation();
      setLocation(coords);
    } catch (error) {
      setGpsError('Error al obtener ubicación GPS');
    } finally {
      setGpsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!visit || !location) return;

    onSubmit({
      visitId: visit.id,
      type,
      lat: location.lat,
      lng: location.lng,
      notes: notes.trim() || undefined,
      feedback: isCheckout ? feedback : undefined
    });
  };

  const handleFeedbackChange = (score: number) => {
    setFeedback(prev => ({ ...prev, score: score as 1 | 2 | 3 | 4 | 5 }));
  };

  if (!isOpen || !visit) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-screen overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">{title}</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
              disabled={isLoading}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Visit Info */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium text-sm">
                {visit.clienteNombre.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </div>
              <div>
                <h3 className="font-medium text-gray-900">{visit.clienteNombre}</h3>
                <p className="text-sm text-gray-600">{visit.ventanaHoraria}</p>
              </div>
            </div>
            <div className="text-sm text-gray-600">
              <p className="font-medium">{visit.propertyTitle}</p>
              <p>{visit.propertyAddress}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {/* GPS Location */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Ubicación GPS
              </label>
              
              <div className="border border-gray-300 rounded-lg p-4">
                {gpsLoading ? (
                  <div className="flex items-center space-x-3">
                    <svg className="animate-spin w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    <span className="text-sm text-gray-600">Obteniendo ubicación...</span>
                  </div>
                ) : location ? (
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-sm font-medium text-green-700">Ubicación obtenida</span>
                    </div>
                    <p className="text-xs text-gray-600 font-mono">
                      {formatCoordinates(location.lat, location.lng)}
                    </p>
                    <button
                      type="button"
                      onClick={handleGetLocation}
                      className="mt-2 text-xs text-blue-600 hover:text-blue-700"
                    >
                      Actualizar ubicación
                    </button>
                  </div>
                ) : gpsError ? (
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-sm font-medium text-red-700">Error GPS</span>
                    </div>
                    <p className="text-xs text-gray-600 mb-2">{gpsError}</p>
                    <button
                      type="button"
                      onClick={handleGetLocation}
                      className="text-xs text-blue-600 hover:text-blue-700"
                    >
                      Reintentar
                    </button>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-sm text-gray-600">Sin ubicación</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleGetLocation}
                      className="text-xs text-blue-600 hover:text-blue-700"
                    >
                      Obtener ubicación
                    </button>
                  </div>
                )}
              </div>
              
              <p className="text-xs text-gray-500 mt-2">
                📍 Usando GPS simulado para propósitos de demostración
              </p>
            </div>

            {/* Feedback (only for checkout) */}
            {isCheckout && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Valoración de la visita
                </label>
                
                <div className="flex items-center space-x-2 mb-3">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => handleFeedbackChange(star)}
                      className={`text-2xl ${
                        feedback?.score && feedback.score >= star
                          ? 'text-yellow-400'
                          : 'text-gray-300 hover:text-yellow-300'
                      }`}
                    >
                      ★
                    </button>
                  ))}
                </div>
                
                {feedback?.score && (
                  <textarea
                    value={feedback.comentario || ''}
                    onChange={(e) => setFeedback(prev => ({ ...prev!, comentario: e.target.value }))}
                    placeholder="Comentarios sobre la visita (opcional)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={2}
                  />
                )}
              </div>
            )}

            {/* Notes */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notas {isCheckout ? '(opcional)' : ''}
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={
                  isCheckout
                    ? 'Resumen de la visita, observaciones, próximos pasos...'
                    : 'Estado del cliente, observaciones iniciales...'
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
            </div>

            {/* Actions */}
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isLoading || !location}
                className={`flex-1 px-4 py-2 rounded-md text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 ${
                  isCheckout
                    ? 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
                    : 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
                }`}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    <span>Procesando...</span>
                  </div>
                ) : (
                  actionLabel
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}