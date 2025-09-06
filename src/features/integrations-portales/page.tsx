import { useState } from "react";
import { 
  PortalsGrid, 
  LogsTable, 
  ImportExportBar,
  AuditTrailDrawer 
} from "./components";

const PortalesIntegrationsPage = () => {
  const [activeTab, setActiveTab] = useState<"portals" | "logs" | "settings">("portals");
  const [auditDrawerOpen, setAuditDrawerOpen] = useState(false);

  const tabs = [
    { 
      id: "portals" as const, 
      label: "Portales", 
      icon: "🌐",
      description: "Gestiona las conexiones con portales inmobiliarios"
    },
    { 
      id: "logs" as const, 
      label: "Logs", 
      icon: "📋",
      description: "Revisa el historial de sincronizaciones"
    },
    { 
      id: "settings" as const, 
      label: "Configuración", 
      icon: "⚙️",
      description: "Import/Export y configuraciones globales"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Integraciones con Portales
              </h1>
              <p className="mt-2 text-gray-600">
                Gestiona las conexiones y sincronización con portales inmobiliarios
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setAuditDrawerOpen(true)}
                className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm font-medium"
              >
                <span className="mr-2">🔍</span>
                Auditoría
              </button>
            </div>
          </div>
          
          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                    activeTab === tab.id
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Description */}
        <div className="mb-6">
          <p className="text-gray-600">
            {tabs.find(t => t.id === activeTab)?.description}
          </p>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === "portals" && (
            <div>
              <PortalsGrid />
            </div>
          )}

          {activeTab === "logs" && (
            <div>
              <LogsTable />
            </div>
          )}

          {activeTab === "settings" && (
            <div className="space-y-6">
              <ImportExportBar />
              
              <div className="bg-white p-6 rounded-lg border">
                <h3 className="text-lg font-semibold mb-4">Configuraciones Globales</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Sincronización Automática</h4>
                    <div className="space-y-3">
                      <label className="flex items-center">
                        <input 
                          type="checkbox" 
                          defaultChecked
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">
                          Sincronizar cada 15 minutos
                        </span>
                      </label>
                      <label className="flex items-center">
                        <input 
                          type="checkbox" 
                          defaultChecked
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">
                          Notificar errores por email
                        </span>
                      </label>
                      <label className="flex items-center">
                        <input 
                          type="checkbox" 
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">
                          Pausar sincronización nocturna (22:00 - 06:00)
                        </span>
                      </label>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Límites y Rendimiento</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Máximo de propiedades por lote
                        </label>
                        <input 
                          type="number" 
                          defaultValue={50}
                          min={10}
                          max={200}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Timeout de conexión (segundos)
                        </label>
                        <input 
                          type="number" 
                          defaultValue={30}
                          min={10}
                          max={120}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Reintentos automáticos
                        </label>
                        <select className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm">
                          <option value="0">Sin reintentos</option>
                          <option value="1">1 reintento</option>
                          <option value="2" defaultValue="">2 reintentos</option>
                          <option value="3">3 reintentos</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-200">
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium">
                    💾 Guardar Configuración
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Audit Trail Drawer */}
      <AuditTrailDrawer 
        isOpen={auditDrawerOpen}
        onClose={() => setAuditDrawerOpen(false)}
      />
    </div>
  );
};

export default PortalesIntegrationsPage;