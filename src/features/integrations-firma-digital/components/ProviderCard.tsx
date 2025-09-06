import React from 'react';
import { ProviderInfo, ComponentProps } from '../types';
import { formatEidas, statusColor, formatTimeAgo } from '../utils';

interface ProviderCardProps extends ComponentProps {
  provider: ProviderInfo;
}

export function ProviderCard({ provider, onConnect, onSettings }: ProviderCardProps) {
  const statusColors = statusColor(provider.status);
  
  const getStatusText = (status: string) => {
    switch (status) {
      case 'CONNECTED': return 'Conectado';
      case 'DISCONNECTED': return 'Desconectado';
      case 'TOKEN_EXPIRED': return 'Token Expirado';
      case 'ERROR': return 'Error';
      default: return status;
    }
  };

  const getActionButton = () => {
    if (provider.status === 'DISCONNECTED') {
      return (
        <button
          onClick={() => onConnect?.(provider.id)}
          className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Conectar
        </button>
      );
    }
    
    if (provider.status === 'TOKEN_EXPIRED') {
      return (
        <button
          onClick={() => onConnect?.(provider.id)}
          className="w-full rounded-md bg-yellow-600 px-4 py-2 text-sm font-medium text-white hover:bg-yellow-700"
        >
          Reconectar
        </button>
      );
    }
    
    return (
      <button
        onClick={() => onSettings?.(provider.id)}
        className="w-full rounded-md bg-gray-600 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
      >
        Configurar
      </button>
    );
  };

  return (
    <div className="rounded-lg border bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
      {/* Header with logo and status */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-md bg-gray-100 flex items-center justify-center">
            <img 
              src={provider.logo} 
              alt={provider.name}
              className="h-8 w-8 object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/logos/default-provider.svg';
              }}
            />
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900">{provider.name}</h3>
            <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${statusColors}`}>
              {getStatusText(provider.status)}
            </span>
          </div>
        </div>
      </div>
      
      {/* Description */}
      <p className="text-sm text-gray-600 mb-4">{provider.description}</p>
      
      {/* eIDAS Support */}
      <div className="mb-4">
        <div className="text-sm font-medium text-gray-700 mb-2">Soporte eIDAS:</div>
        <div className="flex gap-2">
          {(['SES', 'AES', 'QES'] as const).map((level) => {
            const supported = provider.supports[level.toLowerCase() as keyof typeof provider.supports];
            const eidasFormat = formatEidas(level);
            
            return (
              <span
                key={level}
                className={`inline-flex rounded px-2 py-1 text-xs font-medium ${
                  supported ? eidasFormat.color : 'bg-gray-100 text-gray-400'
                }`}
                title={supported ? eidasFormat.description : `${eidasFormat.description} - No soportado`}
              >
                {level}
              </span>
            );
          })}
        </div>
      </div>
      
      {/* Credits and usage info */}
      {provider.status === 'CONNECTED' && (
        <div className="mb-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Créditos:</span>
            <span className={`font-medium ${
              provider.credits <= 50 ? 'text-red-600' : 
              provider.credits <= 100 ? 'text-yellow-600' : 'text-green-600'
            }`}>
              {provider.credits}
            </span>
          </div>
          
          {provider.lastUsedAt && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Último uso:</span>
              <span className="text-gray-900">
                {formatTimeAgo(provider.lastUsedAt)}
              </span>
            </div>
          )}
        </div>
      )}
      
      {/* Action button */}
      <div className="mt-4">
        {getActionButton()}
      </div>
      
      {/* Test connection button for connected providers */}
      {provider.status === 'CONNECTED' && (
        <div className="mt-2">
          <button
            className="w-full rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            onClick={() => {
              // Test connection logic would go here
              console.log('Testing connection for', provider.id);
            }}
          >
            🔍 Probar Conexión
          </button>
        </div>
      )}
      
      {/* Connection type badge */}
      <div className="mt-3 pt-3 border-t border-gray-100">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-500">Tipo:</span>
          <span className="rounded bg-gray-100 px-2 py-1 font-mono text-gray-700">
            {provider.connectionType.toUpperCase()}
          </span>
        </div>
      </div>
    </div>
  );
}