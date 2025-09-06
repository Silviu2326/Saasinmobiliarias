import { useState } from "react";
import { usePortalConfig } from "../hooks";
import PublishDefaultsForm from "./PublishDefaultsForm";
import MappingEditor from "./MappingEditor";
import CredentialsVault from "./CredentialsVault";
import SyncStatusPanel from "./SyncStatusPanel";

interface SettingsDrawerProps {
  portalId: string;
  isOpen: boolean;
  onClose: () => void;
}

const SettingsDrawer = ({ portalId, isOpen, onClose }: SettingsDrawerProps) => {
  const [activeTab, setActiveTab] = useState<"credentials" | "defaults" | "mappings" | "sync" | "advanced">("credentials");
  const { config, loading, saveConfig, saving } = usePortalConfig(portalId);

  if (!isOpen) return null;

  const tabs = [
    { id: "credentials" as const, label: "Credenciales", icon: "🔐" },
    { id: "defaults" as const, label: "Valores por Defecto", icon: "⚙️" },
    { id: "mappings" as const, label: "Mapeo de Campos", icon: "🔗" },
    { id: "sync" as const, label: "Estado Sync", icon: "🔄" },
    { id: "advanced" as const, label: "Avanzado", icon: "🛠️" }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex z-50">
      <div className="ml-auto w-full max-w-4xl bg-white h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Configuración - {portalId}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Gestiona credenciales, mapeos y configuración del portal
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-2"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {loading ? (
            <div className="animate-pulse space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 bg-gray-200 rounded"></div>
              ))}
            </div>
          ) : (
            <>
              {activeTab === "credentials" && config && (
                <CredentialsVault 
                  portalId={portalId}
                  credentials={config.credentials}
                  onUpdate={(creds) => saveConfig({ credentials: creds })}
                />
              )}

              {activeTab === "defaults" && config && (
                <PublishDefaultsForm
                  portalId={portalId}
                  defaults={config.publishDefaults}
                  onUpdate={(defaults) => saveConfig({ publishDefaults: defaults })}
                />
              )}

              {activeTab === "mappings" && config && (
                <MappingEditor
                  portalId={portalId}
                  mappings={config.mappings}
                  onUpdate={(mappings) => saveConfig({ mappings })}
                />
              )}

              {activeTab === "sync" && (
                <SyncStatusPanel portalId={portalId} />
              )}

              {activeTab === "advanced" && config && (
                <div className="space-y-6">
                  <div className="bg-white p-6 rounded-lg border">
                    <h3 className="text-lg font-semibold mb-4">Configuración Avanzada</h3>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Frecuencia de Sync (minutos)
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="1440"
                          defaultValue={config.advanced.syncFrequencyMin}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Throttle (req/min)
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="1000"
                          defaultValue={config.advanced.throttleReqPerMin}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Política de borrado
                        </label>
                        <select
                          defaultValue={config.advanced.deletePolicy}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                        >
                          <option value="remove">Eliminar del portal</option>
                          <option value="pause">Pausar anuncio</option>
                          <option value="archive">Archivar</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Política de duplicados
                        </label>
                        <select
                          defaultValue={config.advanced.duplicatePolicy}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                        >
                          <option value="skip">Omitir</option>
                          <option value="update">Actualizar</option>
                          <option value="create">Crear nuevo</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500">
              {config && (
                <>
                  Última actualización: {new Date(config.updatedAt).toLocaleString("es-ES")}
                  {config.updatedBy && ` por ${config.updatedBy}`}
                </>
              )}
            </div>
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsDrawer;