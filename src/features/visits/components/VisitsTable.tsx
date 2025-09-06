import React from 'react';
import { Visit } from '../types';
import { 
  getStatusColor, 
  getStatusIcon, 
  getStatusLabel, 
  formatVisitDate, 
  formatFeedbackStars, 
  getFeedbackColor,
  isVisitToday,
  isVisitTomorrow,
  isVisitPast,
  getVisitDaysFromNow,
  getInitials
} from '../utils';

interface VisitsTableProps {
  visits: Visit[];
  selectedIds: Set<string>;
  onSelect: (id: string) => void;
  onSelectAll: () => void;
  onView: (visit: Visit) => void;
  onEdit: (visit: Visit) => void;
  onDelete: (id: string) => void;
  onConfirm: (visit: Visit) => void;
  onCancel: (visit: Visit) => void;
  onAddFeedback: (visit: Visit) => void;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  onSort: (field: string) => void;
  isLoading?: boolean;
}

export default function VisitsTable({
  visits,
  selectedIds,
  onSelect,
  onSelectAll,
  onView,
  onEdit,
  onDelete,
  onConfirm,
  onCancel,
  onAddFeedback,
  sortBy,
  sortOrder,
  onSort,
  isLoading = false
}: VisitsTableProps) {
  const getSortIcon = (field: string) => {
    if (sortBy !== field) {
      return <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
      </svg>;
    }
    
    return sortOrder === 'asc' 
      ? <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
        </svg>
      : <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>;
  };

  if (isLoading) {
    return (
      <div className="bg-white shadow rounded-lg">
        <div className="animate-pulse">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="h-4 bg-gray-300 rounded w-1/4"></div>
          </div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="px-6 py-4 border-b border-gray-100">
              <div className="flex items-center space-x-4">
                <div className="h-4 bg-gray-300 rounded w-4"></div>
                <div className="h-4 bg-gray-300 rounded w-1/4"></div>
                <div className="h-4 bg-gray-300 rounded w-1/3"></div>
                <div className="h-4 bg-gray-300 rounded w-1/6"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="relative px-6 py-3">
                <input
                  type="checkbox"
                  checked={visits.length > 0 && selectedIds.size === visits.length}
                  onChange={onSelectAll}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
              </th>
              
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => onSort('fechaCompleta')}
              >
                <div className="flex items-center space-x-1">
                  <span>Fecha/Hora</span>
                  {getSortIcon('fechaCompleta')}
                </div>
              </th>
              
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => onSort('clienteNombre')}
              >
                <div className="flex items-center space-x-1">
                  <span>Cliente</span>
                  {getSortIcon('clienteNombre')}
                </div>
              </th>
              
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => onSort('propertyTitle')}
              >
                <div className="flex items-center space-x-1">
                  <span>Inmueble</span>
                  {getSortIcon('propertyTitle')}
                </div>
              </th>
              
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => onSort('agenteNombre')}
              >
                <div className="flex items-center space-x-1">
                  <span>Agente</span>
                  {getSortIcon('agenteNombre')}
                </div>
              </th>
              
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => onSort('estado')}
              >
                <div className="flex items-center space-x-1">
                  <span>Estado</span>
                  {getSortIcon('estado')}
                </div>
              </th>
              
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Confirmación
              </th>
              
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => onSort('feedback')}
              >
                <div className="flex items-center space-x-1">
                  <span>Feedback</span>
                  {getSortIcon('feedback')}
                </div>
              </th>
              
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">Acciones</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {visits.map((visit) => {
              const isPast = isVisitPast(visit.fecha);
              const isToday = isVisitToday(visit.fecha);
              const isTomorrow = isVisitTomorrow(visit.fecha);
              const daysFromNow = getVisitDaysFromNow(visit.fecha);
              
              let rowClasses = 'hover:bg-gray-50';
              if (isToday) rowClasses += ' bg-blue-50';
              else if (isTomorrow) rowClasses += ' bg-yellow-50';
              else if (isPast && visit.estado !== 'hecha') rowClasses += ' bg-red-50';

              return (
                <tr key={visit.id} className={rowClasses}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(visit.id)}
                      onChange={() => onSelect(visit.id)}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {formatVisitDate(visit.fecha)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {visit.ventanaHoraria}
                      </div>
                      <div className="text-xs text-gray-400">
                        {isToday && '🔥 Hoy'}
                        {isTomorrow && '⚡ Mañana'}
                        {isPast && visit.estado !== 'hecha' && '⚠️ Vencida'}
                        {!isToday && !isTomorrow && !isPast && daysFromNow > 0 && `En ${daysFromNow} día${daysFromNow > 1 ? 's' : ''}`}
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8">
                        <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium text-xs">
                          {getInitials(visit.clienteNombre)}
                        </div>
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">
                          {visit.clienteNombre}
                        </div>
                        <div className="text-sm text-gray-500">
                          {visit.clienteEmail}
                        </div>
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4">
                    <div className="max-w-xs">
                      <div className="text-sm font-medium text-gray-900 truncate">
                        {visit.propertyTitle}
                      </div>
                      <div className="text-sm text-gray-500 truncate">
                        {visit.propertyAddress}
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8">
                        <div className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center text-white font-medium text-xs">
                          {getInitials(visit.agenteNombre)}
                        </div>
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">
                          {visit.agenteNombre}
                        </div>
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(visit.estado)}`}>
                      <span className="mr-1">{getStatusIcon(visit.estado)}</span>
                      {getStatusLabel(visit.estado)}
                    </span>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    {visit.confirmado ? (
                      <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                        ✓ Confirmada
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                        ⏳ Pendiente
                      </span>
                    )}
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    {visit.feedback ? (
                      <div className="flex items-center">
                        <span className={`text-sm ${getFeedbackColor(visit.feedback.score)}`}>
                          {formatFeedbackStars(visit.feedback.score)}
                        </span>
                        <span className="ml-1 text-xs text-gray-600">
                          ({visit.feedback.score}/5)
                        </span>
                      </div>
                    ) : visit.estado === 'hecha' ? (
                      <button
                        onClick={() => onAddFeedback(visit)}
                        className="text-blue-600 hover:text-blue-900 text-sm"
                      >
                        + Añadir feedback
                      </button>
                    ) : (
                      <span className="text-gray-400 text-sm">-</span>
                    )}
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => onView(visit)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Ver detalles"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                      
                      <button
                        onClick={() => onEdit(visit)}
                        className="text-indigo-600 hover:text-indigo-900"
                        title="Editar"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>

                      {visit.estado === 'pendiente' && (
                        <button
                          onClick={() => onConfirm(visit)}
                          className="text-green-600 hover:text-green-900"
                          title="Confirmar"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </button>
                      )}

                      {(visit.estado === 'pendiente' || visit.estado === 'confirmada') && (
                        <button
                          onClick={() => onCancel(visit)}
                          className="text-red-600 hover:text-red-900"
                          title="Cancelar"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                      
                      <button
                        onClick={() => onDelete(visit.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Eliminar"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      {visits.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3a2 2 0 012-2h8a2 2 0 012 2v4m-6 9l2 2 4-4M5 3v4M3 5h4M6 17v4a2 2 0 002 2h8a2 2 0 002-2v-4" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay visitas programadas</h3>
          <p className="text-gray-500 mb-4">Comienza programando la primera visita a una propiedad.</p>
        </div>
      )}
    </div>
  );
}