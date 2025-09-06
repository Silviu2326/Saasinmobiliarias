import React, { useState } from "react";
import { ExportOptions } from "../types";
import { useExport } from "../hooks";

interface ExportBarProps {
  data?: any;
  filename?: string;
}

export const ExportBar: React.FC<ExportBarProps> = ({ data, filename = "conversion-analytics" }) => {
  const [format, setFormat] = useState<"CSV" | "JSON" | "PNG">("CSV");
  const { exportData, exporting } = useExport();
  const [message, setMessage] = useState<string | null>(null);

  const handleExport = async () => {
    try {
      const options: ExportOptions = {
        format,
        data: data || { message: "No data available" },
        filename,
      };

      await exportData(options);
      setMessage(`Exportación ${format} completada`);
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error("Error exporting:", error);
      setMessage("Error en la exportación");
      setTimeout(() => setMessage(null), 3000);
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-gray-700">Exportar:</span>
          
          {/* Selector de formato */}
          <div className="flex rounded-lg border border-gray-300 overflow-hidden">
            {(["CSV", "JSON", "PNG"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFormat(f)}
                className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                  format === f
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          <button
            onClick={handleExport}
            disabled={exporting}
            className="px-4 py-1.5 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {exporting ? "Exportando..." : "Exportar"}
          </button>
        </div>

        {/* Mensaje de estado */}
        {message && (
          <div className={`text-sm font-medium transition-opacity ${
            message.includes("Error") ? "text-red-600" : "text-green-600"
          }`}>
            {message}
          </div>
        )}

        {/* Información adicional */}
        <div className="text-xs text-gray-500">
          <div className="flex flex-wrap gap-4">
            <span>CSV: Tabla de datos</span>
            <span>JSON: Datos estructurados</span>
            <span>PNG: Gráficos visuales</span>
          </div>
        </div>
      </div>

      {/* Botones de exportación rápida */}
      <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-gray-200">
        <button
          onClick={() => {
            setFormat("CSV");
            setTimeout(handleExport, 100);
          }}
          disabled={exporting}
          className="px-3 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded hover:bg-blue-100 disabled:opacity-50 transition-colors"
        >
          📊 CSV Embudo
        </button>
        <button
          onClick={() => {
            setFormat("JSON");
            setTimeout(handleExport, 100);
          }}
          disabled={exporting}
          className="px-3 py-1 text-xs font-medium text-purple-600 bg-purple-50 rounded hover:bg-purple-100 disabled:opacity-50 transition-colors"
        >
          📋 JSON Completo
        </button>
        <button
          onClick={() => {
            setFormat("PNG");
            setTimeout(handleExport, 100);
          }}
          disabled={exporting}
          className="px-3 py-1 text-xs font-medium text-green-600 bg-green-50 rounded hover:bg-green-100 disabled:opacity-50 transition-colors"
        >
          📈 PNG Gráficos
        </button>
      </div>
    </div>
  );
};