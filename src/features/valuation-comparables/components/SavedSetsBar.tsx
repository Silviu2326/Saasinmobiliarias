import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Save, Bookmark, Star, Plus } from "lucide-react";
import { useCompSets } from "../hooks";
import type { CompSet } from "../types";

interface SavedSetsBarProps {
  selectedIds: string[];
  onLoadSet?: (setId: string) => void;
  className?: string;
}

export function SavedSetsBar({ selectedIds, onLoadSet, className }: SavedSetsBarProps) {
  const { sets, saveSet, updateSet, isSaving } = useCompSets();
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [selectedSetId, setSelectedSetId] = useState<string>("");

  const [newSet, setNewSet] = useState({
    name: "",
    client: "",
    notes: "",
    isDefaultForAvm: false,
  });

  const handleSaveSet = async () => {
    if (!newSet.name.trim() || selectedIds.length === 0) return;

    await saveSet({
      name: newSet.name.trim(),
      client: newSet.client.trim() || undefined,
      notes: newSet.notes.trim() || undefined,
      comps: selectedIds,
      isDefaultForAvm: newSet.isDefaultForAvm,
    });

    setNewSet({ name: "", client: "", notes: "", isDefaultForAvm: false });
    setShowSaveDialog(false);
  };

  const handleLoadSet = (setId: string) => {
    setSelectedSetId(setId);
    onLoadSet?.(setId);
  };

  const handleMarkAsDefault = async (setId: string) => {
    const set = sets.find(s => s.id === setId);
    if (set) {
      await updateSet({ id: setId, updates: { isDefaultForAvm: true } });
      sets.filter(s => s.id !== setId).forEach(s => {
        if (s.isDefaultForAvm) {
          updateSet({ id: s.id, updates: { isDefaultForAvm: false } });
        }
      });
    }
  };

  const defaultSet = sets.find(s => s.isDefaultForAvm);

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Select value={selectedSetId} onValueChange={handleLoadSet}>
        <SelectTrigger className="w-48 h-8">
          <SelectValue placeholder="Cargar set guardado" />
        </SelectTrigger>
        <SelectContent>
          {sets.map(set => (
            <SelectItem key={set.id} value={set.id}>
              <div className="flex items-center justify-between w-full">
                <div>
                  <div className="font-medium">{set.name}</div>
                  {set.client && (
                    <div className="text-xs text-gray-500">{set.client}</div>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <Badge variant="secondary" className="text-xs">
                    {set.comps.length}
                  </Badge>
                  {set.isDefaultForAvm && (
                    <Star className="h-3 w-3 text-yellow-500" />
                  )}
                </div>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            disabled={selectedIds.length === 0}
            className="h-8"
          >
            <Bookmark className="h-3 w-3 mr-1" />
            Guardar Set
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Guardar Set de Comparables</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="setName">Nombre del set *</Label>
              <Input
                id="setName"
                placeholder="Ej: Cliente ABC - Zona Centro"
                value={newSet.name}
                onChange={(e) => setNewSet(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="setClient">Cliente (opcional)</Label>
              <Input
                id="setClient"
                placeholder="Nombre del cliente"
                value={newSet.client}
                onChange={(e) => setNewSet(prev => ({ ...prev, client: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="setNotes">Notas (opcional)</Label>
              <Textarea
                id="setNotes"
                placeholder="Descripción o notas sobre este set de comparables"
                value={newSet.notes}
                onChange={(e) => setNewSet(prev => ({ ...prev, notes: e.target.value }))}
                rows={3}
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isDefault"
                checked={newSet.isDefaultForAvm}
                onChange={(e) => setNewSet(prev => ({ ...prev, isDefaultForAvm: e.target.checked }))}
                className="rounded"
              />
              <Label htmlFor="isDefault">Marcar como set por defecto para AVM</Label>
            </div>

            <div className="bg-gray-50 p-3 rounded">
              <div className="text-sm text-gray-600">
                Se guardarán <Badge variant="secondary">{selectedIds.length}</Badge> comparables seleccionados
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowSaveDialog(false)}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSaveSet}
                disabled={!newSet.name.trim() || selectedIds.length === 0 || isSaving}
              >
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? "Guardando..." : "Guardar Set"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {defaultSet && (
        <div className="text-xs text-gray-500 flex items-center gap-1">
          <Star className="h-3 w-3 text-yellow-500" />
          Por defecto: {defaultSet.name}
        </div>
      )}
    </div>
  );
}