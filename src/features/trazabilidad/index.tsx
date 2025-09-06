import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Edit2,
  Archive,
  Trash2,
  QrCode,
  FileText,
  Download,
  AlertTriangle,
  Clock,
  MapPin,
  Package,
  TrendingUp,
  Activity,
  BarChart3,
  PieChart,
  Calendar,
  Truck,
  CheckCircle2,
  XCircle,
  Eye,
  RefreshCw,
  Bell
} from 'lucide-react';
import { TrazabilidadForm } from './components/TrazabilidadForm';
import { ProductosList } from './components/ProductosList';
import { TrazabilidadTimeline } from './components/TrazabilidadTimeline';
import { TrazabilidadStats } from './components/TrazabilidadStats';
import { useTrazabilidad } from './hooks/useTrazabilidad';

export interface Producto {
  id: string;
  codigo: string;
  nombre: string;
  categoria: string;
  proveedor: {
    nombre: string;
    origen: string;
    contacto: string;
  };
  fechas: {
    fabricacion: string;
    caducidad: string;
    registro: string;
  };
  estado: 'en_transito' | 'almacenado' | 'distribuido' | 'entregado' | 'vencido' | 'retirado';
  ubicacionActual: string;
  certificaciones: string[];
  documentos: Array<{
    nombre: string;
    tipo: string;
    url: string;
    fechaSubida: string;
  }>;
  historial: Array<{
    id: string;
    fecha: string;
    ubicacion: string;
    evento: string;
    descripcion: string;
    usuario: string;
    temperatura?: number;
    humedad?: number;
  }>;
  alertas: Array<{
    id: string;
    tipo: 'caducidad' | 'temperatura' | 'ubicacion' | 'documento' | 'calidad';
    severidad: 'baja' | 'media' | 'alta' | 'critica';
    mensaje: string;
    fecha: string;
    resuelta: boolean;
  }>;
  qrCode?: string;
  temperatura?: {
    actual: number;
    minima: number;
    maxima: number;
  };
  lote: string;
  cantidadInicial: number;
  cantidadActual: number;
  unidadMedida: string;
}

export interface TrazabilidadFilters {
  estado?: string;
  categoria?: string;
  proveedor?: string;
  fechaDesde?: string;
  fechaHasta?: string;
  ubicacion?: string;
  alertas?: boolean;
  search?: string;
}

