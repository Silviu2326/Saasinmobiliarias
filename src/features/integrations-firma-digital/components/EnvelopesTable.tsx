import React from 'react';
import { useEnvelopes } from '../hooks';
import { ComponentProps } from '../types';
import { statusColor, formatDateTime } from '../utils';

export function EnvelopesTable({ onDetails }: ComponentProps) {
  const { envelopes, loading, error } = useEnvelopes();

  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-16 bg-gray-100 rounded animate-pulse"></div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-600">
        Error al cargar envíos: {error}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Documento</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Firmantes</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {envelopes.map((envelope) => (
              <tr key={envelope.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">{envelope.subject}</div>
                  <div className="text-sm text-gray-500">ID: {envelope.id}</div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${statusColor(envelope.status)}`}>
                    {envelope.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1">
                    {envelope.signers.map((signer, idx) => (
                      <span key={idx} className={`inline-flex rounded px-2 py-1 text-xs font-medium ${statusColor(signer.status || 'pending')}`}>
                        {signer.name}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {formatDateTime(envelope.createdAt)}
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => onDetails?.(envelope.id)}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      Ver
                    </button>
                    {envelope.status === 'sent' && (
                      <button className="text-yellow-600 hover:text-yellow-800 text-sm">
                        Recordar
                      </button>
                    )}
                    {envelope.status !== 'signed' && envelope.status !== 'canceled' && (
                      <button className="text-red-600 hover:text-red-800 text-sm">
                        Cancelar
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {envelopes.length === 0 && (
        <div className="text-center py-8">
          <div className="text-4xl mb-4">📨</div>
          <h3 className="text-lg font-medium text-gray-900">No hay envíos</h3>
          <p className="text-gray-600 mt-2">Los envíos de documentos aparecerán aquí</p>
        </div>
      )}
    </div>
  );
}