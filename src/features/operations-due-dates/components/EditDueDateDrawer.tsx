import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X } from 'lucide-react';
import { DueDateItem } from '../types';
import SLAIndicator from './SLAIndicator';
import LinkedEntityChip from './LinkedEntityChip';
import { formatDateTime } from '../utils';

interface EditDueDateDrawerProps {
  item: DueDateItem | null;
  open: boolean;
  onClose: () => void;
  onUpdate?: (item: DueDateItem) => void;
}

export default function EditDueDateDrawer({ item, open, onClose, onUpdate }: EditDueDateDrawerProps) {
  if (!open || !item) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end">
      <div className="w-96 bg-white h-full overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Editar Vencimiento</h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="p-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">{item.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-500">Estado SLA</label>
                <div className="mt-1">
                  <SLAIndicator sla={item.sla} />
                </div>
              </div>
              
              <div>
                <label className="text-xs font-medium text-gray-500">Fecha y Hora</label>
                <div className="mt-1 text-sm">{formatDateTime(item.date)}</div>
              </div>
              
              <div>
                <label className="text-xs font-medium text-gray-500">Prioridad</label>
                <div className="mt-1">
                  <Badge variant="outline">{item.priority}</Badge>
                </div>
              </div>
              
              <div>
                <label className="text-xs font-medium text-gray-500">Estado</label>
                <div className="mt-1">
                  <Badge variant="outline">{item.status}</Badge>
                </div>
              </div>
              
              {item.assigneeName && (
                <div>
                  <label className="text-xs font-medium text-gray-500">Responsable</label>
                  <div className="mt-1 text-sm">{item.assigneeName}</div>
                </div>
              )}
              
              {item.entity && (
                <div>
                  <label className="text-xs font-medium text-gray-500">Entidad Vinculada</label>
                  <div className="mt-1">
                    <LinkedEntityChip entity={item.entity} />
                  </div>
                </div>
              )}
              
              {item.description && (
                <div>
                  <label className="text-xs font-medium text-gray-500">Descripción</label>
                  <div className="mt-1 text-sm text-gray-700">{item.description}</div>
                </div>
              )}
            </CardContent>
          </Card>
          
          <div className="space-y-2">
            <Button className="w-full" variant="outline">
              Cambiar Estado
            </Button>
            <Button className="w-full" variant="outline">
              Reprogramar
            </Button>
            <Button className="w-full" variant="outline">
              Reasignar
            </Button>
            <Button className="w-full" variant="outline">
              Ver Auditoría
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}