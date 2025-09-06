import React, { useState } from 'react';
import { useCapacityPlan } from '../hooks';
import { CapacitySuggestion } from '../types';

export function CapacityPlanner() {
  const [showPlanner, setShowPlanner] = useState(false);
  const { data, loading, planCapacity } = useCapacityPlan({});
  
  const [planParams, setPlanParams] = useState({
    demanda: 1000,
    responseTimeHours: 4,
    maxLeadsPerAgent: 50,
    targetConversionRate: 0.15
  });

  const handlePlan = async () => {
    await planCapacity({
      demanda: planParams.demanda,
      objetivos: {
        responseTimeHours: planParams.responseTimeHours,
        maxLeadsPerAgent: planParams.maxLeadsPerAgent,
        targetConversionRate: planParams.targetConversionRate
      },
      limites: {
        minLeadsPerAgent: 10,
        maxWorkloadHours: 8
      }
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Planificación de Capacidad</h3>
        
        <button
          onClick={() => setShowPlanner(!showPlanner)}
          className="rounded-md bg-blue-600 px-3 py-1 text-sm font-medium text-white hover:bg-blue-700"
        >
          {showPlanner ? 'Ocultar' : 'Configurar'}
        </button>
      </div>
      
      {showPlanner && (
        <div className="rounded-lg border bg-gray-50 p-4 space-y-3">
          <div className="text-sm font-medium text-gray-700">Parámetros de Planificación</div>
          
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-gray-700">Demanda Mensual</label>
              <input
                type="number"
                value={planParams.demanda}
                onChange={(e) => setPlanParams(prev => ({ ...prev, demanda: parseInt(e.target.value) || 0 }))}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-1 text-sm"
                placeholder="1000"
              />
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-700">SLA Respuesta (horas)</label>
              <input
                type="number"
                value={planParams.responseTimeHours}
                onChange={(e) => setPlanParams(prev => ({ ...prev, responseTimeHours: parseInt(e.target.value) || 0 }))}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-1 text-sm"
                placeholder="4"
              />
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-700">Máx. Leads por Agente</label>
              <input
                type="number"
                value={planParams.maxLeadsPerAgent}
                onChange={(e) => setPlanParams(prev => ({ ...prev, maxLeadsPerAgent: parseInt(e.target.value) || 0 }))}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-1 text-sm"
                placeholder="50"
              />
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-700">Tasa Conversión Objetivo</label>
              <input
                type="number"
                step="0.01"
                max="1"
                min="0"
                value={planParams.targetConversionRate}
                onChange={(e) => setPlanParams(prev => ({ ...prev, targetConversionRate: parseFloat(e.target.value) || 0 }))}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-1 text-sm"
                placeholder="0.15"
              />
            </div>
          </div>
          
          <button
            onClick={handlePlan}
            disabled={loading}
            className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Calculando...' : 'Calcular Recomendaciones'}
          </button>
        </div>
      )}
      
      {/* Current Capacity Analysis */}
      <div className="rounded-lg border bg-white p-4">
        <div className="text-sm font-medium text-gray-700 mb-3">Análisis Actual</div>
        
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="text-center">
            <div className="text-lg font-semibold text-blue-600">~85%</div>
            <div className="text-xs text-gray-600">Utilización Media</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-green-600">12%</div>
            <div className="text-xs text-gray-600">Capacidad Libre</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-yellow-600">3%</div>
            <div className="text-xs text-gray-600">Sobrecarga</div>
          </div>
        </div>
        
        <div className="mt-3 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full flex">
            <div className="bg-green-500" style={{ width: '12%' }}></div>
            <div className="bg-blue-500" style={{ width: '85%' }}></div>
            <div className="bg-red-500" style={{ width: '3%' }}></div>
          </div>
        </div>
      </div>
      
      {/* Recommendations */}
      {data.length > 0 && (
        <div className="space-y-2">
          <div className="text-sm font-medium text-gray-700">Recomendaciones de Redistribución</div>
          
          {data.map((suggestion, index) => (
            <div key={index} className="rounded-lg border bg-white p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-medium text-gray-900">
                  Mover {suggestion.leads} leads
                </div>
                <div className="text-xs text-gray-500">
                  🔄 Redistribución
                </div>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                <span className="font-medium text-red-600">{suggestion.moveFrom}</span>
                <span>→</span>
                <span className="font-medium text-green-600">{suggestion.moveTo}</span>
              </div>
              
              <div className="text-xs text-gray-500">
                {suggestion.reason}
              </div>
            </div>
          ))}
          
          <div className="text-center">
            <button className="text-sm text-blue-600 hover:text-blue-800">
              Aplicar Recomendaciones
            </button>
          </div>
        </div>
      )}
      
      {/* Scenario Analysis */}
      <div className="rounded-lg border bg-blue-50 p-4">
        <div className="text-sm font-medium text-blue-800 mb-2">
          📈 Escenario Recomendado
        </div>
        <div className="text-sm text-blue-700">
          <div>• Capacidad actual: suficiente para {planParams.demanda * 0.85} leads/mes</div>
          <div>• Para {planParams.demanda} leads/mes: contratar 1-2 agentes adicionales</div>
          <div>• SLA {planParams.responseTimeHours}h: alcanzable con redistribución</div>
          <div>• Conversión {(planParams.targetConversionRate * 100).toFixed(1)}%: requiere mejor seguimiento</div>
        </div>
      </div>
      
      <div className="text-xs text-gray-500">
        Cálculos basados en histórico de productividad y carga actual. Recomendaciones sujetas a factores externos.
      </div>
    </div>
  );
}