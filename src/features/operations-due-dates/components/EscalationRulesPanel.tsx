import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { TrendingUp } from 'lucide-react';

interface EscalationRulesPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function EscalationRulesPanel({ open, onOpenChange }: EscalationRulesPanelProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Reglas de Escalado
          </DialogTitle>
        </DialogHeader>
        <div className="text-sm text-gray-600">
          Configuración de escalados automáticos para elementos vencidos o en riesgo.
        </div>
        <div className="flex justify-end">
          <Button onClick={() => onOpenChange(false)}>Cerrar</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}