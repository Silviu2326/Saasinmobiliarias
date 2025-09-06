import { useState } from 'react';
import { Download, FileText, Calendar, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuditExport } from '../hooks';
import { buildCsv, buildJson, downloadFile, formatDate } from '../utils';
import type { AuditQuery, AuditEvent } from '../types';

interface ExportBarProps {
  filters: AuditQuery;
  events: AuditEvent[];
  selectedEvents: Set<string>;
  onScheduleReport: () => void;
}

export function ExportBar({ filters, events, selectedEvents, onScheduleReport }: ExportBarProps) {
  const { jobs, isCreating, createExport } = useAuditExport();
  const [showJobs, setShowJobs] = useState(false);

  const handleExport = async (format: 'csv' | 'json') => {
    if (selectedEvents.size > 0) {
      // Exportar solo eventos seleccionados
      const selectedEventsList = events.filter(e => selectedEvents.has(e.id));
      const content = format === 'csv' ? buildCsv(selectedEventsList) : buildJson(selectedEventsList);
      const filename = `audit-selected-${new Date().toISOString().split('T')[0]}.${format}`;
      downloadFile(content, filename, format === 'csv' ? 'text/csv' : 'application/json');
    } else {
      // Crear job de exportación para todos los filtros
      await createExport(filters, format);
      setShowJobs(true);
    }
  };

  const getJobStatusIcon = (status: string) => {
    switch (status) {
      case 'done':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'processing':
        return <div className="h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h3 className="font-medium">Exportar Datos</h3>
          {selectedEvents.size > 0 && (
            <span className="text-sm text-blue-600">
              {selectedEvents.size} evento{selectedEvents.size !== 1 ? 's' : ''} seleccionado{selectedEvents.size !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleExport('csv')}
              disabled={isCreating}
              className="flex items-center gap-2 px-3 py-2 text-sm border rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              <FileText className="h-4 w-4" />
              CSV
            </button>
            
            <button
              onClick={() => handleExport('json')}
              disabled={isCreating}
              className="flex items-center gap-2 px-3 py-2 text-sm border rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              <Download className="h-4 w-4" />
              JSON
            </button>
          </div>

          <div className="h-4 border-l border-gray-300" />

          <button
            onClick={onScheduleReport}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
          >
            <Calendar className="h-4 w-4" />
            Programar Informe
          </button>

          {jobs.length > 0 && (
            <button
              onClick={() => setShowJobs(!showJobs)}
              className="flex items-center gap-2 px-3 py-2 text-sm border rounded-lg hover:bg-gray-50"
            >
              <Clock className="h-4 w-4" />
              Jobs ({jobs.length})
            </button>
          )}
        </div>
      </div>

      {showJobs && jobs.length > 0 && (
        <div className="mt-4 pt-4 border-t">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Trabajos de Exportación</h4>
          <div className="space-y-2">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="flex items-center justify-between p-3 border rounded-lg bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  {getJobStatusIcon(job.status)}
                  <div>
                    <div className="text-sm font-medium">
                      Exportación {job.format.toUpperCase()}
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatDate(job.createdAt)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {job.status === 'done' && job.url && (
                    <a
                      href={job.url}
                      download
                      className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      Descargar
                    </a>
                  )}
                  
                  {job.status === 'failed' && job.error && (
                    <span className="text-xs text-red-600" title={job.error}>
                      Error
                    </span>
                  )}

                  <span className="text-xs text-gray-500 capitalize">
                    {job.status === 'done' ? 'Completado' :
                     job.status === 'processing' ? 'Procesando' :
                     job.status === 'failed' ? 'Falló' : 'En cola'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedEvents.size === 0 && (
        <div className="mt-3 text-xs text-gray-500">
          💡 Selecciona eventos específicos para exportación inmediata, o usa los botones para exportar todos los resultados filtrados.
        </div>
      )}
    </div>
  );
}