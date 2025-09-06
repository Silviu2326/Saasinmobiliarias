import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Filter, ChevronDown, X, Search } from 'lucide-react';
import { DueDateFilters, DueType, DueStatus, Priority, SLAState } from '../types';
import { formatDateTime } from '../utils';

interface DueDatesFiltersProps {
  filters: DueDateFilters;
  onChange: (filters: DueDateFilters) => void;
  onClear: () => void;
  className?: string;
}

const dueTypes: { value: DueType; label: string }[] = [
  { value: 'OFERTA', label: 'Ofertas' },
  { value: 'RESERVA', label: 'Reservas' },
  { value: 'CONTRATO', label: 'Contratos' },
  { value: 'DUE_DILIGENCE', label: 'Due Diligence' },
  { value: 'PAGO', label: 'Pagos' },
  { value: 'DOCUMENTO', label: 'Documentos' },
  { value: 'TAREA', label: 'Tareas' }
];

const statuses: { value: DueStatus; label: string }[] = [
  { value: 'PENDIENTE', label: 'Pendientes' },
  { value: 'COMPLETADO', label: 'Completados' },
  { value: 'POSPUESTO', label: 'Pospuestos' },
  { value: 'VENCIDO', label: 'Vencidos' }
];

const priorities: { value: Priority; label: string }[] = [
  { value: 'BAJA', label: 'Baja' },
  { value: 'MEDIA', label: 'Media' },
  { value: 'ALTA', label: 'Alta' },
  { value: 'CRITICA', label: 'Crítica' }
];

const slaStates: { value: SLAState; label: string }[] = [
  { value: 'ON_TIME', label: 'A tiempo' },
  { value: 'AT_RISK', label: 'En riesgo' },
  { value: 'LATE', label: 'Vencidos' }
];

const offices = ['Madrid Centro', 'Barcelona', 'Valencia', 'Sevilla'];
const teams = ['Ventas', 'Legal', 'Administración', 'Due Diligence'];
const agents = ['Juan Pérez', 'María García', 'Carlos López', 'Ana Martín', 'Luis Rodríguez'];

export default function DueDatesFilters({ filters, onChange, onClear, className }: DueDatesFiltersProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  
  const activeFiltersCount = Object.values(filters).filter(value => 
    value !== undefined && value !== '' && value !== null
  ).length;

  const updateFilter = (key: keyof DueDateFilters, value: any) => {
    onChange({ ...filters, [key]: value || undefined });
  };

  const clearFilter = (key: keyof DueDateFilters) => {
    const newFilters = { ...filters };
    delete newFilters[key];
    onChange(newFilters);
  };

  const getActiveFiltersDisplay = () => {
    const activeFilters = [];
    
    if (filters.tipo) activeFilters.push({ key: 'tipo', label: dueTypes.find(t => t.value === filters.tipo)?.label });
    if (filters.estado) activeFilters.push({ key: 'estado', label: statuses.find(s => s.value === filters.estado)?.label });
    if (filters.prioridad) activeFilters.push({ key: 'prioridad', label: priorities.find(p => p.value === filters.prioridad)?.label });
    if (filters.sla) activeFilters.push({ key: 'sla', label: slaStates.find(s => s.value === filters.sla)?.label });
    if (filters.oficina) activeFilters.push({ key: 'oficina', label: filters.oficina });
    if (filters.from) activeFilters.push({ key: 'from', label: `Desde ${formatDateTime(filters.from, false)}` });
    if (filters.to) activeFilters.push({ key: 'to', label: `Hasta ${formatDateTime(filters.to, false)}` });
    
    return activeFilters;
  };

  return (
    <Card className={className}>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="w-full justify-between p-4 h-auto">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <span>Filtros</span>
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {activeFiltersCount}
                </Badge>
              )}
            </div>
            <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </Button>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="pt-0">
            {/* Active filters display */}
            {activeFiltersCount > 0 && (
              <div className="mb-4">
                <div className="flex items-center gap-2 flex-wrap">
                  {getActiveFiltersDisplay().map(filter => (
                    <Badge key={filter.key} variant="secondary" className="flex items-center gap-1">
                      {filter.label}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 hover:bg-gray-200"
                        onClick={() => clearFilter(filter.key as keyof DueDateFilters)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                  <Button variant="ghost" size="sm" onClick={onClear} className="text-red-600">
                    Limpiar todos
                  </Button>
                </div>
              </div>
            )}

            {/* Search */}
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar por título, descripción o responsable..."
                  value={filters.q || ''}
                  onChange={(e) => updateFilter('q', e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {/* Filter grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              {/* Date range */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Fecha desde</label>
                <Input
                  type="date"
                  value={filters.from ? filters.from.split('T')[0] : ''}
                  onChange={(e) => updateFilter('from', e.target.value ? `${e.target.value}T00:00:00` : '')}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Fecha hasta</label>
                <Input
                  type="date"
                  value={filters.to ? filters.to.split('T')[0] : ''}
                  onChange={(e) => updateFilter('to', e.target.value ? `${e.target.value}T23:59:59` : '')}
                />
              </div>

              {/* Type */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Tipo</label>
                <Select value={filters.tipo || 'all'} onValueChange={(value) => updateFilter('tipo', value === 'all' ? '' : value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos los tipos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los tipos</SelectItem>
                    {dueTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Status */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Estado</label>
                <Select value={filters.estado || 'all'} onValueChange={(value) => updateFilter('estado', value === 'all' ? '' : value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos los estados" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los estados</SelectItem>
                    {statuses.map(status => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Priority */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Prioridad</label>
                <Select value={filters.prioridad || 'all'} onValueChange={(value) => updateFilter('prioridad', value === 'all' ? '' : value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todas las prioridades" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las prioridades</SelectItem>
                    {priorities.map(priority => (
                      <SelectItem key={priority.value} value={priority.value}>
                        {priority.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* SLA */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">SLA</label>
                <Select value={filters.sla || 'all'} onValueChange={(value) => updateFilter('sla', value === 'all' ? '' : value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos los SLA" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los SLA</SelectItem>
                    {slaStates.map(sla => (
                      <SelectItem key={sla.value} value={sla.value}>
                        {sla.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Office */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Oficina</label>
                <Select value={filters.oficina || 'all'} onValueChange={(value) => updateFilter('oficina', value === 'all' ? '' : value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todas las oficinas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las oficinas</SelectItem>
                    {offices.map(office => (
                      <SelectItem key={office} value={office}>
                        {office}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Agent */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Responsable</label>
                <Select value={filters.agente || 'all'} onValueChange={(value) => updateFilter('agente', value === 'all' ? '' : value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos los agentes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los agentes</SelectItem>
                    {agents.map(agent => (
                      <SelectItem key={agent} value={agent}>
                        {agent}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}