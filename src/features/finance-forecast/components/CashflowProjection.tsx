import React from 'react';
import { Projection } from '../types';

interface CashflowProjectionProps {
  projection: Projection | null;
  isLoading?: boolean;
}

export default function CashflowProjection({ projection, isLoading }: CashflowProjectionProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Proyección de Caja</h3>
      <div className="h-64 flex items-center justify-center text-gray-500">
        <div className="text-center">
          <div className="text-sm">Gráfico de flujo de caja</div>
          <div className="text-xs text-gray-400 mt-1">Implementación completa pendiente</div>
        </div>
      </div>
    </div>
  );
}