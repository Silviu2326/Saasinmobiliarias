import React, { useState } from 'react';
import { useProviders } from '../hooks';
import { shouldShowCreditsAlert, calculateCreditsUsagePercentage } from '../utils';

export function CreditsUsageCard() {
  const { providers } = useProviders();
  const [showDetails, setShowDetails] = useState(false);

  const connectedProviders = providers.filter(p => p.status === 'CONNECTED');
  const totalCredits = connectedProviders.reduce((sum, p) => sum + p.credits, 0);
  const lowCreditProviders = connectedProviders.filter(p => shouldShowCreditsAlert(p.credits, 50));
  
  // Mock monthly usage data
  const mockUsageData = {
    usedThisMonth: 234,
    monthlyLimit: 1000,
    averagePerDay: 8.5,
    projectedUsage: 263
  };
  
  const usagePercentage = calculateCreditsUsagePercentage(mockUsageData.usedThisMonth, mockUsageData.monthlyLimit);
  
  const getStatusColor = () => {
    if (lowCreditProviders.length > 0 || usagePercentage > 80) {
      return 'border-red-200 bg-red-50';
    }
    if (usagePercentage > 60) {
      return 'border-yellow-200 bg-yellow-50';
    }
    return 'border-green-200 bg-green-50';
  };
  
  const getStatusIcon = () => {
    if (lowCreditProviders.length > 0 || usagePercentage > 80) {
      return '⚠️';
    }
    if (usagePercentage > 60) {
      return '🟡';
    }
    return '✅';
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowDetails(!showDetails)}
        className={`flex items-center gap-3 rounded-lg border px-4 py-3 transition-colors hover:bg-opacity-80 ${
          getStatusColor()
        }`}
      >
        <span className="text-lg">{getStatusIcon()}</span>
        <div className="text-left">
          <div className="text-sm font-medium text-gray-900">
            {totalCredits} Créditos
          </div>
          <div className="text-xs text-gray-600">
            {connectedProviders.length} proveedores activos
          </div>
        </div>
        <svg 
          className={`h-4 w-4 text-gray-400 transform transition-transform ${
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
          <div className="mb-4">
            <h4 className="font-medium text-gray-900">Uso de Créditos</h4>
            <p className="text-sm text-gray-600 mt-1">
              Resumen del consumo mensual de créditos por proveedor
            </p>
          </div>
          
          {/* Monthly usage summary */}
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Este mes</span>
              <span className="text-lg font-semibold text-gray-900">
                {mockUsageData.usedThisMonth} / {mockUsageData.monthlyLimit}
              </span>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
              <div 
                className={`h-2 rounded-full transition-all ${
                  usagePercentage > 80 ? 'bg-red-500' :
                  usagePercentage > 60 ? 'bg-yellow-500' :
                  'bg-green-500'
                }`}
                style={{ width: `${Math.min(usagePercentage, 100)}%` }}
              ></div>
            </div>
            
            <div className="flex justify-between text-xs text-gray-600">
              <span>{usagePercentage}% usado</span>
              <span>Promedio: {mockUsageData.averagePerDay}/día</span>
            </div>
          </div>
          
          {/* Per-provider breakdown */}
          <div className="space-y-3">
            <div className="text-sm font-medium text-gray-700">Por Proveedor:</div>
            
            {connectedProviders.map((provider) => {
              const isLow = shouldShowCreditsAlert(provider.credits, 50);
              
              return (
                <div key={provider.id} className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-2">
                    <img 
                      src={provider.logo} 
                      alt={provider.name}
                      className="h-6 w-6 object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/logos/default-provider.svg';
                      }}
                    />
                    <span className="text-sm font-medium text-gray-900">
                      {provider.name}
                    </span>
                  </div>
                  
                  <div className="text-right">
                    <div className={`text-sm font-medium ${
                      isLow ? 'text-red-600' : 'text-gray-900'
                    }`}>
                      {provider.credits}
                    </div>
                    <div className="text-xs text-gray-500">
                      €0.75/firma
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Alerts */}
          {lowCreditProviders.length > 0 && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 text-red-800 mb-1">
                <span>⚠️</span>
                <span className="text-sm font-medium">Créditos bajos</span>
              </div>
              <div className="text-sm text-red-700">
                {lowCreditProviders.length} proveedor{lowCreditProviders.length > 1 ? 'es' : ''} con menos de 50 créditos
              </div>
            </div>
          )}
          
          {/* Projected usage */}
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-blue-900">
                  Uso proyectado
                </div>
                <div className="text-xs text-blue-700">
                  Fin de mes estimado
                </div>
              </div>
              <div className="text-lg font-semibold text-blue-900">
                {mockUsageData.projectedUsage}
              </div>
            </div>
          </div>
          
          {/* Actions */}
          <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
            <button className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
              💳 Añadir Créditos
            </button>
            <button className="w-full rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
              📈 Ver Historial de Uso
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