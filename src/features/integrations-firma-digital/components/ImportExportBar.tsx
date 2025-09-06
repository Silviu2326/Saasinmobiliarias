import React, { useRef } from 'react';
import { useImportExport } from '../hooks';

export function ImportExportBar() {
  const { loading, exportData, importData } = useImportExport();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = async () => {
    // Export all templates (mock)
    await exportData(['tpl-1', 'tpl-2']);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const result = await importData(file);
      if (result.success) {
        alert(`Importadas ${result.imported} plantillas exitosamente`);
      } else {
        alert(`Error en la importación: ${result.errors?.join(', ')}`);
      }
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleExport}
        disabled={loading}
        className="flex items-center gap-2 rounded-md bg-blue-100 px-3 py-2 text-sm font-medium text-blue-700 hover:bg-blue-200 disabled:opacity-50"
      >
        <span>📄</span>
        <span>Exportar</span>
      </button>
      
      <button
        onClick={handleImportClick}
        disabled={loading}
        className="flex items-center gap-2 rounded-md bg-green-100 px-3 py-2 text-sm font-medium text-green-700 hover:bg-green-200 disabled:opacity-50"
      >
        <span>📂</span>
        <span>Importar</span>
      </button>
      
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileChange}
        className="hidden"
      />
      
      {loading && (
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"></div>
          <span>Procesando...</span>
        </div>
      )}
    </div>
  );
}