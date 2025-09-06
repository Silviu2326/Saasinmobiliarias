import React, { useState } from 'react';
import {
  ProvidersGrid,
  TemplatesTable,
  TemplateEditor,
  FlowBuilder,
  EnvelopesTable,
  EnvelopeDetailsDrawer,
  SettingsDrawer,
  ConnectDialog,
  WebhooksPanel,
  LogsTable,
  ImportExportBar,
  TestConnectionButton,
  ComplianceBadge,
  CreditsUsageCard,
  AuditTrailDrawer
} from './components';

export default function FirmaDigitalIntegrationsPage() {
  const [selectedProviderId, setSelectedProviderId] = useState<string | null>(null);
  const [selectedEnvelopeId, setSelectedEnvelopeId] = useState<string | null>(null);
  const [showTemplateEditor, setShowTemplateEditor] = useState(false);
  const [showFlowBuilder, setShowFlowBuilder] = useState(false);
  const [showSettingsDrawer, setShowSettingsDrawer] = useState(false);
  const [showConnectDialog, setShowConnectDialog] = useState(false);
  const [showAuditTrail, setShowAuditTrail] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);

  const handleProviderConnect = (providerId: string) => {
    setSelectedProviderId(providerId);
    setShowConnectDialog(true);
  };

  const handleProviderSettings = (providerId: string) => {
    setSelectedProviderId(providerId);
    setShowSettingsDrawer(true);
  };

  const handleEnvelopeDetails = (envelopeId: string) => {
    setSelectedEnvelopeId(envelopeId);
  };

  const handleNewTemplate = () => {
    setSelectedTemplateId(null);
    setShowTemplateEditor(true);
  };

  const handleEditTemplate = (templateId: string) => {
    setSelectedTemplateId(templateId);
    setShowTemplateEditor(true);
  };

  const handleNewFlow = () => {
    setShowFlowBuilder(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Integraciones de Firma Digital (eIDAS)</h1>
          <p className="mt-2 text-gray-600">
            Centraliza la firma electrónica conforme a eIDAS: gestión de proveedores, plantillas, flujos, envíos y trazabilidad completa.
          </p>
        </div>

        {/* Top Actions Bar */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <ImportExportBar />
            <TestConnectionButton />
          </div>
          
          <div className="flex items-center gap-4">
            <ComplianceBadge />
            <CreditsUsageCard />
          </div>
        </div>

        {/* Providers Section */}
        <div className="mb-8">
          <h2 className="mb-4 text-xl font-semibold text-gray-900">Proveedores de Firma</h2>
          <ProvidersGrid 
            onConnect={handleProviderConnect}
            onSettings={handleProviderSettings}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column - Templates and Flows */}
          <div className="lg:col-span-2 space-y-6">
            {/* Templates Section */}
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Plantillas de Documentos</h3>
                <button
                  onClick={handleNewTemplate}
                  className="rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                  Nueva Plantilla
                </button>
              </div>
              <TemplatesTable onEdit={handleEditTemplate} />
            </div>

            {/* Flows Section */}
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Flujos de Firma</h3>
                <button
                  onClick={handleNewFlow}
                  className="rounded-md bg-green-600 px-3 py-2 text-sm font-medium text-white hover:bg-green-700"
                >
                  Nuevo Flujo
                </button>
              </div>
              <div className="text-sm text-gray-600">
                Define secuencias de firma, recordatorios y métodos de autenticación para diferentes tipos de documentos.
              </div>
            </div>

            {/* Envelopes Section */}
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Envíos y Sobres</h3>
              <EnvelopesTable onDetails={handleEnvelopeDetails} />
            </div>
          </div>

          {/* Right Column - Configuration and Monitoring */}
          <div className="space-y-6">
            {/* Webhooks Panel */}
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <h4 className="text-md font-medium text-gray-900 mb-4">Configuración de Webhooks</h4>
              <WebhooksPanel />
            </div>

            {/* Activity Logs */}
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-md font-medium text-gray-900">Logs de Actividad</h4>
                <button
                  onClick={() => setShowAuditTrail(true)}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Ver Auditoría
                </button>
              </div>
              <LogsTable />
            </div>
          </div>
        </div>
      </div>

      {/* Modals and Drawers */}
      {showConnectDialog && selectedProviderId && (
        <ConnectDialog
          providerId={selectedProviderId}
          isOpen={showConnectDialog}
          onClose={() => {
            setShowConnectDialog(false);
            setSelectedProviderId(null);
          }}
        />
      )}

      {showSettingsDrawer && selectedProviderId && (
        <SettingsDrawer
          providerId={selectedProviderId}
          isOpen={showSettingsDrawer}
          onClose={() => {
            setShowSettingsDrawer(false);
            setSelectedProviderId(null);
          }}
        />
      )}

      {showTemplateEditor && (
        <TemplateEditor
          templateId={selectedTemplateId}
          isOpen={showTemplateEditor}
          onClose={() => {
            setShowTemplateEditor(false);
            setSelectedTemplateId(null);
          }}
        />
      )}

      {showFlowBuilder && (
        <FlowBuilder
          isOpen={showFlowBuilder}
          onClose={() => setShowFlowBuilder(false)}
        />
      )}

      {selectedEnvelopeId && (
        <EnvelopeDetailsDrawer
          envelopeId={selectedEnvelopeId}
          isOpen={!!selectedEnvelopeId}
          onClose={() => setSelectedEnvelopeId(null)}
        />
      )}

      {showAuditTrail && (
        <AuditTrailDrawer
          isOpen={showAuditTrail}
          onClose={() => setShowAuditTrail(false)}
        />
      )}
    </div>
  );
}