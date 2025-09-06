import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Search } from "lucide-react";
import type { SubjectRef } from "../types";
import { useSubjectRef } from "../hooks";

interface SubjectMiniFormProps {
  onSubmit: (subject: SubjectRef) => void;
  className?: string;
}

export function SubjectMiniForm({ onSubmit, className }: SubjectMiniFormProps) {
  const { subject, updateSubject, clearSubject } = useSubjectRef();
  const [localSubject, setLocalSubject] = useState<SubjectRef>(subject);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSubject(localSubject);
    onSubmit(localSubject);
  };

  const handleClear = () => {
    setLocalSubject({});
    clearSubject();
    onSubmit({});
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          Sujeto de Referencia
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
            <div className="lg:col-span-2">
              <Label htmlFor="address" className="text-xs">
                Dirección
              </Label>
              <Input
                id="address"
                placeholder="Calle, número, ciudad..."
                value={localSubject.address || ""}
                onChange={(e) =>
                  setLocalSubject((prev) => ({ ...prev, address: e.target.value }))
                }
                className="h-8"
              />
            </div>
            <div>
              <Label htmlFor="type" className="text-xs">
                Tipo
              </Label>
              <Select
                value={localSubject.type || ""}
                onValueChange={(value) =>
                  setLocalSubject((prev) => ({ ...prev, type: value }))
                }
              >
                <SelectTrigger className="h-8">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="piso">Piso</SelectItem>
                  <SelectItem value="casa">Casa</SelectItem>
                  <SelectItem value="atico">Ático</SelectItem>
                  <SelectItem value="duplex">Dúplex</SelectItem>
                  <SelectItem value="estudio">Estudio</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
            <div>
              <Label htmlFor="sqm" className="text-xs">
                m² útiles
              </Label>
              <Input
                id="sqm"
                type="number"
                placeholder="m²"
                value={localSubject.sqm || ""}
                onChange={(e) =>
                  setLocalSubject((prev) => ({
                    ...prev,
                    sqm: e.target.value ? parseInt(e.target.value) : undefined,
                  }))
                }
                className="h-8"
              />
            </div>
            <div>
              <Label htmlFor="rooms" className="text-xs">
                Habitaciones
              </Label>
              <Input
                id="rooms"
                type="number"
                placeholder="Hab"
                value={localSubject.rooms || ""}
                onChange={(e) =>
                  setLocalSubject((prev) => ({
                    ...prev,
                    rooms: e.target.value ? parseInt(e.target.value) : undefined,
                  }))
                }
                className="h-8"
              />
            </div>
            <div>
              <Label htmlFor="baths" className="text-xs">
                Baños
              </Label>
              <Input
                id="baths"
                type="number"
                placeholder="Baños"
                value={localSubject.baths || ""}
                onChange={(e) =>
                  setLocalSubject((prev) => ({
                    ...prev,
                    baths: e.target.value ? parseInt(e.target.value) : undefined,
                  }))
                }
                className="h-8"
              />
            </div>
            <div>
              <Label htmlFor="floor" className="text-xs">
                Planta
              </Label>
              <Input
                id="floor"
                type="number"
                placeholder="Planta"
                value={localSubject.floor || ""}
                onChange={(e) =>
                  setLocalSubject((prev) => ({
                    ...prev,
                    floor: e.target.value ? parseInt(e.target.value) : undefined,
                  }))
                }
                className="h-8"
              />
            </div>
            <div>
              <Label htmlFor="condition" className="text-xs">
                Estado
              </Label>
              <Select
                value={localSubject.condition || ""}
                onValueChange={(value) =>
                  setLocalSubject((prev) => ({ ...prev, condition: value }))
                }
              >
                <SelectTrigger className="h-8">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nuevo">Nuevo</SelectItem>
                  <SelectItem value="buen_estado">Buen estado</SelectItem>
                  <SelectItem value="reformar">A reformar</SelectItem>
                  <SelectItem value="origen">De origen</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <Button type="submit" size="sm" className="flex items-center gap-2">
              <Search className="h-3 w-3" />
              Usar como referencia
            </Button>
            {(localSubject.address || localSubject.sqm) && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleClear}
              >
                Limpiar
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}