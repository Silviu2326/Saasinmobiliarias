import React from 'react';
import { ModalProps } from '../types';

export function AuditTrailDrawer({ isOpen, onClose }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gray-500 bg-opacity-75" onClick={onClose}></div>
        
        <section className="absolute inset-y-0 right-0 flex max-w-full pl-10">
          <div className="w-screen max-w-md">
            <div className="flex h-full flex-col overflow-y-scroll bg-white py-6 shadow-xl">
              <div className="px-4 sm:px-6">
                <div className="flex items-start justify-between">
                  <h2 className="text-lg font-medium text-gray-900">Auditoría</h2>
                  <button onClick={onClose} className="ml-3 h-7 w-7">×</button>
                </div>
              </div>
              
              <div className="relative mt-6 flex-1 px-4 sm:px-6">
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">🔍</div>
                  <p className="text-gray-600">Trazabilidad completa de cambios y acciones</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}