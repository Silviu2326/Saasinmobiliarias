import React, { useState } from 'react';
import { CalendarDay, CalendarVisit, CalendarEvent } from '../types';
import { generateTimeSlots, createCalendarEvent, getAvailableTimeSlots, formatShortDate } from '../utils';
import CalendarEventCard from './CalendarEventCard';

interface CalendarGridProps {
  days: CalendarDay[];
  visits: CalendarVisit[];
  view: 'week' | 'day';
  onVisitClick: (visit: CalendarVisit) => void;
  onSlotClick: (date: string, timeSlot: string) => void;
  onVisitDrag: (visitId: string, newDate: string, newTimeSlot: string) => void;
  agenteId?: string;
}

export default function CalendarGrid({
  days,
  visits,
  view,
  onVisitClick,
  onSlotClick,
  onVisitDrag,
  agenteId
}: CalendarGridProps) {
  const [draggedVisit, setDraggedVisit] = useState<CalendarVisit | null>(null);
  const [dragOverSlot, setDragOverSlot] = useState<{ date: string; timeSlot: string } | null>(null);
  
  const timeSlots = generateTimeSlots();
  
  // Filter visits by agent if specified
  const filteredVisits = agenteId 
    ? visits.filter(v => v.agenteId === agenteId)
    : visits;

  // Group visits by date
  const visitsByDate = filteredVisits.reduce((acc, visit) => {
    if (!acc[visit.fecha]) {
      acc[visit.fecha] = [];
    }
    acc[visit.fecha].push(visit);
    return acc;
  }, {} as Record<string, CalendarVisit[]>);

  // Create events with positioning
  const eventsByDate = Object.keys(visitsByDate).reduce((acc, date) => {
    acc[date] = visitsByDate[date].map(visit => createCalendarEvent(visit));
    return acc;
  }, {} as Record<string, CalendarEvent[]>);

  const handleDragStart = (e: React.DragEvent, visit: CalendarVisit) => {
    setDraggedVisit(visit);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, date: string, timeSlot: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverSlot({ date, timeSlot });
  };

  const handleDragLeave = () => {
    setDragOverSlot(null);
  };

  const handleDrop = (e: React.DragEvent, date: string, timeSlot: string) => {
    e.preventDefault();
    setDragOverSlot(null);
    
    if (draggedVisit) {
      // Check if slot is available
      const availableSlots = getAvailableTimeSlots(date, filteredVisits, agenteId);
      const isDroppingOnSameSlot = draggedVisit.fecha === date && draggedVisit.ventanaHoraria === timeSlot;
      
      if (availableSlots.includes(timeSlot) || isDroppingOnSameSlot) {
        onVisitDrag(draggedVisit.id, date, timeSlot);
      }
      
      setDraggedVisit(null);
    }
  };

  const isSlotAvailable = (date: string, timeSlot: string): boolean => {
    const availableSlots = getAvailableTimeSlots(date, filteredVisits, agenteId);
    return availableSlots.includes(timeSlot);
  };

  const isSlotHighlighted = (date: string, timeSlot: string): boolean => {
    return dragOverSlot?.date === date && dragOverSlot?.timeSlot === timeSlot;
  };

  return (
    <div className="flex-1 overflow-auto bg-white">
      <div className="min-w-full">
        {/* Header */}
        <div className={`grid ${view === 'week' ? 'grid-cols-8' : 'grid-cols-2'} border-b border-gray-200`}>
          <div className="p-4 text-sm font-medium text-gray-500 bg-gray-50 border-r border-gray-200">
            Hora
          </div>
          {days.map(day => (
            <div key={day.date} className={`p-4 text-center border-r border-gray-200 bg-gray-50 ${day.isToday ? 'bg-blue-50' : ''}`}>
              <div className="text-sm font-medium text-gray-900">
                {view === 'week' ? day.dayName : formatShortDate(day.date)}
              </div>
              <div className={`text-lg font-bold ${day.isToday ? 'text-blue-600' : 'text-gray-700'}`}>
                {day.dayNumber}
              </div>
            </div>
          ))}
        </div>

        {/* Grid */}
        <div className={`grid ${view === 'week' ? 'grid-cols-8' : 'grid-cols-2'}`}>
          {/* Time column */}
          <div className="border-r border-gray-200 bg-gray-50">
            {timeSlots.map(slot => (
              <div key={slot.label} className="h-16 p-2 border-b border-gray-200 text-sm text-gray-500">
                {slot.label}
              </div>
            ))}
          </div>

          {/* Day columns */}
          {days.map(day => (
            <div key={day.date} className="border-r border-gray-200 relative">
              {timeSlots.map(slot => {
                const timeSlotString = `${slot.label} - ${(slot.hour + 1).toString().padStart(2, '0')}:00`;
                const isAvailable = isSlotAvailable(day.date, timeSlotString);
                const isHighlighted = isSlotHighlighted(day.date, timeSlotString);
                
                return (
                  <div
                    key={`${day.date}-${slot.label}`}
                    className={`h-16 border-b border-gray-200 relative cursor-pointer transition-colors ${
                      day.isPast ? 'bg-gray-50' : 'hover:bg-gray-50'
                    } ${
                      isHighlighted ? 'bg-blue-100' : ''
                    } ${
                      !isAvailable && !day.isPast ? 'bg-red-50' : ''
                    }`}
                    onClick={() => {
                      if (!day.isPast && isAvailable) {
                        onSlotClick(day.date, timeSlotString);
                      }
                    }}
                    onDragOver={(e) => handleDragOver(e, day.date, timeSlotString)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, day.date, timeSlotString)}
                  >
                    {/* Slot indicator */}
                    {!day.isPast && isAvailable && (
                      <div className="absolute inset-2 border-2 border-dashed border-gray-300 rounded-md opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="text-xs text-gray-500">+ Crear visita</span>
                      </div>
                    )}
                    
                    {/* Not available indicator */}
                    {!isAvailable && !day.isPast && (
                      <div className="absolute inset-2 flex items-center justify-center">
                        <span className="text-xs text-red-500">No disponible</span>
                      </div>
                    )}
                  </div>
                );
              })}
              
              {/* Events overlay */}
              <div className="absolute inset-0 pointer-events-none">
                {eventsByDate[day.date]?.map((event, index) => (
                  <CalendarEventCard
                    key={event.visit.id}
                    visit={event.visit}
                    onClick={() => onVisitClick(event.visit)}
                    onDragStart={(e) => handleDragStart(e, event.visit)}
                    style={{
                      top: `${event.top}px`,
                      height: `${event.height}px`,
                      pointerEvents: 'auto'
                    }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Empty state */}
        {filteredVisits.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3a2 2 0 012-2h8a2 2 0 012 2v4m-6 9l2 2 4-4M5 3v4M3 5h4M6 17v4a2 2 0 002 2h8a2 2 0 002-2v-4" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay visitas programadas</h3>
            <p className="text-gray-500 mb-4">Haz clic en un slot disponible para crear una nueva visita.</p>
          </div>
        )}

        {/* Legend */}
        <div className="p-4 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center justify-center space-x-6 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-dashed border-gray-300 rounded"></div>
              <span className="text-gray-600">Disponible</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-red-50 border border-red-200 rounded"></div>
              <span className="text-gray-600">Ocupado</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-yellow-50 border-l-4 border-yellow-400 rounded"></div>
              <span className="text-gray-600">Pendiente</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-blue-50 border-l-4 border-blue-400 rounded"></div>
              <span className="text-gray-600">Confirmada</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}