import React, { useState, useEffect } from 'react';
import { Search, X, Calendar, Filter, Users, Building2, User } from 'lucide-react';
import type { SettlementQuery, SettlementStatus } from '../types';
import { useCatalogs } from '../hooks';
import { formatPeriod } from '../utils';

interface SettlementsFiltersProps {
  filters: SettlementQuery;
  onFiltersChange: (filters: SettlementQuery) => void;
  onReset: () => void;
  isLoading?: boolean;
}

export const SettlementsFilters: React.FC<SettlementsFiltersProps> = ({
  filters,
  onFiltersChange,
  onReset,
  isLoading = false
}) => {
  const [localFilters, setLocalFilters] = useState<SettlementQuery>(filters);
  const { offices, teams, agents, getTeamsByOffice, getAgentsByTeam } = useCatalogs();
  
  // Estados para controlar qué filtros están expandidos
  const [expandedSections, setExpandedSections] = useState({
    search: true,
    period: true,
    status: true,
    scope: false,
    origin: false
  });

  // Sincronizar filtros locales con props
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleFilterChange = (key: keyof SettlementQuery, value: any) => {
    const newFilters = { ...localFilters, [key]: value, page: 1 };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleReset = () => {
    const resetFilters = { page: 1, size: filters.size || 25 };
    setLocalFilters(resetFilters);
    onReset();
  };

  const hasActiveFilters = Boolean(
    localFilters.period ||
    localFilters.status ||
    localFilters.office ||
    localFilters.agent ||
    localFilters.team ||
    localFilters.origin ||
    localFilters.q
  );

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Obtener equipos filtrados por oficina seleccionada
  const filteredTeams = localFilters.office 
    ? getTeamsByOffice(localFilters.office)
    : teams;

  // Obtener agentes filtrados por equipo u oficina
  const filteredAgents = localFilters.team
    ? getAgentsByTeam(localFilters.team)
    : localFilters.office
    ? agents.filter(agent => agent.officeId === localFilters.office)
    : agents;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-gray-500" />
          <h3 className="text-lg font-medium text-gray-900">Filtros</h3>
          {hasActiveFilters && (
            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium">
              Activos
            </span>
          )}
        </div>
        
        {hasActiveFilters && (
          <button
            onClick={handleReset}
            className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
          >
            <X className="h-4 w-4" />
            Limpiar todos
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* Búsqueda */}
        <div className="space-y-2">
          <button
            onClick={() => toggleSection('search')}
            className="flex items-center justify-between w-full text-left"
          >
            <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Search className="h-4 w-4" />
              Búsqueda
            </span>
          </button>
          
          {expandedSections.search && (
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por nombre, agente, referencia..."
                  value={localFilters.q || ''}
                  onChange={(e) => handleFilterChange('q', e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={isLoading}
                />
              </div>
            </div>
          )}
        </div>

        {/* Período */}
        <div className="space-y-2">
          <button
            onClick={() => toggleSection('period')}
            className="flex items-center justify-between w-full text-left"
          >
            <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Período
            </span>
          </button>
          
          {expandedSections.period && (
            <div className="space-y-3">
              <input
                type="month"
                value={localFilters.period || ''}
                onChange={(e) => handleFilterChange('period', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={isLoading}
              />
              
              {/* Períodos predefinidos */}
              <div className="flex flex-wrap gap-1">
                {[
                  { label: 'Este mes', value: new Date().toISOString().slice(0, 7) },
                  { label: 'Mes anterior', value: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().slice(0, 7) },
                ].map(({ label, value }) => (
                  <button
                    key={value}
                    onClick={() => handleFilterChange('period', value)}
                    className={`px-2 py-1 text-xs rounded border transition-colors ${
                      localFilters.period === value
                        ? 'bg-blue-100 border-blue-300 text-blue-700'
                        : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Estado */}
        <div className="space-y-2">
          <button
            onClick={() => toggleSection('status')}
            className="flex items-center justify-between w-full text-left"
          >
            <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Estado
            </span>
          </button>
          
          {expandedSections.status && (
            <div className="space-y-2">
              <select
                value={localFilters.status || ''}
                onChange={(e) => handleFilterChange('status', e.target.value as SettlementStatus || undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={isLoading}
              >
                <option value="">Todos los estados</option>
                <option value="BORRADOR">Borrador</option>
                <option value="APROBADA">Aprobada</option>
                <option value="CERRADA">Cerrada</option>
              </select>

              {/* Estados como botones */}
              <div className="flex flex-wrap gap-1">
                {(['BORRADOR', 'APROBADA', 'CERRADA'] as SettlementStatus[]).map((status) => (
                  <button
                    key={status}
                    onClick={() => handleFilterChange('status', localFilters.status === status ? undefined : status)}
                    className={`px-2 py-1 text-xs rounded border transition-colors ${
                      localFilters.status === status
                        ? 'bg-blue-100 border-blue-300 text-blue-700'
                        : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Ámbito */}
        <div className="space-y-2">
          <button
            onClick={() => toggleSection('scope')}
            className="flex items-center justify-between w-full text-left"
          >
            <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Users className="h-4 w-4" />
              Ámbito
            </span>
          </button>
          
          {expandedSections.scope && (
            <div className="space-y-3">
              {/* Oficina */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Oficina
                </label>
                <select
                  value={localFilters.office || ''}
                  onChange={(e) => {
                    const officeId = e.target.value || undefined;
                    handleFilterChange('office', officeId);
                    // Limpiar team y agent si cambia la oficina
                    if (officeId !== localFilters.office) {
                      handleFilterChange('team', undefined);
                      handleFilterChange('agent', undefined);
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  disabled={isLoading}
                >
                  <option value="">Todas las oficinas</option>
                  {offices.map(office => (
                    <option key={office.id} value={office.id}>
                      {office.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Equipo */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Equipo
                </label>
                <select
                  value={localFilters.team || ''}
                  onChange={(e) => {
                    const teamId = e.target.value || undefined;
                    handleFilterChange('team', teamId);
                    // Limpiar agent si cambia el equipo
                    if (teamId !== localFilters.team) {
                      handleFilterChange('agent', undefined);
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  disabled={isLoading || !filteredTeams.length}
                >
                  <option value="">Todos los equipos</option>
                  {filteredTeams.map(team => (
                    <option key={team.id} value={team.id}>
                      {team.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Agente */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Agente
                </label>
                <select
                  value={localFilters.agent || ''}
                  onChange={(e) => handleFilterChange('agent', e.target.value || undefined)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  disabled={isLoading || !filteredAgents.length}
                >
                  <option value="">Todos los agentes</option>
                  {filteredAgents.map(agent => (
                    <option key={agent.id} value={agent.id}>
                      {agent.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Origen */}
        <div className="space-y-2">
          <button
            onClick={() => toggleSection('origin')}
            className="flex items-center justify-between w-full text-left"
          >
            <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Origen
            </span>
          </button>
          
          {expandedSections.origin && (
            <div className="space-y-2">
              <select
                value={localFilters.origin || ''}
                onChange={(e) => handleFilterChange('origin', e.target.value as 'VENTA' | 'ALQUILER' || undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={isLoading}
              >
                <option value="">Todos los orígenes</option>
                <option value="VENTA">Venta</option>
                <option value="ALQUILER">Alquiler</option>
              </select>

              {/* Origen como botones */}
              <div className="flex flex-wrap gap-1">
                {(['VENTA', 'ALQUILER'] as const).map((origin) => (
                  <button
                    key={origin}
                    onClick={() => handleFilterChange('origin', localFilters.origin === origin ? undefined : origin)}
                    className={`px-2 py-1 text-xs rounded border transition-colors ${
                      localFilters.origin === origin
                        ? 'bg-blue-100 border-blue-300 text-blue-700'
                        : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {origin}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Rango de fechas */}
        <div className="space-y-2">
          <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Fechas
          </span>
          
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Desde
              </label>
              <input
                type="date"
                value={localFilters.from || ''}
                onChange={(e) => handleFilterChange('from', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                disabled={isLoading}
              />
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Hasta
              </label>
              <input
                type="date"
                value={localFilters.to || ''}
                onChange={(e) => handleFilterChange('to', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                disabled={isLoading}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Resumen de filtros activos */}
      {hasActiveFilters && (
        <div className="pt-4 border-t border-gray-200">
          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-gray-600">Filtros activos:</span>
            
            {localFilters.period && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                Período: {formatPeriod(localFilters.period)}
                <button
                  onClick={() => handleFilterChange('period', undefined)}
                  className="ml-1 hover:bg-blue-200 rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}

            {localFilters.status && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                Estado: {localFilters.status}
                <button
                  onClick={() => handleFilterChange('status', undefined)}
                  className="ml-1 hover:bg-blue-200 rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}

            {localFilters.origin && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                Origen: {localFilters.origin}
                <button
                  onClick={() => handleFilterChange('origin', undefined)}
                  className="ml-1 hover:bg-blue-200 rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}

            {localFilters.q && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                Búsqueda: "{localFilters.q}"
                <button
                  onClick={() => handleFilterChange('q', undefined)}
                  className="ml-1 hover:bg-blue-200 rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};