import { useRef } from "react";
import { useImportExport } from "../hooks";

const ImportExportBar = () => {
  const { exporting, importing, error, exportToFile, importFromFile } = useImportExport();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const result = await importFromFile(file);
      if (result.success) {
        alert(`Importación exitosa: ${result.imported} portales configurados`);
      } else {
        alert(`Error en importación: ${result.errors.join(", ")}`);
      }
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Import/Export Configuración</h3>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={exportToFile}
          disabled={exporting}
          className="flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
        >
          {exporting ? (
            <>
              <span className="animate-spin mr-2">⏳</span>
              Exportando...
            </>
          ) : (
            <>
              <span className="mr-2">⬇️</span>
              Exportar JSON
            </>
          )}
        </button>

        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={importing}
          className="flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {importing ? (
            <>
              <span className="animate-spin mr-2">⏳</span>
              Importando...
            </>
          ) : (
            <>
              <span className="mr-2">⬆️</span>
              Importar JSON
            </>
          )}
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleImport}
        className="hidden"
      />

      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <div className="mt-4 text-xs text-gray-500 space-y-1">
        <p>• <strong>Exportar:</strong> Descarga la configuración actual (credenciales ofuscadas)</p>
        <p>• <strong>Importar:</strong> Sube un archivo JSON para aplicar configuraciones</p>
        <p>• Útil para replicar configuraciones entre entornos</p>
      </div>
    </div>
  );
};

export default ImportExportBar;