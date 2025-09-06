import React, { useState } from 'react';
import { useProviders } from '../hooks';

export function TestConnectionButton() {
  const { providers, testConnection } = useProviders();
  const [testing, setTesting] = useState<string | null>(null);
  const [results, setResults] = useState<Record<string, any>>({});
  const [showResults, setShowResults] = useState(false);

  const connectedProviders = providers.filter(p => p.status === 'CONNECTED');

  const handleTestAll = async () => {
    if (connectedProviders.length === 0) return;
    
    setTesting('all');
    setResults({});
    setShowResults(true);
    
    const testResults: Record<string, any> = {};
    
    for (const provider of connectedProviders) {
      try {
        const result = await testConnection(provider.id);
        testResults[provider.id] = {
          ...result,
          providerName: provider.name,
          testedAt: new Date().toISOString()
        };
      } catch (error) {
        testResults[provider.id] = {
          success: false,
          error: error instanceof Error ? error.message : 'Test failed',
          providerName: provider.name,
          testedAt: new Date().toISOString()
        };
      }
    }
    
    setResults(testResults);
    setTesting(null);
  };

  const handleTestSingle = async (providerId: string) => {
    setTesting(providerId);
    
    try {
      const result = await testConnection(providerId);
      const provider = providers.find(p => p.id === providerId);
      
      setResults(prev => ({
        ...prev,
        [providerId]: {
          ...result,
          providerName: provider?.name,
          testedAt: new Date().toISOString()
        }
      }));
      setShowResults(true);
    } catch (error) {
      setResults(prev => ({
        ...prev,
        [providerId]: {
          success: false,
          error: error instanceof Error ? error.message : 'Test failed',
          providerName: providers.find(p => p.id === providerId)?.name,
          testedAt: new Date().toISOString()
        }
      }));
      setShowResults(true);
    }
    
    setTesting(null);
  };

  if (connectedProviders.length === 0) {
    return (
      <button 
        disabled
        className="flex items-center gap-2 rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-400 cursor-not-allowed"
      >
        <span>🔍</span>
        <span>Probar Conexiones</span>
      </button>
    );
  }

  return (
    <div className="relative">
      <div className="flex items-center gap-2">
        <button
          onClick={handleTestAll}
          disabled={testing !== null}
          className="flex items-center gap-2 rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className={testing === 'all' ? 'animate-spin' : ''}>
            {testing === 'all' ? '♾️' : '🔍'}
          </span>
          <span>
            {testing === 'all' ? 'Probando...' : 'Probar Conexiones'}
          </span>
        </button>
        
        {showResults && Object.keys(results).length > 0 && (
          <button
            onClick={() => setShowResults(!showResults)}
            className="flex items-center gap-1 rounded-md bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
          >
            <span>📄</span>
            <span>Resultados</span>
            <svg 
              className={`h-4 w-4 transform transition-transform ${
                showResults ? 'rotate-180' : ''
              }`} 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        )}
      </div>
      
      {showResults && Object.keys(results).length > 0 && (
        <div className="absolute right-0 top-full mt-2 w-96 rounded-lg border bg-white p-4 shadow-lg z-10">
          <div className="mb-4">
            <h4 className="font-medium text-gray-900">Resultados de Pruebas de Conexión</h4>
            <p className="text-sm text-gray-600 mt-1">
              Estado de las conexiones con los proveedores
            </p>
          </div>
          
          <div className="space-y-3">
            {Object.entries(results).map(([providerId, result]: [string, any]) => {
              const isSuccess = result.success;
              const provider = providers.find(p => p.id === providerId);
              
              return (
                <div key={providerId} className={`rounded-lg p-3 border ${
                  isSuccess ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <img 
                        src={provider?.logo || '/logos/default-provider.svg'} 
                        alt={result.providerName}
                        className="h-5 w-5 object-contain"
                      />
                      <span className="font-medium text-gray-900">
                        {result.providerName}
                      </span>
                    </div>
                    
                    <div className={`flex items-center gap-1 text-sm font-medium ${
                      isSuccess ? 'text-green-700' : 'text-red-700'
                    }`}>
                      <span>{isSuccess ? '✅' : '❌'}</span>
                      <span>{isSuccess ? 'Conectado' : 'Error'}</span>
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-600">
                    {isSuccess ? (
                      <div className="space-y-1">
                        {result.latency && (
                          <div>Latencia: {result.latency}ms</div>
                        )}
                        <div>Probado: {new Date(result.testedAt).toLocaleTimeString()}</div>
                      </div>
                    ) : (
                      <div className="text-red-700">
                        Error: {result.error}
                      </div>
                    )}
                  </div>
                  
                  {/* Individual test button */}
                  <div className="mt-2">
                    <button
                      onClick={() => handleTestSingle(providerId)}
                      disabled={testing === providerId}
                      className="text-xs text-blue-600 hover:text-blue-800 disabled:opacity-50"
                    >
                      {testing === providerId ? 'Probando...' : 'Probar de nuevo'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Summary */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Resumen:</span>
              <span className="font-medium text-gray-900">
                {Object.values(results).filter((r: any) => r.success).length} / {Object.keys(results).length} exitosas
              </span>
            </div>
          </div>
          
          {/* Close button */}
          <div className="mt-4">
            <button
              onClick={() => setShowResults(false)}
              className="w-full rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
      
      {/* Overlay to close results when clicking outside */}
      {showResults && (
        <div 
          className="fixed inset-0 z-0" 
          onClick={() => setShowResults(false)}
        />
      )}
    </div>
  );
}