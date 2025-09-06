import React from 'react';
import { Download, ExternalLink, Copy, X } from 'lucide-react';
import { downloadImage, getRoomTypeLabel } from '../utils';
import type { StageJob } from '../types';

interface StagingResultViewerProps {
  job: StageJob;
  onClose: () => void;
}

export const StagingResultViewer: React.FC<StagingResultViewerProps> = ({
  job,
  onClose,
}) => {
  const handleDownload = async () => {
    if (!job.resultUrl) return;
    
    try {
      const filename = `staging_${job.roomType}_${job.style}_${new Date(job.createdAt).getTime()}.jpg`;
      await downloadImage(job.resultUrl, filename);
    } catch (error) {
      console.error('Error downloading:', error);
    }
  };

  const handleDuplicate = () => {
    const params = new URLSearchParams({
      photoUrl: job.inputUrl,
      roomType: job.roomType,
      style: job.style,
    });
    
    window.open(`/ia-medios/virtual-staging?${params}`, '_blank');
  };

  const handleOpenGallery = () => {
    alert('Funcionalidad de galería del inmueble - Por implementar');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Resultado del Virtual Staging
            </h2>
            <p className="text-sm text-gray-600">
              {getRoomTypeLabel(job.roomType)} • Estilo {job.style} • {job.resolution}
            </p>
          </div>
          
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Comparación antes/después */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {/* Imagen original */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">
                Imagen original
              </h3>
              <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                <img
                  src={job.inputUrl}
                  alt="Original"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = '/images/placeholder.jpg';
                  }}
                />
              </div>
            </div>

            {/* Resultado */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">
                Con Virtual Staging
              </h3>
              <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                {job.resultUrl ? (
                  <img
                    src={job.resultUrl}
                    alt="Resultado"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = '/images/placeholder-result.jpg';
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-500">
                    Sin resultado disponible
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Detalles del trabajo */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h4 className="font-medium text-gray-900 mb-2">Detalles</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-600">ID:</span>
                <div className="font-mono">{job.id.substring(0, 12)}...</div>
              </div>
              <div>
                <span className="text-gray-600">Resolución:</span>
                <div className="font-medium">{job.resolution.toUpperCase()}</div>
              </div>
              <div>
                <span className="text-gray-600">Elementos:</span>
                <div className="font-medium">{job.items.length}</div>
              </div>
              <div>
                <span className="text-gray-600">Coste:</span>
                <div className="font-medium">{job.cost || 0} créditos</div>
              </div>
            </div>
          </div>

          {/* Acciones */}
          <div className="flex flex-wrap gap-3">
            {job.resultUrl && (
              <button
                onClick={handleDownload}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                Descargar imagen
              </button>
            )}

            <button
              onClick={handleDuplicate}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Copy className="w-4 h-4" />
              Probar otro estilo
            </button>

            <button
              onClick={handleOpenGallery}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              Abrir galería del inmueble
            </button>
          </div>

          {/* Información adicional */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">
              💡 Consejos para mejores resultados
            </h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Usa imágenes con buena iluminación natural</li>
              <li>• Evita espacios muy abarrotados en la imagen original</li>
              <li>• Los estilos mediterráneo y clásico funcionan mejor en espacios amplios</li>
              <li>• Para dormitorios, selecciona pocos elementos para un resultado más limpio</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};