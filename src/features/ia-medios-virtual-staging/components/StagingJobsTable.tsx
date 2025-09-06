import React from 'react';
import { Eye, Download, Copy, X, Loader2 } from 'lucide-react';
import { useJobsQuery, useCancelJob } from '../hooks';
import { getStatusLabel, getStatusColor, getRoomTypeLabel, downloadImage } from '../utils';
import type { JobStatus, StageJob } from '../types';

interface StagingJobsTableProps {
  statusFilter?: JobStatus;
  onJobView?: (job: StageJob) => void;
  limit?: number;
}

export const StagingJobsTable: React.FC<StagingJobsTableProps> = ({
  statusFilter,
  onJobView,
  limit,
}) => {
  const { data: jobs, isLoading, error } = useJobsQuery(statusFilter);
  const cancelJob = useCancelJob();

  const handleDownload = async (job: StageJob) => {
    if (!job.resultUrl) return;
    
    try {
      const filename = `staging_${job.roomType}_${job.style}_${new Date(job.createdAt).getTime()}.jpg`;
      await downloadImage(job.resultUrl, filename);
    } catch (error) {
      console.error('Error downloading:', error);
    }
  };

  const handleDuplicate = (job: StageJob) => {
    const params = new URLSearchParams({
      photoUrl: job.inputUrl,
      roomType: job.roomType,
      style: job.style,
    });
    
    window.open(`/ia-medios/virtual-staging?${params}`, '_blank');
  };

  const handleCancel = async (jobId: string) => {
    if (confirm('¿Estás seguro de que quieres cancelar este trabajo?')) {
      await cancelJob.mutateAsync(jobId);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        <span className="ml-2 text-gray-600">Cargando trabajos...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-sm text-red-800">Error al cargar los trabajos</p>
      </div>
    );
  }

  const displayJobs = limit ? jobs?.slice(0, limit) : jobs;

  if (!displayJobs?.length) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <Eye className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No hay trabajos
        </h3>
        <p className="text-gray-600">
          {statusFilter ? `No hay trabajos con estado "${getStatusLabel(statusFilter)}"` : 'Aún no has creado ningún trabajo'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
        <table className="min-w-full divide-y divide-gray-300">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                Trabajo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                Estancia
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                Estilo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                Creado
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wide">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {displayJobs.map((job) => (
              <tr key={job.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <img
                        src={job.inputUrl}
                        alt="Input"
                        className="h-10 w-10 rounded-lg object-cover"
                        onError={(e) => {
                          e.currentTarget.src = '/images/placeholder.jpg';
                        }}
                      />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {job.id.substring(0, 8)}...
                      </div>
                      <div className="text-sm text-gray-500">
                        {job.resolution} • {job.items.length} elementos
                      </div>
                    </div>
                  </div>
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {getRoomTypeLabel(job.roomType)}
                  </div>
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 capitalize">
                    {job.style}
                  </div>
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(job.status)}`}>
                    {job.status === 'processing' && (
                      <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                    )}
                    {getStatusLabel(job.status)}
                  </span>
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(job.createdAt).toLocaleDateString('es-ES', {
                    day: '2-digit',
                    month: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end gap-2">
                    {job.status === 'done' && job.resultUrl && (
                      <>
                        <button
                          onClick={() => onJobView?.(job)}
                          className="text-blue-600 hover:text-blue-700 p-1"
                          title="Ver resultado"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDownload(job)}
                          className="text-green-600 hover:text-green-700 p-1"
                          title="Descargar"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </>
                    )}
                    
                    <button
                      onClick={() => handleDuplicate(job)}
                      className="text-purple-600 hover:text-purple-700 p-1"
                      title="Duplicar con otro estilo"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    
                    {(job.status === 'queued' || job.status === 'processing') && (
                      <button
                        onClick={() => handleCancel(job.id)}
                        disabled={cancelJob.isPending}
                        className="text-red-600 hover:text-red-700 p-1 disabled:opacity-50"
                        title="Cancelar"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {limit && jobs && jobs.length > limit && (
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Mostrando {limit} de {jobs.length} trabajos
          </p>
        </div>
      )}
    </div>
  );
};

const getStatusBadgeColor = (status: JobStatus): string => {
  const colors = {
    'queued': 'bg-yellow-100 text-yellow-800',
    'processing': 'bg-blue-100 text-blue-800',
    'done': 'bg-green-100 text-green-800',
    'failed': 'bg-red-100 text-red-800'
  };
  
  return colors[status] || 'bg-gray-100 text-gray-800';
};