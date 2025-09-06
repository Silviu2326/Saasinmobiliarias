import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Map as MapIcon, MapPin, Layers, ZoomIn, ZoomOut } from "lucide-react";
import type { Comparable } from "../types";
import { formatMoney } from "../utils";

interface MapWithClustersProps {
  comparables: Comparable[];
  onComparableSelect?: (comparable: Comparable) => void;
  onAreaSelect?: (bounds: { north: number; south: number; east: number; west: number }) => void;
  className?: string;
}

export function MapWithClusters({ 
  comparables, 
  onComparableSelect, 
  onAreaSelect, 
  className 
}: MapWithClustersProps) {
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [selectedComp, setSelectedComp] = useState<Comparable | null>(null);

  const bounds = useMemo(() => {
    if (comparables.length === 0) return null;

    const lats = comparables.map(c => c.lat);
    const lngs = comparables.map(c => c.lng);

    return {
      north: Math.max(...lats),
      south: Math.min(...lats),
      east: Math.max(...lngs),
      west: Math.min(...lngs),
    };
  }, [comparables]);

  const clusters = useMemo(() => {
    if (comparables.length === 0) return [];

    const gridSize = 0.001;
    const clusterMap = new Map<string, Comparable[]>();

    comparables.forEach(comp => {
      const gridLat = Math.floor(comp.lat / gridSize) * gridSize;
      const gridLng = Math.floor(comp.lng / gridSize) * gridSize;
      const key = `${gridLat}-${gridLng}`;
      
      if (!clusterMap.has(key)) {
        clusterMap.set(key, []);
      }
      clusterMap.get(key)!.push(comp);
    });

    return Array.from(clusterMap.entries()).map(([key, comps]) => {
      const [lat, lng] = key.split('-').map(Number);
      const avgPrice = comps.reduce((sum, c) => sum + c.price, 0) / comps.length;
      const avgPpsqm = comps.reduce((sum, c) => sum + (c.ppsqm || 0), 0) / comps.length;

      return {
        lat,
        lng,
        count: comps.length,
        avgPrice,
        avgPpsqm,
        comparables: comps,
      };
    });
  }, [comparables]);

  const handleClusterClick = (cluster: typeof clusters[0]) => {
    if (cluster.count === 1) {
      onComparableSelect?.(cluster.comparables[0]);
    } else {
      setSelectedComp(cluster.comparables[0]);
    }
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <MapIcon className="h-4 w-4" />
            Mapa de Comparables
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant={showHeatmap ? "default" : "outline"}
              size="sm"
              onClick={() => setShowHeatmap(!showHeatmap)}
              className="h-8"
            >
              <Layers className="h-3 w-3 mr-1" />
              Densidad
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="relative bg-gray-50 rounded-lg h-64 overflow-hidden">
          <div
            className={`absolute inset-0 transition-opacity duration-300 ${
              showHeatmap ? "opacity-30" : "opacity-0"
            }`}
            style={{
              background: `radial-gradient(circle, rgba(255,0,0,0.3) 0%, rgba(255,255,0,0.2) 50%, rgba(0,0,255,0.1) 100%)`,
            }}
          />

          {comparables.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-400">
              <div className="text-center">
                <MapPin className="h-8 w-8 mx-auto mb-2" />
                <p className="text-sm">No hay comparables para mostrar</p>
                <p className="text-xs">Ajusta los filtros de búsqueda</p>
              </div>
            </div>
          ) : (
            <div className="relative h-full">
              {clusters.map((cluster, index) => (
                <button
                  key={index}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 hover:scale-110 transition-transform"
                  style={{
                    left: `${((cluster.lng - (bounds?.west || 0)) / ((bounds?.east || 0) - (bounds?.west || 0))) * 100}%`,
                    top: `${100 - ((cluster.lat - (bounds?.south || 0)) / ((bounds?.north || 0) - (bounds?.south || 0))) * 100}%`,
                  }}
                  onClick={() => handleClusterClick(cluster)}
                  title={`${cluster.count} comparable${cluster.count > 1 ? "s" : ""}\n${formatMoney(cluster.avgPrice)}\n${cluster.avgPpsqm.toFixed(0)} €/m²`}
                >
                  <div className="relative">
                    <div
                      className={`
                        w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium text-white
                        ${cluster.count === 1 ? 'bg-blue-600' : cluster.count <= 5 ? 'bg-green-600' : 'bg-red-600'}
                      `}
                    >
                      {cluster.count}
                    </div>
                    {cluster.count > 1 && (
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-white rounded-full border border-gray-300 flex items-center justify-center">
                        <div className="w-1 h-1 bg-gray-600 rounded-full" />
                      </div>
                    )}
                  </div>
                </button>
              ))}

              <div className="absolute top-2 right-2 flex flex-col gap-1">
                <Button variant="secondary" size="icon" className="h-6 w-6">
                  <ZoomIn className="h-3 w-3" />
                </Button>
                <Button variant="secondary" size="icon" className="h-6 w-6">
                  <ZoomOut className="h-3 w-3" />
                </Button>
              </div>

              <div className="absolute bottom-2 left-2 bg-white p-2 rounded shadow-sm">
                <div className="flex items-center gap-4 text-xs">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-blue-600 rounded-full" />
                    <span>Individual</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-green-600 rounded-full" />
                    <span>2-5</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-red-600 rounded-full" />
                    <span>6+</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {comparables.length > 0 && (
          <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
            <div>
              {comparables.length} comparables en {clusters.length} ubicaciones
            </div>
            <div>
              Densidad: {(comparables.length / (bounds ? ((bounds.north - bounds.south) * (bounds.east - bounds.west)) * 111000 : 1)).toFixed(1)}/km²
            </div>
          </div>
        )}

        {selectedComp && (
          <div className="mt-3 p-3 bg-blue-50 rounded border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-sm">{selectedComp.address}</div>
                <div className="text-xs text-gray-600">
                  {formatMoney(selectedComp.price)} • {selectedComp.sqm} m² • {selectedComp.ppsqm?.toFixed(0)} €/m²
                </div>
              </div>
              <Button
                size="sm"
                onClick={() => onComparableSelect?.(selectedComp)}
              >
                Ver detalle
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}