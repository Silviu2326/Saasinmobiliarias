import { Clock, AlertTriangle, Shield, Info } from 'lucide-react';
import { useRetentionStatus } from '../hooks';
import { formatDate, formatRelativeTime } from '../utils';

export function RetentionStatus() {
  const { data, isLoading, error } = useRetentionStatus();

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center gap-2 text-red-600">
          <AlertTriangle className="h-4 w-4" />
          <span className="text-sm">Error al cargar estado de retención</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex items-center gap-2 mb-3">
        <Clock className="h-5 w-5 text-blue-500" />
        <h3 className="font-medium">Política de Retención</h3>
      </div>

      <div className="space-y-3">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Política actual:</span>
            <span className="text-sm font-medium">{data.policy}</span>
          </div>
          
          <div className="text-xs text-gray-500 mt-1">
            Logs conservados durante {data.retentionDays} días
          </div>
        </div>

        {data.nextPurgeAt && (
          <div className="pt-2 border-t">
            <div className="flex items-center gap-2 mb-2">
              <Info className="h-4 w-4 text-amber-500" />
              <span className="text-sm font-medium text-amber-700">
                Próximo purgado
              </span>
            </div>
            
            <div className="text-sm text-gray-600">
              <div>{formatDate(data.nextPurgeAt)}</div>
              <div className="text-xs text-gray-500">
                {formatRelativeTime(data.nextPurgeAt)}
              </div>
            </div>

            {data.itemsForPurge > 0 && (
              <div className="mt-2 text-xs text-amber-600">
                {data.itemsForPurge.toLocaleString()} eventos serán eliminados
              </div>
            )}
          </div>
        )}

        {data.legalHold && (
          <div className="pt-2 border-t">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="h-4 w-4 text-red-500" />
              <span className="text-sm font-medium text-red-700">
                Retención Legal Activa
              </span>
            </div>
            
            {data.legalHoldReason && (
              <div className="text-xs text-gray-600 bg-red-50 p-2 rounded">
                {data.legalHoldReason}
              </div>
            )}
            
            <div className="text-xs text-red-600 mt-1">
              ⚠️ Purgado automático suspendido
            </div>
          </div>
        )}

        <div className="pt-2 border-t text-xs text-gray-500">
          Los logs eliminados no pueden ser recuperados. La retención cumple con normativas RGPD y SOX.
        </div>
      </div>
    </div>
  );
}