import React from 'react';
import { useLogs } from '../hooks';
import { formatDateTime } from '../utils';

export function LogsTable() {
  const { logs, loading, error } = useLogs();

  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-12 bg-gray-100 rounded animate-pulse"></div>
        ))}
      </div>
    );
  }

  if (error) {
    return <div className="text-sm text-red-600">Error: {error}</div>;
  }

  return (
    <div className="space-y-2">
      {logs.slice(0, 5).map((log) => (
        <div key={log.id} className="border rounded p-3">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium text-gray-900">
              {log.action}
            </div>
            <span className={`inline-flex rounded px-2 py-1 text-xs font-medium ${
              log.result === 'ok' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {log.result}
            </span>
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {formatDateTime(log.timestamp)}
          </div>
          {log.message && (
            <div className="text-sm text-gray-600 mt-1">
              {log.message}
            </div>
          )}
        </div>
      ))}
      
      {logs.length === 0 && (
        <div className="text-center py-4">
          <div className="text-2xl mb-2">📜</div>
          <p className="text-sm text-gray-600">No hay logs recientes</p>
        </div>
      )}
      
      {logs.length > 5 && (
        <div className="text-center pt-2">
          <button className="text-blue-600 hover:text-blue-800 text-sm">
            Ver más logs
          </button>
        </div>
      )}
    </div>
  );
}