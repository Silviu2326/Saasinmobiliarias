import React from 'react';
import { useTemplates } from '../hooks';
import { ComponentProps } from '../types';
import { formatDateTime } from '../utils';

export function TemplatesTable({ onEdit }: ComponentProps) {
  const { templates, loading, error } = useTemplates();

  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-16 bg-gray-100 rounded animate-pulse"></div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-600">
        Error al cargar plantillas: {error}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Variables</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Última edición</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {templates.map((template) => (
              <tr key={template.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">{template.name}</div>
                  <div className="text-sm text-gray-500">{template.lang}</div>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
                    {template.type}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">
                    {template.variables.slice(0, 2).join(', ')}
                    {template.variables.length > 2 && ` +${template.variables.length - 2} más`}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {formatDateTime(template.updatedAt)}
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => onEdit?.(template.id)}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      Editar
                    </button>
                    <button className="text-gray-600 hover:text-gray-800 text-sm">
                      Duplicar
                    </button>
                    <button className="text-red-600 hover:text-red-800 text-sm">
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {templates.length === 0 && (
        <div className="text-center py-8">
          <div className="text-4xl mb-4">📄</div>
          <h3 className="text-lg font-medium text-gray-900">No hay plantillas</h3>
          <p className="text-gray-600 mt-2">Crea tu primera plantilla de documento</p>
        </div>
      )}
    </div>
  );
}