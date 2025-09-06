import { useState } from "react";
import { 
  Plus, 
  Calculator, 
  Download, 
  Upload,
  AlertCircle 
} from "lucide-react";
import { formatMoney } from "../utils";
import { useImportExport } from "../hooks";
import { CommissionsFilters } from "../types";

interface CommissionsToolbarProps {
  selectedCount: number;
  selectedTotal: number;
  onNewRule: () => void;
  onSettleSelected: () => void;
  onRecalculateSelected: () => void;
  filters: CommissionsFilters;
}

export default function CommissionsToolbar({
  selectedCount,
  selectedTotal,
  onNewRule,
  onSettleSelected,
  onRecalculateSelected,
  filters,
}: CommissionsToolbarProps) {
  const { exportData, importData, loading } = useImportExport();
  const [importFile, setImportFile] = useState<File | null>(null);

  const handleExport = async () => {
    await exportData(filters, "csv");
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImportFile(file);
      try {
        const result = await importData(file);
        alert(`Imported ${result.imported} items. Errors: ${result.errors.length}`);
      } catch (error) {
        alert("Import failed");
      } finally {
        setImportFile(null);
        event.target.value = "";
      }
    }
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between p-4 bg-white border border-gray-200 rounded-lg">
      <div className="flex flex-wrap gap-2">
        <button 
          onClick={onNewRule}
          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nueva regla
        </button>

        {selectedCount > 0 && (
          <>
            <button
              onClick={onSettleSelected}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-green-700 bg-green-50 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              <Calculator className="w-4 h-4 mr-2" />
              Liquidar seleccionados ({selectedCount})
            </button>

            <button
              onClick={onRecalculateSelected}
              className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Recalcular
            </button>
          </>
        )}

        <button
          onClick={handleExport}
          disabled={loading}
          className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          <Download className="w-4 h-4 mr-2" />
          Exportar CSV
        </button>

        <div className="relative">
          <button
            disabled={loading}
            onClick={() => document.getElementById("import-file")?.click()}
            className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            <Upload className="w-4 h-4 mr-2" />
            Importar CSV
          </button>
          <input
            id="import-file"
            type="file"
            accept=".csv"
            onChange={handleImport}
            className="hidden"
          />
        </div>
      </div>

      {selectedCount > 0 && (
        <div className="flex items-center gap-2 text-sm">
          <AlertCircle className="w-4 h-4 text-blue-500" />
          <span className="text-gray-600">
            {selectedCount} seleccionados - Total estimado: {" "}
            <span className="font-semibold text-blue-600">
              {formatMoney(selectedTotal)}
            </span>
          </span>
        </div>
      )}
    </div>
  );
}