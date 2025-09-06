import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, TestTube } from "lucide-react";
import { useWebhooks } from "../hooks";
import { Skeleton } from "@/components/ui/skeleton";

export function WebhooksPanel() {
  const { webhooks, isLoading, testWebhook } = useWebhooks();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Webhooks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(2)].map((_, i) => (
              <Skeleton key={i} className="h-16" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Webhooks</CardTitle>
            <CardDescription>
              URLs de callback para eventos de telefonía
            </CardDescription>
          </div>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Webhook
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {webhooks.map((webhook) => (
            <div key={webhook.id} className="border rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="font-medium">{webhook.name}</h3>
                    <Badge 
                      variant={webhook.isActive ? "default" : "secondary"}
                      className={webhook.isActive ? "bg-green-100 text-green-800" : ""}
                    >
                      {webhook.isActive ? "Activo" : "Inactivo"}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-600 mb-2 font-mono">
                    {webhook.url}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {webhook.events.map((event) => (
                      <Badge key={event} variant="outline" className="text-xs">
                        {event}
                      </Badge>
                    ))}
                  </div>
                  {webhook.lastTriggered && (
                    <div className="text-xs text-gray-500 mt-2">
                      Último evento: {new Date(webhook.lastTriggered).toLocaleString("es-ES")}
                    </div>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => testWebhook(webhook.id)}
                  >
                    <TestTube className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    Editar
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {webhooks.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No hay webhooks configurados
          </div>
        )}
      </CardContent>
    </Card>
  );
}