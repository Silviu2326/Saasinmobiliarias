import React from 'react';
import { Calculator } from 'lucide-react';
import type { OfferSimulation } from '../types';
import { formatMoney, formatPercent } from '../utils';

interface OfferSimulatorProps {
  simulation: OfferSimulation | null;
  currentPrice: number;
  onSimulate?: (params: any) => void;
}

const OfferSimulator: React.FC<OfferSimulatorProps> = ({
  simulation,
  currentPrice,
  onSimulate
}) => {
  const mockSimulation: OfferSimulation = {
    price: currentPrice,
    probAboveMin: 0.85,
    probClose30: 0.25,
    probClose60: 0.65,
    probClose90: 0.85,
    expectedDiscountPct: 4.2,
    expectedOffers: 2.3,
    offerDistribution: [
      { range: '< 90%', probability: 0.15, avgAmount: currentPrice * 0.88 },
      { range: '90-95%', probability: 0.35, avgAmount: currentPrice * 0.925 },
      { range: '95-98%', probability: 0.30, avgAmount: currentPrice * 0.965 },
      { range: '> 98%', probability: 0.20, avgAmount: currentPrice * 0.99 }
    ]
  };

  const data = simulation || mockSimulation;

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
      <div className="flex items-center gap-2 mb-6">
        <Calculator className="w-5 h-5 text-purple-500" />
        <h3 className="text-lg font-semibold text-gray-900">Simulador de Ofertas</h3>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="p-3 bg-purple-50 rounded-lg">
          <p className="text-sm text-purple-600 mb-1">Ofertas esperadas</p>
          <p className="text-xl font-bold text-purple-900">
            {data.expectedOffers.toFixed(1)}
          </p>
        </div>
        <div className="p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-600 mb-1">Descuento esperado</p>
          <p className="text-xl font-bold text-blue-900">
            {formatPercent(data.expectedDiscountPct / 100)}
          </p>
        </div>
      </div>

      {/* Probability Timeline */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Probabilidad de cierre</h4>
        <div className="space-y-2">
          {[
            { period: '30 días', prob: data.probClose30, color: 'bg-red-500' },
            { period: '60 días', prob: data.probClose60, color: 'bg-yellow-500' },
            { period: '90 días', prob: data.probClose90, color: 'bg-green-500' }
          ].map(item => (
            <div key={item.period} className="flex items-center gap-3">
              <span className="text-sm text-gray-600 w-16">{item.period}</span>
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${item.color}`}
                  style={{ width: `${item.prob * 100}%` }}
                ></div>
              </div>
              <span className="text-sm font-medium text-gray-900 w-12">
                {formatPercent(item.prob * 100, 0)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Offer Distribution */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-3">Distribución de ofertas</h4>
        <div className="space-y-2">
          {data.offerDistribution.map((dist, index) => (
            <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <span className="text-sm text-gray-700">{dist.range} del precio</span>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600">
                  {formatPercent(dist.probability * 100, 0)}
                </span>
                <span className="text-sm font-medium text-gray-900">
                  {formatMoney(dist.avgAmount)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OfferSimulator;