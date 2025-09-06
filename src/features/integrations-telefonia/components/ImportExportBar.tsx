import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useImportExport } from "../hooks";
import { Download, Upload, Loader2 } from "lucide-react";

export function ImportExportBar() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const {
    exportConfig,
    importConfig,
    downloadConfig,
    isExporting,
    isImporting,
    exportData,
    importResult,
    exportError,
    importError,
  } = useImportExport();

  const handleExport = async () => {
    try {
      await exportConfig();
    } catch (error) {
      toast({
        title: "Error al exportar",
        description: "No se pudo exportar la configuración",
        variant: "destructive",
      });
    }
  };

  const handleImport = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const config = JSON.parse(text);
      importConfig(config);
    } catch (error) {
      toast({
        title: "Error al importar",
        description: "Archivo no válido o formato incorrecto",
        variant: "destructive",
      });
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Handle export success
  if (exportData && !exportError) {
    downloadConfig(exportData, `telefonia-config-${new Date().toISOString().split('T')[0]}.json`);
    toast({
      title: "Configuración exportada",
      description: "El archivo se ha descargado correctamente",
    });
  }

  // Handle import success
  if (importResult?.success) {
    toast({
      title: "Configuración importada",
      description: "La configuración se ha importado correctamente",
    });
  } else if (importResult && !importResult.success) {
    toast({
      title: "Error al importar",
      description: importResult.errors?.join(", ") || "Error desconocido",
      variant: "destructive",
    });
  }

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h3 className="font-medium">Configuración</h3>
          <div className="text-sm text-gray-500">
            Exporta o importa la configuración completa de telefonía
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            disabled={isExporting}
          >
            {isExporting ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            Exportar
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleImport}
            disabled={isImporting}
          >
            {isImporting ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Upload className="h-4 w-4 mr-2" />
            )}
            Importar
          </Button>

          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      </div>
    </Card>
  );
}