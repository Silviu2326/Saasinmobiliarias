import React, { useState, useCallback, useRef } from 'react';
import { Upload, Link, X } from 'lucide-react';
import { validateImageFile, formatFileSize } from '../utils';

interface StagingUploaderProps {
  onFileSelect: (file: File) => void;
  onUrlSelect: (url: string) => void;
  initialUrl?: string;
  disabled?: boolean;
}

export const StagingUploader: React.FC<StagingUploaderProps> = ({
  onFileSelect,
  onUrlSelect,
  initialUrl,
  disabled = false,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState(initialUrl || '');
  const [urlMode, setUrlMode] = useState(!!initialUrl);
  const [error, setError] = useState<string>('');
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback((file: File) => {
    const validation = validateImageFile(file);
    if (!validation.valid) {
      setError(validation.error || 'Archivo no válido');
      return;
    }

    setError('');
    setSelectedFile(file);
    setUrlMode(false);
    setImageUrl('');
    onFileSelect(file);
  }, [onFileSelect]);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled && !urlMode) {
      setIsDragActive(true);
    }
  }, [disabled, urlMode]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (disabled || urlMode) return;

    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find(file => file.type.startsWith('image/'));
    
    if (imageFile) {
      handleFileSelect(imageFile);
    }
  }, [disabled, urlMode, handleFileSelect]);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  const handleDropAreaClick = useCallback(() => {
    if (!disabled && !urlMode) {
      fileInputRef.current?.click();
    }
  }, [disabled, urlMode]);

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUrl.trim()) {
      setError('Introduce una URL válida');
      return;
    }

    try {
      new URL(imageUrl);
      setError('');
      setSelectedFile(null);
      onUrlSelect(imageUrl);
    } catch {
      setError('URL no válida');
    }
  };

  const clearSelection = () => {
    setSelectedFile(null);
    setImageUrl('');
    setUrlMode(false);
    setError('');
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2 mb-4">
        <button
          type="button"
          onClick={() => setUrlMode(false)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            !urlMode 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
          disabled={disabled}
        >
          <Upload className="w-4 h-4 inline mr-2" />
          Subir archivo
        </button>
        <button
          type="button"
          onClick={() => setUrlMode(true)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            urlMode 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
          disabled={disabled}
        >
          <Link className="w-4 h-4 inline mr-2" />
          URL de imagen
        </button>
      </div>

      {!urlMode ? (
        <div
          onClick={handleDropAreaClick}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className={`
            border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
            ${isDragActive 
              ? 'border-blue-500 bg-blue-50' 
              : selectedFile 
              ? 'border-green-500 bg-green-50' 
              : 'border-gray-300 hover:border-gray-400'
            }
            ${disabled ? 'cursor-not-allowed opacity-50' : ''}
          `}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={handleFileInputChange}
            className="hidden"
            disabled={disabled}
          />
          
          {selectedFile ? (
            <div className="space-y-2">
              <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                <Upload className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">{selectedFile.name}</p>
                <p className="text-sm text-gray-500">{formatFileSize(selectedFile.size)}</p>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  clearSelection();
                }}
                className="text-red-600 hover:text-red-700 text-sm"
                disabled={disabled}
              >
                <X className="w-4 h-4 inline mr-1" />
                Quitar
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
                <Upload className="w-8 h-8 text-gray-400" />
              </div>
              <div>
                <p className="text-lg font-medium text-gray-900">
                  {isDragActive ? 'Suelta la imagen aquí' : 'Arrastra una imagen o haz clic'}
                </p>
                <p className="text-sm text-gray-500">
                  JPG, PNG o WebP hasta 10MB
                </p>
              </div>
            </div>
          )}
        </div>
      ) : (
        <form onSubmit={handleUrlSubmit} className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              URL de la imagen
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://ejemplo.com/imagen.jpg"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={disabled}
              />
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                disabled={disabled || !imageUrl.trim()}
              >
                Usar URL
              </button>
            </div>
          </div>
          
          {imageUrl && (
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <span className="text-sm text-green-800 truncate">{imageUrl}</span>
              <button
                type="button"
                onClick={clearSelection}
                className="text-red-600 hover:text-red-700 ml-2"
                disabled={disabled}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </form>
      )}

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}
    </div>
  );
};