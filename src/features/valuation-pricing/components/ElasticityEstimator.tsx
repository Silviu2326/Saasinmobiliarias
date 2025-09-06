import React from 'react';
import { TrendingDown, Info } from 'lucide-react';
import type { ElasticityAnalysis } from '../types';
import { formatMoney, formatPercent } from '../utils';

interface ElasticityEstimatorProps {
  analysis: ElasticityAnalysis | null;
  currentPrice: number;
}

const ElasticityEstimator: React.FC<ElasticityEstimatorProps> = ({
  analysis,
  currentPrice
}) => {
  // Mock data if no analysis available
  const mockData = {
    points: [
      { price: 280000, demand: 8.2, demandLow: 6.8, demandHigh: 9.6 },
      { price: 290000, demand: 7.1, demandLow: 5.9, demandHigh: 8.3 },
      { price: 300000, demand: 5.8, demandLow: 4.8, demandHigh: 6.8 },
      { price: 310000, demand: 4.7, demandLow: 3.9, demandHigh: 5.5 },
      { price: 320000, demand: 3.9, demandLow: 3.2, demandHigh: 4.6 }
    ],
    elasticityCoeff: -1.2,
    optimalPrice: 295000,
    confidenceInterval: { low: 285000, high: 305000 },
    r2Score: 0.82,
    lastUpdated: new Date().toISOString()
  };

  const data = analysis || mockData;

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <TrendingDown className="w-5 h-5 text-blue-500" />
          <h3 className="text-lg font-semibold text-gray-900">Elasticidad de Demanda</h3>
        </div>
        <button className="p-1 hover:bg-gray-100 rounded-full" title="Información sobre elasticidad">
          <Info className="w-4 h-4 text-gray-400" />
        </button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-600 mb-1">Elasticidad</p>
          <p className="text-xl font-bold text-blue-900">
            {Math.abs(data.elasticityCoeff).toFixed(2)}
          </p>
          <p className="text-xs text-blue-700">
            {Math.abs(data.elasticityCoeff) > 1 ? 'Elástica' : 'Inelástica'}
          </p>
        </div>
        <div className="p-3 bg-green-50 rounded-lg">
          <p className="text-sm text-green-600 mb-1">Precio óptimo</p>
          <p className="text-xl font-bold text-green-900">
            {formatMoney(data.optimalPrice || 0)}
          </p>
          <p className="text-xs text-green-700">
            Máximo revenue estimado
          </p>
        </div>
      </div>

      {/* Simple Chart Visualization */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Curva Demanda vs Precio</h4>
        <div className="relative h-32 bg-gray-50 rounded border">
          <svg className="w-full h-full">
            {/* Grid lines */}
            <defs>
              <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e5e7eb" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
            
            {/* Data points and line */}
            {data.points.map((point, index) => {
              const x = ((point.price - 270000) / (330000 - 270000)) * 80 + 10;
              const y = 90 - (point.demand / 10) * 70;
              
              return (
                <g key={index}>
                  {/* Confidence interval */}
                  {point.demandLow && point.demandHigh && (
                    <line
                      x1={x}
                      y1={90 - (point.demandLow / 10) * 70}
                      x2={x}
                      y2={90 - (point.demandHigh / 10) * 70}
                      stroke="#93c5fd"
                      strokeWidth="2"
                      opacity="0.6"
                    />
                  )}
                  
                  {/* Data point */}
                  <circle
                    cx={`${x}%`}
                    cy={y}
                    r="3"
                    fill={point.price === currentPrice ? "#dc2626" : "#3b82f6"}
                    stroke="white"
                    strokeWidth="1"
                  />
                  
                  {/* Connection line */}
                  {index < data.points.length - 1 && (
                    <line
                      x1={`${x}%`}
                      y1={y}
                      x2={`${((data.points[index + 1].price - 270000) / (330000 - 270000)) * 80 + 10}%`}
                      y2={90 - (data.points[index + 1].demand / 10) * 70}
                      stroke="#3b82f6"
                      strokeWidth="2"
                      opacity="0.8"
                    />
                  )}
                </g>
              );
            })}
            
            {/* Current price indicator */}
            {(() => {
              const currentX = ((currentPrice - 270000) / (330000 - 270000)) * 80 + 10;
              return (
                <line
                  x1={`${currentX}%`}
                  y1="10"
                  x2={`${currentX}%`}
                  y2="90"
                  stroke="#dc2626"
                  strokeWidth="2"
                  strokeDasharray="4,4"
                  opacity="0.7"
                />
              );
            })()}
          </svg>
          
          {/* Labels */}
          <div className="absolute bottom-2 left-2 text-xs text-gray-500">270k</div>
          <div className="absolute bottom-2 right-2 text-xs text-gray-500">330k</div>
          <div className="absolute top-2 left-2 text-xs text-gray-500">10</div>
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-xs text-gray-500">Precio (EUR)</div>
        </div>
        <div className="text-center mt-2">
          <p className="text-xs text-gray-500">Demanda estimada (leads/semana)</p>
        </div>
      </div>

      {/* Current Price Analysis */}
      <div className="border-t border-gray-200 pt-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">En el precio actual</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-600">Leads esperados/semana:</p>
            <p className="font-semibold text-gray-900">
              {(() => {
                const point = data.points.find(p => Math.abs(p.price - currentPrice) < 5000) || data.points[2];
                return `${point.demand.toFixed(1)} leads`;
              })()}
            </p>
          </div>
          <div>
            <p className="text-gray-600">Sensibilidad al precio:</p>
            <p className="font-semibold text-gray-900">
              {Math.abs(data.elasticityCoeff) > 1 ? 'Alta' : 'Media'}
            </p>
          </div>
        </div>
      </div>

      {/* Model Quality */}
      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Calidad del modelo (R²):</span>
          <div className="flex items-center gap-2">
            <div className="w-20 h-2 bg-gray-200 rounded-full">
              <div 
                className="h-full bg-green-500 rounded-full"
                style={{ width: `${data.r2Score * 100}%` }}
              ></div>
            </div>
            <span className="text-sm font-medium text-gray-900">
              {formatPercent(data.r2Score)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ElasticityEstimator;