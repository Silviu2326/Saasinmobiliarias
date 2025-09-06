import React from 'react';
import { useProductivityFilters, useSla } from '../hooks';
import { formatPct, getSlaStatus } from '../utils';

export function SlaComplianceCard() {
  const { filters } = useProductivityFilters();
  const { data, loading, error } = useSla({ ...filters, xh: 4, yd: 2 });

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-6 w-48 bg-gray-200 rounded animate-pulse"></div>
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-16 bg-gray-100 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600">Error: {error}</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-8 text-gray-500">
        No hay datos disponibles
      </div>
    );
  }

  const contactStatus = getSlaStatus(data.contactSlaPct);
  const followupStatus = getSlaStatus(data.followupSlaPct);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900">Cumplimiento SLA</h3>
      
      {/* SLA Metrics */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg bg-gray-50 p-4">
          <div className="text-sm text-gray-600">Contacto ≤ 4h</div>
          <div className="mt-1 flex items-baseline">
            <div className={`text-2xl font-semibold ${contactStatus.color}`}>
              {formatPct(data.contactSlaPct)}
            </div>
            <div className={`ml-2 text-sm ${contactStatus.color}`}>
              {contactStatus.label}
            </div>
          </div>
        </div>
        
        <div className="rounded-lg bg-gray-50 p-4">
          <div className="text-sm text-gray-600">Seguimiento ≤ 2d</div>
          <div className="mt-1 flex items-baseline">
            <div className={`text-2xl font-semibold ${followupStatus.color}`}>
              {formatPct(data.followupSlaPct)}
            </div>
            <div className={`ml-2 text-sm ${followupStatus.color}`}>
              {followupStatus.label}
            </div>
          </div>
        </div>
      </div>
      
      {/* Breaches Summary */}
      <div className="rounded-lg border border-red-200 bg-red-50 p-4">
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium text-red-800">
            Incumplimientos SLA
          </div>
          <div className="text-xl font-semibold text-red-600">
            {data.breaches}
          </div>
        </div>
      </div>
      
      {/* Top Breaches */}
      {data.topBreaches.length > 0 && (
        <div className="space-y-2">
          <div className="text-sm font-medium text-gray-700">
            Top Incumplimientos
          </div>
          
          <div className="space-y-1">
            {data.topBreaches.slice(0, 5).map((breach) => (
              <div 
                key={breach.id} 
                className="flex items-center justify-between rounded border bg-white px-3 py-2 hover:bg-gray-50 cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <div className="text-sm font-medium text-blue-600">
                    {breach.ref}
                  </div>
                  <div className="text-xs text-gray-500">
                    {breach.agentName}
                  </div>
                </div>
                
                <div className="text-sm text-red-600 font-medium">
                  +{breach.hoursLate.toFixed(1)}h
                </div>
              </div>
            ))}
          </div>
          
          {data.topBreaches.length > 5 && (
            <div className="text-center">
              <button className="text-sm text-blue-600 hover:text-blue-800">
                Ver todos ({data.topBreaches.length})
              </button>
            </div>
          )}
        </div>
      )}
      
      <div className="text-xs text-gray-500">
        SLA: Contacto inicial en ≤4h, seguimiento en ≤2 días. Calculado sobre leads del período.
      </div>
    </div>
  );
}