import React from 'react';
import { PipelineData, Assumptions } from '../types';
import { formatPercent } from '../utils';

interface PipelineToRevenueProps {
  pipeline?: PipelineData[];
  assumptions: Assumptions;
  isLoading?: boolean;
}

export default function PipelineToRevenue({
  pipeline = [],
  assumptions,
  isLoading
}: PipelineToRevenueProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const currentPipeline = pipeline[pipeline.length - 1] || {
    leads: 150,
    visits: 45,
    offers: 30,
    reservations: 24,
    contracts: 20,
    date: new Date().toISOString().split('T')[0]
  };

  const stages = [
    {
      name: 'Leads',
      value: currentPipeline.leads,
      next: Math.round(currentPipeline.leads * assumptions.convLeadVisit),
      conversion: assumptions.convLeadVisit,
      color: 'bg-blue-500'
    },
    {
      name: 'Visitas',
      value: Math.round(currentPipeline.leads * assumptions.convLeadVisit),
      next: Math.round(currentPipeline.leads * assumptions.convLeadVisit * assumptions.convVisitOffer),
      conversion: assumptions.convVisitOffer,
      color: 'bg-indigo-500'
    },
    {
      name: 'Ofertas',
      value: Math.round(currentPipeline.leads * assumptions.convLeadVisit * assumptions.convVisitOffer),
      next: Math.round(currentPipeline.leads * assumptions.convLeadVisit * assumptions.convVisitOffer * assumptions.convOfferReservation),
      conversion: assumptions.convOfferReservation,
      color: 'bg-purple-500'
    },
    {
      name: 'Reservas',
      value: Math.round(currentPipeline.leads * assumptions.convLeadVisit * assumptions.convVisitOffer * assumptions.convOfferReservation),
      next: Math.round(currentPipeline.leads * assumptions.convLeadVisit * assumptions.convVisitOffer * assumptions.convOfferReservation * assumptions.convReservationContract),
      conversion: assumptions.convReservationContract,
      color: 'bg-green-500'
    },
    {
      name: 'Contratos',
      value: Math.round(currentPipeline.leads * assumptions.convLeadVisit * assumptions.convVisitOffer * assumptions.convOfferReservation * assumptions.convReservationContract),
      next: 0,
      conversion: 1,
      color: 'bg-emerald-600'
    }
  ];

  const maxValue = Math.max(...stages.map(stage => stage.value));

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">Pipeline → Ingresos</h3>
        <div className="text-sm text-gray-500">
          Conv. global: {formatPercent(assumptions.convLeadVisit * assumptions.convVisitOffer * assumptions.convOfferReservation * assumptions.convReservationContract)}
        </div>
      </div>

      <div className="space-y-4">
        {stages.map((stage, index) => {
          const percentage = (stage.value / maxValue) * 100;
          const isLast = index === stages.length - 1;
          
          return (
            <div key={stage.name} className="relative">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">{stage.name}</span>
                <span className="text-sm font-bold text-gray-900">{stage.value}</span>
              </div>
              
              <div className="relative">
                <div className="h-12 bg-gray-100 rounded-lg overflow-hidden">
                  <div 
                    className={`h-full ${stage.color} rounded-lg transition-all duration-500`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                
                <div className="absolute inset-0 flex items-center justify-between px-4">
                  <span className="text-xs font-medium text-white drop-shadow-sm">
                    {stage.name}
                  </span>
                  {!isLast && (
                    <span className="text-xs text-gray-600 bg-white/80 px-2 py-1 rounded">
                      {formatPercent(stage.conversion)}
                    </span>
                  )}
                </div>
              </div>
              
              {!isLast && (
                <div className="flex justify-center mt-2">
                  <div className="flex items-center text-xs text-red-600">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                    Pérdida: {stage.value - stage.next}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-100">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Ingresos estimados/mes:</span>
            <div className="font-semibold text-green-600">
              €{Math.round((stages[4].value * (assumptions.avgTicketSale * 0.7 + assumptions.avgTicketRent * 0.3) * 
                (assumptions.feesPctSale * 0.7 + assumptions.feesPctRent * 0.3))).toLocaleString()}
            </div>
          </div>
          <div>
            <span className="text-gray-600">Tiempo promedio:</span>
            <div className="font-semibold text-blue-600">
              {assumptions.cycleDays} días
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}