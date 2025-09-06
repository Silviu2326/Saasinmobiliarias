import React, { useState } from 'react';
import { 
  Edit, 
  Copy, 
  Trash2, 
  Play, 
  Pause, 
  MoreVertical,
  ArrowUpDown,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Regla, TRIGGERS_DISPONIBLES, CONFIGURACIONES_ACCION } from '../types/regla.types';

interface ReglasListProps {
  reglas: Regla[];
  isLoading: boolean;
  onEdit: (regla: Regla) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
  onToggle: (id: string) => void;
  onReorder?: (reorderedIds: string[]) => void;
}

export const ReglasList: React.FC<ReglasListProps> = ({
  reglas,
  isLoading,
  onEdit,
  onDuplicate,
  onDelete,
  onToggle,
  onReorder
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [triggerFilter, setTriggerFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'nombre' | 'prioridad' | 'fechaCreacion' | 'totalEjecuciones'>('prioridad');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [showMenu, setShowMenu] = useState<string | null>(null);

  const itemsPerPage = 10;

  // Filter and sort reglas
  const filteredReglas = reglas
    .filter(regla => {
      const matchesSearch = regla.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           regla.descripcion?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || 
                           (statusFilter === 'active' && regla.activa) ||
                           (statusFilter === 'inactive' && !regla.activa);
      
      const matchesTrigger = triggerFilter === 'all' || regla.trigger === triggerFilter;
      
      return matchesSearch && matchesStatus && matchesTrigger;
    })
    .sort((a, b) => {
      const direction = sortDirection === 'asc' ? 1 : -1;
      
      switch (sortBy) {
        case 'nombre':
          return a.nombre.localeCompare(b.nombre) * direction;
        case 'prioridad':
          return (a.prioridad - b.prioridad) * direction;
        case 'fechaCreacion':
          return (new Date(a.fechaCreacion).getTime() - new Date(b.fechaCreacion).getTime()) * direction;
        case 'totalEjecuciones':
          return (a.totalEjecuciones - b.totalEjecuciones) * direction;
        default:
          return 0;
      }
    });

  // Pagination
  const totalPages = Math.ceil(filteredReglas.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedReglas = filteredReglas.slice(startIndex, startIndex + itemsPerPage);

  const handleSort = (field: typeof sortBy) => {
    if (sortBy === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDirection('asc');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getActionsSummary = (acciones: any[]) => {
    if (acciones.length === 0) return 'Sin acciones';
    
    const summary = acciones
      .map(accion => CONFIGURACIONES_ACCION[accion.type]?.label || accion.type)
      .slice(0, 2)
      .join(', ');
    
    return acciones.length > 2 ? `${summary} +${acciones.length - 2} más` : summary;
  };

  const SortButton = ({ field, children }: { field: typeof sortBy; children: React.ReactNode }) => (
    <button
      onClick={() => handleSort(field)}
      className="flex items-center gap-1 hover:text-gray-900 text-left"
    >
      {children}
      <ArrowUpDown className={`w-3 h-3 ${sortBy === field ? 'text-blue-600' : 'text-gray-400'}`} />
    </button>
  );

  const MenuButton = ({ regla }: { regla: Regla }) => (
    <div className="relative">
      <button
        onClick={(e) => {
          e.stopPropagation();
          setShowMenu(showMenu === regla.id ? null : regla.id);
        }}
        className="p-1 text-gray-400 hover:text-gray-600 rounded"
      >
        <MoreVertical className="w-4 h-4" />
      </button>
      
      {showMenu === regla.id && (
        <>
          <div 
            className="fixed inset-0 z-10"
            onClick={() => setShowMenu(null)}
          />
          <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
            <button
              onClick={() => {
                onEdit(regla);
                setShowMenu(null);
              }}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
            >
              <Edit className="w-4 h-4" />
              Editar
            </button>
            
            <button
              onClick={() => {
                onDuplicate(regla.id);
                setShowMenu(null);
              }}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
            >
              <Copy className="w-4 h-4" />
              Duplicar
            </button>
            
            <button
              onClick={() => {
                onToggle(regla.id);
                setShowMenu(null);
              }}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
            >
              {regla.activa ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {regla.activa ? 'Desactivar' : 'Activar'}
            </button>
            
            <hr className="my-1" />
            
            <button
              onClick={() => {
                onDelete(regla.id);
                setShowMenu(null);
              }}
              className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Eliminar
            </button>
          </div>
        </>
      )}
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Filters */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar reglas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="all">Todos los estados</option>
              <option value="active">Activas</option>
              <option value="inactive">Inactivas</option>
            </select>
            
            <select
              value={triggerFilter}
              onChange={(e) => setTriggerFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="all">Todos los triggers</option>
              {Object.entries(TRIGGERS_DISPONIBLES).map(([key, trigger]) => (
                <option key={key} value={key}>
                  {trigger.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <SortButton field="prioridad">Prioridad</SortButton>
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <SortButton field="nombre">Regla</SortButton>
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Trigger
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <SortButton field="totalEjecuciones">Ejecuciones</SortButton>
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <SortButton field="fechaCreacion">Fecha</SortButton>
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="px-4 py-4">
                    <div className="h-4 bg-gray-200 rounded w-8"></div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="h-4 bg-gray-200 rounded w-32"></div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="h-4 bg-gray-200 rounded w-16"></div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="h-4 bg-gray-200 rounded w-12"></div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="h-4 bg-gray-200 rounded w-8"></div>
                  </td>
                </tr>
              ))
            ) : paginatedReglas.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-gray-500">
                  {searchTerm || statusFilter !== 'all' || triggerFilter !== 'all' 
                    ? 'No se encontraron reglas que coincidan con los filtros'
                    : 'No hay reglas configuradas'
                  }
                </td>
              </tr>
            ) : (
              paginatedReglas.map((regla) => {
                const trigger = TRIGGERS_DISPONIBLES[regla.trigger];
                
                return (
                  <tr key={regla.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="inline-flex items-center justify-center w-6 h-6 text-xs font-medium text-gray-600 bg-gray-100 rounded-full">
                          {regla.prioridad}
                        </span>
                      </div>
                    </td>
                    
                    <td className="px-4 py-4">
                      <div className="max-w-xs">
                        <div className="font-medium text-gray-900 truncate">
                          {regla.nombre}
                        </div>
                        {regla.descripcion && (
                          <div className="text-sm text-gray-500 truncate mt-1">
                            {regla.descripcion}
                          </div>
                        )}
                      </div>
                    </td>
                    
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{trigger.icon}</span>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {trigger.label}
                          </div>
                          <div className="text-xs text-gray-500">
                            {trigger.category}
                          </div>
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-4 py-4">
                      <div className="text-sm text-gray-900">
                        {getActionsSummary(regla.acciones)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {regla.condiciones.length} condicion{regla.condiciones.length !== 1 ? 'es' : ''}
                      </div>
                    </td>
                    
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {regla.totalEjecuciones.toLocaleString()}
                      </div>
                      {regla.ultimaEjecucion && (
                        <div className="text-xs text-gray-500">
                          Última: {formatDate(regla.ultimaEjecucion)}
                        </div>
                      )}
                    </td>
                    
                    <td className="px-4 py-4 whitespace-nowrap">
                      <button
                        onClick={() => onToggle(regla.id)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                          regla.activa ? 'bg-blue-600' : 'bg-gray-200'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            regla.activa ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </td>
                    
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(regla.fechaCreacion)}
                    </td>
                    
                    <td className="px-4 py-4 whitespace-nowrap text-right">
                      <MenuButton regla={regla} />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Mostrando {startIndex + 1} a {Math.min(startIndex + itemsPerPage, filteredReglas.length)} de {filteredReglas.length} reglas
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(page => 
                  page === 1 || 
                  page === totalPages || 
                  Math.abs(page - currentPage) <= 1
                )
                .map((page, index, array) => (
                  <React.Fragment key={page}>
                    {index > 0 && array[index - 1] !== page - 1 && (
                      <span className="px-2 text-gray-400">...</span>
                    )}
                    <button
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-1 text-sm rounded ${
                        currentPage === page
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {page}
                    </button>
                  </React.Fragment>
                ))
              }
            </div>
            
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};