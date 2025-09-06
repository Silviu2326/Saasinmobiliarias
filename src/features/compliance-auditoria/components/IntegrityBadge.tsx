import { useState } from 'react';
import { Shield, RefreshCw, CheckCircle, AlertTriangle, Hash } from 'lucide-react';
import { useIntegrityStatus } from '../hooks';
import { formatDate, formatRelativeTime } from '../utils';

export function IntegrityBadge() {
  const { data, isLoading, error, isVerifying, verifyIntegrity } = useIntegrityStatus();
  const [lastVerification, setLastVerification] = useState<any>(null);

  const handleVerify = async () => {
    try {
      const result = await verifyIntegrity();
      setLastVerification(result);
    } catch (err) {
      console.error('Verification failed:', err);
    }
  };

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
          <span className="text-sm">Error al cargar estado de integridad</span>
        </div>
      </div>
    );
  }

  const getStatusInfo = () => {
    if (lastVerification && !lastVerification.ok) {
      return {
        icon: AlertTriangle,
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        label: 'Integridad Comprometida',
        description: 'Se detectaron inconsistencias en la cadena',
      };
    }
    
    if (!data.chained) {
      return {
        icon: AlertTriangle,
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200',
        label: 'No Encadenado',
        description: 'Los eventos no están encadenados criptográficamente',
      };
    }

    if (data.ok) {
      return {
        icon: CheckCircle,
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        label: 'Integridad Verificada',
        description: 'Cadena de eventos íntegra y verificada',
      };
    }

    return {
      icon: AlertTriangle,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      label: 'Verificación Pendiente',
      description: 'Requiere verificación manual',
    };
  };

  const status = getStatusInfo();
  const StatusIcon = status.icon;

  return (
    <div className={`rounded-lg shadow p-4 border ${status.bgColor} ${status.borderColor}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <StatusIcon className={`h-5 w-5 ${status.color}`} />
          <h3 className="font-medium">Integridad del Log</h3>
        </div>

        <button
          onClick={handleVerify}
          disabled={isVerifying}
          className="flex items-center gap-1 px-3 py-1 text-sm border rounded hover:bg-white disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${isVerifying ? 'animate-spin' : ''}`} />
          {isVerifying ? 'Verificando...' : 'Verificar'}
        </button>
      </div>

      <div className="space-y-3">
        <div>
          <div className={`text-sm font-medium ${status.color} mb-1`}>
            {status.label}
          </div>
          <div className="text-xs text-gray-600">
            {status.description}
          </div>
        </div>

        {data.chained && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Eventos verificados:</span>
              <span className="font-medium">
                {data.verifiedEvents.toLocaleString()} / {data.totalEvents.toLocaleString()}
              </span>
            </div>

            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${
                  data.verifiedEvents === data.totalEvents
                    ? 'bg-green-500'
                    : 'bg-blue-500'
                }`}
                style={{ 
                  width: `${(data.verifiedEvents / data.totalEvents) * 100}%` 
                }}
              />
            </div>
          </div>
        )}

        {data.lastVerifiedAt && (
          <div className="text-xs text-gray-500">
            <div>Última verificación:</div>
            <div>{formatDate(data.lastVerifiedAt)}</div>
            <div>({formatRelativeTime(data.lastVerifiedAt)})</div>
          </div>
        )}

        {data.lastBlockHash && (
          <div className="text-xs text-gray-500">
            <div className="flex items-center gap-1 mb-1">
              <Hash className="h-3 w-3" />
              Último hash de bloque:
            </div>
            <code className="text-xs bg-gray-100 px-2 py-1 rounded break-all">
              {data.lastBlockHash}
            </code>
          </div>
        )}

        {data.brokenChain && (
          <div className="pt-2 border-t border-red-200">
            <div className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm font-medium">Cadena Rota</span>
            </div>
            <div className="text-xs text-red-600 mt-1">
              Se detectó una discontinuidad en la cadena de hashes
            </div>
          </div>
        )}

        {lastVerification && (
          <div className="pt-2 border-t">
            <div className="text-xs text-gray-600">
              <div>Última verificación manual:</div>
              <div className="flex items-center gap-1 mt-1">
                {lastVerification.ok ? (
                  <CheckCircle className="h-3 w-3 text-green-500" />
                ) : (
                  <AlertTriangle className="h-3 w-3 text-red-500" />
                )}
                <span>{lastVerification.details}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}