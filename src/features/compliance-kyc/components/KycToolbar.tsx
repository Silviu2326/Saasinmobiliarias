import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Upload, Download, Webhook, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface KycToolbarProps {
  selectedCount: number;
  onNewApplicant: () => void;
  onBulkApprove: () => void;
  onBulkReject: () => void;
  onBulkRequestInfo: () => void;
  onImport: () => void;
  onExport: () => void;
  onWebhooksClick: () => void;
  className?: string;
}

export function KycToolbar({
  selectedCount,
  onNewApplicant,
  onBulkApprove,
  onBulkReject,
  onBulkRequestInfo,
  onImport,
  onExport,
  onWebhooksClick,
  className,
}: KycToolbarProps) {
  const [showBulkActions, setShowBulkActions] = useState(false);

  return (
    <div className={`flex items-center justify-between ${className}`}>
      <div className="flex items-center gap-2">
        <Button onClick={onNewApplicant} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Nuevo Expediente
        </Button>

        {selectedCount > 0 && (
          <>
            <div className="h-6 w-px bg-gray-300" />
            <Badge variant="secondary">
              {selectedCount} seleccionados
            </Badge>
            
            <Dialog open={showBulkActions} onOpenChange={setShowBulkActions}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  Acciones Masivas
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Acciones Masivas</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">
                    Se aplicarán las acciones a {selectedCount} expedientes seleccionados.
                  </p>
                  
                  <div className="grid gap-2">
                    <Button
                      onClick={() => {
                        onBulkApprove();
                        setShowBulkActions(false);
                      }}
                      className="justify-start"
                      variant="outline"
                    >
                      <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                      Aprobar Todo
                    </Button>
                    
                    <Button
                      onClick={() => {
                        onBulkReject();
                        setShowBulkActions(false);
                      }}
                      className="justify-start"
                      variant="outline"
                    >
                      <XCircle className="h-4 w-4 mr-2 text-red-600" />
                      Rechazar Todo
                    </Button>
                    
                    <Button
                      onClick={() => {
                        onBulkRequestInfo();
                        setShowBulkActions(false);
                      }}
                      className="justify-start"
                      variant="outline"
                    >
                      <AlertCircle className="h-4 w-4 mr-2 text-yellow-600" />
                      Requerir Info
                    </Button>
                  </div>
                  
                  <div className="pt-4 border-t">
                    <p className="text-xs text-gray-500">
                      Estas acciones no se pueden deshacer. Asegúrate de haber revisado todos los expedientes.
                    </p>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onImport}
          className="flex items-center gap-2"
        >
          <Upload className="h-4 w-4" />
          Importar CSV
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={onExport}
          className="flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          Exportar
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={onWebhooksClick}
          className="flex items-center gap-2"
        >
          <Webhook className="h-4 w-4" />
          Webhooks
        </Button>
      </div>
    </div>
  );
}