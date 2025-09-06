import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  Filter,
  MoreHorizontal,
  Edit2,
  Copy,
  Pause,
  Play,
  Trash2,
  Eye,
  Calendar,
  DollarSign,
  Target,
  Users,
  Mail,
  MessageSquare,
  Globe,
  Zap,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Campana } from '../index';

interface CampanasListProps {
  campanas: Campana[];
  onEdit: (campana: Campana) => void;
  onDelete: (id: string) => void;
  onDuplicate: (campana: Campana) => void;
  onToggleStatus: (campana: Campana) => void;
}

export const CampanasList: React.FC<CampanasListProps> = ({
  campanas,
  onEdit,
  onDelete,
  onDuplicate,
  onToggleStatus
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState<string>('todos');
  const [filterTipo, setFilterTipo] = useState<string>('todos');
  const [sortBy, setSortBy] = useState<'nombre' | 'fechaCreacion' | 'presupuesto' | 'roi'>('fechaCreacion');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedCampana, setSelectedCampana] = useState<string | null>(null);

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'email':
        return <Mail className="h-4 w-4" />;
      case 'sms':
        return <MessageSquare className="h-4 w-4" />;
      case 'portales':
        return <Globe className="h-4 w-4" />;
      case 'rpa':
        return <Zap className="h-4 w-4" />;
      default:
        return <Target className="h-4 w-4" />;
    }
  };

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'email':
        return 'text-blue-600 bg-blue-100';
      case 'sms':
        return 'text-green-600 bg-green-100';
      case 'portales':
        return 'text-purple-600 bg-purple-100';
      case 'rpa':
        return 'text-orange-600 bg-orange-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'activa':
        return 'text-green-600 bg-green-100';
      case 'pausada':
        return 'text-yellow-600 bg-yellow-100';
      case 'finalizada':
        return 'text-gray-600 bg-gray-100';
      case 'borrador':
        return 'text-blue-600 bg-blue-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getEstadoIcon = (estado: string) => {
    switch (estado) {
      case 'activa':
        return <Play className="h-3 w-3" />;
      case 'pausada':
        return <Pause className="h-3 w-3" />;
      case 'finalizada':
        return <Target className="h-3 w-3" />;
      case 'borrador':
        return <Edit2 className="h-3 w-3" />;
      default:
        return null;
    }
  };

  const filteredCampanas = campanas
    .filter(campana => {
      const matchesSearch = campana.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          campana.tipo.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesEstado = filterEstado === 'todos' || campana.estado === filterEstado;
      const matchesTipo = filterTipo === 'todos' || campana.tipo === filterTipo;
      return matchesSearch && matchesEstado && matchesTipo;
    })
    .sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'nombre':
          aValue = a.nombre;
          bValue = b.nombre;
          break;
        case 'fechaCreacion':
          aValue = new Date(a.fechaCreacion);
          bValue = new Date(b.fechaCreacion);
          break;
        case 'presupuesto':
          aValue = a.presupuesto;
          bValue = b.presupuesto;
          break;
        case 'roi':
          aValue = a.metricas.roi;
          bValue = b.metricas.roi;
          break;
        default:
          return 0;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  const totalPages = Math.ceil(filteredCampanas.length / itemsPerPage);
  const paginatedCampanas = filteredCampanas.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSort = (field: typeof sortBy) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getROITrend = (roi: number) => {
    if (roi > 20) return { icon: ArrowUpRight, color: 'text-green-600' };
    if (roi < 5) return { icon: ArrowDownRight, color: 'text-red-600' };
    return { icon: TrendingUp, color: 'text-yellow-600' };
  };

  return (
    <div className="space-y-6">
      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar campañas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-64 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <select
              value={filterEstado}
              onChange={(e) => setFilterEstado(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="todos">Todos los estados</option>
              <option value="activa">Activas</option>
              <option value="pausada">Pausadas</option>
              <option value="finalizada">Finalizadas</option>
              <option value="borrador">Borradores</option>
            </select>

            <select
              value={filterTipo}
              onChange={(e) => setFilterTipo(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="todos">Todos los tipos</option>
              <option value="email">Email</option>
              <option value="sms">SMS</option>
              <option value="portales">Portales</option>
              <option value="rpa">RPA</option>
            </select>
          </div>

          <div className="text-sm text-gray-500">
            {filteredCampanas.length} de {campanas.length} campañas
          </div>
        </div>
      </div>

      {/* Campaigns Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left">
                  <button
                    onClick={() => handleSort('nombre')}
                    className="flex items-center text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-gray-700"
                  >
                    Campaña
                    {sortBy === 'nombre' && (
                      sortOrder === 'asc' ? <ChevronUp className="ml-1 h-3 w-3" /> : <ChevronDown className="ml-1 h-3 w-3" />
                    )}
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left">
                  <button
                    onClick={() => handleSort('fechaCreacion')}
                    className="flex items-center text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-gray-700"
                  >
                    Fechas
                    {sortBy === 'fechaCreacion' && (
                      sortOrder === 'asc' ? <ChevronUp className="ml-1 h-3 w-3" /> : <ChevronDown className="ml-1 h-3 w-3" />
                    )}
                  </button>
                </th>
                <th className="px-6 py-3 text-left">
                  <button
                    onClick={() => handleSort('presupuesto')}
                    className="flex items-center text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-gray-700"
                  >
                    Presupuesto
                    {sortBy === 'presupuesto' && (
                      sortOrder === 'asc' ? <ChevronUp className="ml-1 h-3 w-3" /> : <ChevronDown className="ml-1 h-3 w-3" />
                    )}
                  </button>
                </th>
                <th className="px-6 py-3 text-left">
                  <button
                    onClick={() => handleSort('roi')}
                    className="flex items-center text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-gray-700"
                  >
                    Rendimiento
                    {sortBy === 'roi' && (
                      sortOrder === 'asc' ? <ChevronUp className="ml-1 h-3 w-3" /> : <ChevronDown className="ml-1 h-3 w-3" />
                    )}
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Segmentación
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedCampanas.map((campana) => {
                const roiTrend = getROITrend(campana.metricas.roi);
                return (
                  <motion.tr
                    key={campana.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-start space-x-3">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{campana.nombre}</p>
                          <p className="text-xs text-gray-500">
                            Creada el {formatDate(campana.fechaCreacion)}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getEstadoColor(campana.estado)}`}>
                        {getEstadoIcon(campana.estado)}
                        <span className="ml-1 capitalize">{campana.estado}</span>
                      </span>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTipoColor(campana.tipo)}`}>
                        {getTipoIcon(campana.tipo)}
                        <span className="ml-1 capitalize">{campana.tipo}</span>
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <div className="flex items-center text-xs text-gray-500">
                          <Calendar className="h-3 w-3 mr-1" />
                          {formatDate(campana.fechaInicio)}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          hasta {formatDate(campana.fechaFin)}
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatCurrency(campana.presupuesto)}
                        <div className="text-xs text-gray-500">
                          {formatCurrency(campana.gastado)} gastado
                        </div>
                        <div className="w-16 bg-gray-200 rounded-full h-1.5 mt-1">
                          <div 
                            className="bg-blue-500 h-1.5 rounded-full" 
                            style={{ width: `${Math.min((campana.gastado / campana.presupuesto) * 100, 100)}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <roiTrend.icon className={`h-4 w-4 mr-1 ${roiTrend.color}`} />
                        <span className="text-sm font-medium text-gray-900">
                          {campana.metricas.roi}% ROI
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        CTR: {campana.metricas.ctr}%
                      </div>
                      <div className="text-xs text-gray-500">
                        {campana.metricas.conversiones} conversiones
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <Users className="h-3 w-3 text-gray-400 mr-1" />
                        <span className="text-xs text-gray-600">
                          {campana.segmentacion.length} segmentos
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {campana.segmentacion.slice(0, 2).map((segmento) => (
                          <span
                            key={segmento}
                            className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded"
                          >
                            {segmento}
                          </span>
                        ))}
                        {campana.segmentacion.length > 2 && (
                          <span className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                            +{campana.segmentacion.length - 2}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => onEdit(campana)}
                          className="text-blue-600 hover:text-blue-700"
                          title="Editar"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        
                        <button
                          onClick={() => onDuplicate(campana)}
                          className="text-green-600 hover:text-green-700"
                          title="Duplicar"
                        >
                          <Copy className="h-4 w-4" />
                        </button>

                        {campana.estado === 'activa' || campana.estado === 'pausada' ? (
                          <button
                            onClick={() => onToggleStatus(campana)}
                            className={campana.estado === 'activa' ? 'text-yellow-600 hover:text-yellow-700' : 'text-green-600 hover:text-green-700'}
                            title={campana.estado === 'activa' ? 'Pausar' : 'Activar'}
                          >
                            {campana.estado === 'activa' ? (
                              <Pause className="h-4 w-4" />
                            ) : (
                              <Play className="h-4 w-4" />
                            )}
                          </button>
                        ) : null}

                        <button
                          className="text-gray-600 hover:text-gray-700"
                          title="Ver detalles"
                        >
                          <Eye className="h-4 w-4" />
                        </button>

                        <button
                          onClick={() => onDelete(campana.id)}
                          className="text-red-600 hover:text-red-700"
                          title="Eliminar"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-t border-gray-200">
            <div className="flex items-center text-sm text-gray-700">
              Mostrando {(currentPage - 1) * itemsPerPage + 1} a{' '}
              {Math.min(currentPage * itemsPerPage, filteredCampanas.length)} de{' '}
              {filteredCampanas.length} resultados
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
              >
                Anterior
              </button>
              
              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = i + 1;
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-1 text-sm border rounded ${
                        currentPage === page
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'border-gray-300 hover:bg-gray-100'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
                {totalPages > 5 && (
                  <>
                    <span className="px-2 text-gray-500">...</span>
                    <button
                      onClick={() => setCurrentPage(totalPages)}
                      className={`px-3 py-1 text-sm border rounded ${
                        currentPage === totalPages
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'border-gray-300 hover:bg-gray-100'
                      }`}
                    >
                      {totalPages}
                    </button>
                  </>
                )}
              </div>

              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Empty State */}
      {filteredCampanas.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <Target className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron campañas</h3>
          <p className="text-gray-500 mb-6">
            {searchTerm || filterEstado !== 'todos' || filterTipo !== 'todos'
              ? 'No hay campañas que coincidan con los filtros seleccionados.'
              : 'Aún no has creado ninguna campaña.'}
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setFilterEstado('todos');
              setFilterTipo('todos');
            }}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            Limpiar filtros
          </button>
        </div>
      )}
    </div>
  );
};