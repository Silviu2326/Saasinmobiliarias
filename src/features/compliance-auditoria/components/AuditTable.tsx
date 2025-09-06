import { useState } from 'react';
import { ChevronUp, ChevronDown, Clock, User, Activity, AlertTriangle } from 'lucide-react';
import { formatDate, formatSeverity, formatResult } from '../utils';
import type { AuditEvent, AuditQuery } from '../types';

interface AuditTableProps {
  events: AuditEvent[];
  isLoading?: boolean;
  total: number;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onSort: (field: string) => void;
  sort?: string;
  selectedEvents: Set<string>;
  onSelectEvent: (eventId: string) => void;
  onSelectAll: (checked: boolean) => void;
  onRowClick: (event: AuditEvent) => void;
}

export function AuditTable({
  events,
  isLoading,
  total,
  page,
  totalPages,
  onPageChange,
  onSort,
  sort = '-at',
  selectedEvents,
  onSelectEvent,
  onSelectAll,
  onRowClick,
}: AuditTableProps) {
  const [sortField, sortDirection] = sort.startsWith('-') 
    ? [sort.substring(1), 'desc'] 
    : [sort, 'asc'];

  const SortIcon = ({ field }: { field: string }) => {
    if (sortField !== field) return null;
    return sortDirection === 'desc' 
      ? <ChevronDown className="h-4 w-4" />
      : <ChevronUp className="h-4 w-4" />;
  };

  const handleSort = (field: string) => {
    const newDirection = sortField === field && sortDirection === 'asc' ? 'desc' : 'asc';
    onSort(newDirection === 'desc' ? `-${field}` : field);
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="h-12 bg-gray-100 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Eventos de Auditoría</h3>
          <span className="text-sm text-gray-600">
            {total} evento{total !== 1 ? 's' : ''} encontrado{total !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left">
                <input
                  type="checkbox"
                  checked={events.length > 0 && events.every(e => selectedEvents.has(e.id))}
                  onChange={(e) => onSelectAll(e.target.checked)}
                  className="rounded"
                />
              </th>
              {[
                { field: 'at', label: 'Fecha/Hora' },
                { field: 'actor', label: 'Actor' },
                { field: 'origin', label: 'Origen' },
                { field: 'entity', label: 'Entidad' },
                { field: 'action', label: 'Acción' },
                { field: 'severity', label: 'Severidad' },
                { field: 'result', label: 'Resultado' },
              ].map(({ field, label }) => (
                <th
                  key={field}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort(field)}
                >
                  <div className="flex items-center gap-2">
                    {label}
                    <SortIcon field={field} />
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {events.map((event) => {
              const severity = formatSeverity(event.severity);
              const result = formatResult(event.result);
              
              return (
                <tr
                  key={event.id}
                  className={`hover:bg-gray-50 cursor-pointer ${
                    selectedEvents.has(event.id) ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => onRowClick(event)}
                >
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedEvents.has(event.id)}
                      onChange={(e) => {
                        e.stopPropagation();
                        onSelectEvent(event.id);
                      }}
                      className="rounded"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      {formatDate(event.at)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <div>
                        <div className="font-medium">{event.actor}</div>
                        {event.role && (
                          <div className="text-gray-500 text-xs">{event.role}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      event.origin === 'web' ? 'bg-blue-100 text-blue-800' :
                      event.origin === 'api' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {event.origin.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div>
                      <div className="font-medium">{event.entity}</div>
                      {event.ref && (
                        <div className="text-gray-500 text-xs">{event.ref}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4 text-gray-400" />
                      {event.action}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 py-1 text-xs rounded-full ${severity.bgColor} ${severity.color}`}>
                      {severity.label}
                      {event.severity === 'high' && (
                        <AlertTriangle className="inline h-3 w-3 ml-1" />
                      )}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 py-1 text-xs rounded-full ${result.bgColor} ${result.color}`}>
                      {result.label}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {events.length === 0 && (
        <div className="p-8 text-center text-gray-500">
          <Activity className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>No se encontraron eventos con los filtros aplicados</p>
        </div>
      )}

      {totalPages > 1 && (
        <div className="px-6 py-4 border-t bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Mostrando {((page - 1) * 25) + 1} a {Math.min(page * 25, total)} de {total} eventos
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => onPageChange(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-3 py-1 border rounded text-sm hover:bg-gray-100 disabled:opacity-50"
              >
                Anterior
              </button>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = i + 1;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => onPageChange(pageNum)}
                      className={`px-3 py-1 text-sm rounded ${
                        page === pageNum
                          ? 'bg-blue-600 text-white'
                          : 'hover:bg-gray-100'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              <button
                onClick={() => onPageChange(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="px-3 py-1 border rounded text-sm hover:bg-gray-100 disabled:opacity-50"
              >
                Siguiente
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}