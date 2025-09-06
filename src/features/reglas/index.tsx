import React, { useState } from 'react';
import { 
  Plus, 
  Zap, 
  CheckCircle, 
  XCircle, 
  Activity, 
  TrendingUp,
  AlertTriangle,
  Trash2,
  History,
  Play
} from 'lucide-react';
import { useReglas } from './hooks/useReglas';
import { ReglasList } from './components/ReglasList';
import { ReglaForm } from './components/ReglaForm';
import { Regla, CreateReglaRequest, UpdateReglaRequest } from './types/regla.types';

const ReglasPage: React.FC = () => {
  const {
    reglas,
    selectedRegla,
    ejecuciones,
    stats,
    isLoading,
    isCreating,
    isUpdating,
    isDeleting,
    isTestingRegla,
    error,
    testResult,
    loadReglas,
    loadStats,
    selectRegla,
    createRegla,
    updateRegla,
    deleteRegla,
    toggleRegla,
    duplicateRegla,
    reorderReglas,
    loadEjecuciones,
    testRegla,
    clearError,
    clearTestResult
  } = useReglas();

  const [showForm, setShowForm] = useState(false);
  const [editingRegla, setEditingRegla] = useState<Regla | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null);
  const [showEjecuciones, setShowEjecuciones] = useState(false);

  const handleCreateRegla = async (data: CreateReglaRequest) => {
    try {
      await createRegla(data);
      setShowForm(false);
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const handleUpdateRegla = async (data: UpdateReglaRequest) => {
    if (!editingRegla) return;
    
    try {
      await updateRegla(editingRegla.id, data);
      setShowForm(false);
      setEditingRegla(null);
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const handleEditRegla = (regla: Regla) => {
    setEditingRegla(regla);
    setShowForm(true);
    clearTestResult();
  };

  const handleDuplicateRegla = async (id: string) => {
    try {
      await duplicateRegla(id);
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const handleDeleteRegla = async (id: string) => {
    try {
      await deleteRegla(id);
      setShowDeleteModal(null);
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const handleToggleRegla = async (id: string) => {
    try {
      await toggleRegla(id);
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const handleTestRegla = async (testData: any) => {
    if (editingRegla) {
      await testRegla(editingRegla.id, testData);
    }
  };

  const formatLastExecution = (dateString?: string) => {
    if (!dateString) return 'Nunca';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Hace menos de 1 minuto';
    if (diffMins < 60) return `Hace ${diffMins} minutos`;
    if (diffHours < 24) return `Hace ${diffHours} horas`;
    if (diffDays < 7) return `Hace ${diffDays} días`;
    return date.toLocaleDateString('es-ES');
  };

  return (
    <div className="p-6 max-w-full">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Reglas & Reparto</h1>
            <p className="text-gray-600">
              Configura reglas de negocio automáticas para optimizar la gestión de leads e inmuebles
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowEjecuciones(true)}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
            >
              <History className="w-4 h-4" />
              Historial
            </button>
            <button
              onClick={() => {
                setEditingRegla(null);
                setShowForm(true);
                clearTestResult();
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Nueva Regla
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Reglas</p>
                <p className="text-2xl font-bold text-blue-600">{stats?.totalReglas || 0}</p>
              </div>
              <Zap className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Activas</p>
                <p className="text-2xl font-bold text-green-600">{stats?.reglasActivas || 0}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Inactivas</p>
                <p className="text-2xl font-bold text-gray-600">{stats?.reglasInactivas || 0}</p>
              </div>
              <XCircle className="w-8 h-8 text-gray-500" />
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Ejecuciones</p>
                <p className="text-2xl font-bold text-purple-600">
                  {stats?.totalEjecuciones?.toLocaleString() || 0}
                </p>
                <p className="text-xs text-gray-500">
                  Última: {formatLastExecution(stats?.ultimaEjecucion)}
                </p>
              </div>
              <Activity className="w-8 h-8 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Success Rate */}
        {stats && stats.totalEjecuciones > 0 && (
          <div className="bg-white p-4 rounded-lg border border-gray-200 mb-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-900">Tasa de Éxito de Ejecuciones</h3>
              <span className="text-sm text-gray-600">
                {stats.ejecucionesExitosas} de {stats.totalEjecuciones} exitosas
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-600 h-2 rounded-full transition-all duration-300"
                style={{ 
                  width: `${(stats.ejecucionesExitosas / stats.totalEjecuciones) * 100}%` 
                }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>{Math.round((stats.ejecucionesExitosas / stats.totalEjecuciones) * 100)}% éxito</span>
              <span>{stats.ejecucionesFallidas} fallos</span>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-red-800 font-medium">Error</p>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
            <button
              onClick={clearError}
              className="text-red-500 hover:text-red-700"
            >
              <XCircle className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Rules List */}
      <ReglasList
        reglas={reglas}
        isLoading={isLoading}
        onEdit={handleEditRegla}
        onDuplicate={handleDuplicateRegla}
        onDelete={(id) => setShowDeleteModal(id)}
        onToggle={handleToggleRegla}
        onReorder={reorderReglas}
      />

      {/* Rule Form Modal */}
      <ReglaForm
        regla={editingRegla}
        isOpen={showForm}
        onClose={() => {
          setShowForm(false);
          setEditingRegla(null);
          clearTestResult();
        }}
        onSave={editingRegla ? handleUpdateRegla : handleCreateRegla}
        onTest={handleTestRegla}
        isLoading={isCreating || isUpdating}
        isTesting={isTestingRegla}
        testResult={testResult}
      />

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Eliminar Regla</h3>
                <p className="text-gray-600">Esta acción no se puede deshacer</p>
              </div>
            </div>
            <p className="text-gray-700 mb-6">
              ¿Estás seguro de que deseas eliminar esta regla? Se perderá toda la configuración y el historial de ejecuciones.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(null)}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDeleteRegla(showDeleteModal)}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Eliminando...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Eliminar
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Executions History Modal */}
      {showEjecuciones && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Historial de Ejecuciones</h2>
              <button
                onClick={() => setShowEjecuciones(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              {ejecuciones.length === 0 ? (
                <div className="text-center py-12">
                  <History className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No hay ejecuciones registradas</h3>
                  <p className="text-gray-500">
                    Las ejecuciones de reglas aparecerán aquí cuando se activen automáticamente
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {ejecuciones.map((ejecucion) => (
                    <div 
                      key={ejecucion.id} 
                      className={`p-4 rounded-lg border ${
                        ejecucion.exitosa 
                          ? 'border-green-200 bg-green-50' 
                          : 'border-red-200 bg-red-50'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            {ejecucion.exitosa ? (
                              <CheckCircle className="w-5 h-5 text-green-500" />
                            ) : (
                              <XCircle className="w-5 h-5 text-red-500" />
                            )}
                            <h4 className="font-medium text-gray-900">
                              {ejecucion.nombreRegla}
                            </h4>
                            <span className="text-sm text-gray-500">
                              {new Date(ejecucion.timestamp).toLocaleString('es-ES')}
                            </span>
                          </div>
                          <p className={`text-sm ${
                            ejecucion.exitosa ? 'text-green-700' : 'text-red-700'
                          }`}>
                            {ejecucion.resultado || ejecucion.error}
                          </p>
                          {ejecucion.accionesEjecutadas && ejecucion.accionesEjecutadas.length > 0 && (
                            <div className="mt-2">
                              <p className="text-xs font-medium text-gray-700">Acciones ejecutadas:</p>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {ejecucion.accionesEjecutadas.map((accion, index) => (
                                  <span 
                                    key={index}
                                    className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs"
                                  >
                                    {accion}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="text-right text-xs text-gray-500">
                          <div>Tiempo: {ejecucion.tiempoEjecucion}ms</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReglasPage;