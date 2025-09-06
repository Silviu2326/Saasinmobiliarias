import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bell } from 'lucide-react';

interface RemindersSettingsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function RemindersSettings({ open, onOpenChange }: RemindersSettingsProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Configuración de Recordatorios
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Reglas por Tipo</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-gray-600">
              Configuración de recordatorios automáticos según el tipo de vencimiento.
              <div className="mt-4">
                <p>• Ofertas: 48h y 4h antes</p>
                <p>• Reservas: 72h y 24h antes</p>
                <p>• Contratos: 7d y 1d antes</p>
                <p>• Pagos: 5d y 1d antes</p>
              </div>
            </CardContent>
          </Card>
          
          <div className="flex justify-end">
            <Button onClick={() => onOpenChange(false)}>Cerrar</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}