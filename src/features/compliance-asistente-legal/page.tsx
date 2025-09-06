import { useState } from 'react';
import { Scale, Shield, Users, FileText, Activity, Eye, Download, AlertTriangle } from 'lucide-react';
import { useComplianceOverview } from './hooks';
import { getComplianceStatusColor, getComplianceStatusText, buildCompliancePack } from './utils';
import {
  ChecklistPanel,
  DSRActions,
  ConsentsManager,
  KycAmlPanel,
  AuditLogTable,
  DpiaLightWizard,
  LegalDocsGenerator,
  ProviderBadge,
} from './components';

export default function AsistenteLegalPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const { data: overview, isLoading } = useComplianceOverview();

  const handleGenerateCompliancePack = () => {
    const pack = buildCompliancePack('OPERATION-123', {
      dsr: [],
      consents: [],
      checklist: [],
      audit: [],
    });

    const blob = new Blob([pack], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `compliance-pack-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const tabs = [
    { id: 'overview', label: 'Resumen', icon: Eye },
    { id: 'checklists', label: 'Checklists', icon: FileText },
    { id: 'dsr', label: 'RGPD/DSR', icon: Shield },
    { id: 'consents', label: 'Consentimientos', icon: Users },
    { id: 'kyc', label: 'KYC/AML', icon: Users },
    { id: 'documents', label: 'Documentos', icon: FileText },
    { id: 'audit', label: 'Auditoría', icon: Activity },
    { id: 'dpia', label: 'DPIA Light', icon: AlertTriangle },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Scale className="h-8 w-8 text-blue-600" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Asistente Legal & Compliance
                  </h1>
                  <p className="text-sm text-gray-600 mt-1">
                    Gestión integral de cumplimiento RGPD, KYC/AML y documentos legales
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleGenerateCompliancePack}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Compliance Pack
                </button>
              </div>
            </div>
          </div>

          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {tabs.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                    activeTab === id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Estado General</h3>
                    {isLoading ? (
                      <div className="animate-pulse">
                        <div className="h-6 bg-gray-200 rounded w-24 mt-2"></div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 mt-2">
                        <div
                          className={`h-3 w-3 rounded-full ${getComplianceStatusColor(
                            overview?.status || 'critical'
                          )}`}
                        />
                        <p className="text-2xl font-semibold text-gray-900">
                          {getComplianceStatusText(overview?.status || 'critical')}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                {overview?.issues && overview.issues.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-xs font-medium text-gray-500 mb-2">INCIDENCIAS</h4>
                    <ul className="space-y-1">
                      {overview.issues.slice(0, 3).map((issue, i) => (
                        <li key={i} className="text-sm text-red-600 flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          {issue}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Solicitudes DSR</h3>
                    {isLoading ? (
                      <div className="animate-pulse">
                        <div className="h-8 bg-gray-200 rounded w-16 mt-2"></div>
                      </div>
                    ) : (
                      <p className="text-2xl font-semibold text-gray-900 mt-2">
                        {overview?.pendingDsr || 0}
                      </p>
                    )}
                  </div>
                  <Shield className="h-8 w-8 text-blue-500" />
                </div>
                {overview && overview.expiredDsr > 0 && (
                  <p className="text-sm text-red-600 mt-2">
                    {overview.expiredDsr} vencidas
                  </p>
                )}
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Checklist</h3>
                    {isLoading ? (
                      <div className="animate-pulse">
                        <div className="h-8 bg-gray-200 rounded w-20 mt-2"></div>
                      </div>
                    ) : (
                      <p className="text-2xl font-semibold text-gray-900 mt-2">
                        {overview?.checklistProgress || 0}/{overview?.checklistTotal || 0}
                      </p>
                    )}
                  </div>
                  <FileText className="h-8 w-8 text-green-500" />
                </div>
                {overview && overview.checklistProgress < overview.checklistTotal && (
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div
                        className="bg-blue-600 h-1.5 rounded-full"
                        style={{
                          width: `${((overview.checklistProgress / overview.checklistTotal) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4">Acciones Rápidas</h3>
                <div className="space-y-3">
                  <button
                    onClick={() => setActiveTab('dsr')}
                    className="w-full p-3 text-left border rounded-lg hover:bg-gray-50 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <Shield className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-medium">Procesar solicitud DSR</p>
                        <p className="text-sm text-gray-600">Gestionar derechos RGPD</p>
                      </div>
                    </div>
                    <span className="text-gray-400">→</span>
                  </button>
                  
                  <button
                    onClick={() => setActiveTab('kyc')}
                    className="w-full p-3 text-left border rounded-lg hover:bg-gray-50 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <Users className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="font-medium">Verificación KYC/AML</p>
                        <p className="text-sm text-gray-600">Verificar identidad cliente</p>
                      </div>
                    </div>
                    <span className="text-gray-400">→</span>
                  </button>
                  
                  <button
                    onClick={() => setActiveTab('documents')}
                    className="w-full p-3 text-left border rounded-lg hover:bg-gray-50 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-purple-600" />
                      <div>
                        <p className="font-medium">Generar documento</p>
                        <p className="text-sm text-gray-600">Mandatos, DPA, cláusulas</p>
                      </div>
                    </div>
                    <span className="text-gray-400">→</span>
                  </button>
                </div>
              </div>

              <div className="space-y-6">
                <ProviderBadge />
                
                {overview && overview.auditEvents24h > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center gap-2">
                      <Activity className="h-5 w-5 text-blue-600" />
                      <div>
                        <h4 className="font-medium text-blue-900">
                          Actividad reciente
                        </h4>
                        <p className="text-sm text-blue-700">
                          {overview.auditEvents24h} eventos registrados en las últimas 24h
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'checklists' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Seleccionar tipo de operación</h3>
                <div className="grid grid-cols-2 gap-4 max-w-md">
                  <button
                    onClick={() => {/* Implementar selector */}}
                    className="p-4 border-2 border-blue-600 bg-blue-50 rounded-lg text-center"
                  >
                    <FileText className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                    <p className="font-medium">Venta</p>
                  </button>
                  <button
                    onClick={() => {/* Implementar selector */}}
                    className="p-4 border-2 border-gray-300 rounded-lg text-center hover:border-gray-400"
                  >
                    <FileText className="h-6 w-6 mx-auto mb-2 text-gray-400" />
                    <p className="font-medium">Alquiler</p>
                  </button>
                </div>
              </div>
              <ChecklistPanel operationType="venta" referenceId="OP-2024-001" />
            </div>
          </div>
        )}

        {activeTab === 'dsr' && <DSRActions />}
        {activeTab === 'consents' && <ConsentsManager />}
        {activeTab === 'kyc' && <KycAmlPanel />}
        {activeTab === 'documents' && <LegalDocsGenerator />}
        {activeTab === 'audit' && <AuditLogTable />}
        {activeTab === 'dpia' && <DpiaLightWizard />}
      </div>
    </div>
  );
}