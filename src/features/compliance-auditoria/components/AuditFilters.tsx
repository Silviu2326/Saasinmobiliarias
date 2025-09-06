import { useState, useEffect } from 'react';
import { Search, Calendar, Filter, X, Clock } from 'lucide-react';
import { getQuickDateRanges } from '../utils';
import type { AuditQuery, Severity, Result } from '../types';

interface AuditFiltersProps {
  initialFilters: AuditQuery;
  onFiltersChange: (filters: AuditQuery) => void;
  isLoading?: boolean;
}

export function AuditFilters({ initialFilters, onFiltersChange, isLoading }: AuditFiltersProps) {
  const [filters, setFilters] = useState<AuditQuery>(initialFilters);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const quickRanges = getQuickDateRanges();

  useEffect(() => {
    setFilters(initialFilters);
  }, [initialFilters]);

  const handleFilterChange = (key: keyof AuditQuery, value: any) => {
    const newFilters = { ...filters, [key]: value };
    if (value === '' || value === undefined) {
      delete newFilters[key];
    }
    setFilters(newFilters);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFiltersChange({ ...filters, page: 1 });
  };

  const handleClear = () => {
    const cleared: AuditQuery = { page: 1, size: filters.size || 25 };
    setFilters(cleared);
    onFiltersChange(cleared);
  };

  const handleQuickDate = (range: { from: string; to: string }) => {
    const newFilters = {
      ...filters,
      from: range.from.split('T')[0],
      to: range.to.split('T')[0],
    };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const hasActiveFilters = Object.keys(filters).some(key => 
    key !== 'page' && key !== 'size' && filters[key as keyof AuditQuery] !== undefined
  );

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Filtros de Auditoría</h3>
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
        >
          <Filter className="h-4 w-4" />
          {showAdvanced ? 'Ocultar filtros' : 'Más filtros'}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Búsqueda principal y fechas rápidas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Búsqueda general
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={filters.q || ''}
                onChange={(e) => handleFilterChange('q', e.target.value)}
                placeholder="Actor, entidad, acción, referencia..."
                className="w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rangos rápidos
            </label>
            <div className="flex flex-wrap gap-2">
              {Object.entries(quickRanges).map(([key, range]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleQuickDate(range)}
                  className="px-3 py-1 text-sm border rounded-lg hover:bg-gray-50 flex items-center gap-1"
                >
                  <Clock className="h-3 w-3" />
                  {range.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Rango de fechas manual */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Desde
            </label>
            <input
              type="date"
              value={filters.from || ''}
              onChange={(e) => handleFilterChange('from', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hasta
            </label>
            <input
              type="date"
              value={filters.to || ''}
              onChange={(e) => handleFilterChange('to', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Filtros básicos */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Severidad
            </label>
            <select
              value={filters.severity || ''}
              onChange={(e) => handleFilterChange('severity', e.target.value as Severity)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todas</option>
              <option value="low">Bajo</option>
              <option value="med">Medio</option>
              <option value="high">Alto</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Resultado
            </label>
            <select
              value={filters.result || ''}
              onChange={(e) => handleFilterChange('result', e.target.value as Result)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos</option>
              <option value="ok">Exitoso</option>
              <option value="error">Error</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Origen
            </label>
            <select
              value={filters.origin || ''}
              onChange={(e) => handleFilterChange('origin', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos</option>
              <option value="web">Web</option>
              <option value="api">API</option>
              <option value="task">Tarea</option>
            </select>
          </div>
        </div>

        {/* Filtros avanzados */}
        {showAdvanced && (
          <div className="border-t pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Actor
                </label>
                <input
                  type="text"
                  value={filters.actor || ''}
                  onChange={(e) => handleFilterChange('actor', e.target.value)}
                  placeholder="usuario@ejemplo.com"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rol
                </label>
                <select
                  value={filters.role || ''}
                  onChange={(e) => handleFilterChange('role', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Todos</option>
                  <option value="admin">Administrador</option>
                  <option value="comercial">Comercial</option>
                  <option value="legal">Legal</option>
                  <option value="manager">Manager</option>
                  <option value="viewer">Visualizador</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Entidad
                </label>
                <select
                  value={filters.entity || ''}
                  onChange={(e) => handleFilterChange('entity', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Todas</option>
                  <option value="lead">Lead</option>
                  <option value="cliente">Cliente</option>
                  <option value="propietario">Propietario</option>
                  <option value="propiedad">Propiedad</option>
                  <option value="oferta">Oferta</option>
                  <option value="reserva">Reserva</option>
                  <option value="contrato">Contrato</option>
                  <option value="consent">Consentimiento</option>
                  <option value="dsr">DSR</option>
                  <option value="kyc">KYC</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Acción
                </label>
                <select
                  value={filters.action || ''}
                  onChange={(e) => handleFilterChange('action', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Todas</option>
                  <option value="create">Crear</option>
                  <option value="update">Actualizar</option>
                  <option value="delete">Eliminar</option>
                  <option value="export">Exportar</option>
                  <option value="sign">Firmar</option>
                  <option value="login">Login</option>
                  <option value="download">Descargar</option>
                  <option value="access">Acceder</option>
                  <option value="approve">Aprobar</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Registros por página
                </label>
                <select
                  value={filters.size || 25}
                  onChange={(e) => handleFilterChange('size', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Botones de acción */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleClear}
                className="flex items-center gap-1 px-3 py-2 text-sm text-gray-600 hover:text-gray-900"
              >
                <X className="h-4 w-4" />
                Limpiar filtros
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? 'Buscando...' : 'Aplicar filtros'}
            </button>
          </div>
        </div>
      </form>

      {/* Resumen de filtros activos */}
      {hasActiveFilters && (
        <div className="mt-4 pt-4 border-t">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Filter className="h-4 w-4" />
            <span>Filtros activos:</span>
            <div className="flex flex-wrap gap-2">
              {Object.entries(filters).map(([key, value]) => {
                if (key === 'page' || key === 'size' || !value) return null;
                
                return (
                  <span
                    key={key}
                    className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs"
                  >
                    {key}: {String(value)}
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}