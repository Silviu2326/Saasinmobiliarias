import React, { useState } from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  Power, 
  Settings, 
  Trash2, 
  Copy, 
  Eye,
  TestTube,
  MoreVertical
} from 'lucide-react';
import { Pixel, pixelService } from '../services/pixelService';

interface PixelStatusCardProps {
  pixel: Pixel;
  onSelect: (pixel: Pixel) => void;
  onEdit: (pixel: Pixel) => void;
  onDelete: (pixelId: string) => void;
  onToggleStatus: (pixelId: string, isActive: boolean) => void;
  isSelected?: boolean;
}

export const PixelStatusCard: React.FC<PixelStatusCardProps> = ({
  pixel,
  onSelect,
  onEdit,
  onDelete,
  onToggleStatus,
  isSelected = false
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [copiedSnippet, setCopiedSnippet] = useState(false);

  const platformInfo = pixelService.getPlatformInfo(pixel.platform);

  const getStatusIcon = () => {
    switch (pixel.status) {
      case 'active':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'error':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'inactive':
      default:
        return <Power className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusText = () => {
    switch (pixel.status) {
      case 'active':
        return 'Activo';
      case 'error':
        return 'Error';
      case 'inactive':
      default:
        return 'Inactivo';
    }
  };

  const getStatusColor = () => {
    switch (pixel.status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      case 'inactive':
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const handleCopySnippet = async () => {
    try {
      await navigator.clipboard.writeText(pixel.snippet);
      setCopiedSnippet(true);
      setTimeout(() => setCopiedSnippet(false), 2000);
    } catch (err) {
      console.error('Failed to copy snippet:', err);
    }
  };

  const formatLastEvent = () => {
    if (!pixel.lastEventAt) return 'Sin eventos';
    
    const date = new Date(pixel.lastEventAt);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Hace menos de 1 minuto';
    if (diffMins < 60) return `Hace ${diffMins} minutos`;
    if (diffHours < 24) return `Hace ${diffHours} horas`;
    if (diffDays < 7) return `Hace ${diffDays} días`;
    return date.toLocaleDateString();
  };

  return (
    <div 
      className={`relative bg-white rounded-lg border-2 transition-all duration-200 hover:shadow-md cursor-pointer ${
        isSelected 
          ? 'border-blue-500 shadow-md' 
          : 'border-gray-200 hover:border-gray-300'
      }`}
      onClick={() => onSelect(pixel)}
    >
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="text-2xl">{platformInfo.icon}</div>
            <div>
              <h3 className="font-semibold text-gray-900 text-sm">{pixel.name}</h3>
              <p className="text-xs text-gray-500">{platformInfo.name}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMenu(!showMenu);
                }}
                className="p-1 text-gray-400 hover:text-gray-600 rounded"
              >
                <MoreVertical className="w-4 h-4" />
              </button>
              
              {showMenu && (
                <>
                  <div 
                    className="fixed inset-0 z-10"
                    onClick={() => setShowMenu(false)}
                  />
                  <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(pixel);
                        setShowMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                    >
                      <Settings className="w-4 h-4" />
                      Configurar
                    </button>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopySnippet();
                        setShowMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                    >
                      <Copy className="w-4 h-4" />
                      {copiedSnippet ? 'Copiado!' : 'Copiar código'}
                    </button>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleStatus(pixel.id, !pixel.isActive);
                        setShowMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                    >
                      <Power className="w-4 h-4" />
                      {pixel.isActive ? 'Desactivar' : 'Activar'}
                    </button>
                    
                    <hr className="my-1" />
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(pixel.id);
                        setShowMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Eliminar
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Pixel ID */}
        <div className="mb-3">
          <p className="text-xs text-gray-500 mb-1">ID del Píxel</p>
          <p className="text-sm font-mono text-gray-700 bg-gray-50 px-2 py-1 rounded text-xs">
            {pixel.pixelId}
          </p>
        </div>

        {/* Status Badge */}
        <div className="flex items-center justify-between mb-3">
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor()}`}>
            {getStatusText()}
          </span>
          {pixel.isActive && (
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-xs text-green-600">En línea</span>
            </div>
          )}
        </div>

        {/* Last Event */}
        <div className="text-xs text-gray-500">
          <span className="font-medium">Último evento:</span> {formatLastEvent()}
        </div>
      </div>

      {/* Selected Indicator */}
      {isSelected && (
        <div className="absolute top-2 left-2">
          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
        </div>
      )}

      {/* Quick Actions Bar */}
      {isSelected && (
        <div className="border-t border-gray-200 px-4 py-2 bg-gray-50 rounded-b-lg">
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSelect(pixel);
              }}
              className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700"
            >
              <Eye className="w-3 h-3" />
              Ver detalles
            </button>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleCopySnippet();
              }}
              className="flex items-center gap-1 text-xs text-gray-600 hover:text-gray-700"
            >
              <Copy className="w-3 h-3" />
              {copiedSnippet ? 'Copiado!' : 'Copiar'}
            </button>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                // This would trigger connection test in parent
              }}
              className="flex items-center gap-1 text-xs text-gray-600 hover:text-gray-700"
            >
              <TestTube className="w-3 h-3" />
              Probar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};