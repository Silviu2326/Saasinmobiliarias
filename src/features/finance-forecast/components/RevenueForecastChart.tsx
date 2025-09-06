import React from 'react';
import { Projection } from '../types';
import { formatMoney, aggregateByMonth } from '../utils';

interface RevenueForecastChartProps {
  projection: Projection | null;
  isLoading?: boolean;
  showGross?: boolean;
  onToggleGross?: (show: boolean) => void;
  onWhatIf?: () => void;
}

export default function RevenueForecastChart({
  projection,
  isLoading,
  showGross = true,
  onToggleGross,
  onWhatIf
}: RevenueForecastChartProps) {
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

  if (!projection) {
    return (
      <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Ingresos Previstos</h3>
        </div>
        <div className="h-64 flex items-center justify-center text-gray-500">
          <div className="text-center">
            <svg className="w-12 h-12 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <p className="text-sm">No hay datos para mostrar</p>
            <p className="text-xs text-gray-400 mt-1">Configura un escenario para ver la proyección</p>
          </div>
        </div>
      </div>
    );
  }

  const aggregated = aggregateByMonth(projection.points);
  const maxRevenue = Math.max(...aggregated.revenue);

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Ingresos Previstos</h3>
          <p className="text-sm text-gray-500">
            {projection.from} - {projection.to}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {onToggleGross && (
            <button
              onClick={() => onToggleGross(!showGross)}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                showGross
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {showGross ? 'Bruto' : 'Neto'}
            </button>
          )}
          {onWhatIf && (
            <button
              onClick={onWhatIf}
              className="inline-flex items-center px-3 py-1 text-xs font-medium text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-md hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
            >
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              What-If
            </button>
          )}
        </div>
      </div>

      {/* Simple bar chart visualization */}
      <div className="space-y-3">
        {aggregated.months.map((month, index) => {
          const revenue = aggregated.revenue[index];
          const percentage = (revenue / maxRevenue) * 100;
          
          return (
            <div key={month} className="flex items-center space-x-3">
              <div className="w-16 text-xs text-gray-600 font-medium">
                {new Date(month + '-01').toLocaleDateString('es-ES', { 
                  month: 'short',
                  year: '2-digit'
                })}
              </div>
              <div className="flex-1 relative">
                <div className="h-8 bg-gray-100 rounded-md overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-md transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
                <div className="absolute inset-0 flex items-center px-3">
                  <span className="text-xs font-medium text-white drop-shadow-sm">
                    {formatMoney(revenue, projection.currency)}
                  </span>
                </div>
              </div>
              <div className="w-16 text-xs text-gray-500 text-right">
                {aggregated.contracts[index]} cont.
              </div>
            </div>
          );
        })}
      </div>

      {/* Totals */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Total ingresos:</span>
          <span className="font-medium text-gray-900">
            {formatMoney(
              aggregated.revenue.reduce((sum, rev) => sum + rev, 0),
              projection.currency
            )}
          </span>
        </div>
      </div>
    </div>
  );
}