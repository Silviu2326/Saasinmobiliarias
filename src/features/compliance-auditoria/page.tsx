import { useState, useEffect } from 'react';
import { Activity, Search, Filter, Settings } from 'lucide-react';
import { useAuditQuery } from './hooks';
import { queryToUrlParams, urlParamsToQuery } from './utils';
import {
  AuditFilters,
  AuditTable,
  AuditDetailsDrawer,
  ExportBar,
  RetentionStatus,
  IntegrityBadge,
  SchedulerDialog,
} from './components';
import type { AuditEvent, AuditQuery } from './types';

export default function AuditoriaPage() {
  const [selectedEvent, setSelectedEvent] = useState<AuditEvent | null>(null);
  const [selectedEvents, setSelectedEvents] = useState<Set<string>>(new Set());
  const [showScheduler, setShowScheduler] = useState(false);
  const [showFilters, setShowFilters] = useState(true);

  // Inicializar filtros desde URL
  const [initialFilters] = useState<AuditQuery>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return urlParamsToQuery(params);
    }
    return { page: 1, size: 25 };
  });

  const { data, isLoading, fetchEvents, query } = useAuditQuery(initialFilters);

  // Sincronizar con URL
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = queryToUrlParams(query);
      const newUrl = `${window.location.pathname}?${params.toString()}`;
      window.history.replaceState({}, '', newUrl);
    }
  }, [query]);

  const handleFiltersChange = (newFilters: AuditQuery) => {
    fetchEvents(newFilters);
  };

  const handleRowClick = (event: AuditEvent) => {
    setSelectedEvent(event);
  };

  const handleSelectEvent = (eventId: string) => {
    const newSelection = new Set(selectedEvents);
    if (newSelection.has(eventId)) {
      newSelection.delete(eventId);
    } else {
      newSelection.add(eventId);
    }
    setSelectedEvents(newSelection);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked && data?.items) {
      setSelectedEvents(new Set(data.items.map(event => event.id)));
    } else {
      setSelectedEvents(new Set());
    }
  };

  const handlePageChange = (page: number) => {
    fetchEvents({ ...query, page });
  };

  const handleSort = (sort: string) => {
    fetchEvents({ ...query, sort, page: 1 });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Activity className="h-8 w-8 text-blue-600" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Auditoría & Trazabilidad
                  </h1>
                  <p className="text-sm text-gray-600 mt-1">
                    Centro de auditoría con búsqueda avanzada, trazabilidad e integridad de eventos del sistema
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`px-4 py-2 border rounded-lg hover:bg-gray-50 flex items-center gap-2 ${
                    showFilters ? 'bg-gray-50' : ''
                  }`}
                >
                  <Filter className="h-4 w-4" />
                  Filtros
                </button>
                <button
                  onClick={() => setShowScheduler(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                  <Settings className="h-4 w-4" />
                  Configurar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Barra de estado */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <RetentionStatus />
          <IntegrityBadge />
        </div>

        {/* Filtros */}
        {showFilters && (
          <div className="mb-6">
            <AuditFilters
              initialFilters={query}
              onFiltersChange={handleFiltersChange}
              isLoading={isLoading}
            />
          </div>
        )}

        {/* Barra de exportación */}
        <div className="mb-6">
          <ExportBar
            filters={query}
            events={data?.items || []}
            selectedEvents={selectedEvents}
            onScheduleReport={() => setShowScheduler(true)}
          />
        </div>

        {/* Layout principal */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className={`${selectedEvent ? 'xl:col-span-2' : 'xl:col-span-3'}`}>
            <AuditTable
              events={data?.items || []}
              isLoading={isLoading}
              total={data?.total || 0}
              page={data?.page || 1}
              totalPages={data?.totalPages || 1}
              onPageChange={handlePageChange}
              onSort={handleSort}
              sort={query.sort}
              selectedEvents={selectedEvents}
              onSelectEvent={handleSelectEvent}
              onSelectAll={handleSelectAll}
              onRowClick={handleRowClick}
            />
          </div>

          {selectedEvent && (
            <div className="xl:col-span-1">
              <div className="sticky top-6">
                <AuditDetailsDrawer
                  event={selectedEvent}
                  isOpen={!!selectedEvent}
                  onClose={() => setSelectedEvent(null)}
                />
              </div>
            </div>
          )}
        </div>

        {/* Drawer para móvil */}
        {selectedEvent && (
          <div className="xl:hidden">
            <AuditDetailsDrawer
              event={selectedEvent}
              isOpen={!!selectedEvent}
              onClose={() => setSelectedEvent(null)}
            />
          </div>
        )}

        {/* Dialog del programador */}
        <SchedulerDialog
          isOpen={showScheduler}
          onClose={() => setShowScheduler(false)}
          filters={query}
        />
      </div>
    </div>
  );
}