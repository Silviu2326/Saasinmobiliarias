import React, { useState } from 'react';
import { Brain, Check } from 'lucide-react';
import { useRoomTypeDetection } from '../hooks';
import { getRoomTypeLabel } from '../utils';
import type { RoomType } from '../types';

interface RoomTypeDetectorProps {
  selectedRoomType: RoomType | null;
  onRoomTypeSelect: (roomType: RoomType) => void;
  imageInput?: File | string;
  disabled?: boolean;
}

const roomTypeOptions: RoomType[] = ['salon', 'cocina', 'dormitorio', 'bano', 'terraza', 'otro'];

export const RoomTypeDetector: React.FC<RoomTypeDetectorProps> = ({
  selectedRoomType,
  onRoomTypeSelect,
  imageInput,
  disabled = false,
}) => {
  const [isDetecting, setIsDetecting] = useState(false);
  const detectRoomType = useRoomTypeDetection();

  const handleDetectRoom = async () => {
    if (!imageInput) return;
    
    setIsDetecting(true);
    try {
      const result = await detectRoomType.mutateAsync(imageInput);
      onRoomTypeSelect(result.roomType);
    } catch (error) {
      console.error('Error detecting room type:', error);
    } finally {
      setIsDetecting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">
          Tipo de estancia
        </h3>
        
        {imageInput && (
          <button
            onClick={handleDetectRoom}
            disabled={disabled || isDetecting}
            className="flex items-center gap-2 px-3 py-1.5 text-sm bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Brain className={`w-4 h-4 ${isDetecting ? 'animate-pulse' : ''}`} />
            {isDetecting ? 'Detectando...' : 'Detectar automáticamente'}
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {roomTypeOptions.map((roomType) => (
          <button
            key={roomType}
            onClick={() => onRoomTypeSelect(roomType)}
            disabled={disabled}
            className={`
              relative p-4 rounded-lg border-2 text-left transition-all
              ${selectedRoomType === roomType
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }
              ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
            `}
          >
            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-900">
                {getRoomTypeLabel(roomType)}
              </span>
              {selectedRoomType === roomType && (
                <Check className="w-5 h-5 text-blue-600" />
              )}
            </div>
            
            <div className="mt-2 text-sm text-gray-600">
              {getRoomDescription(roomType)}
            </div>
          </button>
        ))}
      </div>

      {detectRoomType.error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">
            Error al detectar el tipo de estancia. Selecciona manualmente.
          </p>
        </div>
      )}
    </div>
  );
};

const getRoomDescription = (roomType: RoomType): string => {
  const descriptions = {
    'salon': 'Sala de estar, salón principal',
    'cocina': 'Cocina, office, comedor',
    'dormitorio': 'Habitación, dormitorio principal',
    'bano': 'Baño, aseo, lavabo',
    'terraza': 'Terraza, balcón, patio',
    'otro': 'Otros espacios'
  };
  
  return descriptions[roomType];
};