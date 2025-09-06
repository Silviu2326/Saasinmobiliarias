import React from 'react';
import { Clock, Target } from 'lucide-react';
import type { DomCurve } from '../types';
import { formatMoney, formatDays } from '../utils';

interface DomVsPriceChartProps {
  curve: DomCurve | null;
  currentPrice: number;
  targetDom?: number;
}

const DomVsPriceChart: React.FC<DomVsPriceChartProps> = ({
  curve,
  currentPrice,
  targetDom = 45
}) => {
  // Mock data
  const mockCurve = {
    points: [
      { price: 280000, p50: 35, p90: 70 },
      { price: 290000, p50: 42, p90: 84 },
      { price: 300000, p50: 52, p90: 104 },
      { price: 310000, p50: 65, p90: 130 },
      { price: 320000, p50: 82, p90: 164 }
    ],
    currentPrice,
    targetDom,
    marketMedian: 52,
    lastUpdated: new Date().toISOString()
  };

  const data = curve || mockCurve;
  const currentPoint = data.points.find(p => Math.abs(p.price - currentPrice) < 5000) || data.points[2];

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-orange-500" />
          <h3 className="text-lg font-semibold text-gray-900">DOM vs Precio</h3>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="text-center p-3 bg-orange-50 rounded-lg">
          <p className="text-sm text-orange-600 mb-1">DOM esperado</p>
          <p className="text-xl font-bold text-orange-900">
            {currentPoint.p50} días
          </p>
        </div>
        <div className="text-center p-3 bg-red-50 rounded-lg">
          <p className="text-sm text-red-600 mb-1">Escenario pesimista</p>
          <p className="text-xl font-bold text-red-900">
            {currentPoint.p90} días
          </p>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">Mediana mercado</p>
          <p className="text-xl font-bold text-gray-900">
            {data.marketMedian} días
          </p>
        </div>
      </div>

      {/* Chart */}
      <div className="mb-6">
        <div className="relative h-40 bg-gray-50 rounded border">
          <svg className="w-full h-full">
            {/* Grid */}
            <defs>
              <pattern id="domGrid" width="25" height="20" patternUnits="userSpaceOnUse">
                <path d="M 25 0 L 0 0 0 20" fill="none" stroke="#e5e7eb" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#domGrid)" />
            
            {/* Target DOM line */}
            <line
              x1="10%"
              y1={`${100 - (targetDom / 200) * 80}%`}
              x2="90%"
              y2={`${100 - (targetDom / 200) * 80}%`}
              stroke="#10b981"
              strokeWidth="2"
              strokeDasharray="5,5"
              opacity="0.7"
            />
            
            {/* P90 curve */}
            <polyline
              points={data.points.map((point, index) => {
                const x = 10 + (index / (data.points.length - 1)) * 80;
                const y = 90 - (point.p90 / 200) * 80;
                return `${x},${y}`;
              }).join(' ')}
              fill="none"
              stroke="#ef4444"
              strokeWidth="2"
              opacity="0.6"
            />
            
            {/* P50 curve */}
            <polyline
              points={data.points.map((point, index) => {
                const x = 10 + (index / (data.points.length - 1)) * 80;
                const y = 90 - (point.p50 / 200) * 80;
                return `${x},${y}`;
              }).join(' ')}
              fill="none"
              stroke="#f97316"
              strokeWidth="3"
            />
            
            {/* Data points */}
            {data.points.map((point, index) => {
              const x = 10 + (index / (data.points.length - 1)) * 80;
              const y = 90 - (point.p50 / 200) * 80;
              const isCurrentPrice = Math.abs(point.price - currentPrice) < 5000;
              
              return (
                <circle
                  key={index}
                  cx={`${x}%`}
                  cy={`${y}%`}
                  r={isCurrentPrice ? "5" : "3"}
                  fill={isCurrentPrice ? "#dc2626" : "#f97316"}
                  stroke="white"
                  strokeWidth="2"
                />
              );
            })}
          </svg>
          
          {/* Labels */}
          <div className="absolute bottom-2 left-2 text-xs text-gray-500">280k</div>
          <div className="absolute bottom-2 right-2 text-xs text-gray-500">320k</div>
          <div className="absolute top-2 left-2 text-xs text-gray-500">200d</div>
          <div className="absolute bottom-10 left-2 text-xs text-gray-500">0d</div>
        </div>
        
        {/* Legend */}
        <div className="flex justify-center gap-6 mt-3">
          <div className="flex items-center gap-2">
            <div className="w-3 h-0.5 bg-orange-500"></div>
            <span className="text-xs text-gray-600">DOM mediano (P50)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-0.5 bg-red-400"></div>
            <span className="text-xs text-gray-600">Escenario pesimista (P90)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-0.5 bg-green-500 border-dashed"></div>
            <span className="text-xs text-gray-600">Objetivo</span>
          </div>
        </div>
      </div>

      {/* Analysis */}
      <div className="border-t border-gray-200 pt-4">
        <div className="flex items-start gap-3 mb-3">
          <Target className="w-5 h-5 text-green-500 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-gray-900">Análisis del precio actual</p>
            <p className="text-sm text-gray-600 mt-1">
              {currentPoint.p50 <= targetDom 
                ? `✅ DOM esperado (${currentPoint.p50}d) está dentro del objetivo (${targetDom}d)`
                : `⚠️ DOM esperado (${currentPoint.p50}d) supera el objetivo (${targetDom}d)`
              }
            </p>
          </div>
        </div>
        
        <div className="text-sm text-gray-600">
          <p>
            Reduciendo el precio en 10.000€ podría acelerar la venta en aproximadamente{' '}
            <strong className="text-gray-900">
              {Math.max(0, currentPoint.p50 - (data.points[1]?.p50 || currentPoint.p50))} días
            </strong>
          </p>
        </div>
      </div>
    </div>
  );
};

export default DomVsPriceChart;