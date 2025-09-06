import { useSyncQueue } from "../hooks";
import { formatJobStatus, formatDate, formatDuration } from "../utils";

interface SyncStatusPanelProps {
  portalId: string;
}

const SyncStatusPanel = ({ portalId }: SyncStatusPanelProps) => {
  const { jobs, loading, error, retryFailed } = useSyncQueue(portalId);

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 bg-gray-200 rounded"></div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  const pendingJobs = jobs.filter(job => job.status === "pending");
  const failedJobs = jobs.filter(job => job.status === "error");
  const successJobs = jobs.filter(job => job.status === "ok");

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <div className="text-2xl font-bold text-green-600">{successJobs.length}</div>
          <div className="text-sm text-green-700">Exitosos</div>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <div className="text-2xl font-bold text-yellow-600">{pendingJobs.length}</div>
          <div className="text-sm text-yellow-700">Pendientes</div>
        </div>
        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
          <div className="text-2xl font-bold text-red-600">{failedJobs.length}</div>
          <div className="text-sm text-red-700">Fallidos</div>
        </div>
      </div>

      {/* Actions */}
      {failedJobs.length > 0 && (
        <div className="flex space-x-3">
          <button
            onClick={retryFailed}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            🔄 Reintentar Fallidos ({failedJobs.length})
          </button>
        </div>
      )}

      {/* Jobs List */}
      <div className="bg-white rounded-lg border">
        <div className="px-6 py-4 border-b border-gray-200">
          <h4 className="text-lg font-semibold">Jobs Recientes</h4>
        </div>
        
        {jobs.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No hay jobs de sincronización recientes</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {jobs.slice(0, 10).map((job) => {
              const statusInfo = formatJobStatus(job.status);
              return (
                <div key={job.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="text-lg">{statusInfo.icon}</div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {job.action.toUpperCase()} {job.entity} {job.ref}
                        </div>
                        <div className="text-sm text-gray-600">
                          {formatDate(job.at)}
                          {job.durationMs && ` • ${formatDuration(job.durationMs)}`}
                          {job.attempts > 1 && ` • ${job.attempts} intentos`}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className={`text-sm font-medium ${statusInfo.color}`}>
                        {statusInfo.label}
                      </div>
                      {job.message && (
                        <div className="text-xs text-gray-500 max-w-xs truncate">
                          {job.message}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default SyncStatusPanel;