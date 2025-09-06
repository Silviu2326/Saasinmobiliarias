import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  SubjectMiniForm,
  SearchFilters,
  MapWithClusters,
  ComparablesTable,
  ExportBar,
  SavedSetsBar,
} from "./components";
import { useSearch, useSubjectRef, useSelection } from "./hooks";
import type { SearchFilters as SearchFiltersType, SubjectRef, Comparable } from "./types";

export default function ComparablesPage() {
  const [filters, setFilters] = useState<SearchFiltersType>({
    radiusKm: 1,
    sort: "distance-asc",
    page: 0,
    size: 25,
  });

  const { subject } = useSubjectRef();
  const { comparables, total, density, isLoading } = useSearch(filters);
  const { selected, clearSelection } = useSelection();
  const [selectedComparable, setSelectedComparable] = useState<Comparable | null>(null);

  const handleSubjectSubmit = (newSubject: SubjectRef) => {
    if (newSubject.lat && newSubject.lng) {
      setFilters(prev => ({
        ...prev,
        lat: newSubject.lat,
        lng: newSubject.lng,
        page: 0,
      }));
    }
  };

  const handleFiltersChange = (newFilters: SearchFiltersType) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 0 }));
  };

  const handleComparableSelect = (comparable: Comparable) => {
    setSelectedComparable(comparable);
  };

  const handleLoadSet = (setId: string) => {
    // Load specific set logic would go here
    console.log("Loading set:", setId);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Comparables</h1>
          <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
            <span>
              {total} resultados{density > 0 && ` " ${density} comp/km²`}
            </span>
            {isLoading && <Badge variant="secondary">Cargando...</Badge>}
          </div>
        </div>
      </div>

      {/* Top Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <SubjectMiniForm 
          onSubmit={handleSubjectSubmit} 
          className="lg:col-span-2" 
        />
        <div className="flex items-end gap-2">
          <ExportBar comparables={comparables} selectedIds={selected} />
          <SavedSetsBar 
            selectedIds={selected} 
            onLoadSet={handleLoadSet} 
          />
        </div>
      </div>

      {/* Filters */}
      <SearchFilters onFiltersChange={handleFiltersChange} />

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-4">
          <MapWithClusters
            comparables={comparables}
            onComparableSelect={handleComparableSelect}
          />
          
          {/* Quick Stats */}
          {comparables.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">
                  Resumen de Búsqueda
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-gray-600">Total:</span>
                    <div className="font-medium">{total} comparables</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Densidad:</span>
                    <div className="font-medium">{density} comp/km²</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Precio medio:</span>
                    <div className="font-medium">
                      {new Intl.NumberFormat("es-ES", {
                        style: "currency",
                        currency: "EUR",
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      }).format(
                        comparables.reduce((sum, c) => sum + c.price, 0) / comparables.length
                      )}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600">¬/m² medio:</span>
                    <div className="font-medium">
                      {Math.round(
                        comparables.reduce((sum, c) => sum + (c.ppsqm || 0), 0) / comparables.length
                      )} ¬
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quality Distribution */}
          {comparables.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">
                  Distribución de Calidad
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  {["A", "B", "C"].map(quality => {
                    const count = comparables.filter(c => c.quality === quality).length;
                    const percentage = count > 0 ? (count / comparables.length) * 100 : 0;
                    
                    return (
                      <div key={quality} className="flex items-center gap-2 text-xs">
                        <div className={`
                          w-3 h-3 rounded-full
                          ${quality === "A" ? "bg-green-500" : quality === "B" ? "bg-yellow-500" : "bg-red-500"}
                        `} />
                        <span>{quality}: {count} ({percentage.toFixed(0)}%)</span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column */}
        <div>
          <ComparablesTable
            comparables={comparables}
            onRowClick={handleComparableSelect}
          />
        </div>
      </div>

      {/* Comparable Detail Modal/Drawer */}
      {selectedComparable && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{selectedComparable.address}</CardTitle>
                <button
                  onClick={() => setSelectedComparable(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="sr-only">Cerrar</span>
                  
                </button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Precio:</span>
                    <div className="font-medium">
                      {new Intl.NumberFormat("es-ES", {
                        style: "currency",
                        currency: "EUR",
                        minimumFractionDigits: 0,
                      }).format(selectedComparable.price)}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600">¬/m²:</span>
                    <div className="font-medium">{selectedComparable.ppsqm?.toFixed(0)} ¬</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Superficie:</span>
                    <div className="font-medium">{selectedComparable.sqm} m²</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Habitaciones:</span>
                    <div className="font-medium">{selectedComparable.rooms || "-"}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Baños:</span>
                    <div className="font-medium">{selectedComparable.baths || "-"}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Planta:</span>
                    <div className="font-medium">
                      {selectedComparable.floor !== undefined ? `${selectedComparable.floor}º` : "-"}
                      {selectedComparable.elevator ? " (Con ascensor)" : ""}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600">Estado:</span>
                    <div className="font-medium">
                      {selectedComparable.condition?.replace("_", " ") || "-"}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600">Fecha:</span>
                    <div className="font-medium">
                      {new Date(selectedComparable.date).toLocaleDateString("es-ES")}
                    </div>
                  </div>
                </div>

                {selectedComparable.photos && selectedComparable.photos.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Fotos</h4>
                    <div className="grid grid-cols-3 gap-2">
                      {selectedComparable.photos.slice(0, 6).map((photo, index) => (
                        <img
                          key={index}
                          src={photo}
                          alt={`Foto ${index + 1}`}
                          className="w-full h-20 object-cover rounded border"
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}