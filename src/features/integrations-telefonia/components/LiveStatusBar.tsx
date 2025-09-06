import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useLiveStatus } from "../hooks";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Clock, Phone } from "lucide-react";

export function LiveStatusBar() {
  const { status, isLoading } = useLiveStatus();

  if (isLoading) {
    return <Skeleton className="h-16" />;
  }

  if (!status) {
    return null;
  }

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <Users className="h-4 w-4 text-green-600" />
            <span className="text-sm text-gray-600">Agentes:</span>
            <Badge variant="outline" className="text-green-600">
              {status.agentsOnline} online
            </Badge>
            <Badge variant="outline" className="text-yellow-600">
              {status.agentsBusy} ocupados
            </Badge>
          </div>

          <div className="flex items-center space-x-2">
            <Phone className="h-4 w-4 text-blue-600" />
            <span className="text-sm text-gray-600">Llamadas:</span>
            <Badge variant="outline" className="text-blue-600">
              {status.callsInProgress} activas
            </Badge>
          </div>

          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-purple-600" />
            <span className="text-sm text-gray-600">Tiempo espera:</span>
            <Badge
              variant="outline"
              className={
                status.avgWaitTime > 60
                  ? "text-red-600"
                  : status.avgWaitTime > 30
                  ? "text-yellow-600"
                  : "text-green-600"
              }
            >
              {status.avgWaitTime}s promedio
            </Badge>
          </div>
        </div>

        <div className="text-xs text-gray-500">
          Actualizado: {new Date(status.timestamp).toLocaleTimeString("es-ES")}
        </div>
      </div>
    </Card>
  );
}