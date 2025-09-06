import React, { useState } from "react";
import { useProviderConfig } from "../hooks";

interface SettingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  providerId: string;
}

export function SettingsDrawer({ isOpen, onClose, providerId }: SettingsDrawerProps) {
  const { config, loading, updateConfig } = useProviderConfig(providerId);
  const [activeTab, setActiveTab] = useState("methods");
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const tabs = [
    { id: "methods", name: "Métodos", icon: "💳" },
    { id: "currencies", name: "Divisas", icon: "💰" },
    { id: "branding", name: "Branding", icon: "🎨" },
    { id: "webhooks", name: "Webhooks", icon: "🔗" },
    { id: "risk", name: "Riesgo", icon: "🛡️" }
  ];

  const renderTabContent = () => {
    if (loading || !config) {
      return (
        <div className="p-6 space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
              <div className="h-8 bg-gray-100 rounded"></div>
            </div>
          ))}
        </div>
      );
    }

    switch (activeTab) {
      case "methods":
        return (
          <div className="p-6 space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Métodos de Pago</h3>
            <div className="space-y-4">
              {config.methods.map((method) => (
                <div key={method.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <span className="font-medium text-gray-900">{method.name}</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={method.enabled}
                          className="sr-only peer"
                          onChange={() => {/* Handle toggle */}}
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>
                  
                  {method.enabled && (
                    <div className="grid grid-cols-2 gap-4 mt-3 text-sm">
                      <div>
                        <label className="block text-gray-600 mb-1">Mínimo</label>
                        <input
                          type="number"
                          value={method.minAmount || ""}
                          className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                          placeholder="0.01"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-600 mb-1">Máximo</label>
                        <input
                          type="number"
                          value={method.maxAmount || ""}
                          className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                          placeholder="Sin límite"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-600 mb-1">Comisión %</label>
                        <input
                          type="number"
                          step="0.1"
                          value={method.feePct || ""}
                          className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                          placeholder="2.9"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-600 mb-1">Comisión fija</label>
                        <input
                          type="number"
                          step="0.01"
                          value={method.feeFixed || ""}
                          className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                          placeholder="0.30"
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );

      case "currencies":
        return (
          <div className="p-6 space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Configuración de Divisas</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Moneda Base
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                  <option value="EUR">EUR - Euro</option>
                  <option value="USD">USD - Dólar</option>
                  <option value="GBP">GBP - Libra</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Monedas Permitidas
                </label>
                <div className="space-y-2">
                  {["EUR", "USD", "GBP"].map((currency) => (
                    <label key={currency} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={config.currencies.allowed.includes(currency)}
                        className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">{currency}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case "branding":
        return (
          <div className="p-6 space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Personalización</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Color Principal
                </label>
                <input
                  type="color"
                  value={config.branding.color || "#635BFF"}
                  className="h-10 w-20 border border-gray-300 rounded"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Texto del Recibo
                </label>
                <textarea
                  value={config.branding.receiptText || ""}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  rows={3}
                  placeholder="Gracias por su compra"
                />
              </div>
            </div>
          </div>
        );

      case "webhooks":
        return (
          <div className="p-6 space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Configuración de Webhooks</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL del Endpoint
                </label>
                <input
                  type="url"
                  value={config.webhooks.url}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="https://api.ejemplo.com/webhooks"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Secreto (HMAC)
                </label>
                <input
                  type="password"
                  value={config.webhooks.secret}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Eventos
                </label>
                <div className="space-y-2">
                  {[
                    "payment.created",
                    "payment.succeeded", 
                    "payment.failed",
                    "refund.created"
                  ].map((event) => (
                    <label key={event} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={config.webhooks.events.includes(event)}
                        className="rounded border-gray-300 text-blue-600"
                      />
                      <span className="ml-2 text-sm text-gray-700 font-mono">{event}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case "risk":
        return (
          <div className="p-6 space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Configuración de Riesgo</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Forzar 3D Secure
                  </label>
                  <p className="text-sm text-gray-500">Requerir autenticación 3DS para todos los pagos</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.risk.force3ds}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Umbral de Riesgo (0-100)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={config.risk.scoreThreshold}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Pagos con score mayor activarán 3DS automáticamente
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Límite por Transacción
                </label>
                <input
                  type="number"
                  value={config.risk.maxTicketAmount || ""}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="1000"
                />
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={`fixed inset-0 z-50 ${isOpen ? "" : "pointer-events-none"}`}>
      {/* Overlay */}
      <div 
        className={`absolute inset-0 bg-black transition-opacity duration-300 ${
          isOpen ? "opacity-50" : "opacity-0"
        }`}
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div 
        className={`absolute right-0 top-0 h-full w-full max-w-2xl bg-white shadow-xl transform transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              Configuración del Proveedor
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {renderTabContent()}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={saving}
            >
              Cancelar
            </button>
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              disabled={saving}
            >
              {saving ? "Guardando..." : "Guardar Cambios"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}