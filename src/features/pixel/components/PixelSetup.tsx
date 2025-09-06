import React, { useState } from 'react';
import { X, Plus, Save, AlertCircle, CheckCircle } from 'lucide-react';
import { CreatePixelRequest, UpdatePixelRequest, Pixel, pixelService } from '../services/pixelService';

interface PixelSetupProps {
  pixel?: Pixel | null;
  onSave: (data: CreatePixelRequest | UpdatePixelRequest) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export const PixelSetup: React.FC<PixelSetupProps> = ({
  pixel,
  onSave,
  onCancel,
  isLoading = false
}) => {
  const isEditing = !!pixel;
  
  const [formData, setFormData] = useState({
    name: pixel?.name || '',
    platform: pixel?.platform || 'meta' as const,
    pixelId: pixel?.pixelId || '',
    isActive: pixel?.isActive ?? true
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPreview, setShowPreview] = useState(false);

  const platforms = [
    { value: 'meta', label: 'Meta (Facebook)', icon: '📘', description: 'Facebook Pixel para tracking de conversiones' },
    { value: 'google', label: 'Google Ads', icon: '🔍', description: 'Google Ads Conversion Tracking' },
    { value: 'tiktok', label: 'TikTok', icon: '🎵', description: 'TikTok Pixel para remarketing' },
    { value: 'linkedin', label: 'LinkedIn', icon: '💼', description: 'LinkedIn Insight Tag' },
    { value: 'twitter', label: 'Twitter (X)', icon: '🐦', description: 'Twitter Universal Website Tag' },
    { value: 'pinterest', label: 'Pinterest', icon: '📌', description: 'Pinterest Tag para conversiones' }
  ] as const;

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    } else if (formData.name.length < 3) {
      newErrors.name = 'El nombre debe tener al menos 3 caracteres';
    }

    if (!formData.pixelId.trim()) {
      newErrors.pixelId = 'El ID del píxel es requerido';
    } else {
      // Platform-specific validation
      switch (formData.platform) {
        case 'meta':
          if (!/^\d{15,16}$/.test(formData.pixelId)) {
            newErrors.pixelId = 'El ID de Meta Pixel debe tener 15-16 dígitos';
          }
          break;
        case 'google':
          if (!/^AW-\d{8,12}$/.test(formData.pixelId)) {
            newErrors.pixelId = 'El ID de Google Ads debe tener formato AW-XXXXXXXXXX';
          }
          break;
        case 'tiktok':
          if (!/^[A-Z0-9]{16}$/.test(formData.pixelId)) {
            newErrors.pixelId = 'El ID de TikTok Pixel debe tener 16 caracteres alfanuméricos';
          }
          break;
        case 'linkedin':
          if (!/^\d{6,8}$/.test(formData.pixelId)) {
            newErrors.pixelId = 'El ID de LinkedIn debe tener 6-8 dígitos';
          }
          break;
        case 'twitter':
          if (!/^o-[a-z0-9]{8}$/.test(formData.pixelId)) {
            newErrors.pixelId = 'El ID de Twitter debe tener formato o-xxxxxxxx';
          }
          break;
        case 'pinterest':
          if (!/^\d{13}$/.test(formData.pixelId)) {
            newErrors.pixelId = 'El ID de Pinterest debe tener 13 dígitos';
          }
          break;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await onSave(formData);
    } catch (error) {
      console.error('Error saving pixel:', error);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const generatePreviewSnippet = () => {
    return pixelService['generateSnippet'](formData.platform, formData.pixelId);
  };

  const getPixelIdPlaceholder = () => {
    switch (formData.platform) {
      case 'meta': return '123456789012345';
      case 'google': return 'AW-123456789';
      case 'tiktok': return 'ABCD1234EFGH5678';
      case 'linkedin': return '123456';
      case 'twitter': return 'o-12345678';
      case 'pinterest': return '1234567890123';
      default: return '';
    }
  };

  const selectedPlatform = platforms.find(p => p.value === formData.platform);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {isEditing ? 'Editar Píxel' : 'Nuevo Píxel'}
          </h2>
          <button
            onClick={onCancel}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
            disabled={isLoading}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Name Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre del Píxel *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="ej. Meta Pixel Principal"
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.name ? 'border-red-300' : 'border-gray-300'
              }`}
              disabled={isLoading}
            />
            {errors.name && (
              <div className="mt-1 flex items-center gap-1 text-sm text-red-600">
                <AlertCircle className="w-4 h-4" />
                {errors.name}
              </div>
            )}
          </div>

          {/* Platform Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Plataforma *
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {platforms.map((platform) => (
                <label
                  key={platform.value}
                  className={`relative flex items-start p-4 border rounded-lg cursor-pointer transition-colors ${
                    formData.platform === platform.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="platform"
                    value={platform.value}
                    checked={formData.platform === platform.value}
                    onChange={(e) => handleInputChange('platform', e.target.value)}
                    className="sr-only"
                    disabled={isLoading}
                  />
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{platform.icon}</span>
                    <div>
                      <div className="font-medium text-gray-900">{platform.label}</div>
                      <div className="text-sm text-gray-500">{platform.description}</div>
                    </div>
                  </div>
                  {formData.platform === platform.value && (
                    <CheckCircle className="absolute top-2 right-2 w-5 h-5 text-blue-500" />
                  )}
                </label>
              ))}
            </div>
          </div>

          {/* Pixel ID Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ID del Píxel *
            </label>
            {selectedPlatform && (
              <div className="mb-2 p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2 text-sm text-blue-700">
                  <span className="text-lg">{selectedPlatform.icon}</span>
                  <span className="font-medium">{selectedPlatform.label}</span>
                </div>
                <p className="text-xs text-blue-600 mt-1">
                  Formato esperado: {getPixelIdPlaceholder()}
                </p>
              </div>
            )}
            <input
              type="text"
              value={formData.pixelId}
              onChange={(e) => handleInputChange('pixelId', e.target.value)}
              placeholder={getPixelIdPlaceholder()}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono ${
                errors.pixelId ? 'border-red-300' : 'border-gray-300'
              }`}
              disabled={isLoading}
            />
            {errors.pixelId && (
              <div className="mt-1 flex items-center gap-1 text-sm text-red-600">
                <AlertCircle className="w-4 h-4" />
                {errors.pixelId}
              </div>
            )}
          </div>

          {/* Status Toggle */}
          <div>
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => handleInputChange('isActive', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                disabled={isLoading}
              />
              <div>
                <span className="text-sm font-medium text-gray-700">
                  Activar píxel inmediatamente
                </span>
                <p className="text-xs text-gray-500">
                  El píxel comenzará a recibir eventos tan pronto como se instale el código
                </p>
              </div>
            </label>
          </div>

          {/* Code Preview */}
          {formData.pixelId && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700">
                  Vista previa del código
                </label>
                <button
                  type="button"
                  onClick={() => setShowPreview(!showPreview)}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  {showPreview ? 'Ocultar' : 'Mostrar'} código
                </button>
              </div>
              
              {showPreview && (
                <div className="bg-gray-900 text-gray-100 p-4 rounded-lg text-xs font-mono overflow-x-auto">
                  <pre>{generatePreviewSnippet()}</pre>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              disabled={isLoading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading || Object.keys(errors).length > 0}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  {isEditing ? 'Actualizar' : 'Crear'} Píxel
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};