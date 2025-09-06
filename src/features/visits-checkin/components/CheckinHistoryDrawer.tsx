import React from 'react';
import { CheckinRecord } from '../types';
import { formatDateTime, formatCoordinates, formatFeedbackStars, getFeedbackColor } from '../utils';

interface CheckinHistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  history: CheckinRecord[];
  isLoading: boolean;
}

export default function CheckinHistoryDrawer({
  isOpen,
  onClose,
  history,
  isLoading
}: CheckinHistoryDrawerProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-end z-50">
      <div className="bg-white h-full w-full max-w-lg shadow-xl flex flex-col">
        {/* Header */}
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-medium text-gray-900">Historial de Check-ins</h2>
              <p className="text-sm text-gray-600">
                Últimos registros de entrada y salida
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center space-x-3">
                <svg className="animate-spin w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span className="text-gray-600">Cargando historial...</span>
              </div>
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Sin historial</h3>
              <p className="text-gray-600">
                No hay registros de check-in/check-out disponibles
              </p>
            </div>
          ) : (
            <div className="p-4 space-y-4">
              {history.map((record, index) => (
                <div
                  key={record.id}
                  className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-medium ${
                          record.type === 'in'
                            ? 'bg-green-500'
                            : 'bg-blue-500'
                        }`}
                      >
                        {record.type === 'in' ? 'IN' : 'OUT'}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {record.type === 'in' ? 'Check-in' : 'Check-out'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatDateTime(record.at)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Visita #{record.visitId.slice(-4)}</p>
                    </div>
                  </div>

                  {/* Location */}
                  <div className="mb-3">
                    <div className="flex items-center text-xs text-gray-600 mb-1">
                      <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span>Ubicación GPS</span>
                    </div>
                    <p className="text-xs font-mono text-gray-500 pl-4">
                      {formatCoordinates(record.lat, record.lng)}
                    </p>
                  </div>

                  {/* Feedback (checkout only) */}
                  {record.type === 'out' && record.feedback && (
                    <div className="mb-3 p-2 bg-yellow-50 rounded">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-600">Valoración:</span>
                        <div className="flex items-center space-x-1">
                          <span className={`text-sm ${getFeedbackColor(record.feedback.score)}`}>
                            {formatFeedbackStars(record.feedback.score)}
                          </span>
                          <span className="text-xs text-gray-500">
                            ({record.feedback.score}/5)
                          </span>
                        </div>
                      </div>
                      {record.feedback.comentario && (
                        <p className="text-xs text-gray-600 italic">
                          "{record.feedback.comentario}"
                        </p>
                      )}
                    </div>
                  )}

                  {/* Notes */}
                  {record.notes && (
                    <div className="mb-3 p-2 bg-gray-50 rounded">
                      <div className="text-xs text-gray-600 mb-1">Notas:</div>
                      <p className="text-xs text-gray-700">
                        {record.notes}
                      </p>
                    </div>
                  )}

                  {/* Separator (not for last item) */}
                  {index < history.length - 1 && (
                    <div className="mt-3 border-b border-gray-100"></div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Check-in</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Check-out</span>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Mostrando últimos {history.length} registros</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}