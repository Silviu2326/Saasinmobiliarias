import React, { useState, useRef, useCallback } from 'react';
import type { RoomType } from '../types';
import { validateImageFile, validateImageUrl, ALLOWED_EXTENSIONS, MAX_FILE_SIZE } from '../schema';
import { formatFileSize, getRoomTypeLabel } from '../utils';

interface PhotoCoachUploaderProps {
  onFileSelect: (file: File, roomType?: RoomType) => void;
  onUrlSubmit: (url: string, roomType?: RoomType) => void;
  disabled?: boolean;
  mode?: 'single' | 'batch';
  onBatchSelect?: (files: File[], roomType?: RoomType) => void;
}

export default function PhotoCoachUploader({ 
  onFileSelect, 
  onUrlSubmit,
  onBatchSelect,
  disabled = false,
  mode = 'single'
}: PhotoCoachUploaderProps) {
  const [dragActive, setDragActive] = useState(false);
  const [inputMode, setInputMode] = useState<'file' | 'url'>('file');
  const [imageUrl, setImageUrl] = useState('');
  const [roomType, setRoomType] = useState<RoomType | ''>('');
  const [errors, setErrors] = useState<string[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    setErrors([]);

    if (disabled) return;

    const files = Array.from(e.dataTransfer.files);
    
    if (mode === 'batch' && onBatchSelect) {
      const imageFiles = files.filter(file => file.type.startsWith('image/'));
      if (imageFiles.length === 0) {
        setErrors(['No se encontraron archivos de imagen válidos']);
        return;
      }
      
      const validationErrors: string[] = [];
      imageFiles.forEach((file, index) => {
        const validation = validateImageFile(file);
        if (!validation.valid) {
          validationErrors.push(`Archivo ${index + 1}: ${validation.errors.join(', ')}`);
        }
      });

      if (validationErrors.length > 0) {
        setErrors(validationErrors);
        return;
      }

      onBatchSelect(imageFiles, roomType as RoomType || undefined);
    } else if (files.length > 0) {
      const file = files[0];
      const validation = validateImageFile(file);
      
      if (!validation.valid) {
        setErrors(validation.errors);
        return;
      }
      
      onFileSelect(file, roomType as RoomType || undefined);
    }
  }, [disabled, mode, onFileSelect, onBatchSelect, roomType]);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrors([]);
    const files = Array.from(e.target.files || []);
    
    if (files.length === 0) return;

    if (mode === 'batch' && onBatchSelect) {
      const validationErrors: string[] = [];
      files.forEach((file, index) => {
        const validation = validateImageFile(file);
        if (!validation.valid) {
          validationErrors.push(`Archivo ${index + 1}: ${validation.errors.join(', ')}`);
        }
      });

      if (validationErrors.length > 0) {
        setErrors(validationErrors);
        return;
      }

      onBatchSelect(files, roomType as RoomType || undefined);
    } else {
      const file = files[0];
      const validation = validateImageFile(file);
      
      if (!validation.valid) {
        setErrors(validation.errors);
        return;
      }
      
      onFileSelect(file, roomType as RoomType || undefined);
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]);

    const validation = validateImageUrl(imageUrl);
    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }

    onUrlSubmit(imageUrl, roomType as RoomType || undefined);
    setImageUrl('');
  };

  const openFileDialog = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  const roomTypes: RoomType[] = ['salon', 'cocina', 'dormitorio', 'bano', 'terraza', 'otro'];

  return (
    <div className="space-y-4">
      {/* Room Type Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tipo de habitación (opcional)
        </label>
        <select
          value={roomType}
          onChange={(e) => setRoomType(e.target.value as RoomType)}
          disabled={disabled}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        >
          <option value="">Seleccionar tipo...</option>
          {roomTypes.map(type => (
            <option key={type} value={type}>
              {getRoomTypeLabel(type)}
            </option>
          ))}
        </select>
      </div>

      {/* Input Mode Toggle */}
      <div className="flex rounded-lg border border-gray-300 overflow-hidden">
        <button
          type="button"
          onClick={() => setInputMode('file')}
          disabled={disabled}
          className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
            inputMode === 'file'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
          } disabled:opacity-50`}
        >
          📁 Subir archivo{mode === 'batch' ? 's' : ''}
        </button>
        <button
          type="button"
          onClick={() => setInputMode('url')}
          disabled={disabled || mode === 'batch'}
          className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
            inputMode === 'url'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
          } disabled:opacity-50`}
        >
          🔗 Desde URL
        </button>
      </div>

      {/* File Upload Area */}
      {inputMode === 'file' && (
        <div
          className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={openFileDialog}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple={mode === 'batch'}
            accept={ALLOWED_EXTENSIONS.map(ext => `.${ext}`).join(',')}
            onChange={handleFileInputChange}
            disabled={disabled}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
          />
          
          <div className="space-y-3">
            <div className="text-4xl">
              {dragActive ? '📥' : '📸'}
            </div>
            <div>
              <p className="text-lg font-medium text-gray-900">
                {dragActive 
                  ? `Suelta ${mode === 'batch' ? 'los archivos' : 'el archivo'} aquí`
                  : `Arrastra ${mode === 'batch' ? 'las fotos' : 'la foto'} aquí o haz clic para seleccionar`
                }
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Formatos: {ALLOWED_EXTENSIONS.join(', ').toUpperCase()} • Máximo: {formatFileSize(MAX_FILE_SIZE)}
                {mode === 'batch' && ' • Hasta 20 archivos'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* URL Input */}
      {inputMode === 'url' && mode !== 'batch' && (
        <form onSubmit={handleUrlSubmit} className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              URL de la imagen
            </label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              disabled={disabled}
              placeholder="https://ejemplo.com/imagen.jpg"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            />
          </div>
          <button
            type="submit"
            disabled={disabled || !imageUrl.trim()}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            🔍 Analizar imagen desde URL
          </button>
        </form>
      )}

      {/* Error Messages */}
      {errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-red-600 mt-0.5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-red-800">
                Error{errors.length > 1 ? 'es' : ''} de validación
              </h3>
              <ul className="mt-1 text-sm text-red-700 space-y-1">
                {errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Help Text */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <svg className="w-5 h-5 text-blue-600 mt-0.5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Consejos para mejores resultados:</p>
            <ul className="space-y-1 text-blue-700">
              <li>• Usa la máxima resolución disponible en tu cámara</li>
              <li>• Asegúrate de que la imagen esté bien iluminada</li>
              <li>• Evita fotos borrosas o con mucho ruido</li>
              {roomType && <li>• Especificar el tipo de habitación mejora la precisión del análisis</li>}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}