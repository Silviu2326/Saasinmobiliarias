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
import { useNumbers } from "../hooks";
import { maskPhone, formatMoney } from "../utils";
import { Search, Plus, Settings2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function NumbersTable() {
  const [filters, setFilters] = useState({
    provider: "",
    office: "",
    agent: "",
    search: "",
  });

  const { numbers, isLoading, assignNumber, purchaseNumber } = useNumbers(filters);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Números de Teléfono</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
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
          <CardTitle>Números de Teléfono</CardTitle>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Comprar Número
          </Button>
        </div>
        
        <div className="flex items-center space-x-4 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar números..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="pl-10"
            />
          </div>
          
          <Select value={filters.provider || "all"} onValueChange={(value) => setFilters(prev => ({ ...prev, provider: value === "all" ? "" : value }))}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Proveedor" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="twilio">Twilio</SelectItem>
              <SelectItem value="vonage">Vonage</SelectItem>
              <SelectItem value="plivo">Plivo</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={filters.office || "all"} onValueChange={(value) => setFilters(prev => ({ ...prev, office: value === "all" ? "" : value }))}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Oficina" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="office-madrid">Madrid</SelectItem>
              <SelectItem value="office-barcelona">Barcelona</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Número</TableHead>
              <TableHead>Proveedor</TableHead>
              <TableHead>Oficina</TableHead>
              <TableHead>Agente</TableHead>
              <TableHead>Grabación</TableHead>
              <TableHead>Coste Mensual</TableHead>
              <TableHead>Etiquetas</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {numbers.map((number) => (
              <TableRow key={number.id}>
                <TableCell className="font-mono">
                  {maskPhone(number.e164)}
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{number.providerId}</Badge>
                </TableCell>
                <TableCell>
                  {number.officeId ? (
                    <Badge variant="secondary">
                      {number.officeId.replace('office-', '')}
                    </Badge>
                  ) : (
                    <span className="text-gray-400">Sin asignar</span>
                  )}
                </TableCell>
                <TableCell>
                  {number.agentId ? (
                    <Badge variant="secondary">
                      {number.agentId}
                    </Badge>
                  ) : (
                    <span className="text-gray-400">Sin asignar</span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={number.recording ? "default" : "secondary"}
                    className={number.recording ? "bg-green-100 text-green-800" : ""}
                  >
                    {number.recording ? "Activa" : "Inactiva"}
                  </Badge>
                </TableCell>
                <TableCell>
                  {number.monthlyCost ? formatMoney(number.monthlyCost) : "N/A"}
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {number.tags?.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm">
                    <Settings2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {numbers.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No hay números disponibles
          </div>
        )}
      </CardContent>
    </Card>
  );
}