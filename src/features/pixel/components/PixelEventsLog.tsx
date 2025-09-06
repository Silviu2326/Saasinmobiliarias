import React, { useState } from 'react';
import { 
  RefreshCw, 
  Filter, 
  Download, 
  Eye, 
  Calendar,
  Globe,
  User,
  Activity,
  ChevronDown,
  ExternalLink
} from 'lucide-react';
import { PixelEvent } from '../services/pixelService';

interface PixelEventsLogProps {
  events: PixelEvent[];
  isLoading: boolean;
  onRefresh: () => void;
}

const EVENT_COLORS = {
  PageView: 'bg-blue-100 text-blue-800',
  ViewContent: 'bg-green-100 text-green-800',
  Lead: 'bg-yellow-100 text-yellow-800',
  Purchase: 'bg-purple-100 text-purple-800',
  conversion: 'bg-red-100 text-red-800',
  AddToCart: 'bg-orange-100 text-orange-800',
  InitiateCheckout: 'bg-indigo-100 text-indigo-800',
  CompleteRegistration: 'bg-pink-100 text-pink-800'
} as const;

const EVENT_ICONS = {
  PageView: '👁️',
  ViewContent: '📄',
  Lead: '📝',
  Purchase: '💰',
  conversion: '🎯',
  AddToCart: '🛒',
  InitiateCheckout: '💳',
  CompleteRegistration: '✍️'
} as const;

export const PixelEventsLog: React.FC<PixelEventsLogProps> = ({
  events,
  isLoading,
  onRefresh
}) => {
  const [filter, setFilter] = useState<string>('all');
  const [expandedEvent, setExpandedEvent] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const eventTypes = Array.from(new Set(events.map(e => e.eventName)));
  
  const filteredEvents = events.filter(event => 
    filter === 'all' || event.eventName === filter
  );

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    let relativeTime = '';
    if (diffMins < 1) relativeTime = 'Ahora mismo';
    else if (diffMins < 60) relativeTime = `Hace ${diffMins} min`;
    else if (diffHours < 24) relativeTime = `Hace ${diffHours} h`;
    else relativeTime = `Hace ${diffDays} días`;

    return {
      relative: relativeTime,
      absolute: date.toLocaleString('es-ES')
    };
  };

  const getEventColor = (eventName: string) => {
    return EVENT_COLORS[eventName as keyof typeof EVENT_COLORS] || 'bg-gray-100 text-gray-800';
  };

  const getEventIcon = (eventName: string) => {
    return EVENT_ICONS[eventName as keyof typeof EVENT_ICONS] || '📊';
  };

  const handleExportEvents = () => {
    const csvContent = [
      ['Timestamp', 'Event', 'Source URL', 'Data'],
      ...filteredEvents.map(event => [
        event.timestamp,
        event.eventName,
        event.sourceUrl,
        JSON.stringify(event.data || {})
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pixel-events-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const EventStatistics = () => {
    const stats = eventTypes.map(type => ({
      name: type,
      count: filteredEvents.filter(e => e.eventName === type).length,
      icon: getEventIcon(type),
      color: getEventColor(type)
    }));

    const totalEvents = filteredEvents.length;

    return (
      <div className="bg-gray-50 rounded-lg p-4 mb-4">
        <h4 className="text-sm font-medium text-gray-900 mb-3">Resumen de Eventos (últimas 24h)</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {stats.map(stat => (
            <div key={stat.name} className="text-center">
              <div className="text-2xl mb-1">{stat.icon}</div>
              <div className="text-lg font-semibold text-gray-900">{stat.count}</div>
              <div className="text-xs text-gray-500">{stat.name}</div>
            </div>
          ))}
        </div>
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="text-center">
            <span className="text-sm text-gray-500">Total de eventos: </span>
            <span className="font-medium text-gray-900">{totalEvents}</span>
          </div>
        </div>
      </div>
    );
  };

  if (events.length === 0 && !isLoading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6">
          <div className="text-center py-12">
            <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay eventos registrados</h3>
            <p className="text-gray-500 text-sm mb-6">
              Este píxel aún no ha recibido ningún evento. Asegúrate de que esté correctamente instalado en tu sitio web.
            </p>
            <button
              onClick={onRefresh}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 mx-auto"
            >
              <RefreshCw className="w-4 h-4" />
              Actualizar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Registro de Eventos</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-3 py-2 text-sm text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              Filtros
              <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>
            
            <button
              onClick={handleExportEvents}
              disabled={filteredEvents.length === 0}
              className="px-3 py-2 text-sm text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Exportar
            </button>
            
            <button
              onClick={onRefresh}
              disabled={isLoading}
              className="px-3 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              {isLoading ? 'Cargando...' : 'Actualizar'}
            </button>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de evento
              </label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Todos los eventos ({events.length})</option>
                {eventTypes.map(type => (
                  <option key={type} value={type}>
                    {type} ({events.filter(e => e.eventName === type).length})
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      <div className="p-4">
        {/* Statistics */}
        <EventStatistics />

        {/* Events List */}
        <div className="space-y-3">
          {filteredEvents.map((event) => {
            const timeInfo = formatTimestamp(event.timestamp);
            const isExpanded = expandedEvent === event.id;
            
            return (
              <div
                key={event.id}
                className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="text-2xl">{getEventIcon(event.eventName)}</div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getEventColor(event.eventName)}`}>
                          {event.eventName}
                        </span>
                        <span className="text-sm text-gray-500">{timeInfo.relative}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                        <Globe className="w-4 h-4 flex-shrink-0" />
                        <a
                          href={event.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-blue-600 truncate flex items-center gap-1"
                        >
                          {event.sourceUrl}
                          <ExternalLink className="w-3 h-3 flex-shrink-0" />
                        </a>
                      </div>
                      
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Calendar className="w-3 h-3" />
                        {timeInfo.absolute}
                        {event.ip && (
                          <>
                            <span>•</span>
                            <span>{event.ip}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => setExpandedEvent(isExpanded ? null : event.id)}
                    className="p-2 text-gray-400 hover:text-gray-600 rounded-lg ml-2"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>

                {/* Expanded Details */}
                {isExpanded && event.data && Object.keys(event.data).length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h5 className="text-sm font-medium text-gray-900 mb-2">Datos del evento</h5>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <pre className="text-xs text-gray-600 overflow-x-auto">
                        {JSON.stringify(event.data, null, 2)}
                      </pre>
                    </div>
                    
                    {event.userAgent && (
                      <div className="mt-3">
                        <h6 className="text-xs font-medium text-gray-700 mb-1">User Agent</h6>
                        <p className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                          {event.userAgent}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
          
          {filteredEvents.length === 0 && filter !== 'all' && (
            <div className="text-center py-8">
              <Filter className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <h4 className="text-lg font-medium text-gray-900 mb-1">No hay eventos de tipo "{filter}"</h4>
              <p className="text-gray-500 text-sm">
                Prueba con un filtro diferente o espera a que lleguen más eventos.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};