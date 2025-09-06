import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Plus,
  Download,
  RefreshCw,
  Bell,
  TrendingUp,
  Settings
} from 'lucide-react';
import { useSLARecalculation } from '../hooks';

interface DueDatesToolbarProps {
  selectedCount: number;
  onCreateNew: () => void;
  onExport: () => void;
  onRemindersSettings: () => void;
  onEscalationRules: () => void;
  className?: string;
}

export default function DueDatesToolbar({
  selectedCount,
  onCreateNew,
  onExport,
  onRemindersSettings,
  onEscalationRules,
  className
}: DueDatesToolbarProps) {
  const { recalculate, isRecalculating } = useSLARecalculation();
  const [showSuccess, setShowSuccess] = useState(false);

  const handleRecalculateSLA = async () => {
    try {
      const result = await recalculate();
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      console.log(`SLA recalculado para ${result.updated} elementos`);
    } catch (error) {
      console.error('Error recalculando SLA:', error);
    }
  };

  return (
    <div className={`flex items-center justify-between bg-white border-b border-gray-200 px-6 py-4 ${className}`}>
      {/* Left side - Main actions */}
      <div className="flex items-center gap-3">
        <Button onClick={onCreateNew} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Vencimiento
        </Button>

        <Button variant="outline" onClick={onExport}>
          <Download className="h-4 w-4 mr-2" />
          Exportar
        </Button>

        <Button 
          variant="outline" 
          onClick={handleRecalculateSLA}
          disabled={isRecalculating}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isRecalculating ? 'animate-spin' : ''}`} />
          Recalcular SLA
        </Button>

        {showSuccess && (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            ✓ SLA actualizado
          </Badge>
        )}
      </div>

      {/* Right side - Settings and status */}
      <div className="flex items-center gap-3">
        {selectedCount > 0 && (
          <Badge variant="secondary">
            {selectedCount} seleccionado{selectedCount !== 1 ? 's' : ''}
          </Badge>
        )}

        <Button variant="ghost" size="sm" onClick={onRemindersSettings}>
          <Bell className="h-4 w-4 mr-2" />
          Recordatorios
        </Button>

        <Button variant="ghost" size="sm" onClick={onEscalationRules}>
          <TrendingUp className="h-4 w-4 mr-2" />
          Escalados
        </Button>

        <Button variant="ghost" size="sm">
          <Settings className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}