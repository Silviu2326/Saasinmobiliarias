import React from 'react';
import { DollarSign } from 'lucide-react';
import type { NetWaterfall } from '../types';
import { formatMoney, formatPercent } from '../utils';

interface WaterfallNetProceedsProps {
  waterfall: NetWaterfall | null;
  price: number;
}

const WaterfallNetProceeds: React.FC<WaterfallNetProceedsProps> = ({ waterfall, price }) => {
  const mockWaterfall: NetWaterfall = {
    price,
    grossAmount: price,
    items: [
      { label: 'Precio venta', amount: price, kind: 'net' },
      { label: 'Honorarios agencia', amount: -price * 0.03, percentage: -3, kind: 'fee' },
      { label: 'Impuestos', amount: -price * 0.006, kind: 'tax' },
      { label: 'Gastos legales', amount: -2000, kind: 'cost' },
      { label: 'Cancelación hipoteca', amount: -price * 0.4, kind: 'cost' }
    ],
    netOwner: price * 0.564,
    effectiveYield: 0.564,
    breakdownByCategory: { fee: price * 0.03, tax: price * 0.006, cost: price * 0.4 + 2000, net: price * 0.564 },
    lastUpdated: new Date().toISOString()
  };

  const data = waterfall || mockWaterfall;

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
      <div className="flex items-center gap-2 mb-6">
        <DollarSign className="w-5 h-5 text-green-500" />
        <h3 className="text-lg font-semibold text-gray-900">Neto Propietario</h3>
      </div>

      <div className="space-y-3">
        {data.items.map((item, index) => (
          <div key={index} className={`flex justify-between items-center py-2 ${
            item.kind === 'net' && item.amount > 0 && index === data.items.length - 1 
              ? 'border-t-2 border-green-200 bg-green-50 px-3 rounded font-semibold' 
              : ''
          }`}>
            <span className={`text-sm ${
              item.kind === 'net' && item.amount > 0 ? 'text-green-800' : 'text-gray-700'
            }`}>
              {item.label}
            </span>
            <div className="text-right">
              <span className={`font-medium ${
                item.amount >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {formatMoney(item.amount)}
              </span>
              {item.percentage && (
                <span className="text-xs text-gray-500 ml-2">
                  ({formatPercent(item.percentage / 100)})
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Rendimiento efectivo:</span>
          <span className="font-semibold text-gray-900">
            {formatPercent(data.effectiveYield)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default WaterfallNetProceeds;