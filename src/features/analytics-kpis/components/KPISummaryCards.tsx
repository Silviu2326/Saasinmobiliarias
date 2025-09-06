import React from 'react';
import type { KPISummary } from '../types';

interface KPISummaryCardsProps {
  summary: KPISummary;
}

export const KPISummaryCards: React.FC<KPISummaryCardsProps> = ({ summary }) => {
  const getHealthColor = (health: number) => {
    if (health >= 80) return 'text-green-600';
    if (health >= 60) return 'text-yellow-600';
    if (health >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const getHealthBgColor = (health: number) => {
    if (health >= 80) return 'bg-green-100';
    if (health >= 60) return 'bg-yellow-100';
    if (health >= 40) return 'bg-orange-100';
    return 'bg-red-100';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {/* Total de Métricas */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center">
          <div className="p-2 bg-blue-100 rounded-lg">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Total de Métricas</p>
            <p className="text-2xl font-semibold text-gray-900">{summary.totalMetrics}</p>
          </div>
        </div>
      </div>

      {/* Salud General */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center">
          <div className={`p-2 rounded-lg ${getHealthBgColor(summary.overallHealth)}`}>
            <svg className={`w-6 h-6 ${getHealthColor(summary.overallHealth)}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Salud General</p>
            <p className={`text-2xl font-semibold ${getHealthColor(summary.overallHealth)}`}>
              {summary.overallHealth}%
            </p>
          </div>
        </div>
      </div>

      {/* Tendencia Positiva */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center">
          <div className="p-2 bg-green-100 rounded-lg">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Subiendo</p>
            <p className="text-2xl font-semibold text-green-600">{summary.trendingUp}</p>
          </div>
        </div>
      </div>

      {/* Tendencia Negativa */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center">
          <div className="p-2 bg-red-100 rounded-lg">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
            </svg>
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Bajando</p>
            <p className="text-2xl font-semibold text-red-600">{summary.trendingDown}</p>
          </div>
        </div>
      </div>
    </div>
  );
};


