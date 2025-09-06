import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuality } from "../hooks";
import { scoreQuality, getQualityDescription } from "../utils";
import { Skeleton } from "@/components/ui/skeleton";

export function QualityMonitor() {
  const [period, setPeriod] = useState("7d");
  const [provider, setProvider] = useState("");

  const filters = {
    from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    to: new Date().toISOString().split('T')[0],
    providerId: provider || undefined,
  };

  const { stats, isLoading } = useQuality(filters);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Monitor de Calidad</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-32" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Monitor de Calidad</CardTitle>
            <CardDescription>
              Métricas de calidad de llamadas en tiempo real
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1d">1d</SelectItem>
                <SelectItem value="7d">7d</SelectItem>
                <SelectItem value="30d">30d</SelectItem>
              </SelectContent>
            </Select>
            <Select value={provider || "all"} onValueChange={(value) => setProvider(value === "all" ? "" : value)}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Proveedor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="twilio">Twilio</SelectItem>
                <SelectItem value="vonage">Vonage</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {stats ? (
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">{stats.asr.toFixed(1)}%</div>
              <div className="text-sm text-gray-600">ASR (Tasa Respuesta)</div>
              <Badge
                variant="secondary"
                className={scoreQuality({ asr: stats.asr }) === 'green' ? 'bg-green-100 text-green-800' : 
                          scoreQuality({ asr: stats.asr }) === 'yellow' ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-red-100 text-red-800'}
              >
                {stats.asr >= 80 ? 'Excelente' : stats.asr >= 60 ? 'Bueno' : 'Mejorable'}
              </Badge>
            </div>
            
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">{stats.mos.toFixed(1)}</div>
              <div className="text-sm text-gray-600">MOS (Calidad Audio)</div>
              <Badge
                variant="secondary"
                className={scoreQuality({ mos: stats.mos }) === 'green' ? 'bg-green-100 text-green-800' : 
                          scoreQuality({ mos: stats.mos }) === 'yellow' ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-red-100 text-red-800'}
              >
                {stats.mos >= 4 ? 'Excelente' : stats.mos >= 3.5 ? 'Bueno' : 'Mejorable'}
              </Badge>
            </div>
            
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">{stats.jitterMs.toFixed(1)}ms</div>
              <div className="text-sm text-gray-600">Jitter Medio</div>
              <Badge
                variant="secondary"
                className={scoreQuality({ jitterMs: stats.jitterMs }) === 'green' ? 'bg-green-100 text-green-800' : 
                          scoreQuality({ jitterMs: stats.jitterMs }) === 'yellow' ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-red-100 text-red-800'}
              >
                {stats.jitterMs < 20 ? 'Excelente' : stats.jitterMs < 40 ? 'Bueno' : 'Mejorable'}
              </Badge>
            </div>
            
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">{stats.dropPct.toFixed(1)}%</div>
              <div className="text-sm text-gray-600">% Caídas</div>
              <Badge
                variant="secondary"
                className={scoreQuality({ dropPct: stats.dropPct }) === 'green' ? 'bg-green-100 text-green-800' : 
                          scoreQuality({ dropPct: stats.dropPct }) === 'yellow' ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-red-100 text-red-800'}
              >
                {stats.dropPct < 1 ? 'Excelente' : stats.dropPct < 3 ? 'Bueno' : 'Mejorable'}
              </Badge>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No hay datos de calidad disponibles
          </div>
        )}
      </CardContent>
    </Card>
  );
}