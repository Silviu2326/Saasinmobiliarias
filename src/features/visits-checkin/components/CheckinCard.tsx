import React from 'react';
import { CheckinVisit } from '../types';
import { 
  getVisitStatus, 
  getStatusColor, 
  getStatusLabel, 
  getStatusIcon, 
  formatDistance, 
  formatTime, 
  formatDuration,
  calculateVisitDuration,
  isVisitOverdue,
  getTimeUntilVisit,
  canCheckin,
  canCheckout,
  getInitials
} from '../utils';

interface CheckinCardProps {
  visit: CheckinVisit;
  onCheckin: (visit: CheckinVisit) => void;
  onCheckout: (visit: CheckinVisit) => void;
  onViewDetails: (visit: CheckinVisit) => void;
}

export default function CheckinCard({
  visit,
  onCheckin,
  onCheckout,
  onViewDetails
}: CheckinCardProps) {
  const status = getVisitStatus(visit);
  const statusColor = getStatusColor(status);
  const statusLabel = getStatusLabel(status);
  const statusIcon = getStatusIcon(status);
  const isOverdue = isVisitOverdue(visit);
  const minutesUntil = getTimeUntilVisit(visit);
  const duration = visit.checkinRecord && visit.checkoutRecord 
    ? calculateVisitDuration(visit.checkinRecord.at, visit.checkoutRecord.at)
    : null;
  
  const canDoCheckin = canCheckin(visit);
  const canDoCheckout = canCheckout(visit);

  const getUrgencyIndicator = () => {
    if (isOverdue) {
      return <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" title="Visita vencida" />;
    } else if (minutesUntil <= 30 && minutesUntil > 0) {
      return <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse" title="Visita próxima" />;
    } else if (status === 'checked-in') {
      return <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse" title="En progreso" />;
    }
    return null;
  };

  const getTimeInfo = () => {
    if (status === 'completed' && duration) {
      return `Completada en ${formatDuration(duration)}`;
    } else if (status === 'checked-in' && visit.checkinRecord) {
      return `Iniciada a las ${formatTime(visit.checkinRecord.at)}`;
    } else if (minutesUntil < 0) {
      return `Vencida hace ${Math.abs(minutesUntil)} min`;
    } else if (minutesUntil <= 30) {
      return `En ${minutesUntil} min`;
    } else {
      return visit.ventanaHoraria;
    }
  };

  return (
    <div className={`bg-white rounded-lg border shadow-sm p-4 hover:shadow-md transition-shadow ${
      isOverdue ? 'border-red-200 bg-red-50' : 
      status === 'checked-in' ? 'border-blue-200 bg-blue-50' :
      status === 'completed' ? 'border-green-200 bg-green-50' :
      'border-gray-200'
    }`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium text-sm">
              {getInitials(visit.clienteNombre)}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium text-gray-900 truncate">
              {visit.clienteNombre}
            </h3>
            <p className="text-xs text-gray-500 truncate">
              {visit.clienteTelefono}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {getUrgencyIndicator()}
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusColor}`}>
            <span className="mr-1">{statusIcon}</span>
            {statusLabel}
          </span>
        </div>
      </div>

      {/* Property info */}
      <div className="mb-3">
        <h4 className="text-sm font-medium text-gray-900 mb-1">
          {visit.propertyTitle}
        </h4>
        <p className="text-xs text-gray-600 mb-2">
          {visit.propertyAddress}
        </p>
        
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>{getTimeInfo()}</span>
          <span>📍 {formatDistance(visit.distanciaEstimada)}</span>
        </div>
      </div>

      {/* Location info (simulated) */}
      {(visit.checkinRecord || visit.checkoutRecord) && (
        <div className="mb-3 p-2 bg-gray-100 rounded text-xs">
          <div className="flex items-center mb-1">
            <svg className="w-3 h-3 mr-1 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
            <span className="text-gray-600">GPS simulado</span>
          </div>
          {visit.checkinRecord && (
            <div className="text-gray-500">
              Check-in: {visit.checkinRecord.lat.toFixed(4)}, {visit.checkinRecord.lng.toFixed(4)}
            </div>
          )}
          {visit.checkoutRecord && (
            <div className="text-gray-500">
              Check-out: {visit.checkoutRecord.lat.toFixed(4)}, {visit.checkoutRecord.lng.toFixed(4)}
            </div>
          )}
        </div>
      )}

      {/* Feedback */}
      {visit.checkoutRecord?.feedback && (
        <div className="mb-3 p-2 bg-yellow-50 rounded">
          <div className="flex items-center text-xs">
            <span className="text-yellow-600 mr-2">
              {'★'.repeat(visit.checkoutRecord.feedback.score)}
              {'☆'.repeat(5 - visit.checkoutRecord.feedback.score)}
            </span>
            <span className="text-gray-600">
              ({visit.checkoutRecord.feedback.score}/5)
            </span>
          </div>
          {visit.checkoutRecord.feedback.comentario && (
            <p className="text-xs text-gray-600 mt-1">
              {visit.checkoutRecord.feedback.comentario}
            </p>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between space-x-2">
        <button
          onClick={() => onViewDetails(visit)}
          className="flex-1 text-xs text-blue-600 hover:text-blue-800 font-medium"
        >
          Ver detalles
        </button>
        
        {canDoCheckin && (
          <button
            onClick={() => onCheckin(visit)}
            className="px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            Check-in
          </button>
        )}
        
        {canDoCheckout && (
          <button
            onClick={() => onCheckout(visit)}
            className="px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Check-out
          </button>
        )}

        {status === 'completed' && (
          <div className="flex items-center text-green-600">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
        )}
      </div>

      {/* Notes */}
      {(visit.checkinRecord?.notes || visit.checkoutRecord?.notes || visit.notas) && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <p className="text-xs text-gray-600">
            <strong>Notas:</strong>{' '}
            {visit.checkoutRecord?.notes || visit.checkinRecord?.notes || visit.notas}
          </p>
        </div>
      )}
    </div>
  );
}