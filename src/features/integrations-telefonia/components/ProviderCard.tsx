import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { ProviderInfo } from "../types";
import { getProviderStatusColor, getProviderStatusText, formatMoney } from "../utils";
import { ConnectDialog } from "./ConnectDialog";
import { SettingsDrawer } from "./SettingsDrawer";
import { TestConnectionButton } from "./TestConnectionButton";

interface ProviderCardProps {
  provider: ProviderInfo;
  onConnect: (id: string, config: any) => void;
  onTest: (id: string) => void;
  isConnecting?: boolean;
  isTesting?: boolean;
}

export function ProviderCard({
  provider,
  onConnect,
  onTest,
  isConnecting = false,
  isTesting = false,
}: ProviderCardProps) {
  const [showConnectDialog, setShowConnectDialog] = useState(false);
  const [showSettingsDrawer, setShowSettingsDrawer] = useState(false);

  const isConnected = provider.status === "CONNECTED";
  const canConfigure = isConnected || provider.status === "TOKEN_EXPIRED";

  return (
    <>
      <Card className="relative hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                {provider.logo ? (
                  <img
                    src={provider.logo}
                    alt={provider.name}
                    className="w-8 h-8 object-contain"
                  />
                ) : (
                  <span className="text-lg font-bold text-gray-600">
                    {provider.name.charAt(0)}
                  </span>
                )}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{provider.name}</h3>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge
                    variant="secondary"
                    className={getProviderStatusColor(provider.status)}
                  >
                    {getProviderStatusText(provider.status)}
                  </Badge>
                  {provider.lastLatencyMs && (
                    <span className="text-xs text-gray-500">
                      {provider.lastLatencyMs}ms
                    </span>
                  )}
                </div>
              </div>
            </div>
            {provider.balance !== undefined && (
              <div className="text-right">
                <div className="text-lg font-semibold text-gray-900">
                  {formatMoney(provider.balance)}
                </div>
                <div className="text-xs text-gray-500">Saldo</div>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <div className="flex items-center justify-between mb-4">
            <div className="flex space-x-1">
              {provider.supports.voice && (
                <Badge variant="outline" className="text-xs">
                  📞 Voz
                </Badge>
              )}
              {provider.supports.sms && (
                <Badge variant="outline" className="text-xs">
                  💬 SMS
                </Badge>
              )}
              {provider.supports.whatsapp && (
                <Badge variant="outline" className="text-xs">
                  💚 WhatsApp
                </Badge>
              )}
            </div>
            <TestConnectionButton
              providerId={provider.id}
              onTest={onTest}
              isTesting={isTesting}
              disabled={!canConfigure}
            />
          </div>

          <div className="flex space-x-2">
            {!isConnected ? (
              <Button
                variant="default"
                size="sm"
                className="flex-1"
                onClick={() => setShowConnectDialog(true)}
                disabled={isConnecting}
              >
                {isConnecting ? "Conectando..." : "Conectar"}
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => setShowConnectDialog(true)}
                disabled={isConnecting}
              >
                Reconectar
              </Button>
            )}
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSettingsDrawer(true)}
              disabled={!canConfigure}
            >
              Configurar
            </Button>
          </div>

          {provider.lastUpdated && (
            <div className="text-xs text-gray-500 mt-3">
              Última actualización:{" "}
              {new Date(provider.lastUpdated).toLocaleString("es-ES")}
            </div>
          )}
        </CardContent>
      </Card>

      <ConnectDialog
        open={showConnectDialog}
        onOpenChange={setShowConnectDialog}
        provider={provider}
        onConnect={onConnect}
        isConnecting={isConnecting}
      />

      <SettingsDrawer
        open={showSettingsDrawer}
        onOpenChange={setShowSettingsDrawer}
        provider={provider}
      />
    </>
  );
}