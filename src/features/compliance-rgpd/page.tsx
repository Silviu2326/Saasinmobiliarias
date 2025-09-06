import { useState } from "react";
import { useRgpdExport } from "./hooks";
import {
  ComplianceScore,
  DsrCenter,
  ConsentsRegistry,
  RoPA,
  PrivacyNotices,
  CookieManager,
  RetentionPolicies,
  BreachReports,
  DataMap,
} from "./components";

const TABS = [
  { id: "overview", label: "Resumen", component: null },
  { id: "dsr", label: "DSR", component: DsrCenter },
  { id: "consents", label: "Consentimientos", component: ConsentsRegistry },
  { id: "ropa", label: "RoPA", component: RoPA },
  { id: "notices", label: "Avisos", component: PrivacyNotices },
  { id: "cookies", label: "Cookies", component: CookieManager },
  { id: "retention", label: "Retención", component: RetentionPolicies },
  { id: "breaches", label: "Brechas", component: BreachReports },
  { id: "datamap", label: "Mapa de Datos", component: DataMap },
];

export function RgpdPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const { exportPack, exporting } = useRgpdExport();

  const activeTabConfig = TABS.find(tab => tab.id === activeTab);
  const ActiveComponent = activeTabConfig?.component;

  const handleExportPack = async () => {
    try {
      await exportPack();
    } catch (error) {
      console.error("Error al exportar pack RGPD:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Centro RGPD</h1>
              <p className="text-sm text-gray-600 mt-1">
                Centro de cumplimiento del Reglamento General de Protección de Datos
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <a
                href="https://www.aepd.es/es/guias-y-herramientas"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Guía AEPD
              </a>
              <button
                onClick={handleExportPack}
                disabled={exporting}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {exporting ? "Generando..." : "RGPD Pack"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="-mb-px flex space-x-8">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === "overview" ? (
          <div className="space-y-8">
            {/* Compliance Score */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <ComplianceScore />
              </div>
              <div className="lg:col-span-2">
                <div className="bg-white rounded-lg border p-6">
                  <h2 className="text-lg font-semibold mb-4">Acciones Rápidas</h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <button
                      onClick={() => setActiveTab("dsr")}
                      className="p-4 border rounded-lg hover:bg-gray-50 text-center"
                    >
                      <div className="text-2xl mb-2">📝</div>
                      <div className="text-sm font-medium">Nueva Solicitud DSR</div>
                    </button>
                    <button
                      onClick={() => setActiveTab("consents")}
                      className="p-4 border rounded-lg hover:bg-gray-50 text-center"
                    >
                      <div className="text-2xl mb-2">✅</div>
                      <div className="text-sm font-medium">Registrar Consentimiento</div>
                    </button>
                    <button
                      onClick={() => setActiveTab("breaches")}
                      className="p-4 border rounded-lg hover:bg-red-50 text-center"
                    >
                      <div className="text-2xl mb-2">🚨</div>
                      <div className="text-sm font-medium">Reportar Brecha</div>
                    </button>
                    <button
                      onClick={() => setActiveTab("ropa")}
                      className="p-4 border rounded-lg hover:bg-gray-50 text-center"
                    >
                      <div className="text-2xl mb-2">📊</div>
                      <div className="text-sm font-medium">Actualizar RoPA</div>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg border p-6">
                <div className="flex items-center">
                  <div className="text-3xl mr-4">👤</div>
                  <div>
                    <div className="text-2xl font-bold">DSR</div>
                    <div className="text-sm text-gray-600">Derechos del interesado</div>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab("dsr")}
                  className="mt-4 w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
                >
                  Gestionar
                </button>
              </div>

              <div className="bg-white rounded-lg border p-6">
                <div className="flex items-center">
                  <div className="text-3xl mr-4">🤝</div>
                  <div>
                    <div className="text-2xl font-bold">Consentimientos</div>
                    <div className="text-sm text-gray-600">Registro y evidencias</div>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab("consents")}
                  className="mt-4 w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700"
                >
                  Ver Registro
                </button>
              </div>

              <div className="bg-white rounded-lg border p-6">
                <div className="flex items-center">
                  <div className="text-3xl mr-4">📋</div>
                  <div>
                    <div className="text-2xl font-bold">RoPA</div>
                    <div className="text-sm text-gray-600">Registro de actividades</div>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab("ropa")}
                  className="mt-4 w-full bg-purple-600 text-white py-2 rounded-md hover:bg-purple-700"
                >
                  Administrar
                </button>
              </div>

              <div className="bg-white rounded-lg border p-6">
                <div className="flex items-center">
                  <div className="text-3xl mr-4">🛡️</div>
                  <div>
                    <div className="text-2xl font-bold">Brechas</div>
                    <div className="text-sm text-gray-600">Incidentes de seguridad</div>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab("breaches")}
                  className="mt-4 w-full bg-red-600 text-white py-2 rounded-md hover:bg-red-700"
                >
                  Reportar
                </button>
              </div>
            </div>

            {/* Info Section */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-4">Centro RGPD Operativo</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-blue-800">
                <div>
                  <h4 className="font-medium mb-2">Funcionalidades Principales:</h4>
                  <ul className="space-y-1">
                    <li>• Gestión completa de solicitudes DSR con SLA</li>
                    <li>• Registro de consentimientos con evidencias</li>
                    <li>• Registro de Actividades de Tratamiento (RoPA)</li>
                    <li>• Versionado de avisos de privacidad</li>
                    <li>• Gestor de cookies con generación de banner</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Cumplimiento Legal:</h4>
                  <ul className="space-y-1">
                    <li>• Políticas de retención automatizadas</li>
                    <li>• Registro de brechas con notificaciones AEPD</li>
                    <li>• Mapa de datos y flujos de información</li>
                    <li>• Score de cumplimiento en tiempo real</li>
                    <li>• Exportación completa "RGPD Pack"</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        ) : ActiveComponent ? (
          <ActiveComponent />
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400">Seleccione una pestaña para continuar</div>
          </div>
        )}
      </div>
    </div>
  );
}