import React from "react";
import { useProviders } from "../hooks";
import { ProviderCard } from "./ProviderCard";
import type { ConnectData } from "../types";

export function PSPProvidersGrid() {
  const { providers, loading, error, connectProvider, testProvider, setProviderMode } = useProviders();

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white border border-gray-200 rounded-lg p-6 animate-pulse">
            <div className="w-16 h-16 bg-gray-200 rounded-lg mb-4"></div>
            <div className="w-24 h-4 bg-gray-200 rounded mb-2"></div>
            <div className="w-32 h-3 bg-gray-100 rounded mb-4"></div>
            <div className="w-20 h-8 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
        <p className="text-red-600">Error al cargar proveedores: {error}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
      {providers.map((provider) => (
        <ProviderCard
          key={provider.id}
          provider={provider}
          onConnect={connectProvider}
          onTest={testProvider}
          onModeChange={setProviderMode}
        />
      ))}
    </div>
  );
}