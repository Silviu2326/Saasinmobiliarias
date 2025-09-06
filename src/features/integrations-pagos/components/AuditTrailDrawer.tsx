import React from "react";

interface AuditTrailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  entityId?: string;
}

export function AuditTrailDrawer({ isOpen, onClose, entityId }: AuditTrailDrawerProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black opacity-50" onClick={onClose} />
      <div className="absolute right-0 top-0 h-full w-full max-w-lg bg-white shadow-xl">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Historial de Auditoría</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        <div className="p-6 text-center text-gray-500">
          <p>Historial de auditoría próximamente</p>
        </div>
      </div>
    </div>
  );
}