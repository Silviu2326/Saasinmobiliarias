import React from 'react';
import { Projection, Currency } from '../types';
import { formatMoney, formatPercent } from '../utils';

interface KpisStripProps {
  projection: Projection | null;
  isLoading?: boolean;
}

export default function KpisStrip({ projection, isLoading }: KpisStripProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-8 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!projection) {
    return (
      <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
        <div className="text-center text-gray-500 py-4">
          <p className="text-sm">Configura un escenario para ver los KPIs</p>
        </div>
      </div>
    );
  }

  const kpis = projection.kpis;

  const KpiCard = ({ 
    title, 
    value, 
    subtitle, 
    trend, 
    color = 'blue' 
  }: {
    title: string;
    value: string;
    subtitle?: string;
    trend?: { value: number; isPositive: boolean };
    color?: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'indigo';
  }) => {
    const colorClasses = {
      blue: 'text-blue-600 bg-blue-50',
      green: 'text-green-600 bg-green-50',
      purple: 'text-purple-600 bg-purple-50',
      orange: 'text-orange-600 bg-orange-50',
      red: 'text-red-600 bg-red-50',
      indigo: 'text-indigo-600 bg-indigo-50'
    };

    return (
      <div className="text-center">
        <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
          {title}
        </div>
        <div className={`text-2xl font-bold ${colorClasses[color].split(' ')[0]} mb-1`}>
          {value}
        </div>
        {subtitle && (
          <div className="text-xs text-gray-400">
            {subtitle}
          </div>
        )}
        {trend && (
          <div className={`text-xs mt-1 ${
            trend.isPositive ? 'text-green-600' : 'text-red-600'
          }`}>
            {trend.isPositive ? '↗' : '↘'} {formatPercent(Math.abs(trend.value))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">KPIs Clave</h3>
        <div className="text-xs text-gray-500">
          Proyección {projection.from} - {projection.to}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
        <KpiCard
          title="ARR Estimado"
          value={formatMoney(kpis.arr, projection.currency)}
          subtitle="Ingresos anualizados"
          color="blue"
        />

        <KpiCard
          title="GMV Proyectado"
          value={formatMoney(kpis.gmv, projection.currency)}
          subtitle="Valor bruto total"
          color="green"
        />

        <KpiCard
          title="Ingresos 3M"
          value={formatMoney(kpis.revenue3m, projection.currency)}
          subtitle="Próximos 3 meses"
          color="purple"
        />

        <KpiCard
          title="Ingresos 12M"
          value={formatMoney(kpis.revenue12m, projection.currency)}
          subtitle="Próximos 12 meses"
          color="orange"
        />

        <KpiCard
          title="Conversión Global"
          value={formatPercent(kpis.convGlobal)}
          subtitle="Lead a contrato"
          color="indigo"
        />

        <KpiCard
          title="Payback"
          value={kpis.paybackMonths ? `${kpis.paybackMonths}m` : 'N/A'}
          subtitle="Meses de recuperación"
          color="red"
        />
      </div>

      {/* Métricas adicionales */}
      <div className="mt-6 pt-6 border-t border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Contratos totales:</span>
            <span className="font-medium">
              {projection.points.reduce((sum, point) => sum + point.contracts, 0)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Ingresos promedio/mes:</span>
            <span className="font-medium">
              {formatMoney(
                projection.points.reduce((sum, point) => sum + point.revenue, 0) / projection.points.length,
                projection.currency
              )}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Margen neto estimado:</span>
            <span className="font-medium">
              {formatPercent(0.3)} {/* Simplified margin calculation */}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}