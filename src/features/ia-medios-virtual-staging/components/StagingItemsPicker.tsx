import React, { useState } from 'react';
import { Loader2, Package, Eye, X } from 'lucide-react';
import { useItemsQuery } from '../hooks';
import type { RoomType, StageItem } from '../types';

interface StagingItemsPickerProps {
  roomType: RoomType | null;
  selectedItems: string[];
  onItemsChange: (items: string[]) => void;
  disabled?: boolean;
  maxItems?: number;
}

export const StagingItemsPicker: React.FC<StagingItemsPickerProps> = ({
  roomType,
  selectedItems,
  onItemsChange,
  disabled = false,
  maxItems = 12,
}) => {
  const [previewItem, setPreviewItem] = useState<StageItem | null>(null);
  const { data: items, isLoading, error } = useItemsQuery(roomType!);

  const handleItemToggle = (itemId: string) => {
    if (selectedItems.includes(itemId)) {
      onItemsChange(selectedItems.filter(id => id !== itemId));
    } else if (selectedItems.length < maxItems) {
      onItemsChange([...selectedItems, itemId]);
    }
  };

  const selectAllSuggested = () => {
    if (!items) return;
    const suggested = items.slice(0, Math.min(6, maxItems));
    onItemsChange(suggested.map(item => item.id));
  };

  const clearSelection = () => {
    onItemsChange([]);
  };

  if (!roomType) {
    return (
      <div className="p-8 text-center text-gray-500">
        <Package className="w-12 h-12 mx-auto mb-2 text-gray-300" />
        <p>Selecciona primero el tipo de estancia</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        <span className="ml-2 text-gray-600">Cargando muebles...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-sm text-red-800">Error al cargar los muebles</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900">
            Muebles y decoración
          </h3>
          <p className="text-sm text-gray-600">
            Selecciona hasta {maxItems} elementos ({selectedItems.length}/{maxItems})
          </p>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={selectAllSuggested}
            disabled={disabled || !items?.length}
            className="text-sm px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 disabled:opacity-50"
          >
            Sugeridos
          </button>
          <button
            onClick={clearSelection}
            disabled={disabled || !selectedItems.length}
            className="text-sm px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50"
          >
            Limpiar
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {items?.map((item) => {
          const isSelected = selectedItems.includes(item.id);
          const canSelect = isSelected || selectedItems.length < maxItems;

          return (
            <div
              key={item.id}
              className={`
                relative p-3 rounded-lg border-2 transition-all
                ${isSelected
                  ? 'border-blue-500 bg-blue-50'
                  : canSelect
                  ? 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  : 'border-gray-100 bg-gray-50'
                }
                ${disabled || !canSelect ? 'cursor-not-allowed opacity-50' : ''}
              `}
            >
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => handleItemToggle(item.id)}
                  disabled={disabled || !canSelect}
                  className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-900 text-sm">
                      {item.name}
                    </h4>
                    
                    {item.preview && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          setPreviewItem(item);
                        }}
                        className="text-gray-400 hover:text-gray-600 p-1"
                        disabled={disabled}
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  
                  <p className="text-xs text-gray-600 capitalize">
                    {item.category}
                  </p>
                </div>
              </label>
            </div>
          );
        })}
      </div>

      {selectedItems.length >= maxItems && (
        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            Has alcanzado el límite máximo de {maxItems} elementos
          </p>
        </div>
      )}

      {/* Modal de vista previa */}
      {previewItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-lg w-full">
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">{previewItem.name}</h3>
                <button
                  onClick={() => setPreviewItem(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="p-4">
              <img
                src={previewItem.preview}
                alt={previewItem.name}
                className="w-full h-64 object-cover rounded-lg"
                onError={(e) => {
                  e.currentTarget.src = '/images/placeholder-item.jpg';
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};