import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { X, History } from 'lucide-react';

interface AuditTrailDrawerProps {
  open: boolean;
  onClose: () => void;
  itemId?: string;
}

export default function AuditTrailDrawer({ open, onClose, itemId }: AuditTrailDrawerProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end">
      <div className="w-96 bg-white h-full overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <History className="h-5 w-5" />
              <h2 className="text-lg font-semibold">Auditoría</h2>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="p-4">
          <Card>
            <CardContent className="p-4 text-sm text-gray-600 text-center">
              <History className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>Historial de cambios y eventos</p>
              <p className="text-xs mt-1">Próximamente disponible</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}