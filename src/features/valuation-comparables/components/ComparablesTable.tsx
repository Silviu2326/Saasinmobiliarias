import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, ExternalLink, X, Plus } from "lucide-react";
import type { Comparable } from "../types";
import { formatMoney, formatDate, formatSqm } from "../utils";
import { QualityBadge } from "./QualityBadge";
import { useSelection } from "../hooks";

interface ComparablesTableProps {
  comparables: Comparable[];
  onRowClick?: (comparable: Comparable) => void;
  onSelectionChange?: (selected: string[]) => void;
  className?: string;
}

const sourceLabels = {
  PORTAL: "Portal",
  REGISTRO: "Registro", 
  NOTARIA: "Notaría",
  INTERNO: "Interno"
};

export function ComparablesTable({ 
  comparables, 
  onRowClick, 
  onSelectionChange,
  className 
}: ComparablesTableProps) {
  const { selected, selectedSet, toggle, selectAll, clearSelection, isSelected } = useSelection();
  const [excludedIds, setExcludedIds] = useState<Set<string>>(new Set());

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const visibleIds = comparables.filter(c => !excludedIds.has(c.id)).map(c => c.id);
      selectAll(visibleIds);
      onSelectionChange?.(visibleIds);
    } else {
      clearSelection();
      onSelectionChange?.([]);
    }
  };

  const handleToggleSelection = (id: string) => {
    toggle(id);
    const newSelected = isSelected(id) 
      ? selected.filter(s => s !== id)
      : [...selected, id];
    onSelectionChange?.(newSelected);
  };

  const handleExclude = (id: string) => {
    setExcludedIds(prev => new Set([...prev, id]));
    if (isSelected(id)) {
      handleToggleSelection(id);
    }
  };

  const handleInclude = (id: string) => {
    setExcludedIds(prev => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const visibleComparables = comparables.filter(c => !excludedIds.has(c.id));
  const excludedComparables = comparables.filter(c => excludedIds.has(c.id));
  
  const allVisibleSelected = visibleComparables.length > 0 && 
    visibleComparables.every(c => isSelected(c.id));
  
  const someVisibleSelected = visibleComparables.some(c => isSelected(c.id));

  const totals = visibleComparables.reduce((acc, comp) => ({
    price: acc.price + comp.price,
    adjTotal: acc.adjTotal + (comp.adjTotal || comp.price),
    weight: acc.weight + (comp.weight || 0),
  }), { price: 0, adjTotal: 0, weight: 0 });

  const avgPpsqm = visibleComparables.length > 0 
    ? visibleComparables.reduce((sum, c) => sum + (c.ppsqm || 0), 0) / visibleComparables.length 
    : 0;

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center justify-between">
          <span>Comparables ({visibleComparables.length})</span>
          {selected.length > 0 && (
            <Badge variant="secondary">
              {selected.length} seleccionados
            </Badge>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-8">
                  <Checkbox
                    checked={allVisibleSelected}
                    indeterminate={someVisibleSelected && !allVisibleSelected}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead className="min-w-20">Ref</TableHead>
                <TableHead className="min-w-20">Fecha</TableHead>
                <TableHead className="min-w-16">Dist</TableHead>
                <TableHead className="min-w-20">€/m²</TableHead>
                <TableHead className="min-w-24">Precio</TableHead>
                <TableHead className="min-w-16">m²</TableHead>
                <TableHead className="min-w-20">Hab/Ba</TableHead>
                <TableHead className="min-w-20">Planta/Asc</TableHead>
                <TableHead className="min-w-20">Estado</TableHead>
                <TableHead className="min-w-20">Ajuste €</TableHead>
                <TableHead className="min-w-16">Peso</TableHead>
                <TableHead className="min-w-16">Calidad</TableHead>
                <TableHead className="min-w-20">Fuente</TableHead>
                <TableHead className="min-w-20">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visibleComparables.map((comp) => (
                <TableRow 
                  key={comp.id}
                  className={`cursor-pointer hover:bg-gray-50 ${
                    isSelected(comp.id) ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => onRowClick?.(comp)}
                >
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={isSelected(comp.id)}
                      onCheckedChange={() => handleToggleSelection(comp.id)}
                    />
                  </TableCell>
                  <TableCell className="font-medium text-xs">
                    {comp.ref || comp.id.slice(0, 8)}
                  </TableCell>
                  <TableCell className="text-xs">
                    {formatDate(comp.date)}
                  </TableCell>
                  <TableCell className="text-xs">
                    {comp.distance ? `${Math.round(comp.distance)}m` : '-'}
                  </TableCell>
                  <TableCell className="text-xs font-medium">
                    {comp.ppsqm?.toFixed(0)} €
                  </TableCell>
                  <TableCell className="text-xs">
                    {formatMoney(comp.price)}
                  </TableCell>
                  <TableCell className="text-xs">
                    {formatSqm(comp.sqm)}
                  </TableCell>
                  <TableCell className="text-xs">
                    {comp.rooms || '-'}/{comp.baths || '-'}
                  </TableCell>
                  <TableCell className="text-xs">
                    {comp.floor !== undefined ? `${comp.floor}º` : '-'}{comp.elevator ? '/A' : ''}
                  </TableCell>
                  <TableCell className="text-xs">
                    <Badge variant="outline" className="text-xs">
                      {comp.condition?.replace('_', ' ') || '-'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs">
                    {comp.adjTotal ? (
                      <span className={comp.adjTotal > comp.price ? 'text-green-600' : comp.adjTotal < comp.price ? 'text-red-600' : ''}>
                        {formatMoney(comp.adjTotal)}
                      </span>
                    ) : '-'}
                  </TableCell>
                  <TableCell className="text-xs">
                    {comp.weight ? `${(comp.weight * 100).toFixed(1)}%` : '-'}
                  </TableCell>
                  <TableCell>
                    {comp.quality && <QualityBadge quality={comp.quality} />}
                  </TableCell>
                  <TableCell className="text-xs">
                    <Badge variant="secondary" className="text-xs">
                      {sourceLabels[comp.source]}
                    </Badge>
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-6 w-6">
                        <Eye className="h-3 w-3" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6 text-red-600 hover:text-red-700"
                        onClick={() => handleExclude(comp.id)}
                        title="Excluir"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {visibleComparables.length > 0 && (
          <div className="border-t p-3 bg-gray-50">
            <div className="grid grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-gray-600">Media precio:</span>
                <div className="font-medium">{formatMoney(totals.price / visibleComparables.length)}</div>
              </div>
              <div>
                <span className="text-gray-600">Media ajustada:</span>
                <div className="font-medium">{formatMoney(totals.adjTotal / visibleComparables.length)}</div>
              </div>
              <div>
                <span className="text-gray-600">Media €/m²:</span>
                <div className="font-medium">{avgPpsqm.toFixed(0)} €</div>
              </div>
              <div>
                <span className="text-gray-600">Peso total:</span>
                <div className="font-medium">{(totals.weight * 100).toFixed(1)}%</div>
              </div>
            </div>
          </div>
        )}

        {excludedComparables.length > 0 && (
          <div className="border-t p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                Excluidos ({excludedComparables.length})
              </span>
            </div>
            <div className="space-y-1">
              {excludedComparables.map(comp => (
                <div key={comp.id} className="flex items-center justify-between p-2 bg-red-50 rounded text-xs">
                  <div className="flex items-center gap-2">
                    <span>{comp.ref || comp.id.slice(0, 8)}</span>
                    <span className="text-gray-500">{comp.address}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleInclude(comp.id)}
                    className="text-green-600 hover:text-green-700 h-6"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Incluir
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {comparables.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            <div className="text-sm">No hay comparables para mostrar</div>
            <div className="text-xs mt-1">Ajusta los filtros de búsqueda</div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}