export default function TrazabilidadPage() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'productos' | 'timeline' | 'create'>('dashboard');
  const [selectedProducto, setSelectedProducto] = useState<Producto | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null);
  const [showQRModal, setShowQRModal] = useState<string | null>(null);
  
  const {
    productos,
    loading,
    error,
    stats,
    createProducto,
    updateProducto,
    deleteProducto,
    generateQR,
    exportData,
    resolveAlert
  } = useTrazabilidad();

  const handleCreateProducto = (data: Partial<Producto>) => {
    createProducto(data);
    setShowForm(false);
  };

  const handleEditProducto = (producto: Producto) => {
    setSelectedProducto(producto);
    setShowForm(true);
  };

  const handleUpdateProducto = (data: Partial<Producto>) => {
    if (selectedProducto) {
      updateProducto(selectedProducto.id, data);
      setSelectedProducto(null);
      setShowForm(false);
    }
  };

  const handleDeleteProducto = (id: string) => {
    deleteProducto(id);
    setShowDeleteModal(null);
  };

  const handleGenerateQR = async (id: string) => {
    const qrCode = await generateQR(id);
    setShowQRModal(qrCode);
  };

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

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-lg shadow-sm p-6 border border-gray-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Productos</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-xs text-green-600 mt-1">+{stats.nuevos} este mes</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Package className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white rounded-lg shadow-sm p-6 border border-gray-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">En Tránsito</p>
              <p className="text-2xl font-bold text-gray-900">{stats.enTransito}</p>
              <div className="flex items-center mt-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse mr-1"></div>
                <span className="text-xs text-gray-500">Activos</span>
              </div>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <Truck className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white rounded-lg shadow-sm p-6 border border-gray-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Alertas Activas</p>
              <p className="text-2xl font-bold text-gray-900">{stats.alertasActivas}</p>
              <p className="text-xs text-red-600 mt-1">{stats.alertasCriticas} críticas</p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-white rounded-lg shadow-sm p-6 border border-gray-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Tiempo Promedio</p>
              <p className="text-2xl font-bold text-gray-900">{stats.tiempoPromedio}d</p>
              <p className="text-xs text-green-600 mt-1">-2d vs. mes anterior</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Clock className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Estado Overview */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Estado de Productos</h3>
          <button
            onClick={() => setActiveTab('productos')}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            Ver todos →
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-2">
              <Truck className="h-6 w-6 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.enTransito}</p>
            <p className="text-xs text-gray-600">En Tránsito</p>
          </div>
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-2">
              <Package className="h-6 w-6 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.almacenados}</p>
            <p className="text-xs text-gray-600">Almacenados</p>
          </div>
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-orange-100 rounded-full mb-2">
              <Activity className="h-6 w-6 text-orange-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.distribuidos}</p>
            <p className="text-xs text-gray-600">Distribuidos</p>
          </div>
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full mb-2">
              <CheckCircle2 className="h-6 w-6 text-purple-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.entregados}</p>
            <p className="text-xs text-gray-600">Entregados</p>
          </div>
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mb-2">
              <XCircle className="h-6 w-6 text-red-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.vencidos}</p>
            <p className="text-xs text-gray-600">Vencidos</p>
          </div>
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-100 rounded-full mb-2">
              <Archive className="h-6 w-6 text-gray-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.retirados}</p>
            <p className="text-xs text-gray-600">Retirados</p>
          </div>
        </div>
      </div>

      {/* Recent Activity and Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Actividad Reciente</h3>
          <div className="space-y-3">
            {productos.slice(0, 3).map((producto) => (
              <motion.div
                key={producto.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-start space-x-3"
              >
                <div className={`p-2 rounded-lg ${getEstadoColor(producto.estado)}`}>
                  {getEstadoIcon(producto.estado)}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{producto.nombre}</p>
                  <p className="text-xs text-gray-500">{producto.codigo} • {producto.categoria}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {producto.ubicacionActual} • {new Date(producto.fechas.registro).toLocaleDateString('es-ES')}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Alertas Críticas</h3>
          <div className="space-y-3">
            {productos
              .flatMap(p => p.alertas)
              .filter(a => !a.resuelta && (a.severidad === 'critica' || a.severidad === 'alta'))
              .slice(0, 3)
              .map((alerta) => (
                <div key={alerta.id} className="flex items-start space-x-3">
                  <div className={`p-2 rounded-lg ${getSeveridadColor(alerta.severidad)}`}>
                    <AlertTriangle className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{alerta.mensaje}</p>
                    <p className="text-xs text-gray-500">
                      {alerta.tipo} • {new Date(alerta.fecha).toLocaleDateString('es-ES')}
                    </p>
                    <button
                      onClick={() => resolveAlert(alerta.id)}
                      className="text-xs text-blue-600 hover:text-blue-700 mt-1"
                    >
                      Marcar como resuelta →
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Charts */}
      <TrazabilidadStats productos={productos} />
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error al cargar datos</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Activity className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Sistema de Trazabilidad</h1>
                <p className="text-xs text-gray-500">Control y seguimiento de productos</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button className="relative p-2 text-gray-600 hover:text-gray-900">
                <Bell className="h-5 w-5" />
                <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
              </button>
              <button
                onClick={exportData}
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setSelectedProducto(null);
                  setShowForm(true);
                }}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Registrar Producto
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
              { id: 'productos', label: 'Productos', icon: Package },
              { id: 'timeline', label: 'Timeline', icon: Activity },
              { id: 'create', label: 'Registrar', icon: Plus }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center px-1 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'text-blue-600 border-blue-600'
                    : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-4 w-4 mr-2" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderDashboard()}
            </motion.div>
          )}
          
          {activeTab === 'productos' && (
            <motion.div
              key="productos"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <ProductosList
                productos={productos}
                onEdit={handleEditProducto}
                onDelete={(id) => setShowDeleteModal(id)}
                onGenerateQR={handleGenerateQR}
                onResolveAlert={resolveAlert}
              />
            </motion.div>
          )}

          {activeTab === 'timeline' && (
            <motion.div
              key="timeline"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <TrazabilidadTimeline productos={productos} />
            </motion.div>
          )}

          {activeTab === 'create' && (
            <motion.div
              key="create"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <TrazabilidadForm
                producto={null}
                onSave={handleCreateProducto}
                onCancel={() => setActiveTab('dashboard')}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Form Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
            >
              <TrazabilidadForm
                producto={selectedProducto}
                onSave={selectedProducto ? handleUpdateProducto : handleCreateProducto}
                onCancel={() => {
                  setShowForm(false);
                  setSelectedProducto(null);
                }}
                isModal
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md"
            >
              <div className="flex items-center mb-4">
                <div className="p-2 bg-red-100 rounded-lg mr-3">
                  <Trash2 className="h-6 w-6 text-red-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Eliminar Producto</h2>
              </div>
              <p className="text-gray-600 mb-6">
                ¿Estás seguro de que quieres eliminar este producto del sistema de trazabilidad? Esta acción no se puede deshacer.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowDeleteModal(null)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => handleDeleteProducto(showDeleteModal)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Eliminar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* QR Code Modal */}
      <AnimatePresence>
        {showQRModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md"
            >
              <div className="text-center">
                <QrCode className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-gray-900 mb-4">Código QR Generado</h2>
                <div className="bg-gray-100 p-8 rounded-lg mb-4">
                  <div className="w-48 h-48 bg-white mx-auto rounded-lg flex items-center justify-center">
                    <QrCode className="h-32 w-32 text-gray-400" />
                  </div>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowQRModal(null)}
                    className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cerrar
                  </button>
                  <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    Descargar
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}