import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  Filter,
  MoreHorizontal,
  Edit2,
  Archive,
  Trash2,
  QrCode,
  Eye,
  AlertTriangle,
  Package,
  Truck,
  Activity,
  CheckCircle2,
  XCircle,
  Calendar,
  MapPin,
  Thermometer,
  Clock,
  ChevronDown,
  ChevronUp,
  Download
} from 'lucide-react';
import { Producto, TrazabilidadFilters } from '../index';

interface ProductosListProps {
  productos: Producto[];
  onEdit: (producto: Producto) => void;
  onDelete: (id: string) => void;
  onGenerateQR: (id: string) => void;
  onResolveAlert: (alertId: string) => void;
}

export const ProductosList: React.FC<ProductosListProps> = ({
  productos,
  onEdit,
  onDelete,
  onGenerateQR,
  onResolveAlert
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState<string>('todos');
  const [filterCategoria, setFilterCategoria] = useState<string>('todas');
  const [sortBy, setSortBy] = useState<'nombre' | 'fechaRegistro' | 'fechaCaducidad' | 'estado'>('fechaRegistro');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedProducto, setSelectedProducto] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'en_transito':
        return 'text-blue-600 bg-blue-100';
      case 'almacenado':
        return 'text-green-600 bg-green-100';
      case 'distribuido':
        return 'text-orange-600 bg-orange-100';
      case 'entregado':
        return 'text-purple-600 bg-purple-100';
      case 'vencido':
        return 'text-red-600 bg-red-100';
      case 'retirado':
        return 'text-gray-600 bg-gray-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getEstadoIcon = (estado: string) => {
    switch (estado) {
      case 'en_transito':
        return <Truck className="h-4 w-4" />;
      case 'almacenado':
        return <Package className="h-4 w-4" />;
      case 'distribuido':
        return <Activity className="h-4 w-4" />;
      case 'entregado':
        return <CheckCircle2 className="h-4 w-4" />;
      case 'vencido':
        return <XCircle className="h-4 w-4" />;
      case 'retirado':
        return <Archive className="h-4 w-4" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  const getSeveridadColor = (severidad: string) => {
    switch (severidad) {
      case 'critica':
        return 'text-red-600 bg-red-100';
      case 'alta':
        return 'text-orange-600 bg-orange-100';
      case 'media':
        return 'text-yellow-600 bg-yellow-100';
      case 'baja':
        return 'text-blue-600 bg-blue-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const filteredProductos = productos
    .filter(producto => {
      const matchesSearch = producto.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          producto.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          producto.categoria.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesEstado = filterEstado === 'todos' || producto.estado === filterEstado;
      const matchesCategoria = filterCategoria === 'todas' || producto.categoria === filterCategoria;
      return matchesSearch && matchesEstado && matchesCategoria;
    })
    .sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'nombre':
          aValue = a.nombre;
          bValue = b.nombre;
          break;
        case 'fechaRegistro':
          aValue = new Date(a.fechas.registro);
          bValue = new Date(b.fechas.registro);
          break;
        case 'fechaCaducidad':
          aValue = new Date(a.fechas.caducidad);
          bValue = new Date(b.fechas.caducidad);
          break;
        case 'estado':
          aValue = a.estado;
          bValue = b.estado;
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

  const totalPages = Math.ceil(filteredProductos.length / itemsPerPage);
  const paginatedProductos = filteredProductos.slice(
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getDaysUntilExpiry = (expiryDate: string) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getExpiryColor = (days: number) => {
    if (days < 0) return 'text-red-600';
    if (days <= 7) return 'text-orange-600';
    if (days <= 30) return 'text-yellow-600';
    return 'text-green-600';
  };

  const categorias = Array.from(new Set(productos.map(p => p.categoria)));

  return (
    <div className="space-y-6">
      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
        <div className="flex flex-col space-y-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar productos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-64 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filtros
                {showFilters ? <ChevronUp className="h-4 w-4 ml-2" /> : <ChevronDown className="h-4 w-4 ml-2" />}
              </button>
            </div>

            <div className="text-sm text-gray-500">
              {filteredProductos.length} de {productos.length} productos
            </div>
          </div>

          {/* Extended Filters */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200"
            >
              <select
                value={filterEstado}
                onChange={(e) => setFilterEstado(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="todos">Todos los estados</option>
                <option value="en_transito">En Tránsito</option>
                <option value="almacenado">Almacenado</option>
                <option value="distribuido">Distribuido</option>
                <option value="entregado">Entregado</option>
                <option value="vencido">Vencido</option>
                <option value="retirado">Retirado</option>
              </select>

              <select
                value={filterCategoria}
                onChange={(e) => setFilterCategoria(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="todas">Todas las categorías</option>
                {categorias.map((categoria) => (
                  <option key={categoria} value={categoria}>
                    {categoria}
                  </option>
                ))}
              </select>

              <button
                onClick={() => {
                  setFilterEstado('todos');
                  setFilterCategoria('todas');
                  setSearchTerm('');
                }}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Limpiar Filtros
              </button>
            </motion.div>
          )}
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left">
                  <button
                    onClick={() => handleSort('nombre')}
                    className="flex items-center text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-gray-700"
                  >
                    Producto
                    {sortBy === 'nombre' && (
                      sortOrder === 'asc' ? <ChevronUp className="ml-1 h-3 w-3" /> : <ChevronDown className="ml-1 h-3 w-3" />
                    )}
                  </button>
                </th>
                <th className="px-6 py-3 text-left">
                  <button
                    onClick={() => handleSort('estado')}
                    className="flex items-center text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-gray-700"
                  >
                    Estado
                    {sortBy === 'estado' && (
                      sortOrder === 'asc' ? <ChevronUp className="ml-1 h-3 w-3" /> : <ChevronDown className="ml-1 h-3 w-3" />
                    )}
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Proveedor
                </th>
                <th className="px-6 py-3 text-left">
                  <button
                    onClick={() => handleSort('fechaCaducidad')}
                    className="flex items-center text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-gray-700"
                  >
                    Caducidad
                    {sortBy === 'fechaCaducidad' && (
                      sortOrder === 'asc' ? <ChevronUp className="ml-1 h-3 w-3" /> : <ChevronDown className="ml-1 h-3 w-3" />
                    )}
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cantidad
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ubicación
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Alertas
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedProductos.map((producto) => {
                const daysUntilExpiry = getDaysUntilExpiry(producto.fechas.caducidad);
                const alertasActivas = producto.alertas.filter(a => !a.resuelta);
                
                return (
                  <motion.tr
                    key={producto.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-start space-x-3">
                        <div className={`p-2 rounded-lg ${getEstadoColor(producto.estado)}`}>
                          {getEstadoIcon(producto.estado)}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{producto.nombre}</p>
                          <p className="text-xs text-gray-500">{producto.codigo} • {producto.categoria}</p>
                          <p className="text-xs text-gray-400">Lote: {producto.lote}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getEstadoColor(producto.estado)}`}>
                        {getEstadoIcon(producto.estado)}
                        <span className="ml-1 capitalize">{producto.estado.replace('_', ' ')}</span>
                      </span>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{producto.proveedor.nombre}</div>
                      <div className="text-xs text-gray-500">{producto.proveedor.origen}</div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatDate(producto.fechas.caducidad)}
                      </div>
                      <div className={`text-xs font-medium ${getExpiryColor(daysUntilExpiry)}`}>
                        {daysUntilExpiry < 0 
                          ? `Vencido hace ${Math.abs(daysUntilExpiry)} días`
                          : daysUntilExpiry === 0
                            ? 'Vence hoy'
                            : `${daysUntilExpiry} días restantes`
                        }
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {producto.cantidadActual} / {producto.cantidadInicial}
                      </div>
                      <div className="text-xs text-gray-500">{producto.unidadMedida}</div>
                      <div className="w-16 bg-gray-200 rounded-full h-1.5 mt-1">
                        <div 
                          className={`h-1.5 rounded-full ${
                            (producto.cantidadActual / producto.cantidadInicial) > 0.5 
                              ? 'bg-green-500' 
                              : (producto.cantidadActual / producto.cantidadInicial) > 0.2
                                ? 'bg-yellow-500' 
                                : 'bg-red-500'
                          }`}
                          style={{ width: `${(producto.cantidadActual / producto.cantidadInicial) * 100}%` }}
                        />
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <MapPin className="h-3 w-3 mr-1 text-gray-400" />
                        {producto.ubicacionActual || 'Sin ubicación'}
                      </div>
                      {producto.temperatura && (
                        <div className="flex items-center text-xs text-gray-500 mt-1">
                          <Thermometer className="h-3 w-3 mr-1" />
                          {producto.temperatura.actual}°C
                        </div>
                      )}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      {alertasActivas.length > 0 ? (
                        <div className="space-y-1">
                          {alertasActivas.slice(0, 2).map((alerta) => (
                            <div key={alerta.id} className="flex items-center">
                              <div className={`p-1 rounded ${getSeveridadColor(alerta.severidad)}`}>
                                <AlertTriangle className="h-3 w-3" />
                              </div>
                              <span className="ml-1 text-xs text-gray-600 truncate max-w-20">
                                {alerta.mensaje}
                              </span>
                              <button
                                onClick={() => onResolveAlert(alerta.id)}
                                className="ml-2 text-xs text-blue-600 hover:text-blue-700"
                              >
                                ✓
                              </button>
                            </div>
                          ))}
                          {alertasActivas.length > 2 && (
                            <p className="text-xs text-gray-500">
                              +{alertasActivas.length - 2} más
                            </p>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">Sin alertas</span>
                      )}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => onEdit(producto)}
                          className="text-blue-600 hover:text-blue-700"
                          title="Editar"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        
                        <button
                          onClick={() => onGenerateQR(producto.id)}
                          className="text-green-600 hover:text-green-700"
                          title="Generar QR"
                        >
                          <QrCode className="h-4 w-4" />
                        </button>

                        <button
                          className="text-gray-600 hover:text-gray-700"
                          title="Ver historial"
                        >
                          <Eye className="h-4 w-4" />
                        </button>

                        <div className="relative">
                          <button
                            onClick={() => setSelectedProducto(selectedProducto === producto.id ? null : producto.id)}
                            className="text-gray-600 hover:text-gray-700"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </button>
                          
                          {selectedProducto === producto.id && (
                            <div className="absolute right-0 top-8 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                              <button
                                onClick={() => {
                                  // Export product data
                                  setSelectedProducto(null);
                                }}
                                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              >
                                <Download className="h-4 w-4 mr-2" />
                                Exportar datos
                              </button>
                              <button
                                onClick={() => {
                                  // Archive product
                                  setSelectedProducto(null);
                                }}
                                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              >
                                <Archive className="h-4 w-4 mr-2" />
                                Archivar
                              </button>
                              <button
                                onClick={() => {
                                  onDelete(producto.id);
                                  setSelectedProducto(null);
                                }}
                                className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Eliminar
                              </button>
                            </div>
                          )}
                        </div>
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
              {Math.min(currentPage * itemsPerPage, filteredProductos.length)} de{' '}
              {filteredProductos.length} resultados
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
      {filteredProductos.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron productos</h3>
          <p className="text-gray-500 mb-6">
            {searchTerm || filterEstado !== 'todos' || filterCategoria !== 'todas'
              ? 'No hay productos que coincidan con los filtros seleccionados.'
              : 'Aún no has registrado ningún producto.'}
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setFilterEstado('todos');
              setFilterCategoria('todas');
            }}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            Limpiar filtros
          </button>
        </div>
      )}

      {/* Click outside to close dropdown */}
      {selectedProducto && (
        <div
          className="fixed inset-0 z-5"
          onClick={() => setSelectedProducto(null)}
        />
      )}
    </div>
  );
};