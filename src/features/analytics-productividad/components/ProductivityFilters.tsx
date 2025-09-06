import React from 'react';
import { useProductivityFilters } from '../hooks';
import { getDateRange } from '../utils';

const PRESET_RANGES = [
  { label: 'Hoy', days: 0 },
  { label: '7 días', days: 7 },
  { label: '30 días', days: 30 },
  { label: 'Trimestre', days: 90 },
  { label: 'YTD', days: new Date().getDay() }
];

const CANAL_OPTIONS = [
  { value: 'tel', label: 'Teléfono' },
  { value: 'email', label: 'Email' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'visita', label: 'Visita' }
];

const TIPO_OPTIONS = [
  { value: 'venta', label: 'Venta' },
  { value: 'alquiler', label: 'Alquiler' }
];

const GROUP_BY_OPTIONS = [
  { value: 'day', label: 'Día' },
  { value: 'week', label: 'Semana' },
  { value: 'month', label: 'Mes' }
];

export function ProductivityFilters() {
  const { filters, updateFilters } = useProductivityFilters();

  const handlePresetRange = (days: number) => {
    const { from, to } = getDateRange(days);
    updateFilters({ from, to });
  };

  const handleInputChange = (field: string, value: string) => {
    updateFilters({ [field]: value || undefined });
  };

  const handleNumberChange = (field: string, value: string) => {
    const numValue = value ? parseInt(value) : undefined;
    updateFilters({ [field]: numValue });
  };

  return (
    <div className="space-y-4">
      {/* Date Range and Presets */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Desde:</label>
          <input
            type="date"
            value={filters.from || ''}
            onChange={(e) => handleInputChange('from', e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-1 text-sm"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Hasta:</label>
          <input
            type="date"
            value={filters.to || ''}
            onChange={(e) => handleInputChange('to', e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-1 text-sm"
          />
        </div>

        <div className="flex items-center gap-1">
          {PRESET_RANGES.map((preset) => (
            <button
              key={preset.label}
              onClick={() => handlePresetRange(preset.days)}
              className="rounded-md bg-gray-100 px-3 py-1 text-sm text-gray-700 hover:bg-gray-200"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Filters Row */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Oficina:</label>
          <input
            type="text"
            value={filters.office || ''}
            onChange={(e) => handleInputChange('office', e.target.value)}
            placeholder="Filtrar por oficina"
            className="rounded-md border border-gray-300 px-3 py-1 text-sm"
          />
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Equipo:</label>
          <input
            type="text"
            value={filters.team || ''}
            onChange={(e) => handleInputChange('team', e.target.value)}
            placeholder="Filtrar por equipo"
            className="rounded-md border border-gray-300 px-3 py-1 text-sm"
          />
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Agente:</label>
          <input
            type="text"
            value={filters.agent || ''}
            onChange={(e) => handleInputChange('agent', e.target.value)}
            placeholder="Filtrar por agente"
            className="rounded-md border border-gray-300 px-3 py-1 text-sm"
          />
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Canal:</label>
          <select
            value={filters.canal || ''}
            onChange={(e) => handleInputChange('canal', e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-1 text-sm"
          >
            <option value="">Todos</option>
            {CANAL_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Tipo:</label>
          <select
            value={filters.tipo || ''}
            onChange={(e) => handleInputChange('tipo', e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-1 text-sm"
          >
            <option value="">Todos</option>
            {TIPO_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Advanced Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Portal:</label>
          <input
            type="text"
            value={filters.portal || ''}
            onChange={(e) => handleInputChange('portal', e.target.value)}
            placeholder="Portal"
            className="rounded-md border border-gray-300 px-3 py-1 text-sm"
          />
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Campaña:</label>
          <input
            type="text"
            value={filters.campaña || ''}
            onChange={(e) => handleInputChange('campaña', e.target.value)}
            placeholder="Campaña"
            className="rounded-md border border-gray-300 px-3 py-1 text-sm"
          />
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Día inicia:</label>
          <select
            value={filters.dayStartHour || 8}
            onChange={(e) => handleNumberChange('dayStartHour', e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-1 text-sm"
          >
            {Array.from({ length: 13 }, (_, i) => (
              <option key={i} value={i}>
                {i}:00
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Agrupar por:</label>
          <select
            value={filters.groupBy || 'day'}
            onChange={(e) => handleInputChange('groupBy', e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-1 text-sm"
          >
            {GROUP_BY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}