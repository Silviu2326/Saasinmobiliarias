import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { ProviderInfo } from "../types";

interface SettingsDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  provider: ProviderInfo;
}

export function SettingsDrawer({ open, onOpenChange, provider }: SettingsDrawerProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[600px] sm:max-w-[600px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center space-x-2">
            <span>Configuración de {provider.name}</span>
          </SheetTitle>
          <SheetDescription>
            Administra números, ruteo, grabaciones y más configuraciones
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6">
          <Tabs defaultValue="numbers" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="numbers">Números</TabsTrigger>
              <TabsTrigger value="routing">Ruteo</TabsTrigger>
              <TabsTrigger value="recording">Grabación</TabsTrigger>
              <TabsTrigger value="queues">Colas</TabsTrigger>
              <TabsTrigger value="schedules">Horarios</TabsTrigger>
            </TabsList>

            <TabsContent value="numbers" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Gestión de Números</CardTitle>
                  <CardDescription>
                    Compra, asigna y configura números de teléfono
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-gray-500">
                    Funcionalidad de números en desarrollo
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="routing" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Reglas de Ruteo</CardTitle>
                  <CardDescription>
                    Define cómo se enrutan las llamadas entrantes
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-gray-500">
                    Editor de reglas de ruteo en desarrollo
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="recording" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Configuración de Grabación</CardTitle>
                  <CardDescription>
                    Configura la grabación de llamadas y retención
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-gray-500">
                    Configuración de grabación en desarrollo
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="queues" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Colas de Atención</CardTitle>
                  <CardDescription>
                    Configura colas, tiempos de espera y estrategias
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-gray-500">
                    Configuración de colas en desarrollo
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="schedules" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Horarios y Festivos</CardTitle>
                  <CardDescription>
                    Define horarios comerciales y días festivos
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-gray-500">
                    Configuración de horarios en desarrollo
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  );
}