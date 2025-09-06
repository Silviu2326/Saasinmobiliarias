import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { Filter, ChevronDown, X, MapPin } from "lucide-react";
import type { SearchFilters as SearchFiltersType, Source } from "../types";

interface SearchFiltersProps {
  onFiltersChange: (filters: SearchFiltersType) => void;
  className?: string;
}

export function SearchFilters({ onFiltersChange, className }: SearchFiltersProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isExpanded, setIsExpanded] = useState(false);

  const [filters, setFilters] = useState<SearchFiltersType>({
    radiusKm: parseFloat(searchParams.get("radiusKm") || "1"),
    from: searchParams.get("from") || "",
    to: searchParams.get("to") || "",
    sqmMin: searchParams.get("sqmMin") ? parseInt(searchParams.get("sqmMin")!) : undefined,
    sqmMax: searchParams.get("sqmMax") ? parseInt(searchParams.get("sqmMax")!) : undefined,
    roomsMin: searchParams.get("roomsMin") ? parseInt(searchParams.get("roomsMin")!) : undefined,
    bathsMin: searchParams.get("bathsMin") ? parseInt(searchParams.get("bathsMin")!) : undefined,
    floorMin: searchParams.get("floorMin") ? parseInt(searchParams.get("floorMin")!) : undefined,
    floorMax: searchParams.get("floorMax") ? parseInt(searchParams.get("floorMax")!) : undefined,
    hasElevator: searchParams.get("hasElevator") === "true" ? true : searchParams.get("hasElevator") === "false" ? false : undefined,
    terraceMin: searchParams.get("terraceMin") ? parseInt(searchParams.get("terraceMin")!) : undefined,
    parking: searchParams.get("parking") === "true" ? true : searchParams.get("parking") === "false" ? false : undefined,
    condition: searchParams.get("condition") || "",
    priceMin: searchParams.get("priceMin") ? parseInt(searchParams.get("priceMin")!) : undefined,
    priceMax: searchParams.get("priceMax") ? parseInt(searchParams.get("priceMax")!) : undefined,
    source: searchParams.get("source") as Source || undefined,
    sort: searchParams.get("sort") || "distance-asc",
    page: parseInt(searchParams.get("page") || "0"),
    size: parseInt(searchParams.get("size") || "25"),
  });

  const handleFilterChange = (key: keyof SearchFiltersType, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    
    const newSearchParams = new URLSearchParams(searchParams);
    if (value !== undefined && value !== "" && value !== null) {
      newSearchParams.set(key, value.toString());
    } else {
      newSearchParams.delete(key);
    }
    setSearchParams(newSearchParams);
    
    onFiltersChange(newFilters);
  };

  const clearFilters = () => {
    const clearedFilters: SearchFiltersType = {
      radiusKm: 1,
      sort: "distance-asc",
      page: 0,
      size: 25,
    };
    setFilters(clearedFilters);
    setSearchParams(new URLSearchParams());
    onFiltersChange(clearedFilters);
  };

  const activeFiltersCount = Object.entries(filters).filter(([key, value]) => {
    if (["page", "size", "sort", "radiusKm"].includes(key)) return false;
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
                Filtros de Búsqueda
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
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div>
              <Label htmlFor="radiusKm" className="text-xs">
                Radio (km)
              </Label>
              <Select
                value={filters.radiusKm?.toString() || "1"}
                onValueChange={(value) => handleFilterChange("radiusKm", parseFloat(value))}
              >
                <SelectTrigger className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0.5">0.5 km</SelectItem>
                  <SelectItem value="1">1 km</SelectItem>
                  <SelectItem value="2">2 km</SelectItem>
                  <SelectItem value="3">3 km</SelectItem>
                  <SelectItem value="5">5 km</SelectItem>
                </SelectContent>
              </Select>
            </div>

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
              <Label htmlFor="sort" className="text-xs">
                Orden
              </Label>
              <Select
                value={filters.sort || "distance-asc"}
                onValueChange={(value) => handleFilterChange("sort", value)}
              >
                <SelectTrigger className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="distance-asc">Distancia ↑</SelectItem>
                  <SelectItem value="distance-desc">Distancia ↓</SelectItem>
                  <SelectItem value="date-desc">Fecha ↓</SelectItem>
                  <SelectItem value="date-asc">Fecha ↑</SelectItem>
                  <SelectItem value="ppsqm-desc">€/m² ↓</SelectItem>
                  <SelectItem value="ppsqm-asc">€/m² ↑</SelectItem>
                  <SelectItem value="sqm-desc">m² ↓</SelectItem>
                  <SelectItem value="sqm-asc">m² ↑</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <CollapsibleContent className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="space-y-3">
                <h4 className="font-medium text-sm">Superficie</h4>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="sqmMin" className="text-xs">
                      m² mín
                    </Label>
                    <Input
                      id="sqmMin"
                      type="number"
                      placeholder="Min"
                      value={filters.sqmMin || ""}
                      onChange={(e) =>
                        handleFilterChange("sqmMin", e.target.value ? parseInt(e.target.value) : undefined)
                      }
                      className="h-8"
                    />
                  </div>
                  <div>
                    <Label htmlFor="sqmMax" className="text-xs">
                      m² máx
                    </Label>
                    <Input
                      id="sqmMax"
                      type="number"
                      placeholder="Max"
                      value={filters.sqmMax || ""}
                      onChange={(e) =>
                        handleFilterChange("sqmMax", e.target.value ? parseInt(e.target.value) : undefined)
                      }
                      className="h-8"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium text-sm">Distribución</h4>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="roomsMin" className="text-xs">
                      Hab. mín
                    </Label>
                    <Input
                      id="roomsMin"
                      type="number"
                      placeholder="Hab"
                      value={filters.roomsMin || ""}
                      onChange={(e) =>
                        handleFilterChange("roomsMin", e.target.value ? parseInt(e.target.value) : undefined)
                      }
                      className="h-8"
                    />
                  </div>
                  <div>
                    <Label htmlFor="bathsMin" className="text-xs">
                      Baños mín
                    </Label>
                    <Input
                      id="bathsMin"
                      type="number"
                      placeholder="Baños"
                      value={filters.bathsMin || ""}
                      onChange={(e) =>
                        handleFilterChange("bathsMin", e.target.value ? parseInt(e.target.value) : undefined)
                      }
                      className="h-8"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium text-sm">Características</h4>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="hasElevator"
                      checked={filters.hasElevator === true}
                      onCheckedChange={(checked) =>
                        handleFilterChange("hasElevator", checked ? true : undefined)
                      }
                    />
                    <Label htmlFor="hasElevator" className="text-xs">
                      Con ascensor
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="parking"
                      checked={filters.parking === true}
                      onCheckedChange={(checked) =>
                        handleFilterChange("parking", checked ? true : undefined)
                      }
                    />
                    <Label htmlFor="parking" className="text-xs">
                      Con parking
                    </Label>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="condition" className="text-xs">
                  Estado
                </Label>
                <Select
                  value={filters.condition || "all"}
                  onValueChange={(value) => handleFilterChange("condition", value === "all" ? undefined : value)}
                >
                  <SelectTrigger className="h-8">
                    <SelectValue placeholder="Cualquier estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Cualquier estado</SelectItem>
                    <SelectItem value="nuevo">Nuevo</SelectItem>
                    <SelectItem value="buen_estado">Buen estado</SelectItem>
                    <SelectItem value="reformar">A reformar</SelectItem>
                    <SelectItem value="origen">De origen</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="source" className="text-xs">
                  Fuente
                </Label>
                <Select
                  value={filters.source || "all"}
                  onValueChange={(value) => handleFilterChange("source", value === "all" ? undefined : value)}
                >
                  <SelectTrigger className="h-8">
                    <SelectValue placeholder="Cualquier fuente" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Cualquier fuente</SelectItem>
                    <SelectItem value="PORTAL">Portal</SelectItem>
                    <SelectItem value="REGISTRO">Registro</SelectItem>
                    <SelectItem value="NOTARIA">Notaría</SelectItem>
                    <SelectItem value="INTERNO">Interno</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="terraceMin" className="text-xs">
                  Terraza mín (m²)
                </Label>
                <Input
                  id="terraceMin"
                  type="number"
                  placeholder="m² terraza"
                  value={filters.terraceMin || ""}
                  onChange={(e) =>
                    handleFilterChange("terraceMin", e.target.value ? parseInt(e.target.value) : undefined)
                  }
                  className="h-8"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="priceMin" className="text-xs">
                  Precio mínimo (€)
                </Label>
                <Input
                  id="priceMin"
                  type="number"
                  placeholder="€ mín"
                  value={filters.priceMin || ""}
                  onChange={(e) =>
                    handleFilterChange("priceMin", e.target.value ? parseInt(e.target.value) : undefined)
                  }
                  className="h-8"
                />
              </div>
              <div>
                <Label htmlFor="priceMax" className="text-xs">
                  Precio máximo (€)
                </Label>
                <Input
                  id="priceMax"
                  type="number"
                  placeholder="€ máx"
                  value={filters.priceMax || ""}
                  onChange={(e) =>
                    handleFilterChange("priceMax", e.target.value ? parseInt(e.target.value) : undefined)
                  }
                  className="h-8"
                />
              </div>
            </div>

            {activeFiltersCount > 0 && (
              <div className="pt-2 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearFilters}
                  className="flex items-center gap-2"
                >
                  <X className="h-3 w-3" />
                  Limpiar filtros
                </Button>
              </div>
            )}
          </CollapsibleContent>
        </CardContent>
      </Collapsible>
    </Card>
  );
}