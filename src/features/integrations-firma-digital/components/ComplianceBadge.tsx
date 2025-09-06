import React, { useState } from 'react';
import { useProviders } from '../hooks';
import { formatEidas } from '../utils';
import { EidasLevel } from '../types';

export function ComplianceBadge() {
  const { providers } = useProviders();
  const [showDetails, setShowDetails] = useState(false);

  // Calculate highest eIDAS level available
  const getHighestLevel = (): EidasLevel | null => {
    const connectedProviders = providers.filter(p => p.status === 'CONNECTED');
    
    if (connectedProviders.some(p => p.supports.qes)) return 'QES';
    if (connectedProviders.some(p => p.supports.aes)) return 'AES';
    if (connectedProviders.some(p => p.supports.ses)) return 'SES';
    
    return null;
  };
  
  const highestLevel = getHighestLevel();
  const connectedCount = providers.filter(p => p.status === 'CONNECTED').length;
  
  const getComplianceStatus = () => {
    if (!highestLevel || connectedCount === 0) {
      return {
        level: 'Sin Conexión',
        color: 'bg-gray-100 text-gray-800 border-gray-200',
        icon: '⚠️',
        description: 'No hay proveedores conectados'
      };
    }
    
    const eidasFormat = formatEidas(highestLevel);
    return {
      level: `eIDAS ${highestLevel}`,
      color: eidasFormat.color + ' border-current',
      icon: '🔒',
      description: `Máximo nivel disponible: ${eidasFormat.description}`
    };
  };
  
  const status = getComplianceStatus();
  
  return (
    <div className="relative">
      <button
        onClick={() => setShowDetails(!showDetails)}
        className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors hover:bg-opacity-80 ${
          status.color
        }`}
      >
        <span>{status.icon}</span>
        <span>{status.level}</span>
        <svg 
          className={`h-4 w-4 transform transition-transform ${
            showDetails ? 'rotate-180' : ''
          }`} 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {showDetails && (
        <div className="absolute right-0 top-full mt-2 w-80 rounded-lg border bg-white p-4 shadow-lg z-10">
          <div className="mb-3">
            <h4 className="font-medium text-gray-900">Estado de Cumplimiento eIDAS</h4>
            <p className="text-sm text-gray-600 mt-1">{status.description}</p>
          </div>
          
          {/* eIDAS Levels Checklist */}
          <div className="space-y-3">
            <div className="text-sm font-medium text-gray-700">Niveles Disponibles:</div>
            
            {(['QES', 'AES', 'SES'] as const).map((level) => {
              const supportingProviders = providers.filter(p => 
                p.status === 'CONNECTED' && 
                p.supports[level.toLowerCase() as keyof typeof p.supports]
              );
              
              const eidasFormat = formatEidas(level);
              const isSupported = supportingProviders.length > 0;
              
              return (
                <div key={level} className="flex items-center gap-3">
                  <div className={`h-4 w-4 rounded-full flex items-center justify-center ${
                    isSupported ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                  }`}>
                    {isSupported ? '✓' : '−'}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex rounded px-2 py-1 text-xs font-medium ${
                        isSupported ? eidasFormat.color : 'bg-gray-100 text-gray-400'
                      }`}>
                        {level}
                      </span>
                      <span className="text-sm text-gray-900">
                        {eidasFormat.description}
                      </span>
                    </div>
                    
                    {isSupported && (
                      <div className="text-xs text-gray-500 mt-1">
                        Soportado por: {supportingProviders.map(p => p.name).join(', ')}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Compliance Checklist */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="text-sm font-medium text-gray-700 mb-2">Checklist de Cumplimiento:</div>
            
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <span className={`h-3 w-3 rounded-full ${
                  connectedCount > 0 ? 'bg-green-500' : 'bg-gray-300'
                }`}></span>
                <span className={connectedCount > 0 ? 'text-green-700' : 'text-gray-500'}>
                  Proveedor conectado ({connectedCount} activos)
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <span className={`h-3 w-3 rounded-full ${
                  highestLevel ? 'bg-green-500' : 'bg-gray-300'
                }`}></span>
                <span className={highestLevel ? 'text-green-700' : 'text-gray-500'}>
                  Firma electrónica habilitada
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <span className={`h-3 w-3 rounded-full ${
                  providers.some(p => p.supports.aes || p.supports.qes) ? 'bg-green-500' : 'bg-gray-300'
                }`}></span>
                <span className={providers.some(p => p.supports.aes || p.supports.qes) ? 'text-green-700' : 'text-gray-500'}>
                  Firma avanzada/cualificada disponible
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-green-500"></span>
                <span className="text-green-700">
                  Trazabilidad y evidencias completas
                </span>
              </div>
            </div>
          </div>
          
          {/* Help link */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <button className="text-sm text-blue-600 hover:text-blue-800">
              📜 Ver guía de cumplimiento eIDAS
            </button>
          </div>
        </div>
      )}
      
      {/* Overlay to close details when clicking outside */}
      {showDetails && (
        <div 
          className="fixed inset-0 z-0" 
          onClick={() => setShowDetails(false)}
        />
      )}
    </div>
  );
}