import React, { useState } from "react";
import {
  PSPProvidersGrid,
  ImportExportBar,
  PaymentMethodsTable,
  CheckoutLinksTable,
  ChargesTable,
  SubscriptionsTable,
  DisputesPanel,
  PayoutsPanel,
  ReconciliationPanel,
  FeesBreakdownCard,
  UsageCostsCard,
  WebhooksPanel,
  LogsTable,
  AuditTrailDrawer
} from "./components";

export default function PagosIntegrationsPage() {
  const [showAuditTrail, setShowAuditTrail] = useState(false);
  const [auditEntityId, setAuditEntityId] = useState<string | undefined>();

  const handleShowAuditTrail = (entityId?: string) => {
    setAuditEntityId(entityId);
    setShowAuditTrail(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Integraciones de Pagos
                </h1>
                <p className="mt-2 text-sm text-gray-600">
                  Gestiona proveedores de pago, métodos, cobros, reembolsos y conciliación desde un solo lugar
                </p>
              </div>
              
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => handleShowAuditTrail()}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Auditoría
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Import/Export Bar */}
        <ImportExportBar />

        {/* PSP Providers Grid */}
        <PSPProvidersGrid />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-8">
            {/* Payment Methods */}
            <PaymentMethodsTable />

            {/* Checkout Links */}
            <CheckoutLinksTable />

            {/* Charges */}
            <ChargesTable />

            {/* Disputes */}
            <DisputesPanel />
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Subscriptions */}
            <SubscriptionsTable />

            {/* Payouts */}
            <PayoutsPanel />

            {/* Reconciliation */}
            <ReconciliationPanel />

            {/* Fees Breakdown */}
            <FeesBreakdownCard />

            {/* Usage & Costs */}
            <UsageCostsCard />

            {/* Webhooks */}
            <WebhooksPanel />
          </div>
        </div>

        {/* Logs Table - Full Width */}
        <div className="mt-8">
          <LogsTable />
        </div>
      </div>

      {/* Audit Trail Drawer */}
      <AuditTrailDrawer
        isOpen={showAuditTrail}
        onClose={() => setShowAuditTrail(false)}
        entityId={auditEntityId}
      />
    </div>
  );
}