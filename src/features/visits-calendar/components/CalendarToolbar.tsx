import React from 'react';
import { CalendarState } from '../types';

interface CalendarToolbarProps {
  state: CalendarState;
  onViewChange: (view: 'week' | 'day') => void;
  onNavigate: (direction: 'prev' | 'next' | 'today') => void;
  onAgenteChange: (agente: string) => void;
  currentDateLabel: string;
}

export default function CalendarToolbar({
  state,
  onViewChange,
  onNavigate,
  onAgenteChange,
  currentDateLabel
}: CalendarToolbarProps) {
  const agentes = [
    { id: '', nombre: 'Todos los agentes' },
    { id: 'agent-1', nombre: 'Pedro Ruiz' },
    { id: 'agent-2', nombre: 'Carmen Vega' },
    { id: 'agent-3', nombre: 'Antonio Silva' },
    { id: 'agent-4', nombre: 'Isabel Torres' },
    { id: 'agent-5', nombre: 'Manuel Jiménez' },
  ];

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left side - Navigation */}
        <div className="flex items-center space-x-4">
          {/* Today button */}
          <button
            onClick={() => onNavigate('today')}
            className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Hoy
          </button>

          {/* Navigation arrows */}
          <div className="flex items-center space-x-1">
            <button
              onClick={() => onNavigate('prev')}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md"
              title="Anterior"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={() => onNavigate('next')}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md"
              title="Siguiente"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Current date label */}
          <div className="text-xl font-semibold text-gray-900">
            {currentDateLabel}
          </div>
        </div>

        {/* Right side - Controls */}
        <div className="flex items-center space-x-4">
          {/* Agent selector */}
          <div className="flex items-center space-x-2">
            <label htmlFor="agente-select" className="text-sm font-medium text-gray-700">
              Agente:
            </label>
            <select
              id="agente-select"
              value={state.agente || ''}
              onChange={(e) => onAgenteChange(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {agentes.map(agente => (
                <option key={agente.id} value={agente.id}>
                  {agente.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* View selector */}
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">Vista:</span>
            <div className="flex rounded-md shadow-sm">
              <button
                onClick={() => onViewChange('week')}
                className={`px-4 py-2 text-sm font-medium border rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  state.view === 'week'
                    ? 'bg-blue-500 text-white border-blue-500'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                Semana
              </button>
              <button
                onClick={() => onViewChange('day')}
                className={`px-4 py-2 text-sm font-medium border-t border-r border-b rounded-r-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  state.view === 'day'
                    ? 'bg-blue-500 text-white border-blue-500'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                Día
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}