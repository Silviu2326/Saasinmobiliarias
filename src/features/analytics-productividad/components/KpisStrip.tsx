import React from 'react';
import { useProductivityFilters, useResponseTimes, useSla, useTasksStats, useFieldStats, useLeaderboard } from '../hooks';
import { formatDurationH, formatPct, getTrendIcon, getTrendColor } from '../utils';

interface KpiCardProps {
  title: string;
  value: string | number;
  unit?: string;
  change?: {
    value: number;
    isPositive: boolean;
  };
  loading?: boolean;
}

function KpiCard({ title, value, unit, change, loading }: KpiCardProps) {
  if (loading) {
    return (
      <div className="rounded-lg bg-white p-4 shadow-sm">
        <div className="animate-pulse">
          <div className="h-4 w-20 bg-gray-200 rounded mb-2"></div>
          <div className="h-8 w-16 bg-gray-200 rounded mb-1"></div>
          <div className="h-3 w-12 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg bg-white p-4 shadow-sm">
      <div className="text-sm font-medium text-gray-600">{title}</div>
      <div className="mt-2 flex items-baseline">
        <div className="text-2xl font-semibold text-gray-900">
          {value}
          {unit && <span className="text-lg text-gray-500 ml-1">{unit}</span>}
        </div>
        {change && (
          <div className={`ml-2 flex items-baseline text-sm font-medium ${getTrendColor(change.value)}`}>
            <span>{getTrendIcon(change.value)}</span>
            <span className="ml-1">{Math.abs(change.value).toFixed(1)}%</span>
          </div>
        )}
      </div>
    </div>
  );
}

export function KpisStrip() {
  const { filters } = useProductivityFilters();
  
  const { data: responseTimes, loading: responseLoading } = useResponseTimes(filters);
  const { data: slaData, loading: slaLoading } = useSla(filters);
  const { data: tasksData, loading: tasksLoading } = useTasksStats(filters);
  const { data: fieldData, loading: fieldLoading } = useFieldStats(filters);
  const { data: leaderboardData, loading: leaderboardLoading } = useLeaderboard(filters, 'results');

  // Calculate KPIs from data
  const avgFirstContactP50 = responseTimes.length > 0 
    ? responseTimes.reduce((acc, r) => acc + r.p50FirstContact, 0) / responseTimes.length 
    : 0;

  const avgFirstContactP90 = responseTimes.length > 0 
    ? responseTimes.reduce((acc, r) => acc + r.p90FirstContact, 0) / responseTimes.length 
    : 0;

  const slaContactPct = slaData?.contactSlaPct || 0;

  const onTimeTasksPct = tasksData.length > 0
    ? (tasksData.reduce((acc, t) => acc + t.onTime, 0) / tasksData.reduce((acc, t) => acc + t.completed, 0)) * 100
    : 0;

  const visitsRatio = fieldData 
    ? (fieldData.doneVisits / fieldData.plannedVisits) * 100 
    : 0;

  const avgOffersPerAgent = leaderboardData.length > 0
    ? leaderboardData.reduce((acc, a) => acc + a.offers, 0) / leaderboardData.length
    : 0;

  const avgContractsPerAgent = leaderboardData.length > 0
    ? leaderboardData.reduce((acc, a) => acc + a.contracts, 0) / leaderboardData.length
    : 0;

  const avgConversionRate = avgOffersPerAgent > 0 
    ? (avgContractsPerAgent / avgOffersPerAgent) * 100 
    : 0;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
      <KpiCard
        title="1er Contacto (P50)"
        value={formatDurationH(avgFirstContactP50)}
        change={{ value: -5.2, isPositive: true }}
        loading={responseLoading}
      />
      
      <KpiCard
        title="1er Contacto (P90)"
        value={formatDurationH(avgFirstContactP90)}
        change={{ value: -8.1, isPositive: true }}
        loading={responseLoading}
      />
      
      <KpiCard
        title="SLA Contacto"
        value={formatPct(slaContactPct)}
        change={{ value: 2.3, isPositive: true }}
        loading={slaLoading}
      />
      
      <KpiCard
        title="Tareas On-time"
        value={formatPct(onTimeTasksPct)}
        change={{ value: 1.8, isPositive: true }}
        loading={tasksLoading}
      />
      
      <KpiCard
        title="Visitas Realizadas"
        value={formatPct(visitsRatio)}
        change={{ value: -2.1, isPositive: false }}
        loading={fieldLoading}
      />
      
      <KpiCard
        title="Ofertas/Agente"
        value={avgOffersPerAgent.toFixed(1)}
        change={{ value: 4.2, isPositive: true }}
        loading={leaderboardLoading}
      />
      
      <KpiCard
        title="Ratio Cierre"
        value={formatPct(avgConversionRate)}
        change={{ value: 1.5, isPositive: true }}
        loading={leaderboardLoading}
      />
    </div>
  );
}