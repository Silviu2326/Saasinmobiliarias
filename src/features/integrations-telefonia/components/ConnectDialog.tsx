import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import type { ProviderInfo, ConnectionConfig } from "../types";
import { connectionConfigSchema } from "../schema";

interface ConnectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  provider: ProviderInfo;
  onConnect: (id: string, config: ConnectionConfig) => void;
  isConnecting: boolean;
}

export function ConnectDialog({
  open,
  onOpenChange,
  provider,
  onConnect,
  isConnecting,
}: ConnectDialogProps) {
  const [activeTab, setActiveTab] = useState(provider.connectMode);

  const form = useForm<ConnectionConfig>({
    resolver: zodResolver(connectionConfigSchema),
    defaultValues: {
      mode: provider.connectMode,
      oauth: {
        clientId: "",
        clientSecret: "",
        redirectUri: "https://app.ejemplo.com/oauth/callback",
      },
      apiKey: {
        apiKey: "",
        accountSid: "",
        region: "us1",
      },
      credentials: {
        username: "",
        password: "",
        tenant: "",
      },
      webhooks: {
        voice: "https://api.ejemplo.com/webhooks/voice",
        sms: "https://api.ejemplo.com/webhooks/sms",
      },
    },
  });

  const onSubmit = (data: ConnectionConfig) => {
    onConnect(provider.id, { ...data, mode: activeTab as any });
  };

  const isConnected = provider.status === "CONNECTED";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center">
              {provider.logo ? (
                <img
                  src={provider.logo}
                  alt={provider.name}
                  className="w-6 h-6 object-contain"
                />
              ) : (
                <span className="text-sm font-bold text-gray-600">
                  {provider.name.charAt(0)}
                </span>
              )}
            </div>
            <span>
              {isConnected ? "Reconectar" : "Conectar"} {provider.name}
            </span>
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="OAUTH">OAuth 2.0</TabsTrigger>
                <TabsTrigger value="API_KEY">API Key</TabsTrigger>
                <TabsTrigger value="CREDENTIALS">Credenciales</TabsTrigger>
              </TabsList>

              <TabsContent value="OAUTH" className="space-y-4">
                <FormField
                  control={form.control}
                  name="oauth.clientId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Client ID</FormLabel>
                      <FormControl>
                        <Input placeholder="Tu Client ID" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="oauth.clientSecret"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Client Secret</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Tu Client Secret"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="oauth.redirectUri"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Redirect URI</FormLabel>
                      <FormControl>
                        <Input {...field} readOnly />
                      </FormControl>
                      <div className="text-xs text-gray-500">
                        Configura esta URL en tu aplicación {provider.name}
                      </div>
                    </FormItem>
                  )}
                />
              </TabsContent>

              <TabsContent value="API_KEY" className="space-y-4">
                <FormField
                  control={form.control}
                  name="apiKey.apiKey"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>API Key</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Tu API Key"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="apiKey.accountSid"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Account SID (opcional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Account SID" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="apiKey.region"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Región (opcional)</FormLabel>
                      <FormControl>
                        <Input placeholder="us1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>

              <TabsContent value="CREDENTIALS" className="space-y-4">
                <FormField
                  control={form.control}
                  name="credentials.username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Usuario</FormLabel>
                      <FormControl>
                        <Input placeholder="Tu usuario" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="credentials.password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contraseña</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Tu contraseña"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="credentials.tenant"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tenant (opcional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Tenant ID" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>
            </Tabs>

            <div className="border-t pt-4">
              <h4 className="font-medium mb-3">Webhooks (opcional)</h4>
              <div className="space-y-3">
                <FormField
                  control={form.control}
                  name="webhooks.voice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Webhook de Voz</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://api.ejemplo.com/webhooks/voice"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="webhooks.sms"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Webhook de SMS</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://api.ejemplo.com/webhooks/sms"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              {activeTab === "OAUTH" ? (
                <Button type="submit" disabled={isConnecting}>
                  {isConnecting ? "Autorizando..." : "Autorizar"}
                </Button>
              ) : (
                <Button type="submit" disabled={isConnecting}>
                  {isConnecting ? "Conectando..." : "Conectar"}
                </Button>
              )}
            </DialogFooter>
          </form>
        </Form>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-center space-x-2 text-sm text-blue-800">
            <span>🔒</span>
            <span>
              Las credenciales se almacenan de forma segura y encriptada.
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}