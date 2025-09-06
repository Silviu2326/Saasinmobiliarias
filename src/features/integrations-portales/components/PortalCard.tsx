import { useState } from "react";
import type { PortalInfo } from "../types";
import { formatStatus, formatDate } from "../utils";
import TestConnectionButton from "./TestConnectionButton";

interface PortalCardProps {
  portal: PortalInfo;
  onConnect: () => void;
  onSettings: () => void;
  onViewStats: () => void;
  onDisconnect: () => void;
}

const PortalCard = ({ 
  portal, 
  onConnect, 
  onSettings, 
  onViewStats,
  onDisconnect 
}: PortalCardProps) => {
  const [showActions, setShowActions] = useState(false);
  const statusInfo = formatStatus(portal.status);
  const isConnected = portal.status === "CONNECTED";
  const hasIssue = portal.status === "TOKEN_EXPIRED" || portal.status === "ERROR";

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow relative">
      {/* Portal Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="text-2xl">{portal.logo}</div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{portal.name}</h3>
            <p className="text-sm text-gray-500">{portal.description}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusInfo.bgColor} ${statusInfo.color}`}>
            {statusInfo.label}
          </span>
          
          <button
            onClick={() => setShowActions(!showActions)}
            className="p-1 text-gray-400 hover:text-gray-600 rounded"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Status Details */}
      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Modo:</span>
          <span className="text-gray-900">{portal.mode}</span>
        </div>
        
        {portal.apiVersion && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">API Version:</span>
            <span className="text-gray-900">v{portal.apiVersion}</span>
          </div>
        )}
        
        {portal.lastSyncAt && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Última Sync:</span>
            <span className="text-gray-900">{formatDate(portal.lastSyncAt)}</span>
          </div>
        )}
      </div>

      {/* Supported Actions */}
      {portal.supportedActions && portal.supportedActions.length > 0 && (
        <div className="mb-4">
          <div className="text-sm text-gray-500 mb-1">Acciones soportadas:</div>
          <div className="flex flex-wrap gap-1">
            {portal.supportedActions.map(action => (
              <span 
                key={action}
                className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-blue-100 text-blue-800"
              >
                {action}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Alert for issues */}
      {hasIssue && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
          <div className="flex">
            <div className="text-yellow-400 mr-2">⚠️</div>
            <div className="text-sm text-yellow-800">
              {portal.status === "TOKEN_EXPIRED" 
                ? "El token de acceso ha expirado. Reconecta el portal."
                : "Hay un problema con la conexión. Verifica la configuración."
              }
            </div>
          </div>
        </div>
      )}

      {/* Main Actions */}
      <div className="space-y-2">
        {isConnected ? (
          <>
            <button
              onClick={onSettings}
              className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              ⚙️ Configurar
            </button>
            
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={onViewStats}
                className="px-3 py-2 text-xs text-blue-700 bg-blue-50 rounded-md hover:bg-blue-100"
              >
                📊 Estadísticas
              </button>
              
              <TestConnectionButton 
                portalId={portal.id} 
                size="small"
              />
            </div>
          </>
        ) : (
          <button
            onClick={onConnect}
            className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            🔗 Conectar Portal
          </button>
        )}
      </div>

      {/* Actions Dropdown */}
      {showActions && (
        <div className="absolute top-16 right-4 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-10">
          {portal.websiteUrl && (
            <a
              href={portal.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              🌐 Visitar sitio web
            </a>
          )}
          
          {isConnected && (
            <>
              <button
                onClick={onViewStats}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                📈 Ver métricas detalladas
              </button>
              
              <button
                onClick={onDisconnect}
                className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                🔌 Desconectar
              </button>
            </>
          )}
          
          <button
            onClick={() => setShowActions(false)}
            className="block w-full text-left px-4 py-2 text-sm text-gray-500 hover:bg-gray-100 border-t border-gray-100"
          >
            ❌ Cerrar
          </button>
        </div>
      )}

      {/* Overlay to close dropdown */}
      {showActions && (
        <div 
          className="fixed inset-0 z-0" 
          onClick={() => setShowActions(false)}
        />
      )}
    </div>
  );
};

export default PortalCard;