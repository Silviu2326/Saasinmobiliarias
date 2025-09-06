import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Send } from "lucide-react";
import { useSmsTemplates } from "../hooks";
import { Skeleton } from "@/components/ui/skeleton";

export function SmsTemplatesTable() {
  const { templates, isLoading } = useSmsTemplates();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Plantillas SMS</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
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
            <CardTitle>Plantillas SMS/WhatsApp</CardTitle>
            <CardDescription>
              Gestiona plantillas con variables dinámicas
            </CardDescription>
          </div>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Nueva Plantilla
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {templates.map((template) => (
            <div key={template.id} className="border rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="font-medium">{template.name}</h3>
                    <Badge variant="outline" className="text-xs">
                      {template.channel === "SMS" ? "💬" : "💚"} {template.channel}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {template.lang.toUpperCase()}
                    </Badge>
                    {template.isActive && (
                      <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                        Activa
                      </Badge>
                    )}
                  </div>
                  <div className="text-sm text-gray-600 mb-2">
                    {template.body}
                  </div>
                  {template.variables.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {template.variables.map((variable) => (
                        <Badge key={variable} variant="outline" className="text-xs">
                          {`{{${variable}}}`}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm">
                    <Send className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    Editar
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {templates.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No hay plantillas configuradas
          </div>
        )}
      </CardContent>
    </Card>
  );
}