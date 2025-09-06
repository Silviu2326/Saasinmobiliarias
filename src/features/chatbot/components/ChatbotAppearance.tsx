import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Upload, 
  Palette, 
  MessageCircle, 
  Monitor,
  Smartphone,
  Eye,
  Plus,
  Trash2,
  Edit2,
  Save,
  RefreshCw
} from 'lucide-react';

interface ChatbotAppearanceProps {
  appearance: {
    primaryColor: string;
    botAvatar: string;
    companyLogo: string;
    welcomeMessage: string;
    position: 'bottom-right' | 'bottom-left';
    proactiveMessages: string[];
  };
  onUpdate: (appearance: Partial<ChatbotAppearanceProps['appearance']>) => void;
}

export const ChatbotAppearance: React.FC<ChatbotAppearanceProps> = ({ appearance, onUpdate }) => {
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [newProactiveMessage, setNewProactiveMessage] = useState('');
  const [editingMessageIndex, setEditingMessageIndex] = useState<number | null>(null);
  const [editingMessageValue, setEditingMessageValue] = useState('');

  const colorPresets = [
    '#3B82F6', // Blue
    '#10B981', // Green
    '#8B5CF6', // Purple
    '#F59E0B', // Yellow
    '#EF4444', // Red
    '#06B6D4', // Cyan
    '#EC4899', // Pink
    '#84CC16', // Lime
  ];

  const handleColorChange = (color: string) => {
    onUpdate({ primaryColor: color });
  };

  const handleFileUpload = (field: 'botAvatar' | 'companyLogo', event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        onUpdate({ [field]: e.target?.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const addProactiveMessage = () => {
    if (newProactiveMessage.trim()) {
      onUpdate({
        proactiveMessages: [...appearance.proactiveMessages, newProactiveMessage.trim()]
      });
      setNewProactiveMessage('');
    }
  };

  const removeProactiveMessage = (index: number) => {
    const updated = appearance.proactiveMessages.filter((_, i) => i !== index);
    onUpdate({ proactiveMessages: updated });
  };

  const editProactiveMessage = (index: number) => {
    setEditingMessageIndex(index);
    setEditingMessageValue(appearance.proactiveMessages[index]);
  };

  const saveEditedMessage = () => {
    if (editingMessageIndex !== null && editingMessageValue.trim()) {
      const updated = [...appearance.proactiveMessages];
      updated[editingMessageIndex] = editingMessageValue.trim();
      onUpdate({ proactiveMessages: updated });
      setEditingMessageIndex(null);
      setEditingMessageValue('');
    }
  };

  const cancelEditMessage = () => {
    setEditingMessageIndex(null);
    setEditingMessageValue('');
  };

  const renderChatbotPreview = () => (
    <div className={`bg-gray-100 rounded-lg p-6 h-96 relative overflow-hidden ${
      previewMode === 'desktop' ? 'w-full' : 'w-80 mx-auto'
    }`}>
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-100 opacity-50"></div>
      
      {/* Mock Website Content */}
      <div className="relative z-10">
        <div className="bg-white rounded-lg p-4 mb-4 shadow-sm">
          <div className="h-2 bg-gray-200 rounded mb-2"></div>
          <div className="h-2 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-2 bg-gray-200 rounded w-1/2"></div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="h-2 bg-gray-200 rounded mb-2"></div>
          <div className="h-2 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>

      {/* Chatbot Widget */}
      <div className={`absolute ${
        appearance.position === 'bottom-right' ? 'bottom-6 right-6' : 'bottom-6 left-6'
      }`}>
        {/* Chat Button */}
        <motion.div
          style={{ backgroundColor: appearance.primaryColor }}
          className="w-14 h-14 rounded-full shadow-lg flex items-center justify-center cursor-pointer"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {appearance.botAvatar ? (
            <img 
              src={appearance.botAvatar} 
              alt="Bot Avatar" 
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <MessageCircle className="h-6 w-6 text-white" />
          )}
        </motion.div>
        
        {/* Sample Chat Bubble */}
        <div className={`absolute bottom-16 ${
          appearance.position === 'bottom-right' ? 'right-0' : 'left-0'
        } w-64 bg-white rounded-lg shadow-xl p-4 border`}>
          <div className="flex items-start space-x-3">
            {appearance.botAvatar ? (
              <img 
                src={appearance.botAvatar} 
                alt="Bot Avatar" 
                className="w-8 h-8 rounded-full object-cover flex-shrink-0"
              />
            ) : (
              <div 
                style={{ backgroundColor: appearance.primaryColor }}
                className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
              >
                <MessageCircle className="h-4 w-4 text-white" />
              </div>
            )}
            <div className="flex-1">
              <p className="text-sm text-gray-900">{appearance.welcomeMessage}</p>
              <div className="flex space-x-2 mt-2">
                <button 
                  style={{ backgroundColor: appearance.primaryColor }}
                  className="px-3 py-1 text-xs text-white rounded-full"
                >
                  Ver propiedades
                </button>
                <button className="px-3 py-1 text-xs text-gray-600 border rounded-full hover:bg-gray-50">
                  Contactar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Preview Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Vista Previa en Vivo</h3>
              <p className="text-sm text-gray-600 mt-1">Ve cómo se verá tu chatbot en tiempo real</p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setPreviewMode('desktop')}
                className={`p-2 rounded-lg ${previewMode === 'desktop' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <Monitor className="h-4 w-4" />
              </button>
              <button
                onClick={() => setPreviewMode('mobile')}
                className={`p-2 rounded-lg ${previewMode === 'mobile' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <Smartphone className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
        <div className="p-6">
          {renderChatbotPreview()}
        </div>
      </div>

      {/* Appearance Settings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Colors & Branding */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Colores y Marca</h3>
            <p className="text-sm text-gray-600 mt-1">Personaliza la apariencia visual</p>
          </div>
          <div className="p-6 space-y-6">
            {/* Primary Color */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Color Principal
              </label>
              <div className="flex items-center space-x-3">
                <input
                  type="color"
                  value={appearance.primaryColor}
                  onChange={(e) => handleColorChange(e.target.value)}
                  className="w-12 h-10 rounded-lg border-2 border-gray-300 cursor-pointer"
                />
                <input
                  type="text"
                  value={appearance.primaryColor}
                  onChange={(e) => handleColorChange(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="#3B82F6"
                />
              </div>
              <div className="mt-3">
                <p className="text-xs text-gray-600 mb-2">Presets de colores:</p>
                <div className="flex space-x-2">
                  {colorPresets.map((color) => (
                    <button
                      key={color}
                      onClick={() => handleColorChange(color)}
                      style={{ backgroundColor: color }}
                      className={`w-8 h-8 rounded-lg border-2 transition-all ${
                        appearance.primaryColor === color 
                          ? 'border-gray-900 scale-110' 
                          : 'border-gray-300 hover:scale-105'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Bot Avatar Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Avatar del Bot
              </label>
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden">
                  {appearance.botAvatar ? (
                    <img 
                      src={appearance.botAvatar} 
                      alt="Bot Avatar" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Upload className="h-6 w-6 text-gray-400" />
                  )}
                </div>
                <div className="flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload('botAvatar', e)}
                    className="hidden"
                    id="botAvatar"
                  />
                  <label
                    htmlFor="botAvatar"
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Subir Imagen
                  </label>
                  <p className="text-xs text-gray-500 mt-1">PNG, JPG hasta 1MB</p>
                </div>
              </div>
            </div>

            {/* Company Logo Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Logo de la Empresa
              </label>
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 rounded-lg bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden">
                  {appearance.companyLogo ? (
                    <img 
                      src={appearance.companyLogo} 
                      alt="Company Logo" 
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <Upload className="h-6 w-6 text-gray-400" />
                  )}
                </div>
                <div className="flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload('companyLogo', e)}
                    className="hidden"
                    id="companyLogo"
                  />
                  <label
                    htmlFor="companyLogo"
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Subir Logo
                  </label>
                  <p className="text-xs text-gray-500 mt-1">PNG, JPG hasta 1MB</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Messages & Position */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Mensajes y Posición</h3>
            <p className="text-sm text-gray-600 mt-1">Configura mensajes y ubicación</p>
          </div>
          <div className="p-6 space-y-6">
            {/* Welcome Message */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mensaje de Bienvenida
              </label>
              <textarea
                value={appearance.welcomeMessage}
                onChange={(e) => onUpdate({ welcomeMessage: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="¡Hola! ¿En qué puedo ayudarte hoy?"
              />
            </div>

            {/* Widget Position */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Posición del Widget
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => onUpdate({ position: 'bottom-right' })}
                  className={`p-4 border-2 rounded-lg text-center transition-all ${
                    appearance.position === 'bottom-right'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className="w-8 h-8 bg-gray-200 rounded-lg mb-2 mx-auto relative">
                    <div className="absolute bottom-1 right-1 w-2 h-2 bg-blue-500 rounded-full"></div>
                  </div>
                  <span className="text-sm font-medium">Inferior Derecha</span>
                </button>
                <button
                  onClick={() => onUpdate({ position: 'bottom-left' })}
                  className={`p-4 border-2 rounded-lg text-center transition-all ${
                    appearance.position === 'bottom-left'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className="w-8 h-8 bg-gray-200 rounded-lg mb-2 mx-auto relative">
                    <div className="absolute bottom-1 left-1 w-2 h-2 bg-blue-500 rounded-full"></div>
                  </div>
                  <span className="text-sm font-medium">Inferior Izquierda</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Proactive Messages */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Mensajes Proactivos</h3>
          <p className="text-sm text-gray-600 mt-1">Mensajes que el bot enviará automáticamente</p>
        </div>
        <div className="p-6">
          {/* Add New Message */}
          <div className="flex space-x-3 mb-4">
            <input
              type="text"
              value={newProactiveMessage}
              onChange={(e) => setNewProactiveMessage(e.target.value)}
              placeholder="¿Necesitas ayuda encontrando una propiedad?"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              onKeyPress={(e) => e.key === 'Enter' && addProactiveMessage()}
            />
            <button
              onClick={addProactiveMessage}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>

          {/* Messages List */}
          <div className="space-y-3">
            {appearance.proactiveMessages.map((message, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
              >
                {editingMessageIndex === index ? (
                  <>
                    <input
                      type="text"
                      value={editingMessageValue}
                      onChange={(e) => setEditingMessageValue(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      onKeyPress={(e) => e.key === 'Enter' && saveEditedMessage()}
                    />
                    <button
                      onClick={saveEditedMessage}
                      className="p-2 text-green-600 hover:text-green-700"
                    >
                      <Save className="h-4 w-4" />
                    </button>
                    <button
                      onClick={cancelEditMessage}
                      className="p-2 text-gray-600 hover:text-gray-700"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </button>
                  </>
                ) : (
                  <>
                    <span className="flex-1 text-sm text-gray-700">{message}</span>
                    <button
                      onClick={() => editProactiveMessage(index)}
                      className="p-2 text-blue-600 hover:text-blue-700"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => removeProactiveMessage(index)}
                      className="p-2 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </>
                )}
              </motion.div>
            ))}
          </div>

          {appearance.proactiveMessages.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-sm">No hay mensajes proactivos configurados</p>
              <p className="text-xs mt-1">Agrega mensajes que el bot enviará automáticamente</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};