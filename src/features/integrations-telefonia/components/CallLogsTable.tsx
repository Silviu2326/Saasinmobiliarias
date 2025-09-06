import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCallLogs } from "../hooks";
import { 
  maskPhone, 
  formatDuration, 
  formatMoney, 
  getCallStatusColor, 
  getCallStatusText, 
  getChannelIcon 
} from "../utils";
import { Search, Download, Play } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function CallLogsTable() {
  const { logs, isLoading, filters, updateFilters, nextPage, prevPage, page, totalPages, total } = useCallLogs();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Historial de Llamadas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(10)].map((_, i) => (
              <Skeleton key={i} className="h-12" />
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
            <CardTitle>Historial de Llamadas</CardTitle>
            <div className="text-sm text-gray-500 mt-1">
              {total} registros encontrados
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-4 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar en logs..."
              value={filters.q || ""}
              onChange={(e) => updateFilters({ q: e.target.value })}
              className="pl-10"
            />
          </div>
          
          <Select 
            value={filters.channel || "all"} 
            onValueChange={(value) => updateFilters({ channel: value === "all" ? undefined : value as any })}
          >
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Canal" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="CALL">📞 Llamadas</SelectItem>
              <SelectItem value="SMS">💬 SMS</SelectItem>
              <SelectItem value="WHATSAPP">💚 WhatsApp</SelectItem>
            </SelectContent>
          </Select>
          
          <Select 
            value={filters.direction || "all"} 
            onValueChange={(value) => updateFilters({ direction: value === "all" ? undefined : value as any })}
          >
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Dirección" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="IN">Entrantes</SelectItem>
              <SelectItem value="OUT">Salientes</SelectItem>
            </SelectContent>
          </Select>

          <Select 
            value={filters.status || "all"} 
            onValueChange={(value) => updateFilters({ status: value === "all" ? undefined : value as any })}
          >
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="answered">Respondida</SelectItem>
              <SelectItem value="busy">Ocupado</SelectItem>
              <SelectItem value="no_answer">Sin respuesta</SelectItem>
              <SelectItem value="failed">Fallida</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha/Hora</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>De → A</TableHead>
              <TableHead>Agente</TableHead>
              <TableHead>Duración</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Coste</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.map((log) => (
              <TableRow key={log.id}>
                <TableCell className="text-sm">
                  {new Date(log.at).toLocaleString("es-ES")}
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <span>{getChannelIcon(log.channel)}</span>
                    <Badge variant="outline" className={
                      log.direction === "IN" ? "text-blue-600" : "text-green-600"
                    }>
                      {log.direction === "IN" ? "Entrante" : "Saliente"}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell className="font-mono text-sm">
                  {maskPhone(log.from)} → {maskPhone(log.to)}
                </TableCell>
                <TableCell>
                  {log.agentId ? (
                    <Badge variant="secondary">{log.agentId}</Badge>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </TableCell>
                <TableCell>
                  {log.durationSec ? formatDuration(log.durationSec) : "-"}
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className={getCallStatusColor(log.status)}>
                    {getCallStatusText(log.status)}
                  </Badge>
                </TableCell>
                <TableCell>
                  {log.cost ? formatMoney(log.cost) : "-"}
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-1">
                    {log.recordingUrl && (
                      <Button variant="ghost" size="sm" title="Reproducir grabación">
                        <Play className="h-4 w-4" />
                      </Button>
                    )}
                    {log.transcript && (
                      <Button variant="ghost" size="sm" title="Ver transcripción">
                        <Download className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {logs.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No hay registros que mostrar
          </div>
        )}

        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-gray-500">
            Página {page} de {totalPages}
          </div>
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={prevPage}
              disabled={page <= 1}
            >
              Anterior
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={nextPage}
              disabled={page >= totalPages}
            >
              Siguiente
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}