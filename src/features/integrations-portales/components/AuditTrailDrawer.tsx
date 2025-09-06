import { useAuditTrail } from "../hooks";
import { formatDate } from "../utils";

interface AuditTrailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  portalId?: string;
}

const AuditTrailDrawer = ({ isOpen, onClose, portalId }: AuditTrailDrawerProps) => {
  const { events, loading, error } = useAuditTrail(portalId);

  if (!isOpen) return null;

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case "credential_update": return "🔐";
      case "mapping_change": return "🔗";
      case "config_change": return "⚙️";
      case "publish_action": return "📤";
      default: return "📝";
    }
  };

  const getEventColor = (eventType: string) => {
    switch (eventType) {
      case "credential_update": return "text-red-600 bg-red-50";
      case "mapping_change": return "text-blue-600 bg-blue-50";
      case "config_change": return "text-yellow-600 bg-yellow-50";
      case "publish_action": return "text-green-600 bg-green-50";
      default: return "text-gray-600 bg-gray-50";
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex z-50">
      <div className="ml-auto w-full max-w-2xl bg-white h-full flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Auditoría de Cambios {portalId && `- ${portalId}`}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-2">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-auto p-6">
          {loading ? (
            <div className="animate-pulse space-y-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-20 bg-gray-200 rounded"></div>
              ))}
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-red-600">{error}</p>
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-4">📋</div>
              <p>No hay eventos de auditoría registrados</p>
            </div>
          ) : (
            <div className="space-y-4">
              {events.map((event) => (
                <div key={event.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${getEventColor(event.eventType)}`}>
                      {getEventIcon(event.eventType)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {event.description}
                          </p>
                          <div className="mt-1 text-xs text-gray-500 space-x-4">
                            <span>👤 {event.user}</span>
                            <span>🕒 {formatDate(event.timestamp)}</span>
                            {event.portalName && <span>🌐 {event.portalName}</span>}
                            {event.ipAddress && <span>🌍 {event.ipAddress}</span>}
                          </div>
                        </div>
                      </div>
                      
                      {(event.oldValue || event.newValue) && (
                        <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
                          {event.oldValue && (
                            <div className="bg-red-50 p-2 rounded">
                              <div className="font-medium text-red-800 mb-1">Valor anterior:</div>
                              <pre className="text-red-700 whitespace-pre-wrap overflow-auto">
                                {JSON.stringify(event.oldValue, null, 2)}
                              </pre>
                            </div>
                          )}
                          {event.newValue && (
                            <div className="bg-green-50 p-2 rounded">
                              <div className="font-medium text-green-800 mb-1">Valor nuevo:</div>
                              <pre className="text-green-700 whitespace-pre-wrap overflow-auto">
                                {JSON.stringify(event.newValue, null, 2)}
                              </pre>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuditTrailDrawer;