import React from 'react';
import { useWebhooks } from '../hooks';

export function WebhooksPanel() {
  const { webhooks, loading, error } = useWebhooks();

  if (loading) {
    return (
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-16 bg-gray-100 rounded animate-pulse"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-sm text-red-600">Error: {error}</div>
    );
  }

  return (
    <div className="space-y-4">
      {webhooks.length > 0 ? (
        webhooks.map((webhook) => (
          <div key={webhook.id} className="border rounded p-3">
            <div className="text-sm font-medium text-gray-900">
              {webhook.url}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {webhook.events.length} eventos configurados
            </div>
            <div className="mt-2 flex gap-2">
              <span className={`inline-flex rounded px-2 py-1 text-xs font-medium ${
                webhook.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {webhook.enabled ? 'Activo' : 'Inactivo'}
              </span>
            </div>
          </div>
        ))
      ) : (
        <div className="text-center py-4">
          <div className="text-2xl mb-2">🔗</div>
          <p className="text-sm text-gray-600">No hay webhooks configurados</p>
          <button className="mt-2 text-blue-600 hover:text-blue-800 text-sm">
            Configurar Webhook
          </button>
        </div>
      )}
    </div>
  );
}