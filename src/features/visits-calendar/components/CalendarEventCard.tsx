import React from 'react';
import { CalendarVisit } from '../types';
import { getStatusColor } from '../utils';

interface CalendarEventCardProps {
  visit: CalendarVisit;
  onClick: () => void;
  onDragStart?: (e: React.DragEvent) => void;
  style?: React.CSSProperties;
}

export default function CalendarEventCard({ 
  visit, 
  onClick, 
  onDragStart,
  style 
}: CalendarEventCardProps) {
  const statusColor = getStatusColor(visit.estado);
  
  return (
    <div
      className={`absolute left-1 right-1 p-2 rounded-md border-l-4 cursor-pointer hover:shadow-md transition-shadow text-xs ${statusColor}`}
      style={style}
      onClick={onClick}
      draggable={true}
      onDragStart={onDragStart}
      title={`${visit.clienteNombre} - ${visit.propertyTitle}`}
    >
      <div className="font-medium truncate">
        {visit.clienteNombre}
      </div>
      <div className="text-xs opacity-75 truncate">
        {visit.propertyTitle}
      </div>
      <div className="text-xs opacity-60 mt-1">
        {visit.ventanaHoraria}
      </div>
      {!visit.confirmado && visit.estado === 'pendiente' && (
        <div className="flex items-center mt-1">
          <svg className="w-3 h-3 text-yellow-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span className="text-xs">Sin confirmar</span>
        </div>
      )}
    </div>
  );
}