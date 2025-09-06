import { FileText, Image, Download, Eye } from 'lucide-react';
import { useState } from 'react';
import { useEvidence } from '../hooks';
import { formatFileSize } from '../utils';

interface EvidenceViewerProps {
  eventId: string;
  filename: string;
}

export function EvidenceViewer({ eventId, filename }: EvidenceViewerProps) {
  const { evidence, isLoading } = useEvidence(eventId, filename);
  const [showContent, setShowContent] = useState(false);

  if (isLoading) {
    return (
      <div className="animate-pulse flex items-center space-x-4">
        <div className="rounded-md bg-gray-300 h-10 w-10"></div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-300 rounded w-32"></div>
          <div className="h-3 bg-gray-300 rounded w-20"></div>
        </div>
      </div>
    );
  }

  if (!evidence) {
    return (
      <div className="flex items-center space-x-3 p-3 border border-red-200 rounded-lg bg-red-50">
        <FileText className="h-5 w-5 text-red-500" />
        <div>
          <p className="text-sm font-medium text-red-900">Error al cargar evidencia</p>
          <p className="text-xs text-red-700">{filename}</p>
        </div>
      </div>
    );
  }

  const getIcon = () => {
    switch (evidence.type) {
      case 'image':
        return <Image className="h-5 w-5 text-blue-500" />;
      case 'json':
        return <FileText className="h-5 w-5 text-green-500" />;
      default:
        return <FileText className="h-5 w-5 text-gray-500" />;
    }
  };

  const handleDownload = () => {
    if (evidence.url) {
      window.open(evidence.url, '_blank');
    }
  };

  return (
    <div className="border rounded-lg p-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {getIcon()}
          <div>
            <p className="text-sm font-medium">{evidence.filename}</p>
            <p className="text-xs text-gray-500">
              {formatFileSize(evidence.size)} • {evidence.type}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {evidence.content && (
            <button
              onClick={() => setShowContent(!showContent)}
              className="p-1 text-gray-500 hover:text-gray-700"
              title="Ver contenido"
            >
              <Eye className="h-4 w-4" />
            </button>
          )}
          {evidence.url && (
            <button
              onClick={handleDownload}
              className="p-1 text-gray-500 hover:text-gray-700"
              title="Descargar"
            >
              <Download className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Contenido expandible */}
      {showContent && evidence.content && (
        <div className="mt-3 pt-3 border-t">
          <div className="bg-gray-50 p-3 rounded text-xs font-mono overflow-x-auto max-h-40">
            {evidence.type === 'json' ? (
              <pre>{JSON.stringify(JSON.parse(evidence.content), null, 2)}</pre>
            ) : (
              <pre>{evidence.content}</pre>
            )}
          </div>
        </div>
      )}

      {/* Vista previa de imagen */}
      {evidence.type === 'image' && evidence.url && showContent && (
        <div className="mt-3 pt-3 border-t">
          <img
            src={evidence.url}
            alt={evidence.filename}
            className="max-w-full max-h-48 object-contain rounded"
          />
        </div>
      )}

      {/* Información de integridad */}
      {evidence.hash && (
        <div className="mt-2 text-xs text-gray-500">
          Hash: <code className="bg-gray-100 px-1 rounded">{evidence.hash.substring(0, 16)}...</code>
        </div>
      )}
    </div>
  );
}