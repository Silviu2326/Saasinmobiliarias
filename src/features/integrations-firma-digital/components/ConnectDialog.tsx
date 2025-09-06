import React, { useState } from 'react';
import { DrawerProps } from '../types';
import { useProviders } from '../hooks';

interface ConnectDialogProps extends DrawerProps {
  providerId: string;
}

export function ConnectDialog({ providerId, isOpen, onClose }: ConnectDialogProps) {
  const { connect } = useProviders();
  const [connectionType, setConnectionType] = useState<'oauth' | 'apikey' | 'credentials'>('oauth');
  const [credentials, setCredentials] = useState({
    clientId: '',
    clientSecret: '',
    apiKey: '',
    username: '',
    password: '',
    accountId: '',
    region: ''
  });
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleConnect = async () => {
    setLoading(true);
    try {
      const success = await connect(providerId, { type: connectionType, ...credentials });
      if (success) {
        onClose();
      }
    } catch (error) {
      console.error('Connection failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-gray-500 bg-opacity-75" onClick={onClose}></div>
      
      <div className="relative w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <div className="mb-4">
          <h3 className="text-lg font-medium text-gray-900">Conectar Proveedor</h3>
          <p className="text-sm text-gray-600">Configure las credenciales para conectar el proveedor</p>
        </div>
        
        {/* Connection Type Selector */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Conexión</label>
          <div className="flex gap-2">
            {(['oauth', 'apikey', 'credentials'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setConnectionType(type)}
                className={`px-3 py-1 text-sm rounded ${
                  connectionType === type
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {type.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
        
        {/* OAuth Fields */}
        {connectionType === 'oauth' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Client ID</label>
              <input
                type="text"
                value={credentials.clientId}
                onChange={(e) => setCredentials(prev => ({ ...prev, clientId: e.target.value }))}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Client Secret</label>
              <input
                type="password"
                value={credentials.clientSecret}
                onChange={(e) => setCredentials(prev => ({ ...prev, clientSecret: e.target.value }))}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Redirect URI (auto)</label>
              <input
                type="text"
                value="https://myapp.com/oauth/callback"
                disabled
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 bg-gray-50"
              />
            </div>
          </div>
        )}
        
        {/* API Key Fields */}
        {connectionType === 'apikey' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">API Key</label>
              <input
                type="password"
                value={credentials.apiKey}
                onChange={(e) => setCredentials(prev => ({ ...prev, apiKey: e.target.value }))}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Account ID (opcional)</label>
              <input
                type="text"
                value={credentials.accountId}
                onChange={(e) => setCredentials(prev => ({ ...prev, accountId: e.target.value }))}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              />
            </div>
          </div>
        )}
        
        {/* Credentials Fields */}
        {connectionType === 'credentials' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Username</label>
              <input
                type="text"
                value={credentials.username}
                onChange={(e) => setCredentials(prev => ({ ...prev, username: e.target.value }))}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <input
                type="password"
                value={credentials.password}
                onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              />
            </div>
          </div>
        )}
        
        {/* Actions */}
        <div className="mt-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleConnect}
            disabled={loading}
            className="flex-1 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Conectando...' : 'Conectar'}
          </button>
        </div>
      </div>
    </div>
  );
}