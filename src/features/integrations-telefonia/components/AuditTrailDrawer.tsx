import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { useAuditTrail } from "../hooks";

interface AuditTrailDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resourceId?: string;
}

export function AuditTrailDrawer({ open, onOpenChange, resourceId }: AuditTrailDrawerProps) {
  const { events, isLoading } = useAuditTrail(resourceId);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[500px] sm:max-w-[500px]">
        <SheetHeader>
          <SheetTitle>Trazabilidad de Eventos</SheetTitle>
          <SheetDescription>
            Historial de cambios y eventos del registro
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6">
          <div className="space-y-4">
            {events.map((event) => (
              <div key={event.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <Badge variant="outline">{event.action}</Badge>
                  <span className="text-xs text-gray-500">
                    {new Date(event.timestamp).toLocaleString("es-ES")}
                  </span>
                </div>
                
                <div className="text-sm">
                  <div className="font-medium mb-1">Usuario: {event.userId}</div>
                  <div className="text-gray-600">Recurso: {event.resource}</div>
                  
                  {event.oldValues && event.newValues && (
                    <div className="mt-2 text-xs">
                      <div className="text-red-600">
                        - {JSON.stringify(event.oldValues)}
                      </div>
                      <div className="text-green-600">
                        + {JSON.stringify(event.newValues)}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          {events.length === 0 && !isLoading && (
            <div className="text-center py-8 text-gray-500">
              No hay eventos registrados
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}