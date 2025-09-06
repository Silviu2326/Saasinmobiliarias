import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal,
  Edit2,
  Copy,
  Pause,
  Play,
  Trash2,
  TrendingUp,
  Users,
  Mail,
  MessageSquare,
  Globe,
  Zap,
  Calendar,
  DollarSign,
  Eye,
  BarChart3,
  PieChart,
  Activity,
  Target,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { CampanasForm } from './components/CampanasForm';
import { CampanasList } from './components/CampanasList';
import { CampanasStats } from './components/CampanasStats';
import { useCampanas } from './hooks/useCampanas';

export interface Campana {
  id: string;
  nombre: string;
  tipo: 'email' | 'sms' | 'portales' | 'rpa';
  estado: 'activa' | 'pausada' | 'finalizada' | 'borrador';
  fechaInicio: string;
  fechaFin: string;
  presupuesto: number;
  gastado: number;
  segmentacion: string[];
  metricas: {
    impresiones: number;
    clicks: number;
    conversiones: number;
    ctr: number;
    roi: number;
  };
  fechaCreacion: string;
  fechaModificacion: string;
}

export default function CampanasPage() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'list' | 'create'>('dashboard');
  const [selectedCampana, setSelectedCampana] = useState<Campana | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null);
  
  const {
    campanas,
    loading,
    error,
    stats,
    createCampana,
    updateCampana,
    deleteCampana,
    duplicateCampana
  } = useCampanas();

  const handleCreateCampana = (data: Partial<Campana>) => {
    createCampana(data);
    setShowForm(false);
  };

  const handleEditCampana = (campana: Campana) => {
    setSelectedCampana(campana);
    setShowForm(true);
  };

  const handleUpdateCampana = (data: Partial<Campana>) => {
    if (selectedCampana) {
      updateCampana(selectedCampana.id, data);
      setSelectedCampana(null);
      setShowForm(false);
    }
  };

  const handleDeleteCampana = (id: string) => {
    deleteCampana(id);
    setShowDeleteModal(null);
  };

  const handleDuplicateCampana = (campana: Campana) => {
    duplicateCampana(campana);
  };

  const handleToggleStatus = (campana: Campana) => {
    const newStatus = campana.estado === 'activa' ? 'pausada' : 'activa';
    updateCampana(campana.id, { estado: newStatus });
  };

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
              <p className="text-sm text-gray-600">Total Campañas</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-xs text-green-600 mt-1">+{stats.nuevas} este mes</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Target className="h-6 w-6 text-blue-600" />
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
              <p className="text-sm text-gray-600">Activas</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activas}</p>
              <div className="flex items-center mt-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-1"></div>
                <span className="text-xs text-gray-500">En ejecución</span>
              </div>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <Play className="h-6 w-6 text-green-600" />
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
              <p className="text-sm text-gray-600">ROI Promedio</p>
              <p className="text-2xl font-bold text-gray-900">{stats.roiPromedio}%</p>
              <p className="text-xs text-green-600 mt-1">+12% vs mes anterior</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-purple-600" />
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
              <p className="text-sm text-gray-600">Presupuesto Total</p>
              <p className="text-2xl font-bold text-gray-900">€{stats.presupuestoTotal.toLocaleString()}</p>
              <p className="text-xs text-gray-600 mt-1">€{stats.gastado.toLocaleString()} gastado</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Campaign Status Overview */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Estado de Campañas</h3>
          <button
            onClick={() => setActiveTab('list')}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            Ver todas →
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-2">
              <Play className="h-6 w-6 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.activas}</p>
            <p className="text-xs text-gray-600">Activas</p>
          </div>
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-yellow-100 rounded-full mb-2">
              <Pause className="h-6 w-6 text-yellow-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.pausadas}</p>
            <p className="text-xs text-gray-600">Pausadas</p>
          </div>
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-100 rounded-full mb-2">
              <CheckCircle2 className="h-6 w-6 text-gray-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.finalizadas}</p>
            <p className="text-xs text-gray-600">Finalizadas</p>
          </div>
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-2">
              <Edit2 className="h-6 w-6 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.borradores}</p>
            <p className="text-xs text-gray-600">Borradores</p>
          </div>
        </div>
      </div>

      {/* Recent Campaigns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Campañas Recientes</h3>
          <div className="space-y-3">
            {campanas.slice(0, 3).map((campana) => (
              <motion.div
                key={campana.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-start space-x-3"
              >
                <div className={`p-2 rounded-lg ${getEstadoColor(campana.estado)}`}>
                  {getTipoIcon(campana.tipo)}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{campana.nombre}</p>
                  <p className="text-xs text-gray-500">{campana.tipo} • {campana.estado}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    ROI: {campana.metricas.roi}% • CTR: {campana.metricas.ctr}%
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <CampanasStats campanas={campanas} />
      </div>
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
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error al cargar campañas</h2>
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
              <Target className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Gestión de Campañas</h1>
                <p className="text-xs text-gray-500">Marketing multicanal y automatización</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setSelectedCampana(null);
                  setShowForm(true);
                }}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nueva Campaña
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
              { id: 'list', label: 'Campañas', icon: Target },
              { id: 'create', label: 'Crear', icon: Plus }
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
          
          {activeTab === 'list' && (
            <motion.div
              key="list"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <CampanasList
                campanas={campanas}
                onEdit={handleEditCampana}
                onDelete={(id) => setShowDeleteModal(id)}
                onDuplicate={handleDuplicateCampana}
                onToggleStatus={handleToggleStatus}
              />
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
              <CampanasForm
                campana={null}
                onSave={handleCreateCampana}
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
              <CampanasForm
                campana={selectedCampana}
                onSave={selectedCampana ? handleUpdateCampana : handleCreateCampana}
                onCancel={() => {
                  setShowForm(false);
                  setSelectedCampana(null);
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
                <h2 className="text-xl font-bold text-gray-900">Eliminar Campaña</h2>
              </div>
              <p className="text-gray-600 mb-6">
                ¿Estás seguro de que quieres eliminar esta campaña? Esta acción no se puede deshacer.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowDeleteModal(null)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => handleDeleteCampana(showDeleteModal)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Eliminar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}