import { useState } from "react";
import type { Credentials } from "../types";
import { maskSecret, formatDate } from "../utils";
import TestConnectionButton from "./TestConnectionButton";

interface CredentialsVaultProps {
  portalId: string;
  credentials?: Credentials;
  onUpdate: (credentials: Credentials) => void;
}

const CredentialsVault = ({ portalId, credentials, onUpdate }: CredentialsVaultProps) => {
  const [showSecrets, setShowSecrets] = useState(false);

  if (!credentials) {
    return (
      <div className="bg-white p-6 rounded-lg border">
        <div className="text-center py-8">
          <div className="text-gray-400 mb-4">🔐</div>
          <p className="text-gray-600 mb-4">No hay credenciales configuradas para este portal</p>
          <p className="text-sm text-gray-500">
            Ve a la pestaña de configuración para establecer las credenciales
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Credentials Overview */}
      <div className="bg-white p-6 rounded-lg border">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-semibold">Credenciales Almacenadas</h3>
          <div className="flex space-x-2">
            <button
              onClick={() => setShowSecrets(!showSecrets)}
              className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
            >
              {showSecrets ? "🙈 Ocultar" : "👁️ Mostrar"} Secretos
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Modo</label>
              <div className="mt-1 px-3 py-2 bg-gray-50 border rounded text-sm">
                {credentials.mode.toUpperCase()}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Alias</label>
              <div className="mt-1 px-3 py-2 bg-gray-50 border rounded text-sm">
                {credentials.alias}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Ámbito</label>
              <div className="mt-1 px-3 py-2 bg-gray-50 border rounded text-sm">
                {credentials.officeScope || "global"}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Última actualización</label>
              <div className="mt-1 px-3 py-2 bg-gray-50 border rounded text-sm">
                {formatDate(credentials.updatedAt)}
              </div>
            </div>
          </div>

          {credentials.expiresAt && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <div className="flex items-center">
                <div className="text-yellow-500 mr-2">⏰</div>
                <div>
                  <div className="text-sm font-medium text-yellow-800">
                    Credenciales expiran el {formatDate(credentials.expiresAt)}
                  </div>
                  <div className="text-sm text-yellow-700">
                    Considera renovarlas antes de la fecha de expiración
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Credential Details by Type */}
      {credentials.mode === "oauth" && credentials.oauth && (
        <div className="bg-white p-6 rounded-lg border">
          <h4 className="text-lg font-semibold mb-4">Detalles OAuth</h4>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Client ID</label>
              <div className="mt-1 font-mono text-sm p-2 bg-gray-50 rounded border">
                {showSecrets ? credentials.oauth.clientId : maskSecret(credentials.oauth.clientId || "")}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Client Secret</label>
              <div className="mt-1 font-mono text-sm p-2 bg-gray-50 rounded border">
                {showSecrets ? credentials.oauth.clientSecret : maskSecret(credentials.oauth.clientSecret || "")}
              </div>
            </div>
            
            {credentials.oauth.token && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Access Token</label>
                <div className="mt-1 font-mono text-sm p-2 bg-gray-50 rounded border">
                  {showSecrets ? credentials.oauth.token : maskSecret(credentials.oauth.token)}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {credentials.mode === "apikey" && credentials.apikey && (
        <div className="bg-white p-6 rounded-lg border">
          <h4 className="text-lg font-semibold mb-4">Detalles API Key</h4>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">API Key</label>
              <div className="mt-1 font-mono text-sm p-2 bg-gray-50 rounded border">
                {showSecrets ? credentials.apikey.apiKey : maskSecret(credentials.apikey.apiKey)}
              </div>
            </div>
            
            {credentials.apikey.accountId && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Account ID</label>
                <div className="mt-1 font-mono text-sm p-2 bg-gray-50 rounded border">
                  {credentials.apikey.accountId}
                </div>
              </div>
            )}
            
            {credentials.apikey.region && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Región</label>
                <div className="mt-1 font-mono text-sm p-2 bg-gray-50 rounded border">
                  {credentials.apikey.region}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {credentials.mode === "creds" && credentials.creds && (
        <div className="bg-white p-6 rounded-lg border">
          <h4 className="text-lg font-semibold mb-4">Credenciales de Usuario</h4>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Usuario</label>
              <div className="mt-1 font-mono text-sm p-2 bg-gray-50 rounded border">
                {credentials.creds.username}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Contraseña</label>
              <div className="mt-1 font-mono text-sm p-2 bg-gray-50 rounded border">
                {showSecrets ? credentials.creds.password : maskSecret(credentials.creds.password)}
              </div>
            </div>
            
            {credentials.creds.domain && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Dominio</label>
                <div className="mt-1 font-mono text-sm p-2 bg-gray-50 rounded border">
                  {credentials.creds.domain}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="bg-white p-6 rounded-lg border">
        <h4 className="text-lg font-semibold mb-4">Acciones</h4>
        <div className="flex flex-wrap gap-3">
          <TestConnectionButton portalId={portalId} />
          
          <button className="px-4 py-2 text-sm bg-yellow-50 text-yellow-700 border border-yellow-300 rounded-md hover:bg-yellow-100">
            🔄 Rotar Credenciales
          </button>
          
          <button className="px-4 py-2 text-sm bg-red-50 text-red-700 border border-red-300 rounded-md hover:bg-red-100">
            🗑️ Eliminar Credenciales
          </button>
        </div>
      </div>
    </div>
  );
};

export default CredentialsVault;