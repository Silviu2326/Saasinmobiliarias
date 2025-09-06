import React from 'react';
import { RouteVisit } from '../types';
import { getPriorityColor, formatDuration, formatDistance } from '../utils';

interface VisitCardProps {
  visit: RouteVisit;
  showOrder?: number;
  isDragging?: boolean;
  onDragStart?: (visit: RouteVisit) => void;
  onViewDetails?: (visit: RouteVisit) => void;
  className?: string;
}

export default function VisitCard({
  visit,
  showOrder,
  isDragging = false,
  onDragStart,
  onViewDetails,
  className = ''
}: VisitCardProps) {
  const handleDragStart = (e: React.DragEvent) => {
    if (onDragStart) {
      onDragStart(visit);
    }
    e.dataTransfer.setData('text/plain', visit.id);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .join('')
      .slice(0, 2);
  };

  return (
    <div
      className={`bg-white rounded-lg border shadow-sm p-4 hover:shadow-md transition-all cursor-move ${
        isDragging ? 'opacity-50 transform rotate-3' : ''
      } ${visit.confirmado ? 'border-green-200 bg-green-50' : 'border-gray-200'} ${className}`}
      draggable
      onDragStart={handleDragStart}
    >
      {/* Header with order and priority */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          {showOrder && (
            <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
              {showOrder}
            </div>
          )}
          
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-gray-500 rounded-full flex items-center justify-center text-white font-medium text-sm">
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
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(visit.prioridad)}`}>
            {visit.prioridad.toUpperCase()}
          </span>
          
          {visit.confirmado && (
            <div className="w-5 h-5 text-green-600">
              <svg fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          )}
        </div>
      </div>

      {/* Property info */}
      <div className="mb-3">
        <h4 className="text-sm font-medium text-gray-900 mb-1 truncate">
          {visit.propertyTitle}
        </h4>
        <p className="text-xs text-gray-600 mb-2 line-clamp-2">
          {visit.propertyAddress}
        </p>
        
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center space-x-3">
            <span className="flex items-center">
              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                  clipRule="evenodd"
                />
              </svg>
              {visit.ventanaHoraria}
            </span>
            
            <span className="flex items-center">
              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                  clipRule="evenodd"
                />
              </svg>
              {visit.distanciaEstimada ? formatDistance(visit.distanciaEstimada) : '-'}
            </span>
          </div>
          
          <span className="flex items-center">
            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {formatDuration(visit.tiempoEstimado)}
          </span>
        </div>
      </div>

      {/* Notes */}
      {visit.notas && (
        <div className="mb-3 p-2 bg-yellow-50 rounded text-xs">
          <div className="flex items-start">
            <svg className="w-3 h-3 mr-1 text-yellow-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-yellow-700 line-clamp-2">
              {visit.notas}
            </span>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center text-xs text-gray-400">
          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
            <path d="M10 4a2 2 0 100-4 2 2 0 000 4z" />
            <path d="M10 20a2 2 0 100-4 2 2 0 000 4z" />
          </svg>
          <span>Arrastrar para ordenar</span>
        </div>
        
        {onViewDetails && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails(visit);
            }}
            className="text-xs text-blue-600 hover:text-blue-800 font-medium"
          >
            Ver detalles
          </button>
        )}
      </div>
    </div>
  );
}