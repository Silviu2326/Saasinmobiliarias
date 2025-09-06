import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";

export function RoutingRulesEditor() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Reglas de Ruteo</CardTitle>
            <CardDescription>
              Define cómo se enrutan las llamadas entrantes por horario y condiciones
            </CardDescription>
          </div>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Nueva Regla
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Horario Comercial</div>
                <div className="text-sm text-gray-500">09:00-18:00 → Agente ventas</div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="text-green-600">Activa</Badge>
                <Badge variant="secondary">Prioridad: 1</Badge>
              </div>
            </div>
          </div>
          
          <div className="border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Fuera de Horario</div>
                <div className="text-sm text-gray-500">18:00-09:00 → Buzón de voz</div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="text-green-600">Activa</Badge>
                <Badge variant="secondary">Prioridad: 2</Badge>
              </div>
            </div>
          </div>
        </div>
        
        <div className="text-center py-8 text-gray-500 border-t mt-6">
          Editor visual de reglas en desarrollo
        </div>
      </CardContent>
    </Card>
  );
}