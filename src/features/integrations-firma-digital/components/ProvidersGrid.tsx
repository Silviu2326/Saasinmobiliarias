import React from 'react';
import { useProviders } from '../hooks';
import { ProviderCard } from './ProviderCard';
import { ComponentProps } from '../types';

export function ProvidersGrid({ onConnect, onSettings }: ComponentProps) {
  const { providers, loading, error } = useProviders();

  if (loading) {
    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-lg border bg-white p-6 shadow-sm animate-pulse">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 bg-gray-200 rounded-md"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-20"></div>
              </div>
            </div>
            <div className="space-y-2 mb-4">
              <div className="h-3 bg-gray-200 rounded"></div>
              <div className="h-3 bg-gray-200 rounded w-3/4"></div>
            </div>
            <div className="h-8 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6">
        <div className="flex items-center gap-2 text-red-800">
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <span className="font-medium">Error al cargar los proveedores</span>
        </div>
        <p className="mt-2 text-red-700">{error}</p>
        <button 
          className="mt-3 rounded-md bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700"
          onClick={() => window.location.reload()}
        >
          Reintentar
        </button>
      </div>
    );
  }

  if (providers.length === 0) {
    return (
      <div className="rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
        <div className="mx-auto h-12 w-12 text-gray-400">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="mt-4 text-lg font-medium text-gray-900">No hay proveedores disponibles</h3>
        <p className="mt-2 text-gray-600">
          No se encontraron proveedores de firma digital configurados.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg bg-green-50 p-4">
          <div className="flex items-center">
            <div className="flex-1">
              <div className="text-sm font-medium text-green-600">Conectados</div>
              <div className="text-2xl font-semibold text-green-900">
                {providers.filter(p => p.status === 'CONNECTED').length}
              </div>
            </div>
            <div className="h-8 w-8 text-green-600">
              ✓
            </div>
          </div>
        </div>
        
        <div className="rounded-lg bg-yellow-50 p-4">
          <div className="flex items-center">
            <div className="flex-1">
              <div className="text-sm font-medium text-yellow-600">Token Expirado</div>
              <div className="text-2xl font-semibold text-yellow-900">
                {providers.filter(p => p.status === 'TOKEN_EXPIRED').length}
              </div>
            </div>
            <div className="h-8 w-8 text-yellow-600">
              ⚠️
            </div>
          </div>
        </div>
        
        <div className="rounded-lg bg-gray-50 p-4">
          <div className="flex items-center">
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-600">Desconectados</div>
              <div className="text-2xl font-semibold text-gray-900">
                {providers.filter(p => p.status === 'DISCONNECTED').length}
              </div>
            </div>
            <div className="h-8 w-8 text-gray-600">
              −
            </div>
          </div>
        </div>
        
        <div className="rounded-lg bg-blue-50 p-4">
          <div className="flex items-center">
            <div className="flex-1">
              <div className="text-sm font-medium text-blue-600">Total Créditos</div>
              <div className="text-2xl font-semibold text-blue-900">
                {providers.reduce((sum, p) => sum + p.credits, 0)}
              </div>
            </div>
            <div className="h-8 w-8 text-blue-600">
              💳
            </div>
          </div>
        </div>
      </div>
      
      {/* Providers grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {providers.map((provider) => (
          <ProviderCard
            key={provider.id}
            provider={provider}
            onConnect={onConnect}
            onSettings={onSettings}
          />
        ))}
      </div>
      
      {/* Help text */}
      <div className="rounded-lg bg-blue-50 p-4">
        <div className="flex items-start gap-3">
          <div className="h-5 w-5 text-blue-600 mt-0.5">
            💡
          </div>
          <div className="flex-1 text-sm">
            <div className="font-medium text-blue-900 mb-1">Configuración de Proveedores</div>
            <div className="text-blue-700">
              <p className="mb-2">Para conectar un proveedor, necesitarás las credenciales correspondientes:</p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li><strong>OAuth:</strong> Client ID, Client Secret y Redirect URI</li>
                <li><strong>API Key:</strong> API Key y opcionalmente Account ID y Region</li>
                <li><strong>Credenciales:</strong> Username, Password y opcionalmente Account ID</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}