import React from 'react';
import { Check, Loader2 } from 'lucide-react';
import { useStylesQuery } from '../hooks';
import type { StageStyle } from '../types';

interface StagingStylesPickerProps {
  selectedStyle: StageStyle['id'] | null;
  onStyleSelect: (style: StageStyle['id']) => void;
  disabled?: boolean;
}

export const StagingStylesPicker: React.FC<StagingStylesPickerProps> = ({
  selectedStyle,
  onStyleSelect,
  disabled = false,
}) => {
  const { data: styles, isLoading, error } = useStylesQuery();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        <span className="ml-2 text-gray-600">Cargando estilos...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-sm text-red-800">Error al cargar los estilos</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900">
        Estilo de decoración
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {styles?.map((style) => (
          <button
            key={style.id}
            onClick={() => onStyleSelect(style.id)}
            disabled={disabled}
            className={`
              relative group rounded-lg overflow-hidden border-2 transition-all
              ${selectedStyle === style.id
                ? 'border-blue-500 shadow-md'
                : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
              }
              ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
            `}
          >
            {/* Imagen miniatura */}
            <div className="aspect-video bg-gray-100 relative overflow-hidden">
              <img
                src={style.thumb}
                alt={style.name}
                className="w-full h-full object-cover transition-transform group-hover:scale-105"
                onError={(e) => {
                  e.currentTarget.src = '/images/placeholder-style.jpg';
                }}
              />
              
              {selectedStyle === style.id && (
                <div className="absolute top-2 right-2 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                  <Check className="w-4 h-4 text-white" />
                </div>
              )}
            </div>

            {/* Información del estilo */}
            <div className="p-4 text-left">
              <h4 className="font-medium text-gray-900 mb-1">
                {style.name}
              </h4>
              <p className="text-sm text-gray-600 line-clamp-2">
                {style.description}
              </p>
            </div>
          </button>
        ))}
      </div>

      {selectedStyle && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-2">
            <Check className="w-5 h-5 text-blue-600" />
            <span className="font-medium text-blue-900">
              Estilo seleccionado: {styles?.find(s => s.id === selectedStyle)?.name}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};