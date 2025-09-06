import React, { useState } from 'react';
import { Layers, Plus, Copy } from 'lucide-react';
import type { Scenario } from '../types';

interface ScenarioManagerProps {
  scenarios: Scenario[];
  activeScenario: Scenario | null;
  onScenarioChange: (scenario: Scenario) => void;
  onCreateScenario: (scenario: any) => void;
}

const ScenarioManager: React.FC<ScenarioManagerProps> = ({
  scenarios,
  activeScenario,
  onScenarioChange,
  onCreateScenario
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const mockScenarios: Scenario[] = [
    {
      id: 'baseline',
      name: 'Baseline',
      type: 'BASELINE',
      goal: 'EQUILIBRIO',
      constraints: { minOwner: 280000 },
      listPrice: 300000,
      anchorPrice: 315000,
      minAcceptable: 285000,
      expectedOutcome: { domP50: 45, closeProb60d: 0.65, netOwner: 270000, totalRevenue: 300000 },
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString(),
      createdBy: 'system',
      isBaseline: true
    }
  ];

  const data = scenarios.length > 0 ? scenarios : mockScenarios;

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
        title="Gestionar escenarios"
      >
        <Layers className="w-6 h-6" />
      </button>

      {/* Popup Panel */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-80 bg-white border border-gray-200 rounded-lg shadow-xl">
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900">Escenarios</h3>
          </div>
          
          <div className="max-h-64 overflow-y-auto">
            {data.map((scenario) => (
              <div
                key={scenario.id}
                className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                  activeScenario?.id === scenario.id ? 'bg-blue-50 border-blue-200' : ''
                }`}
                onClick={() => onScenarioChange(scenario)}
              >
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium text-gray-900">{scenario.name}</h4>
                  <span className={`text-xs px-2 py-1 rounded ${
                    scenario.type === 'BASELINE' ? 'bg-gray-100 text-gray-700' :
                    scenario.type === 'OPTIMISTA' ? 'bg-green-100 text-green-700' :
                    scenario.type === 'AGRESIVO' ? 'bg-red-100 text-red-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {scenario.type}
                  </span>
                </div>
                
                <div className="text-sm text-gray-600">
                  <p>Lista: {scenario.listPrice.toLocaleString('es-ES', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0 })}</p>
                  <p>DOM: {scenario.expectedOutcome.domP50}d • Prob: {Math.round(scenario.expectedOutcome.closeProb60d * 100)}%</p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="p-4 space-y-2">
            <button
              onClick={() => {
                onCreateScenario({
                  name: `Escenario ${data.length + 1}`,
                  type: 'PERSONALIZADO',
                  goal: 'EQUILIBRIO',
                  constraints: { minOwner: 280000 },
                  listPrice: 300000,
                  anchorPrice: 315000,
                  minAcceptable: 285000,
                  expectedOutcome: { domP50: 45, closeProb60d: 0.65, netOwner: 270000, totalRevenue: 300000 },
                  createdBy: 'user'
                });
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Crear escenario
            </button>
            
            {activeScenario && (
              <button
                onClick={() => {
                  onCreateScenario({
                    ...activeScenario,
                    id: undefined,
                    name: `${activeScenario.name} (copia)`,
                    createdBy: 'user'
                  });
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Copy className="w-4 h-4" />
                Duplicar actual
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default ScenarioManager;