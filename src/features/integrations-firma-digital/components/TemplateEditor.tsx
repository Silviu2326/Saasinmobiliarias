import React from 'react';
import { DrawerProps } from '../types';

interface TemplateEditorProps extends DrawerProps {
  templateId?: string | null;
}

export function TemplateEditor({ templateId, isOpen, onClose }: TemplateEditorProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-gray-500 bg-opacity-75" onClick={onClose}></div>
      
      <div className="relative w-full max-w-4xl max-h-[90vh] rounded-lg bg-white p-6 shadow-xl overflow-y-auto">
        <div className="mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            {templateId ? 'Editar Plantilla' : 'Nueva Plantilla'}
          </h3>
        </div>
        
        <div className="text-center py-8">
          <div className="text-4xl mb-4">📝</div>
          <p className="text-gray-600">Editor de plantillas con variables y campos de firma</p>
        </div>
        
        <div className="mt-6 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 border rounded text-gray-700">
            Cancelar
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded">
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}