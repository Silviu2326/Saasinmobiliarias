import { useState, useRef } from 'react';
import { CheckCircle, AlertCircle, Upload, X } from 'lucide-react';
import { useChecklists } from '../hooks';
import { calculateChecklistProgress } from '../utils';
import type { ChecklistItem } from '../types';

interface ChecklistPanelProps {
  operationType: 'venta' | 'alquiler';
  referenceId?: string;
}

export function ChecklistPanel({ operationType, referenceId }: ChecklistPanelProps) {
  const { items, save, isLoading } = useChecklists(operationType, referenceId);
  const [localItems, setLocalItems] = useState<ChecklistItem[]>([]);
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  const workingItems = localItems.length > 0 ? localItems : items || [];
  const progress = calculateChecklistProgress(workingItems);

  const handleToggle = (itemId: string) => {
    const updated = workingItems.map(item =>
      item.id === itemId ? { ...item, done: !item.done } : item
    );
    setLocalItems(updated);
  };

  const handleEvidenceUpload = (itemId: string, fileName: string) => {
    const updated = workingItems.map(item =>
      item.id === itemId ? { ...item, evidence: fileName, done: true } : item
    );
    setLocalItems(updated);
  };

  const handleNotesChange = (itemId: string, notes: string) => {
    const updated = workingItems.map(item =>
      item.id === itemId ? { ...item, notes } : item
    );
    setLocalItems(updated);
  };

  const handleSave = async () => {
    await save.mutateAsync(workingItems);
    setLocalItems([]);
  };

  const groupedItems = workingItems.reduce((acc, item) => {
    const category = item.category || 'General';
    if (!acc[category]) acc[category] = [];
    acc[category].push(item);
    return acc;
  }, {} as Record<string, ChecklistItem[]>);

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          <div className="h-2 bg-gray-200 rounded"></div>
          <div className="space-y-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-12 bg-gray-100 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">
            Checklist de {operationType === 'venta' ? 'Venta' : 'Alquiler'}
          </h3>
          {progress.hasBlockers && (
            <span className="flex items-center gap-1 text-red-600 text-sm">
              <AlertCircle className="h-4 w-4" />
              Hay bloqueadores
            </span>
          )}
        </div>

        <div className="mb-4">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
            <span>Progreso</span>
            <span>{progress.completed} de {progress.total}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${
                progress.percentage === 100
                  ? 'bg-green-500'
                  : progress.percentage > 60
                  ? 'bg-blue-500'
                  : 'bg-yellow-500'
              }`}
              style={{ width: `${progress.percentage}%` }}
            />
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {Object.entries(groupedItems).map(([category, categoryItems]) => (
          <div key={category}>
            <h4 className="font-medium text-gray-700 mb-3">{category}</h4>
            <div className="space-y-3">
              {categoryItems.map(item => (
                <div
                  key={item.id}
                  className={`border rounded-lg p-4 ${
                    item.blocker && !item.done
                      ? 'border-red-300 bg-red-50'
                      : item.done
                      ? 'border-green-300 bg-green-50'
                      : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={item.done}
                      onChange={() => handleToggle(item.id)}
                      className="mt-1 h-4 w-4 text-blue-600 rounded"
                    />
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <label className={`${item.done ? 'line-through text-gray-500' : ''}`}>
                          {item.label}
                        </label>
                        {item.required && (
                          <span className="text-xs px-2 py-0.5 bg-red-100 text-red-700 rounded">
                            Obligatorio
                          </span>
                        )}
                        {item.blocker && (
                          <span className="text-xs px-2 py-0.5 bg-orange-100 text-orange-700 rounded">
                            Bloqueador
                          </span>
                        )}
                      </div>

                      {item.evidence && (
                        <div className="mt-2 flex items-center gap-2 text-sm text-green-600">
                          <CheckCircle className="h-4 w-4" />
                          <span>Evidencia: {item.evidence}</span>
                        </div>
                      )}

                      <div className="mt-2 flex items-center gap-2">
                        <input
                          ref={el => fileInputRefs.current[item.id] = el}
                          type="file"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              handleEvidenceUpload(item.id, file.name);
                            }
                          }}
                        />
                        <button
                          onClick={() => fileInputRefs.current[item.id]?.click()}
                          className="flex items-center gap-1 px-2 py-1 text-xs border rounded hover:bg-gray-50"
                        >
                          <Upload className="h-3 w-3" />
                          Subir evidencia
                        </button>
                        
                        <input
                          type="text"
                          placeholder="Notas..."
                          value={item.notes || ''}
                          onChange={(e) => handleNotesChange(item.id, e.target.value)}
                          className="flex-1 px-2 py-1 text-sm border rounded"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="p-6 border-t bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            {progress.percentage === 100 ? (
              <span className="text-green-600 font-medium">
                ✓ Checklist completado
              </span>
            ) : (
              <span>
                Completa todos los items obligatorios para continuar
              </span>
            )}
          </div>
          <button
            onClick={handleSave}
            disabled={save.isPending}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {save.isPending ? 'Guardando...' : 'Guardar progreso'}
          </button>
        </div>
      </div>
    </div>
  );
}