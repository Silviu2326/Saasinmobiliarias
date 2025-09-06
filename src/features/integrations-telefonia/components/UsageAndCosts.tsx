import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUsageAndCosts } from "../hooks";
import { formatMoney, formatNumber } from "../utils";
import { Skeleton } from "@/components/ui/skeleton";

export function UsageAndCosts() {
  const [period, setPeriod] = useState("30d");
  
  const filters = {
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    to: new Date().toISOString().split('T')[0],
  };

  const { usage, costs, isLoading } = useUsageAndCosts(filters);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Uso y Costes</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-32" />
        </CardContent>
      </Card>
    );
  }

  const totalMinutes = usage.reduce((sum, day) => sum + day.inMinutes + day.outMinutes, 0);
  const totalSms = usage.reduce((sum, day) => sum + day.smsIn + day.smsOut, 0);
  const totalCost = usage.reduce((sum, day) => sum + day.cost, 0);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Uso y Costes</CardTitle>
            <CardDescription>
              Consumo y coste por período
            </CardDescription>
          </div>
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7d</SelectItem>
              <SelectItem value="30d">30d</SelectItem>
              <SelectItem value="90d">90d</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-900">{formatMoney(totalCost)}</div>
            <div className="text-sm text-blue-700">Coste Total</div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-lg font-semibold text-gray-900">{formatNumber(totalMinutes)}</div>
              <div className="text-xs text-gray-600">Minutos</div>
            </div>
            
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-lg font-semibold text-gray-900">{formatNumber(totalSms)}</div>
              <div className="text-xs text-gray-600">SMS</div>
            </div>
          </div>
        </div>
        
        {costs && (
          <div className="mt-4 pt-4 border-t">
            <div className="text-sm text-gray-600 mb-2">Desglose:</div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Voz entrante:</span>
                <span>{formatMoney(costs.breakdown.voice.inbound)}</span>
              </div>
              <div className="flex justify-between">
                <span>Voz saliente:</span>
                <span>{formatMoney(costs.breakdown.voice.outbound)}</span>
              </div>
              <div className="flex justify-between">
                <span>SMS:</span>
                <span>{formatMoney(costs.breakdown.sms.inbound + costs.breakdown.sms.outbound)}</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}