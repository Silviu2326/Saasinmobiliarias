import { useState, useEffect } from "react";
import type { CredentialMode, Credentials } from "../types";
import { validateCredentials } from "../schema";

interface ConnectDialogProps {
  portalId: string;
  isOpen: boolean;
  onClose: () => void;
  onConnect: (portalId: string, credentials: Partial<Credentials>) => Promise<{ success: boolean; message: string }>;
  loading: boolean;
}

const ConnectDialog = ({ portalId, isOpen, onClose, onConnect, loading }: ConnectDialogProps) => {
  const [mode, setMode] = useState<CredentialMode>("apikey");
  const [formData, setFormData] = useState({
    alias: `${portalId}-prod`,
    officeScope: "global",
    // OAuth
    clientId: "",
    clientSecret: "",
    // API Key
    apiKey: "",
    accountId: "",
    region: "eu-west-1",
    // Credentials
    username: "",
    password: "",
    domain: ""
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        alias: `${portalId}-prod`,
        officeScope: "global",
        clientId: "",
        clientSecret: "",
        apiKey: "",
        accountId: "",
        region: "eu-west-1",
        username: "",
        password: "",
        domain: ""
      });
      setErrors({});
    }
  }, [isOpen, portalId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const credentials: Partial<Credentials> = {
      mode,
      alias: formData.alias,
      officeScope: formData.officeScope
    };

    if (mode === "oauth") {
      credentials.oauth = {
        clientId: formData.clientId,
        clientSecret: formData.clientSecret
      };
    } else if (mode === "apikey") {
      credentials.apikey = {
        apiKey: formData.apiKey,
        accountId: formData.accountId,
        region: formData.region
      };
    } else if (mode === "creds") {
      credentials.creds = {
        username: formData.username,
        password: formData.password,
        domain: formData.domain
      };
    }

    const validation = validateCredentials(credentials);
    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
      validation.error?.errors.forEach(error => {
        if (error.path && error.path.length > 0) {
          fieldErrors[error.path.join(".")] = error.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    try {
      const result = await onConnect(portalId, credentials);
      if (result.success) {
        onClose();
      } else {
        setErrors({ submit: result.message });
      }
    } catch (error) {
      setErrors({ submit: "Error al conectar portal" });
    }
  };

  const handleOAuthAuthorize = () => {
    setTesting(true);
    // Simulate OAuth flow
    setTimeout(() => {
      setFormData({ ...formData, clientId: "oauth_client_123", clientSecret: "oauth_secret_456" });
      setTesting(false);
    }, 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-screen overflow-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Conectar {portalId}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Mode Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Método de autenticación
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setMode("oauth")}
                className={`px-3 py-2 text-sm rounded-md ${
                  mode === "oauth"
                    ? "bg-blue-100 text-blue-800 border-blue-300 border"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                OAuth
              </button>
              <button
                type="button"
                onClick={() => setMode("apikey")}
                className={`px-3 py-2 text-sm rounded-md ${
                  mode === "apikey"
                    ? "bg-blue-100 text-blue-800 border-blue-300 border"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                API Key
              </button>
              <button
                type="button"
                onClick={() => setMode("creds")}
                className={`px-3 py-2 text-sm rounded-md ${
                  mode === "creds"
                    ? "bg-blue-100 text-blue-800 border-blue-300 border"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Credenciales
              </button>
            </div>
          </div>

          {/* Basic Fields */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Alias
            </label>
            <input
              type="text"
              value={formData.alias}
              onChange={(e) => setFormData({ ...formData, alias: e.target.value })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            {errors.alias && <p className="text-red-500 text-xs mt-1">{errors.alias}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Ámbito
            </label>
            <select
              value={formData.officeScope}
              onChange={(e) => setFormData({ ...formData, officeScope: e.target.value })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="global">Global</option>
              <option value="office">Solo mi oficina</option>
            </select>
          </div>

          {/* OAuth Fields */}
          {mode === "oauth" && (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-sm text-blue-800 mb-3">
                  Autoriza la aplicación para acceder a tu cuenta de {portalId}
                </p>
                <button
                  type="button"
                  onClick={handleOAuthAuthorize}
                  disabled={testing}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {testing ? "Autorizando..." : "🔗 Autorizar aplicación"}
                </button>
              </div>
              
              {formData.clientId && (
                <div className="text-sm text-green-600">
                  ✅ Autorización completada
                </div>
              )}
            </div>
          )}

          {/* API Key Fields */}
          {mode === "apikey" && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  API Key *
                </label>
                <input
                  type="password"
                  value={formData.apiKey}
                  onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="sk_live_..."
                />
                {errors["apikey.apiKey"] && <p className="text-red-500 text-xs mt-1">{errors["apikey.apiKey"]}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Account ID
                </label>
                <input
                  type="text"
                  value={formData.accountId}
                  onChange={(e) => setFormData({ ...formData, accountId: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="acc_123456"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Región
                </label>
                <select
                  value={formData.region}
                  onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="eu-west-1">Europa (Irlanda)</option>
                  <option value="us-east-1">EE.UU. (Virginia)</option>
                  <option value="ap-south-1">Asia (Mumbai)</option>
                </select>
              </div>
            </div>
          )}

          {/* Credentials Fields */}
          {mode === "creds" && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Usuario *
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {errors["creds.username"] && <p className="text-red-500 text-xs mt-1">{errors["creds.username"]}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Contraseña *
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {errors["creds.password"] && <p className="text-red-500 text-xs mt-1">{errors["creds.password"]}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Dominio
                </label>
                <input
                  type="text"
                  value={formData.domain}
                  onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="miempresa.com"
                />
              </div>
            </div>
          )}

          {/* Error Display */}
          {errors.submit && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{errors.submit}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || (mode === "oauth" && !formData.clientId)}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Conectando..." : "Conectar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ConnectDialog;