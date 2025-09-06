import React, { useState } from 'react';
import { RouteVisit, OptimizedRoute, RouteStop, DragDropState } from '../types';
import { formatDuration, formatDistance } from '../utils';
import VisitCard from './VisitCard';

interface RouteBuilderProps {
  availableVisits: RouteVisit[];
  currentRoute: OptimizedRoute | null;
  onRouteChange: (route: OptimizedRoute) => void;
  onVisitSelect: (visit: RouteVisit) => void;
  isOptimizing: boolean;
}

export default function RouteBuilder({
  availableVisits,
  currentRoute,
  onRouteChange,
  onVisitSelect,
  isOptimizing
}: RouteBuilderProps) {
  const [dragDropState, setDragDropState] = useState<DragDropState>({
    draggedItem: null,
    dropZone: null
  });

  const handleDragStart = (visit: RouteVisit) => {
    // Check if this visit is already in the route
    const existingStop = currentRoute?.stops.find(stop => stop.visit.id === visit.id);
    if (existingStop) {
      setDragDropState({
        draggedItem: existingStop,
        dropZone: null
      });
    } else {
      // Create a temporary stop for the unassigned visit
      const tempStop: RouteStop = {
        visitId: visit.id,
        visit,
        order: 0,
        travelTime: 0,
        travelDistance: 0
      };
      setDragDropState({
        draggedItem: tempStop,
        dropZone: null
      });
    }
  };

  const handleDragOver = (e: React.DragEvent, zone: 'unassigned' | 'route', insertIndex?: number) => {
    e.preventDefault();
    setDragDropState(prev => ({
      ...prev,
      dropZone: zone,
      insertIndex
    }));
  };

  const handleDrop = (e: React.DragEvent, zone: 'unassigned' | 'route', insertIndex?: number) => {
    e.preventDefault();
    
    if (!dragDropState.draggedItem || !currentRoute) {
      setDragDropState({ draggedItem: null, dropZone: null });
      return;
    }

    const draggedStop = dragDropState.draggedItem;
    const wasInRoute = currentRoute.stops.some(stop => stop.visitId === draggedStop.visitId);

    if (zone === 'route') {
      // Add to or reorder within route
      let newStops = [...currentRoute.stops];
      
      if (wasInRoute) {
        // Remove from current position
        newStops = newStops.filter(stop => stop.visitId !== draggedStop.visitId);
      }
      
      // Insert at new position
      const targetIndex = insertIndex !== undefined ? insertIndex : newStops.length;
      newStops.splice(targetIndex, 0, {
        ...draggedStop,
        order: targetIndex + 1
      });
      
      // Update order for all stops
      newStops = newStops.map((stop, index) => ({
        ...stop,
        order: index + 1
      }));
      
      onRouteChange({
        ...currentRoute,
        stops: newStops,
        totalVisits: newStops.length
      });
      
    } else if (zone === 'unassigned' && wasInRoute) {
      // Remove from route
      const newStops = currentRoute.stops
        .filter(stop => stop.visitId !== draggedStop.visitId)
        .map((stop, index) => ({
          ...stop,
          order: index + 1
        }));
      
      onRouteChange({
        ...currentRoute,
        stops: newStops,
        totalVisits: newStops.length
      });
    }

    setDragDropState({ draggedItem: null, dropZone: null });
  };

  const handleDragEnd = () => {
    setDragDropState({ draggedItem: null, dropZone: null });
  };

  const getUnassignedVisits = () => {
    if (!currentRoute) return availableVisits;
    const assignedVisitIds = new Set(currentRoute.stops.map(stop => stop.visitId));
    return availableVisits.filter(visit => !assignedVisitIds.has(visit.id));
  };

  const unassignedVisits = getUnassignedVisits();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
      {/* Available Visits */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                Visitas Disponibles
              </h3>
              <p className="text-sm text-gray-600">
                {unassignedVisits.length} visitas sin asignar
              </p>
            </div>
            
            <div className="text-xs text-gray-500">
              <span className="flex items-center">
                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path d="M10 4a2 2 0 100-4 2 2 0 000 4z" />
                  <path d="M10 20a2 2 0 100-4 2 2 0 000 4z" />
                </svg>
                Arrastra a la ruta
              </span>
            </div>
          </div>
        </div>
        
        <div
          className={`p-4 space-y-3 max-h-96 overflow-y-auto ${
            dragDropState.dropZone === 'unassigned' ? 'bg-blue-50 border-2 border-dashed border-blue-300' : ''
          }`}
          onDragOver={(e) => handleDragOver(e, 'unassigned')}
          onDrop={(e) => handleDrop(e, 'unassigned')}
        >
          {unassignedVisits.length === 0 ? (
            <div className="text-center py-8">
              <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <h4 className="text-sm font-medium text-gray-900 mb-1">
                Todas las visitas asignadas
              </h4>
              <p className="text-xs text-gray-500">
                Todas las visitas disponibles están en la ruta actual
              </p>
            </div>
          ) : (
            unassignedVisits.map((visit) => (
              <VisitCard
                key={visit.id}
                visit={visit}
                onDragStart={handleDragStart}
                onViewDetails={onVisitSelect}
                isDragging={dragDropState.draggedItem?.visit.id === visit.id}
              />
            ))
          )}
        </div>
      </div>

      {/* Current Route */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                Ruta Actual
              </h3>
              <p className="text-sm text-gray-600">
                {currentRoute ? `${currentRoute.stops.length} visitas programadas` : 'Sin ruta activa'}
              </p>
            </div>
            
            {currentRoute && (
              <div className="text-xs text-gray-500 text-right">
                <div className="flex items-center space-x-3">
                  <span className="flex items-center">
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                    {formatDistance(currentRoute.totalDistance)}
                  </span>
                  <span className="flex items-center">
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                    {formatDuration(currentRoute.totalTime)}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div
          className={`p-4 space-y-3 max-h-96 overflow-y-auto ${
            dragDropState.dropZone === 'route' ? 'bg-blue-50 border-2 border-dashed border-blue-300' : ''
          } ${isOptimizing ? 'opacity-50' : ''}`}
          onDragOver={(e) => handleDragOver(e, 'route')}
          onDrop={(e) => handleDrop(e, 'route')}
        >
          {!currentRoute || currentRoute.stops.length === 0 ? (
            <div className="text-center py-8">
              <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              <h4 className="text-sm font-medium text-gray-900 mb-1">
                Ruta vacía
              </h4>
              <p className="text-xs text-gray-500">
                Arrastra visitas aquí para crear una ruta
              </p>
            </div>
          ) : isOptimizing ? (
            <div className="text-center py-8">
              <div className="flex items-center justify-center mb-4">
                <svg className="animate-spin w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              </div>
              <h4 className="text-sm font-medium text-gray-900 mb-1">
                Optimizando ruta...
              </h4>
              <p className="text-xs text-gray-500">
                Calculando el mejor orden de visitas
              </p>
            </div>
          ) : (
            <>
              {/* Start location */}
              <div className="flex items-center p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex-shrink-0 w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                  🏠
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium text-green-800">
                    {currentRoute.startLocation.name || 'Punto de inicio'}
                  </p>
                  <p className="text-xs text-green-600">
                    {currentRoute.startLocation.address || 'Oficina central'}
                  </p>
                </div>
              </div>

              {/* Route stops */}
              {currentRoute.stops.map((stop, index) => (
                <div key={stop.visitId} className="relative">
                  {/* Travel info */}
                  {index > 0 && (stop.travelTime || stop.travelDistance) && (
                    <div className="flex items-center justify-center py-1">
                      <div className="flex items-center text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        {stop.travelTime ? formatDuration(stop.travelTime) : ''} • {stop.travelDistance ? formatDistance(stop.travelDistance) : ''}
                      </div>
                    </div>
                  )}

                  {/* Drop zone above each stop */}
                  <div
                    className={`h-2 ${
                      dragDropState.dropZone === 'route' && dragDropState.insertIndex === index
                        ? 'bg-blue-300 border-2 border-dashed border-blue-400 rounded'
                        : ''
                    }`}
                    onDragOver={(e) => handleDragOver(e, 'route', index)}
                    onDrop={(e) => handleDrop(e, 'route', index)}
                  />

                  <VisitCard
                    visit={stop.visit}
                    showOrder={stop.order}
                    onDragStart={handleDragStart}
                    onViewDetails={onVisitSelect}
                    isDragging={dragDropState.draggedItem?.visitId === stop.visitId}
                  />
                </div>
              ))}

              {/* Final drop zone */}
              <div
                className={`h-4 ${
                  dragDropState.dropZone === 'route' && 
                  (dragDropState.insertIndex === undefined || dragDropState.insertIndex >= currentRoute.stops.length)
                    ? 'bg-blue-300 border-2 border-dashed border-blue-400 rounded'
                    : ''
                }`}
                onDragOver={(e) => handleDragOver(e, 'route', currentRoute.stops.length)}
                onDrop={(e) => handleDrop(e, 'route', currentRoute.stops.length)}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}