import React, { useState } from 'react';
import { Scenario } from '../types';

interface ScenarioEditorProps {
  scenarios: Scenario[];
  activeScenarioId: string;
  onScenarioChange: (scenarioId: string) => void;
  onCreateScenario: () => void;
  onCopyScenario: (scenario: Scenario) => void;
  onRenameScenario: (id: string, name: string) => void;
  onDeleteScenario: (id: string) => void;
  onSetDefault: (id: string) => void;
}

export default function ScenarioEditor({
  scenarios,
  activeScenarioId,
  onScenarioChange,
  onCreateScenario,
  onCopyScenario,
  onRenameScenario,
  onDeleteScenario,
  onSetDefault
}: ScenarioEditorProps) {
  const [editingName, setEditingName] = useState<string | null>(null);
  const [newName, setNewName] = useState('');

  const activeScenario = scenarios.find(s => s.id === activeScenarioId);

  const handleRename = (id: string) => {
    const scenario = scenarios.find(s => s.id === id);
    if (scenario) {
      setEditingName(id);
      setNewName(scenario.name);
    }
  };

  const confirmRename = () => {
    if (editingName && newName.trim()) {
      onRenameScenario(editingName, newName.trim());
    }
    setEditingName(null);
    setNewName('');
  };

  const cancelRename = () => {
    setEditingName(null);
    setNewName('');
  };

  const getScenarioIcon = (kind: Scenario['kind']) => {
    switch (kind) {
      case 'BASELINE':
        return (
          <div className="w-3 h-3 rounded-full bg-blue-500"></div>
        );
      case 'OPTIMISTIC':
        return (
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
        );
      case 'PESSIMISTIC':
        return (
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
        );
      case 'CUSTOM':
        return (
          <div className="w-3 h-3 rounded-full bg-purple-500"></div>
        );
    }
  };

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">Escenarios</h3>
        <button
          onClick={onCreateScenario}
          className="inline-flex items-center px-3 py-1 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nuevo
        </button>
      </div>

      {/* Selector Principal */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Escenario Activo
        </label>
        <select
          value={activeScenarioId}
          onChange={(e) => onScenarioChange(e.target.value)}
          className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          {scenarios.map((scenario) => (
            <option key={scenario.id} value={scenario.id}>
              {scenario.name} {scenario.isDefault ? '(Por defecto)' : ''}
            </option>
          ))}
        </select>
      </div>

      {/* Lista de Escenarios */}
      <div className="space-y-2">
        {scenarios.map((scenario) => {
          const isActive = scenario.id === activeScenarioId;
          const isEditing = editingName === scenario.id;

          return (
            <div
              key={scenario.id}
              className={`p-3 rounded-lg border-2 transition-colors ${
                isActive 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 bg-gray-50 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {getScenarioIcon(scenario.kind)}
                  {isEditing ? (
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        className="px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') confirmRename();
                          if (e.key === 'Escape') cancelRename();
                        }}
                        autoFocus
                      />
                      <button
                        onClick={confirmRename}
                        className="p-1 text-green-600 hover:text-green-800"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </button>
                      <button
                        onClick={cancelRename}
                        className="p-1 text-red-600 hover:text-red-800"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-900">
                        {scenario.name}
                        {scenario.isDefault && (
                          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                            Por defecto
                          </span>
                        )}
                      </span>
                      <span className="text-xs text-gray-500">
                        {scenario.kind} • Actualizado {new Date(scenario.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>

                {!isEditing && (
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => onCopyScenario(scenario)}
                      className="p-1 text-gray-400 hover:text-gray-600"
                      title="Copiar escenario"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                    
                    {scenario.kind === 'CUSTOM' && (
                      <>
                        <button
                          onClick={() => handleRename(scenario.id)}
                          className="p-1 text-gray-400 hover:text-gray-600"
                          title="Renombrar"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>

                        {!scenario.isDefault && (
                          <button
                            onClick={() => onSetDefault(scenario.id)}
                            className="p-1 text-gray-400 hover:text-blue-600"
                            title="Establecer como predeterminado"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                            </svg>
                          </button>
                        )}

                        <button
                          onClick={() => onDeleteScenario(scenario.id)}
                          className="p-1 text-gray-400 hover:text-red-600"
                          title="Eliminar"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Vista previa de impacto */}
              {isActive && activeScenario && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="grid grid-cols-3 gap-4 text-xs">
                    <div>
                      <span className="text-gray-500">Conv. Global:</span>
                      <span className="ml-1 font-medium">
                        {((activeScenario.assumptions.convLeadVisit *
                           activeScenario.assumptions.convVisitOffer *
                           activeScenario.assumptions.convOfferReservation *
                           activeScenario.assumptions.convReservationContract) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Ticket Medio:</span>
                      <span className="ml-1 font-medium">
                        {Math.round(activeScenario.assumptions.avgTicketSale * 0.7 + activeScenario.assumptions.avgTicketRent * 0.3).toLocaleString()}€
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Ciclo:</span>
                      <span className="ml-1 font-medium">
                        {activeScenario.assumptions.cycleDays}d
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {scenarios.length === 0 && (
        <div className="text-center py-6 text-gray-500">
          <p className="text-sm">No hay escenarios creados</p>
          <p className="text-xs mt-1">Crea tu primer escenario para comenzar</p>
        </div>
      )}
    </div>
  );
}