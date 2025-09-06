import React from 'react';
import { Button } from '@/components/ui/button';
import { Download, Upload } from 'lucide-react';

interface ImportExportBarProps {
  onExport: () => void;
  onImport: () => void;
  className?: string;
}

export default function ImportExportBar({ onExport, onImport, className }: ImportExportBarProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Button variant="outline" onClick={onExport}>
        <Download className="h-4 w-4 mr-2" />
        Exportar
      </Button>
      <Button variant="outline" onClick={onImport}>
        <Upload className="h-4 w-4 mr-2" />
        Importar
      </Button>
    </div>
  );
}