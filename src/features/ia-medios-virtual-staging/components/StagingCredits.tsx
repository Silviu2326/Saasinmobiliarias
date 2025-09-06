import React from 'react';
import { Coins, TrendingUp, AlertCircle } from 'lucide-react';
import { useCreditsQuery } from '../hooks';
import { estimateCost } from '../utils';
import type { StageStyle, Resolution } from '../types';

interface StagingCreditsProps {
  selectedStyle?: StageStyle['id'];
  selectedResolution?: Resolution;
  selectedItemsCount?: number;
  showEstimate?: boolean;
}

export const StagingCredits: React.FC<StagingCreditsProps> = ({
  selectedStyle,
  selectedResolution = '2k',
  selectedItemsCount = 0,
  showEstimate = false,
}) => {
  const { data: credits, isLoading, error } = useCreditsQuery();

  const estimatedCost = selectedStyle 
    ? estimateCost(selectedStyle, selectedResolution, selectedItemsCount)
    : 0;

  const hasEnoughCredits = credits ? credits.current >= estimatedCost : true;

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-20 bg-gray-100 rounded-lg"></div>
      </div>
    );
  }

  if (error || !credits) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-sm text-red-800">Error al cargar los créditos</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Saldo actual */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <Coins className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Créditos disponibles</h3>
              <p className="text-sm text-gray-600">Para Virtual Staging</p>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">
              {credits.current}
            </div>
            <div className="text-sm text-gray-500">
              de {credits.total} totales
            </div>
          </div>
        </div>

        {/* Barra de progreso */}
        <div className="mt-3">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Uso de créditos</span>
            <span>{Math.round((credits.current / credits.total) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all"
              style={{ width: `${(credits.current / credits.total) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Estimación de coste */}
      {showEstimate && selectedStyle && (
        <div className={`
          p-4 rounded-lg border-2 transition-colors
          ${hasEnoughCredits 
            ? 'border-green-200 bg-green-50' 
            : 'border-red-200 bg-red-50'
          }
        `}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className={`w-5 h-5 ${hasEnoughCredits ? 'text-green-600' : 'text-red-600'}`} />
              <span className="font-medium">Coste estimado</span>
            </div>
            <span className={`text-xl font-bold ${hasEnoughCredits ? 'text-green-700' : 'text-red-700'}`}>
              {estimatedCost} créditos
            </span>
          </div>
          
          <div className="mt-2 text-sm space-y-1">
            <div className="flex justify-between text-gray-600">
              <span>Resolución {selectedResolution.toUpperCase()}:</span>
              <span>{credits.costPerJob[selectedResolution]} créditos</span>
            </div>
            {selectedItemsCount > 0 && (
              <div className="flex justify-between text-gray-600">
                <span>{selectedItemsCount} elementos adicionales:</span>
                <span>+{Math.floor(selectedItemsCount / 3)} créditos</span>
              </div>
            )}
          </div>

          {!hasEnoughCredits && (
            <div className="mt-3 flex items-center gap-2 text-red-700">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">
                Créditos insuficientes. Necesitas {estimatedCost - credits.current} créditos más.
              </span>
            </div>
          )}
        </div>
      )}

      {/* Tabla de precios */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h4 className="font-medium text-gray-900">Precios por resolución</h4>
        </div>
        
        <div className="divide-y divide-gray-200">
          {Object.entries(credits.costPerJob).map(([resolution, cost]) => (
            <div key={resolution} className="p-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                <span className="font-medium">{resolution.toUpperCase()}</span>
                <span className="text-sm text-gray-500">
                  {getResolutionLabel(resolution)}
                </span>
              </div>
              <span className="font-medium">{cost} créditos</span>
            </div>
          ))}
        </div>
        
        <div className="p-3 bg-gray-50 text-xs text-gray-600">
          * Coste adicional: +1 crédito por cada 3 elementos seleccionados
        </div>
      </div>

      {/* Información de recarga */}
      {credits.current < 20 && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div className="text-sm text-yellow-800">
              <p className="font-medium mb-1">Créditos bajos</p>
              <p>
                Te quedan pocos créditos. Considera recargar tu saldo para seguir 
                usando el Virtual Staging sin interrupciones.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const getResolutionLabel = (resolution: string): string => {
  const labels = {
    '1k': '1024×768px',
    '2k': '2048×1536px', 
    '4k': '4096×3072px'
  };
  
  return labels[resolution as keyof typeof labels] || resolution;
};