import { X, Copy, Hash, Link as LinkIcon } from 'lucide-react';
import { formatDate, formatSeverity, formatResult, calculateDiff, obfuscatePayload } from '../utils';
import { EvidenceViewer } from './EvidenceViewer';
import type { AuditEvent } from '../types';

interface AuditDetailsDrawerProps {
  event: AuditEvent | null;
  isOpen: boolean;
  onClose: () => void;
}

export function AuditDetailsDrawer({ event, isOpen, onClose }: AuditDetailsDrawerProps) {
  if (!isOpen || !event) return null;

  const severity = formatSeverity(event.severity);
  const result = formatResult(event.result);
  const diffs = calculateDiff(event.before, event.after);
  const obfuscatedPayload = obfuscatePayload(event.payload);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
      
      <div className="absolute right-0 top-0 h-full w-full max-w-2xl bg-white shadow-xl">
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-xl font-semibold">Detalle del Evento</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Metadatos principales */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Fecha/Hora</label>
                <p className="text-sm mt-1">{formatDate(event.at)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Actor</label>
                <p className="text-sm mt-1">{event.actor}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Rol</label>
                <p className="text-sm mt-1">{event.role || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Origen</label>
                <p className="text-sm mt-1 uppercase">{event.origin}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Entidad</label>
                <p className="text-sm mt-1">{event.entity}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Referencia</label>
                <p className="text-sm mt-1">{event.ref || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Acción</label>
                <p className="text-sm mt-1">{event.action}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Severidad</label>
                <span className={`inline-block px-2 py-1 text-xs rounded-full mt-1 ${severity.bgColor} ${severity.color}`}>
                  {severity.label}
                </span>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Resultado</label>
                <span className={`inline-block px-2 py-1 text-xs rounded-full mt-1 ${result.bgColor} ${result.color}`}>
                  {result.label}
                </span>
              </div>
            </div>

            {/* Información técnica */}
            {(event.ip || event.userAgent || event.sessionId) && (
              <div className="border rounded-lg p-4">
                <h3 className="font-medium mb-3">Información Técnica</h3>
                <div className="space-y-2 text-sm">
                  {event.ip && <div><strong>IP:</strong> {event.ip}</div>}
                  {event.userAgent && <div><strong>User Agent:</strong> {event.userAgent}</div>}
                  {event.sessionId && <div><strong>Sesión:</strong> {event.sessionId}</div>}
                </div>
              </div>
            )}

            {/* Payload */}
            {obfuscatedPayload && (
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium">Payload</h3>
                  <button
                    onClick={() => copyToClipboard(JSON.stringify(obfuscatedPayload, null, 2))}
                    className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900"
                  >
                    <Copy className="h-4 w-4" />
                    Copiar
                  </button>
                </div>
                <pre className="bg-gray-50 p-3 rounded text-xs overflow-x-auto">
                  {JSON.stringify(obfuscatedPayload, null, 2)}
                </pre>
              </div>
            )}

            {/* Diferencias */}
            {diffs.length > 0 && (
              <div className="border rounded-lg p-4">
                <h3 className="font-medium mb-3">Cambios</h3>
                <div className="space-y-2">
                  {diffs.map((diff, index) => (
                    <div key={index} className="border-l-4 pl-3 py-1" style={{
                      borderColor: diff.type === 'added' ? '#10b981' : 
                                 diff.type === 'removed' ? '#ef4444' : '#f59e0b'
                    }}>
                      <div className="text-sm font-medium">{diff.field}</div>
                      <div className="text-xs space-y-1">
                        {diff.type !== 'added' && (
                          <div className="text-red-600">- {JSON.stringify(diff.before)}</div>
                        )}
                        {diff.type !== 'removed' && (
                          <div className="text-green-600">+ {JSON.stringify(diff.after)}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Evidencias */}
            {event.evidence && event.evidence.length > 0 && (
              <div className="border rounded-lg p-4">
                <h3 className="font-medium mb-3">Evidencias</h3>
                <div className="space-y-3">
                  {event.evidence.map((filename, index) => (
                    <EvidenceViewer
                      key={index}
                      eventId={event.id}
                      filename={filename}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Integridad */}
            <div className="border rounded-lg p-4">
              <h3 className="font-medium mb-3 flex items-center gap-2">
                <Hash className="h-4 w-4" />
                Integridad
              </h3>
              <div className="space-y-2 text-sm">
                {event.hash && (
                  <div className="flex items-center justify-between">
                    <span>Hash del evento:</span>
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                      {event.hash.substring(0, 16)}...
                    </code>
                  </div>
                )}
                {event.chainHash && (
                  <div className="flex items-center justify-between">
                    <span>Hash de cadena:</span>
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                      {event.chainHash}
                    </code>
                  </div>
                )}
              </div>
            </div>

            {/* Enlace a entidad */}
            {event.ref && (
              <div className="border rounded-lg p-4">
                <h3 className="font-medium mb-3 flex items-center gap-2">
                  <LinkIcon className="h-4 w-4" />
                  Enlaces Relacionados
                </h3>
                <button className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1">
                  Ver {event.entity} {event.ref}
                  <LinkIcon className="h-3 w-3" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}