import React, { useState } from "react";
import { connectProviderSchema } from "../schema";
import type { ProviderInfo, ConnectData } from "../types";

interface ConnectDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConnect: (data: ConnectData) => Promise<void>;
  provider: ProviderInfo;
  loading: boolean;
}

export function ConnectDialog({ isOpen, onClose, onConnect, provider, loading }: ConnectDialogProps) {
  const [formData, setFormData] = useState<ConnectData>({
    mode: "test",
    type: "apikey",
    credentials: {},
    office: "",
    currencies: ["EUR"]
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      connectProviderSchema.parse(formData);
      setErrors({});
      await onConnect(formData);
    } catch (error: any) {
      if (error.issues) {
        const newErrors: Record<string, string> = {};
        error.issues.forEach((issue: any) => {
          newErrors[issue.path.join(".")] = issue.message;
        });
        setErrors(newErrors);
      } else {
        setErrors({ submit: error.message || "Error al conectar" });
      }
    }
  };

  const renderCredentialFields = () => {
    switch (formData.type) {
      case "oauth":
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Client ID
              </label>
              <input
                type="text"
                value={formData.credentials.clientId || ""}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  credentials: { ...prev.credentials, clientId: e.target.value }
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ingresa tu Client ID"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Client Secret
              </label>
              <input
                type="password"
                value={formData.credentials.clientSecret || ""}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  credentials: { ...prev.credentials, clientSecret: e.target.value }
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ingresa tu Client Secret"
              />
            </div>
          </div>
        );
      
      case "apikey":
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              API Key
            </label>
            <input
              type="password"
              value={formData.credentials.apiKey || ""}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                credentials: { ...prev.credentials, apiKey: e.target.value }
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ingresa tu API Key"
            />
          </div>
        );
      
      case "credentials":
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Usuario/Comercio
              </label>
              <input
                type="text"
                value={formData.credentials.username || ""}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  credentials: { ...prev.credentials, username: e.target.value }
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ingresa el usuario o código de comercio"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contraseña/Terminal
              </label>
              <input
                type="password"
                value={formData.credentials.password || ""}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  credentials: { ...prev.credentials, password: e.target.value }
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ingresa la contraseña o terminal"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Clave de Firma
              </label>
              <input
                type="password"
                value={formData.credentials.secretKey || ""}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  credentials: { ...prev.credentials, secretKey: e.target.value }
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ingresa la clave de firma"
              />
            </div>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Conectar {provider.name}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
              disabled={loading}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Connection Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Conexión
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="apikey">API Key</option>
                <option value="oauth">OAuth</option>
                <option value="credentials">Credenciales</option>
              </select>
            </div>

            {/* Mode */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Modo
              </label>
              <select
                value={formData.mode}
                onChange={(e) => setFormData(prev => ({ ...prev, mode: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="test">Pruebas</option>
                <option value="live">Producción</option>
              </select>
            </div>

            {/* Credentials */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Credenciales
              </label>
              {renderCredentialFields()}
              {errors.credentials && (
                <p className="mt-2 text-sm text-red-600">{errors.credentials}</p>
              )}
            </div>

            {/* Office/Scope */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Oficina/Scope (opcional)
              </label>
              <input
                type="text"
                value={formData.office}
                onChange={(e) => setFormData(prev => ({ ...prev, office: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Especifica la oficina o scope"
              />
            </div>

            {/* Currencies */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Monedas Permitidas
              </label>
              <div className="space-y-2">
                {["EUR", "USD", "GBP"].map((currency) => (
                  <label key={currency} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.currencies.includes(currency)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData(prev => ({
                            ...prev,
                            currencies: [...prev.currencies, currency]
                          }));
                        } else {
                          setFormData(prev => ({
                            ...prev,
                            currencies: prev.currencies.filter(c => c !== currency)
                          }));
                        }
                      }}
                      className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">{currency}</span>
                  </label>
                ))}
              </div>
              {errors.currencies && (
                <p className="mt-2 text-sm text-red-600">{errors.currencies}</p>
              )}
            </div>

            {/* Submit Error */}
            {errors.submit && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{errors.submit}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                disabled={loading}
              >
                {loading ? "Conectando..." : "Conectar"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}