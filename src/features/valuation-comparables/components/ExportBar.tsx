import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, FileText, FileJson, Map } from "lucide-react";
import { useState } from "react";
import { useImportExport } from "../hooks";
import type { Comparable, ExportFormat } from "../types";

interface ExportBarProps {
  comparables: Comparable[];
  selectedIds?: string[];
  className?: string;
}

export function ExportBar({ comparables, selectedIds, className }: ExportBarProps) {
  const [format, setFormat] = useState<ExportFormat["format"]>("CSV");
  const [includeAdjustments, setIncludeAdjustments] = useState(true);
  const [includeScores, setIncludeScores] = useState(true);
  
  const { exportData, isExporting } = useImportExport();

  const handleExport = async () => {
    const compsToExport = selectedIds && selectedIds.length > 0
      ? comparables.filter(c => selectedIds.includes(c.id))
      : comparables;

    if (compsToExport.length === 0) return;

    await exportData({
      comps: compsToExport,
      format,
      includeAdjustments,
      includeScores,
    });
  };

  const getFormatIcon = (format: ExportFormat["format"]) => {
    switch (format) {
      case "CSV": return <FileText className="h-3 w-3" />;
      case "JSON": return <FileJson className="h-3 w-3" />;
      case "GeoJSON": return <Map className="h-3 w-3" />;
    }
  };

  const exportCount = selectedIds && selectedIds.length > 0 ? selectedIds.length : comparables.length;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Select value={format} onValueChange={(value: ExportFormat["format"]) => setFormat(value)}>
        <SelectTrigger className="w-32 h-8">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="CSV">
            <div className="flex items-center gap-2">
              <FileText className="h-3 w-3" />
              CSV
            </div>
          </SelectItem>
          <SelectItem value="JSON">
            <div className="flex items-center gap-2">
              <FileJson className="h-3 w-3" />
              JSON
            </div>
          </SelectItem>
          <SelectItem value="GeoJSON">
            <div className="flex items-center gap-2">
              <Map className="h-3 w-3" />
              GeoJSON
            </div>
          </SelectItem>
        </SelectContent>
      </Select>

      <Button
        size="sm"
        onClick={handleExport}
        disabled={exportCount === 0 || isExporting}
        className="h-8"
      >
        <Download className="h-3 w-3 mr-1" />
        {isExporting ? "Exportando..." : `Exportar ${exportCount > 0 ? `(${exportCount})` : ""}`}
      </Button>
    </div>
  );
}