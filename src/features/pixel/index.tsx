import React, { useState } from 'react';
import { 
  Plus, 
  TestTube, 
  Code, 
  Copy, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Trash2,
  BookOpen,
  Zap
} from 'lucide-react';
import { usePixel } from './hooks/usePixel';
import { PixelStatusCard } from './components/PixelStatusCard';
import { PixelSetup } from './components/PixelSetup';
import { PixelEventsLog } from './components/PixelEventsLog';
import { CreatePixelRequest, UpdatePixelRequest, Pixel } from './services/pixelService';

const PixelPage: React.FC = () => {
  const {
    pixels,
    selectedPixel,
    events,
    isLoading,
    isTestingConnection,
    error,
    connectionTestResult,
    loadPixels,
    selectPixel,
    createPixel,
    updatePixel,
    deletePixel,
    loadEvents,
    testConnection,
    clearError
  } = usePixel();

  const [showSetup, setShowSetup] = useState(false);
  const [editingPixel, setEditingPixel] = useState<Pixel | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null);
  const [copiedSnippet, setCopiedSnippet] = useState(false);
  const [showInstallGuide, setShowInstallGuide] = useState(false);

  const handleCreatePixel = async (data: CreatePixelRequest) => {
    try {
      await createPixel(data);
      setShowSetup(false);
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const handleUpdatePixel = async (data: UpdatePixelRequest) => {
    if (!editingPixel) return;
    
    try {
      await updatePixel(editingPixel.id, data);
      setEditingPixel(null);
      setShowSetup(false);
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const handleDeletePixel = async (pixelId: string) => {
    try {
      await deletePixel(pixelId);
      setShowDeleteModal(null);
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const handleTogglePixelStatus = async (pixelId: string, isActive: boolean) => {
    try {
      await updatePixel(pixelId, { isActive });
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const handleCopySnippet = async (snippet: string) => {
    try {
      await navigator.clipboard.writeText(snippet);
      setCopiedSnippet(true);
      setTimeout(() => setCopiedSnippet(false), 2000);
    } catch (err) {
      console.error('Failed to copy snippet:', err);
    }
  };

  const handleTestConnection = async (pixelId: string) => {
    await testConnection(pixelId);
  };

  const activePixels = pixels.filter(p => p.isActive).length;
  const errorPixels = pixels.filter(p => p.status === 'error').length;
  const totalEvents = events.length;

  return (
    <div className="p-6 max-w-full">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Gestión de Píxeles</h1>
            <p className="text-gray-600">
              Configura y monitoriza los píxeles de tracking de tus plataformas de marketing
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowInstallGuide(true)}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
            >
              <BookOpen className="w-4 h-4" />
              Guía de instalación
            </button>
            <button
              onClick={() => setShowSetup(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Nuevo Píxel
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Píxeles Activos</p>
                <p className="text-2xl font-bold text-green-600">{activePixels}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Configurados</p>
                <p className="text-2xl font-bold text-blue-600">{pixels.length}</p>
              </div>
              <Code className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Con Errores</p>
                <p className="text-2xl font-bold text-red-600">{errorPixels}</p>
              </div>
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Eventos Recientes</p>
                <p className="text-2xl font-bold text-purple-600">{totalEvents}</p>
              </div>
              <Zap className="w-8 h-8 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
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

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Pixel List */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Píxeles Configurados</h2>
            </div>
            
            <div className="p-4">
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="animate-pulse">
                      <div className="h-20 bg-gray-200 rounded-lg"></div>
                    </div>
                  ))}
                </div>
              ) : pixels.length === 0 ? (
                <div className="text-center py-12">
                  <Code className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No hay píxeles configurados</h3>
                  <p className="text-gray-500 text-sm mb-6">
                    Comienza agregando tu primer píxel de tracking
                  </p>
                  <button
                    onClick={() => setShowSetup(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 mx-auto"
                  >
                    <Plus className="w-4 h-4" />
                    Agregar Píxel
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {pixels.map((pixel) => (
                    <PixelStatusCard
                      key={pixel.id}
                      pixel={pixel}
                      onSelect={selectPixel}
                      onEdit={(pixel) => {
                        setEditingPixel(pixel);
                        setShowSetup(true);
                      }}
                      onDelete={(pixelId) => setShowDeleteModal(pixelId)}
                      onToggleStatus={handleTogglePixelStatus}
                      isSelected={selectedPixel?.id === pixel.id}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Pixel Details */}
        <div className="lg:col-span-2">
          {!selectedPixel ? (
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-12 text-center">
                <TestTube className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-900 mb-2">
                  Selecciona un píxel para ver los detalles
                </h3>
                <p className="text-gray-500">
                  Elige un píxel de la lista para ver su configuración, código de instalación y eventos recientes
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Pixel Details Card */}
              <div className="bg-white rounded-lg shadow-sm">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">{selectedPixel.name}</h2>
                      <p className="text-gray-600">ID: {selectedPixel.pixelId}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleTestConnection(selectedPixel.id)}
                        disabled={isTestingConnection}
                        className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 flex items-center gap-2"
                      >
                        <TestTube className={`w-4 h-4 ${isTestingConnection ? 'animate-spin' : ''}`} />
                        {isTestingConnection ? 'Probando...' : 'Probar Conexión'}
                      </button>
                      
                      <button
                        onClick={() => handleCopySnippet(selectedPixel.snippet)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                      >
                        <Copy className="w-4 h-4" />
                        {copiedSnippet ? 'Copiado!' : 'Copiar Código'}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  {/* Connection Test Result */}
                  {connectionTestResult && (
                    <div className={`p-4 rounded-lg flex items-start gap-3 ${
                      connectionTestResult.isConnected 
                        ? 'bg-green-50 border border-green-200' 
                        : 'bg-red-50 border border-red-200'
                    }`}>
                      {connectionTestResult.isConnected ? (
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                      )}
                      <div>
                        <p className={`font-medium ${
                          connectionTestResult.isConnected ? 'text-green-800' : 'text-red-800'
                        }`}>
                          {connectionTestResult.isConnected ? 'Conexión exitosa' : 'Error de conexión'}
                        </p>
                        <p className={`text-sm ${
                          connectionTestResult.isConnected ? 'text-green-700' : 'text-red-700'
                        }`}>
                          {connectionTestResult.message}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Installation Code */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-3">Código de Instalación</h3>
                    <div className="relative">
                      <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
                        <code>{selectedPixel.snippet}</code>
                      </pre>
                      <button
                        onClick={() => handleCopySnippet(selectedPixel.snippet)}
                        className="absolute top-2 right-2 p-2 text-gray-400 hover:text-gray-200 rounded"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                      Agrega este código en la sección &lt;head&gt; de todas las páginas de tu sitio web.
                    </p>
                  </div>
                </div>
              </div>

              {/* Events Log */}
              <PixelEventsLog
                events={events}
                isLoading={isLoading}
                onRefresh={() => loadEvents(selectedPixel.id)}
              />
            </div>
          )}
        </div>
      </div>

      {/* Pixel Setup Modal */}
      {showSetup && (
        <PixelSetup
          pixel={editingPixel}
          onSave={editingPixel ? handleUpdatePixel : handleCreatePixel}
          onCancel={() => {
            setShowSetup(false);
            setEditingPixel(null);
          }}
          isLoading={isLoading}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Eliminar Píxel</h3>
                <p className="text-gray-600">Esta acción no se puede deshacer</p>
              </div>
            </div>
            <p className="text-gray-700 mb-6">
              ¿Estás seguro de que deseas eliminar este píxel? Se perderá toda la configuración y el historial de eventos.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(null)}
                className="flex-1 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDeletePixel(showDeleteModal)}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Installation Guide Modal */}
      {showInstallGuide && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Guía de Instalación</h2>
                <button
                  onClick={() => setShowInstallGuide(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="prose max-w-none">
                <h3>Pasos para instalar un píxel:</h3>
                <ol>
                  <li>Copia el código de instalación del píxel</li>
                  <li>Accede al código HTML de tu sitio web</li>
                  <li>Pega el código dentro de la etiqueta <code>&lt;head&gt;</code></li>
                  <li>Guarda los cambios y sube el archivo a tu servidor</li>
                  <li>Usa la herramienta de "Probar Conexión" para verificar la instalación</li>
                </ol>
                
                <h3>Consejos importantes:</h3>
                <ul>
                  <li>Asegúrate de instalar el código en todas las páginas del sitio</li>
                  <li>No modifiques el código del píxel</li>
                  <li>Verifica que el píxel esté activo antes de hacer campañas</li>
                  <li>Revisa regularmente el registro de eventos</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PixelPage;