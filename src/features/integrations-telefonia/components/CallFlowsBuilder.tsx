import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export function CallFlowsBuilder() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Constructor de Flujos IVR</CardTitle>
            <CardDescription>
              Diseña flujos de llamada interactivos con drag & drop
            </CardDescription>
          </div>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Flujo
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-center py-12 text-gray-500">
          <div className="text-lg font-medium mb-2">🚧 En Desarrollo</div>
          <div className="text-sm">Constructor visual de flujos IVR próximamente</div>
          <div className="mt-4">
            <Button variant="outline" size="sm">Ver Flujos Existentes</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}