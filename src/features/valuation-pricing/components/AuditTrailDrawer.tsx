import React from 'react';
import { X, Clock, User } from 'lucide-react';
import type { AuditEvent } from '../types';

interface AuditTrailDrawerProps {
  open: boolean;
  onClose: () => void;
  events: AuditEvent[];
}

const AuditTrailDrawer: React.FC<AuditTrailDrawerProps> = ({ open, onClose, events }) => {
  if (!open) return null;

  const mockEvents: AuditEvent[] = [
    {
      id: '1',
      at: new Date().toISOString(),
      user: 'user',
      userName: 'Juan Pérez',
      action: 'Precio actualizado',
      category: 'PRICE_CHANGE',
      payload: { oldPrice: 295000, newPrice: 300000 }
    },
    {
      id: '2', 
      at: new Date(Date.now() - 3600000).toISOString(),
      user: 'user',
      action: 'Escenario creado',
      category: 'SCENARIO',
      payload: { scenarioName: 'Equilibrio' }
    }
  ];

  const data = events.length > 0 ? events : mockEvents;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end">
      <div className="bg-white w-96 h-full shadow-xl">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">Trazabilidad</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="overflow-y-auto h-full pb-20">
          {data.map((event) => (
            <div key={event.id} className="p-6 border-b border-gray-100">
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-medium text-gray-900">{event.action}</h4>
                    <span className="text-xs text-gray-500">
                      {new Date(event.at).toLocaleTimeString('es-ES')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <User className="w-3 h-3 text-gray-400" />
                    <span className="text-sm text-gray-600">{event.userName || event.user}</span>
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      event.category === 'PRICE_CHANGE' ? 'bg-blue-100 text-blue-700' :
                      event.category === 'SCENARIO' ? 'bg-green-100 text-green-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {event.category}
                    </span>
                  </div>
                  {event.payload && (
                    <pre className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                      {JSON.stringify(event.payload, null, 2)}
                    </pre>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AuditTrailDrawer;