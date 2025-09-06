import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { Filter, ChevronDown, X } from "lucide-react";
import type { KycFilters as KycFiltersType } from "../types";

interface KycFiltersProps {
  filters: KycFiltersType;
  onFiltersChange: (filters: KycFiltersType) => void;
  className?: string;
}

export function KycFilters({ filters, onFiltersChange, className }: KycFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleFilterChange = (key: keyof KycFiltersType, value: any) => {
    onFiltersChange({ ...filters, [key]: value, page: 0 });
  };

  const clearFilters = () => {
    onFiltersChange({
      page: 0,
      size: 25,
      sort: "createdAt-desc",
    });
  };

  const activeFiltersCount = Object.entries(filters).filter(([key, value]) => {
    if (["page", "size", "sort"].includes(key)) return false;
    return value !== undefined && value !== "" && value !== null;
  }).length;

  return (
    <Card className={className}>
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CardHeader className="pb-3">
          <CollapsibleTrigger asChild>
            <div className="flex items-center justify-between cursor-pointer">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filtros
                {activeFiltersCount > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {activeFiltersCount}
                  </Badge>
                )}
              </CardTitle>
              <ChevronDown className={`h-4 w-4 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
            </div>
          </CollapsibleTrigger>
        </CardHeader>

        <CardContent>
          {/* Always visible filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div>
              <Label htmlFor="q" className="text-xs">
                Buscar
              </Label>
              <Input
                id="q"
                placeholder="Nombre, documento, email..."
                value={filters.q || ""}
                onChange={(e) => handleFilterChange("q", e.target.value)}
                className="h-8"
              />
            </div>

            <div>
              <Label htmlFor="estado" className="text-xs">
                Estado
              </Label>
              <Select
                value={filters.estado || "all"}
                onValueChange={(value) => handleFilterChange("estado", value === "all" ? undefined : value)}
              >
                <SelectTrigger className="h-8">
                  <SelectValue placeholder="Todos los estados" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="NUEVO">Nuevo</SelectItem>
                  <SelectItem value="EN_REVISION">En Revisi�n</SelectItem>
                  <SelectItem value="APROBADO">Aprobado</SelectItem>
                  <SelectItem value="RECHAZADO">Rechazado</SelectItem>
                  <SelectItem value="PEND_INFO">Pend. Informaci�n</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="riesgo" className="text-xs">
                Nivel de Riesgo
              </Label>
              <Select
                value={filters.riesgo || "all"}
                onValueChange={(value) => handleFilterChange("riesgo", value === "all" ? undefined : value)}
              >
                <SelectTrigger className="h-8">
                  <SelectValue placeholder="Todos los riesgos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los riesgos</SelectItem>
                  <SelectItem value="BAJO">Bajo</SelectItem>
                  <SelectItem value="MEDIO">Medio</SelectItem>
                  <SelectItem value="ALTO">Alto</SelectItem>
                  <SelectItem value="CRITICO">Cr�tico</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="sort" className="text-xs">
                Orden
              </Label>
              <Select
                value={filters.sort || "createdAt-desc"}
                onValueChange={(value) => handleFilterChange("sort", value)}
              >
                <SelectTrigger className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="createdAt-desc">Fecha �</SelectItem>
                  <SelectItem value="createdAt-asc">Fecha �</SelectItem>
                  <SelectItem value="name-asc">Nombre �</SelectItem>
                  <SelectItem value="name-desc">Nombre �</SelectItem>
                  <SelectItem value="riskScore-desc">Riesgo �</SelectItem>
                  <SelectItem value="riskScore-asc">Riesgo �</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <CollapsibleContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="from" className="text-xs">
                  Desde
                </Label>
                <Input
                  id="from"
                  type="date"
                  value={filters.from || ""}
                  onChange={(e) => handleFilterChange("from", e.target.value)}
                  className="h-8"
                />
              </div>

              <div>
                <Label htmlFor="to" className="text-xs">
                  Hasta
                </Label>
                <Input
                  id="to"
                  type="date"
                  value={filters.to || ""}
                  onChange={(e) => handleFilterChange("to", e.target.value)}
                  className="h-8"
                />
              </div>

              <div>
                <Label htmlFor="canal" className="text-xs">
                  Canal
                </Label>
                <Select
                  value={filters.canal || "all"}
                  onValueChange={(value) => handleFilterChange("canal", value === "all" ? undefined : value)}
                >
                  <SelectTrigger className="h-8">
                    <SelectValue placeholder="Todos los canales" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los canales</SelectItem>
                    <SelectItem value="web">Web</SelectItem>
                    <SelectItem value="portales">Portales</SelectItem>
                    <SelectItem value="oficina">Oficina</SelectItem>
                    <SelectItem value="whatsapp">WhatsApp</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="oficina" className="text-xs">
                  Oficina
                </Label>
                <Select
                  value={filters.oficina || "all"}
                  onValueChange={(value) => handleFilterChange("oficina", value === "all" ? undefined : value)}
                >
                  <SelectTrigger className="h-8">
                    <SelectValue placeholder="Todas las oficinas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las oficinas</SelectItem>
                    <SelectItem value="office-1">Madrid Centro</SelectItem>
                    <SelectItem value="office-2">Barcelona</SelectItem>
                    <SelectItem value="office-3">Valencia</SelectItem>
                    <SelectItem value="office-4">Sevilla</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="agente" className="text-xs">
                  Agente
                </Label>
                <Select
                  value={filters.agente || "all"}
                  onValueChange={(value) => handleFilterChange("agente", value === "all" ? undefined : value)}
                >
                  <SelectTrigger className="h-8">
                    <SelectValue placeholder="Todos los agentes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los agentes</SelectItem>
                    <SelectItem value="agent-1">Ana Garc�a</SelectItem>
                    <SelectItem value="agent-2">Carlos L�pez</SelectItem>
                    <SelectItem value="agent-3">Mar�a Rodr�guez</SelectItem>
                    <SelectItem value="agent-4">Juan Mart�n</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {activeFiltersCount > 0 && (
              <div className="pt-4 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearFilters}
                  className="flex items-center gap-2"
                >
                  <X className="h-3 w-3" />
                  Limpiar Filtros
                </Button>
              </div>
            )}
          </CollapsibleContent>
        </CardContent>
      </Collapsible>
    </Card>
  );
}