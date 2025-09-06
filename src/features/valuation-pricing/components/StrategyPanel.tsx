import React, { useState } from 'react';
import { Settings, TrendingUp, Calendar, Target } from 'lucide-react';
import type { Scenario, PricingPhase } from '../types';
import { formatMoney, formatDays } from '../utils';

interface StrategyPanelProps {
  currentPrice: number;
  onPriceChange: (price: number) => void;
  scenario?: Scenario | null;
}

const StrategyPanel: React.FC<StrategyPanelProps> = ({
  currentPrice,
  onPriceChange,
  scenario
}) => {
  const [activePhase, setActivePhase] = useState(0);

  // Mock phases for demonstration
  const defaultPhases: PricingPhase[] = [
    {
      id: 'phase-1',
      name: 'Fase 1: Impacto',
      order: 1,
      listPrice: currentPrice,
      duration: 21,
      objective: 'Generar máximo interés y visitas',
      triggers: {
        domGt: 21,
        visitsLt: 15,
        leadsLt: 5
      },
      actions: ['Promoción intensiva', 'Fotos profesionales', 'Tour virtual'],
      active: true
    },
    {
      id: 'phase-2',
      name: 'Fase 2: Optimización',
      order: 2,
      listPrice: Math.round(currentPrice * 0.97),
      duration: 28,
      objective: 'Equilibrar precio y velocidad',
      triggers: {
        domGt: 49,
        visitsLt: 8,
        leadsLt: 3
      },
      actions: ['Ajuste precio -3%', 'Revisión descripción', 'Contacto directo'],
      active: false
    },
    {
      id: 'phase-3',
      name: 'Fase 3: Liquidación',
      order: 3,
      listPrice: Math.round(currentPrice * 0.94),
      duration: 21,
      objective: 'Cerrar venta rápidamente',
      triggers: {
        domGt: 77,
        offersLt: 1
      },
      actions: ['Reducción -6%', 'Urgencia venta', 'Flexibilidad negociación'],
      active: false
    }
  ];

  const phases = scenario?.strategy?.phases || defaultPhases;

  // Mock price floors
  const priceFloors = [
    { price: 299000, type: 'psychological', label: 'Barrera psicológica' },
    { price: 295000, type: 'filter', label: 'Filtro búsqueda' },
    { price: 290000, type: 'minimum', label: 'Mínimo propietario' }
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Estrategia de Fases</h3>
        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <Settings className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Current Price Input */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Precio actual de lista
        </label>
        <div className="flex items-center gap-3">
          <input
            type="number"
            value={currentPrice}
            onChange={(e) => onPriceChange(Number(e.target.value))}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            step="1000"
          />
          <span className="text-sm text-gray-500">EUR</span>
        </div>
      </div>

      {/* Phases */}
      <div className="space-y-4 mb-6">
        {phases.map((phase, index) => (
          <div
            key={phase.id}
            className={`border rounded-lg p-4 cursor-pointer transition-colors ${
              activePhase === index
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => setActivePhase(index)}
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <h4 className="font-medium text-gray-900">{phase.name}</h4>
                <p className="text-sm text-gray-600">{phase.objective}</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-semibold text-gray-900">
                  {formatMoney(phase.listPrice)}
                </p>
                <p className="text-sm text-gray-500">
                  {formatDays(phase.duration)}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-sm text-gray-600">
                {phase.triggers.domGt && (
                  <span>DOM &gt; {phase.triggers.domGt}d</span>
                )}
                {phase.triggers.visitsLt && (
                  <span>Visitas &lt; {phase.triggers.visitsLt}</span>
                )}
                {phase.triggers.leadsLt && (
                  <span>Leads &lt; {phase.triggers.leadsLt}</span>
                )}
              </div>
              <div className={`w-3 h-3 rounded-full ${
                phase.active ? 'bg-green-500' : 'bg-gray-300'
              }`} />
            </div>

            {activePhase === index && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Acciones previstas</p>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {phase.actions.map((action, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <Target className="w-3 h-3 text-blue-500" />
                          {action}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Triggers activación</p>
                    <div className="space-y-1 text-sm text-gray-600">
                      {Object.entries(phase.triggers).map(([key, value]) => (
                        <div key={key} className="flex items-center gap-2">
                          <Calendar className="w-3 h-3 text-orange-500" />
                          {key === 'domGt' && `Más de ${value} días en mercado`}
                          {key === 'visitsLt' && `Menos de ${value} visitas/semana`}
                          {key === 'leadsLt' && `Menos de ${value} leads/semana`}
                          {key === 'offersLt' && `Menos de ${value} ofertas`}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Price Floors */}
      <div className="border-t border-gray-200 pt-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
          <TrendingUp className="w-4 h-4" />
          Pisos de precio relevantes
        </h4>
        <div className="space-y-2">
          {priceFloors.map((floor, index) => (
            <div key={index} className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${
                  currentPrice > floor.price ? 'bg-green-500' : 'bg-red-500'
                }`} />
                <span className="text-sm text-gray-700">{floor.label}</span>
              </div>
              <span className="text-sm font-medium text-gray-900">
                {formatMoney(floor.price)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StrategyPanel;