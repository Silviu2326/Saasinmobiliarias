import React, { useState } from "react";
import { formatDate, getStatusColor, getStatusText } from "../utils";
import { ConnectDialog } from "./ConnectDialog";
import { SettingsDrawer } from "./SettingsDrawer";
import type { ProviderInfo, ConnectData } from "../types";

interface ProviderCardProps {
  provider: ProviderInfo;
  onConnect: (id: string, data: ConnectData) => Promise<void>;
  onTest: (id: string) => Promise<{ success: boolean; message: string }>;
  onModeChange: (id: string, mode: "test" | "live") => Promise<void>;
}

export function ProviderCard({ provider, onConnect, onTest, onModeChange }: ProviderCardProps) {
  const [showConnectDialog, setShowConnectDialog] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [testing, setTesting] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleConnect = async (data: ConnectData) => {
    try {
      setConnecting(true);
      await onConnect(provider.id, data);
      setShowConnectDialog(false);
    } catch (error) {
      throw error;
    } finally {
      setConnecting(false);
    }
  };

  const handleTest = async () => {
    try {
      setTesting(true);
      const result = await onTest(provider.id);
      setTestResult(result);
    } catch (error) {
      setTestResult({
        success: false,
        message: error instanceof Error ? error.message : "Error al probar conexión"
      });
    } finally {
      setTesting(false);
    }
  };

  const handleModeToggle = async () => {
    try {
      const newMode = provider.status === "LIVE" ? "test" : "live";
      await onModeChange(provider.id, newMode);
    } catch (error) {
      console.error("Error changing mode:", error);
    }
  };

  const isConnected = provider.status !== "DISCONNECTED";
  const statusColor = getStatusColor(provider.status);

  return (
    <>
      <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
              {provider.logo ? (
                <img src={provider.logo} alt={provider.name} className="w-8 h-8 object-contain" />
              ) : (
                <div className="w-8 h-8 bg-gray-300 rounded"></div>
              )}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{provider.name}</h3>
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusColor}`}>
                {getStatusText(provider.status)}
              </span>
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="space-y-2 mb-4">
          <div className="text-sm text-gray-600">
            <strong>Métodos:</strong> {provider.methods.join(", ")}
          </div>
          <div className="text-sm text-gray-600">
            <strong>Divisas:</strong> {provider.currencies.join(", ")}
          </div>
          {provider.lastSyncAt && (
            <div className="text-sm text-gray-500">
              Última sync: {formatDate(provider.lastSyncAt)}
            </div>
          )}
        </div>

        {/* Test Result */}
        {testResult && (
          <div className={`p-3 rounded-lg mb-4 text-sm ${
            testResult.success 
              ? "bg-green-50 text-green-800 border border-green-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}>
            {testResult.message}
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col space-y-2">
          {!isConnected ? (
            <button
              onClick={() => setShowConnectDialog(true)}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              disabled={connecting}
            >
              {connecting ? "Conectando..." : "Conectar"}
            </button>
          ) : (
            <>
              <div className="flex space-x-2">
                <button
                  onClick={() => setShowSettings(true)}
                  className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                >
                  Configurar
                </button>
                <button
                  onClick={handleTest}
                  className="flex-1 px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm font-medium"
                  disabled={testing}
                >
                  {testing ? "Probando..." : "Probar"}
                </button>
              </div>
              
              {/* Mode Toggle */}
              {(provider.status === "TEST" || provider.status === "LIVE") && (
                <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">Modo:</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={provider.status === "LIVE"}
                      onChange={handleModeToggle}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    <span className="ml-3 text-sm text-gray-700">
                      {provider.status === "LIVE" ? "Live" : "Test"}
                    </span>
                  </label>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Dialogs */}
      <ConnectDialog
        isOpen={showConnectDialog}
        onClose={() => setShowConnectDialog(false)}
        onConnect={handleConnect}
        provider={provider}
        loading={connecting}
      />

      <SettingsDrawer
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        providerId={provider.id}
      />
    </>
  );
}