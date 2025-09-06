import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package,
  Truck,
  MapPin,
  Clock,
  User,
  Thermometer,
  Droplets,
  AlertTriangle,
  CheckCircle2,
  Search,
  Filter,
  Calendar,
  Activity,
  Eye
} from 'lucide-react';
import { Producto } from '../index';

interface TrazabilidadTimelineProps {
  productos: Producto[];
}

export const TrazabilidadTimeline: React.FC<TrazabilidadTimelineProps> = ({
  productos
}) => {
  const [selectedProducto, setSelectedProducto] = useState<Producto | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState('todos');

  const filteredProductos = productos.filter(producto => {
    const matchesSearch = producto.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         producto.codigo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesEstado = filterEstado === 'todos' || producto.estado === filterEstado;
    return matchesSearch && matchesEstado;
  });

  const getEventIcon = (evento: string) => {
    const eventoLower = evento.toLowerCase();
    if (eventoLower.includes('registro') || eventoLower.includes('creación')) {
      return <Package className="h-4 w-4" />;
    }
    if (eventoLower.includes('transporte') || eventoLower.includes('envío')) {
      return <Truck className="h-4 w-4" />;
    }
    if (eventoLower.includes('entrega') || eventoLower.includes('recepción')) {
      return <CheckCircle2 className="h-4 w-4" />;
    }
    if (eventoLower.includes('ubicación') || eventoLower.includes('movimiento')) {
      return <MapPin className="h-4 w-4" />;
    }
    if (eventoLower.includes('alerta') || eventoLower.includes('problema')) {
      return <AlertTriangle className="h-4 w-4" />;
    }
    return <Activity className="h-4 w-4" />;
  };

  const getEventColor = (evento: string) => {
    const eventoLower = evento.toLowerCase();
    if (eventoLower.includes('alerta') || eventoLower.includes('problema') || eventoLower.includes('error')) {
      return 'bg-red-100 text-red-600 border-red-200';
    }
    if (eventoLower.includes('entrega') || eventoLower.includes('completado') || eventoLower.includes('éxito')) {
      return 'bg-green-100 text-green-600 border-green-200';
    }
    if (eventoLower.includes('transporte') || eventoLower.includes('enviando')) {
      return 'bg-blue-100 text-blue-600 border-blue-200';
    }
    if (eventoLower.includes('advertencia') || eventoLower.includes('atención')) {
      return 'bg-yellow-100 text-yellow-600 border-yellow-200';
    }
    return 'bg-gray-100 text-gray-600 border-gray-200';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDateShort = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const TimelineItem = ({ historialItem, isLast = false }: { 
    historialItem: Producto['historial'][0]; 
    isLast?: boolean;
  }) => (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="relative"
    >
      {/* Timeline line */}
      {!isLast && (
        <div className="absolute left-6 top-12 bottom-0 w-0.5 bg-gray-200" />
      )}
      
      <div className="flex items-start space-x-4">
        {/* Icon */}
        <div className={`p-2 rounded-full border-2 ${getEventColor(historialItem.evento)} z-10 bg-white`}>
          {getEventIcon(historialItem.evento)}
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0 pb-8">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-semibold text-gray-900">{historialItem.evento}</h4>
              <p className="text-sm text-gray-600 mt-1">{historialItem.descripcion}</p>
            </div>
            <time className="text-xs text-gray-500 whitespace-nowrap ml-4">
              {formatDateShort(historialItem.fecha)}
            </time>
          </div>
          
          <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
            <div className="flex items-center">
              <MapPin className="h-3 w-3 mr-1" />
              <span>{historialItem.ubicacion}</span>
            </div>
            
            <div className="flex items-center">
              <User className="h-3 w-3 mr-1" />
              <span>{historialItem.usuario}</span>
            </div>
            
            {historialItem.temperatura && (
              <div className="flex items-center">
                <Thermometer className="h-3 w-3 mr-1" />
                <span>{historialItem.temperatura}°C</span>
              </div>
            )}
            
            {historialItem.humedad && (
              <div className="flex items-center">
                <Droplets className="h-3 w-3 mr-1" />
                <span>{historialItem.humedad}%</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
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
          </div>

          <div className="text-sm text-gray-500">
            {filteredProductos.length} productos
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Product List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Productos</h3>
            <p className="text-sm text-gray-600">Selecciona un producto para ver su timeline</p>
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {filteredProductos.map((producto) => (
              <motion.button
                key={producto.id}
                whileHover={{ backgroundColor: 'rgb(249 250 251)' }}
                onClick={() => setSelectedProducto(producto)}
                className={`w-full p-4 text-left border-b border-gray-100 transition-colors ${
                  selectedProducto?.id === producto.id ? 'bg-blue-50 border-blue-200' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-gray-900">{producto.nombre}</h4>
                    <p className="text-xs text-gray-500">{producto.codigo} • {producto.categoria}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {producto.historial.length} eventos
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      producto.estado === 'en_transito' ? 'bg-blue-100 text-blue-700' :
                      producto.estado === 'almacenado' ? 'bg-green-100 text-green-700' :
                      producto.estado === 'distribuido' ? 'bg-orange-100 text-orange-700' :
                      producto.estado === 'entregado' ? 'bg-purple-100 text-purple-700' :
                      producto.estado === 'vencido' ? 'bg-red-100 text-red-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {producto.estado.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>

          {filteredProductos.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              <Package className="h-8 w-8 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">No se encontraron productos</p>
            </div>
          )}
        </div>

        {/* Timeline */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {selectedProducto ? 'Timeline de Trazabilidad' : 'Timeline'}
                </h3>
                {selectedProducto && (
                  <p className="text-sm text-gray-600">
                    {selectedProducto.nombre} ({selectedProducto.codigo})
                  </p>
                )}
              </div>
              {selectedProducto && (
                <button
                  className="flex items-center text-sm text-blue-600 hover:text-blue-700"
                >
                  <Eye className="h-4 w-4 mr-1" />
                  Ver detalles
                </button>
              )}
            </div>
          </div>

          <div className="p-6">
            {selectedProducto ? (
              <div className="space-y-4">
                {/* Product Summary */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Proveedor</p>
                      <p className="text-sm font-medium text-gray-900">
                        {selectedProducto.proveedor.nombre}
                      </p>
                      <p className="text-xs text-gray-500">{selectedProducto.proveedor.origen}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Ubicación Actual</p>
                      <p className="text-sm font-medium text-gray-900">
                        {selectedProducto.ubicacionActual || 'Sin ubicación'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Cantidad</p>
                      <p className="text-sm font-medium text-gray-900">
                        {selectedProducto.cantidadActual} / {selectedProducto.cantidadInicial}
                      </p>
                      <p className="text-xs text-gray-500">{selectedProducto.unidadMedida}</p>
                    </div>
                  </div>
                </div>

                {/* Timeline Events */}
                <div className="space-y-1">
                  {selectedProducto.historial.length > 0 ? (
                    selectedProducto.historial
                      .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
                      .map((historialItem, index, array) => (
                        <TimelineItem
                          key={historialItem.id}
                          historialItem={historialItem}
                          isLast={index === array.length - 1}
                        />
                      ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Clock className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                      <p className="text-sm">No hay eventos registrados</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Activity className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">
                  Selecciona un Producto
                </h4>
                <p className="text-sm">
                  Elige un producto de la lista para visualizar su timeline completo de trazabilidad
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Product Details Modal */}
      <AnimatePresence>
        {selectedProducto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => {/* Close modal */}}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal content would go here */}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};