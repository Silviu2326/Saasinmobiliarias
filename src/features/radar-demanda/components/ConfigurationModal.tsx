import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  X,
  Plus,
  Minus,
  Settings,
  Search,
  Users,
  Globe,
  Bell,
  Mail,
  Save,
  AlertCircle,
  Target,
  Newspaper
} from 'lucide-react';
import { RadarConfig } from '../services/radarService';

interface ConfigurationModalProps {
  isOpen: boolean;
  config: RadarConfig | null;
  loading?: boolean;
  onClose: () => void;
  onSave: (config: RadarConfig) => Promise<void>;
}

export const ConfigurationModal: React.FC<ConfigurationModalProps> = ({
  isOpen,
  config,
  loading = false,
  onClose,
  onSave
}) => {
  const [formData, setFormData] = useState<RadarConfig>({
    keywords: [],
    competitors: [],
    sources: [],
    alertsEnabled: true,
    emailNotifications: true
  });

  const [newKeyword, setNewKeyword] = useState('');
  const [newCompetitor, setNewCompetitor] = useState('');
  const [newSource, setNewSource] = useState('');
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (config) {
      setFormData({ ...config });
    }
  }, [config]);

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (formData.keywords.length === 0) {
      newErrors.keywords = 'Agrega al menos una palabra clave';
    }

    if (formData.keywords.length > 20) {
      newErrors.keywords = 'Máximo 20 palabras clave permitidas';
    }

    if (formData.competitors.length > 10) {
      newErrors.competitors = 'Máximo 10 competidores permitidos';
    }

    if (formData.sources.length > 15) {
      newErrors.sources = 'Máximo 15 fuentes permitidas';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setSaving(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Error saving config:', error);
    } finally {
      setSaving(false);
    }
  };

  const addKeyword = () => {
    if (newKeyword.trim() && !formData.keywords.includes(newKeyword.trim())) {
      setFormData(prev => ({
        ...prev,
        keywords: [...prev.keywords, newKeyword.trim()]
      }));
      setNewKeyword('');
      setErrors(prev => ({ ...prev, keywords: '' }));
    }
  };

  const removeKeyword = (keyword: string) => {
    setFormData(prev => ({
      ...prev,
      keywords: prev.keywords.filter(k => k !== keyword)
    }));
  };

  const addCompetitor = () => {
    if (newCompetitor.trim() && !formData.competitors.includes(newCompetitor.trim())) {
      setFormData(prev => ({
        ...prev,
        competitors: [...prev.competitors, newCompetitor.trim()]
      }));
      setNewCompetitor('');
    }
  };

  const removeCompetitor = (competitor: string) => {
    setFormData(prev => ({
      ...prev,
      competitors: prev.competitors.filter(c => c !== competitor)
    }));
  };

  const addSource = () => {
    if (newSource.trim() && !formData.sources.includes(newSource.trim())) {
      setFormData(prev => ({
        ...prev,
        sources: [...prev.sources, newSource.trim()]
      }));
      setNewSource('');
    }
  };

  const removeSource = (source: string) => {
    setFormData(prev => ({
      ...prev,
      sources: prev.sources.filter(s => s !== source)
    }));
  };

  const suggestedKeywords = [
    'inversión inmobiliaria',
    'comprar vivienda',
    'mercado inmobiliario',
    'precio vivienda',
    'alquiler madrid',
    'hipoteca'
  ];

  const suggestedCompetitors = [
    'idealista.com',
    'fotocasa.es',
    'habitaclia.com',
    'pisos.com'
  ];

  const suggestedSources = [
    'expansion.com',
    'eleconomista.es',
    'abc.es',
    'elmundo.es',
    'cincodias.elpais.com'
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Settings className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Configurar Radar de Demanda</h2>
                <p className="text-sm text-gray-600">Personaliza las fuentes y términos a monitorear</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="space-y-8">
            {/* Keywords Section */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Target className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Palabras Clave</h3>
                  <p className="text-sm text-gray-600">Términos para monitorear tendencias de búsqueda</p>
                </div>
              </div>

              {errors.keywords && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm">{errors.keywords}</span>
                </div>
              )}

              <div className="mb-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newKeyword}
                    onChange={(e) => setNewKeyword(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addKeyword()}
                    placeholder="ej. inversión inmobiliaria"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={addKeyword}
                    disabled={!newKeyword.trim()}
                    className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Current Keywords */}
              {formData.keywords.length > 0 && (
                <div className="mb-4">
                  <div className="flex flex-wrap gap-2">
                    {formData.keywords.map(keyword => (
                      <div
                        key={keyword}
                        className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                      >
                        <Search className="w-3 h-3" />
                        <span>{keyword}</span>
                        <button
                          onClick={() => removeKeyword(keyword)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    {formData.keywords.length}/20 palabras clave
                  </div>
                </div>
              )}

              {/* Suggested Keywords */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Sugerencias:</h4>
                <div className="flex flex-wrap gap-2">
                  {suggestedKeywords
                    .filter(keyword => !formData.keywords.includes(keyword))
                    .map(keyword => (
                      <button
                        key={keyword}
                        onClick={() => {
                          setNewKeyword(keyword);
                          addKeyword();
                        }}
                        className="px-3 py-1 text-sm text-gray-600 border border-gray-300 rounded-full hover:bg-gray-50 transition-colors"
                      >
                        {keyword}
                      </button>
                    ))}
                </div>
              </div>
            </div>

            {/* Competitors Section */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Users className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Competidores</h3>
                  <p className="text-sm text-gray-600">Empresas o marcas a monitorear (opcional)</p>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newCompetitor}
                    onChange={(e) => setNewCompetitor(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addCompetitor()}
                    placeholder="ej. idealista.com"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={addCompetitor}
                    disabled={!newCompetitor.trim()}
                    className="px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {formData.competitors.length > 0 && (
                <div className="mb-4">
                  <div className="flex flex-wrap gap-2">
                    {formData.competitors.map(competitor => (
                      <div
                        key={competitor}
                        className="flex items-center gap-2 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm"
                      >
                        <Users className="w-3 h-3" />
                        <span>{competitor}</span>
                        <button
                          onClick={() => removeCompetitor(competitor)}
                          className="text-purple-600 hover:text-purple-800"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    {formData.competitors.length}/10 competidores
                  </div>
                </div>
              )}

              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Sugerencias:</h4>
                <div className="flex flex-wrap gap-2">
                  {suggestedCompetitors
                    .filter(competitor => !formData.competitors.includes(competitor))
                    .map(competitor => (
                      <button
                        key={competitor}
                        onClick={() => {
                          setNewCompetitor(competitor);
                          addCompetitor();
                        }}
                        className="px-3 py-1 text-sm text-gray-600 border border-gray-300 rounded-full hover:bg-gray-50 transition-colors"
                      >
                        {competitor}
                      </button>
                    ))}
                </div>
              </div>
            </div>

            {/* Sources Section */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Newspaper className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Fuentes de Contenido</h3>
                  <p className="text-sm text-gray-600">Sitios web para monitorear artículos relevantes</p>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newSource}
                    onChange={(e) => setNewSource(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addSource()}
                    placeholder="ej. expansion.com"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={addSource}
                    disabled={!newSource.trim()}
                    className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {formData.sources.length > 0 && (
                <div className="mb-4">
                  <div className="flex flex-wrap gap-2">
                    {formData.sources.map(source => (
                      <div
                        key={source}
                        className="flex items-center gap-2 px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm"
                      >
                        <Globe className="w-3 h-3" />
                        <span>{source}</span>
                        <button
                          onClick={() => removeSource(source)}
                          className="text-orange-600 hover:text-orange-800"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    {formData.sources.length}/15 fuentes
                  </div>
                </div>
              )}

              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Sugerencias:</h4>
                <div className="flex flex-wrap gap-2">
                  {suggestedSources
                    .filter(source => !formData.sources.includes(source))
                    .map(source => (
                      <button
                        key={source}
                        onClick={() => {
                          setNewSource(source);
                          addSource();
                        }}
                        className="px-3 py-1 text-sm text-gray-600 border border-gray-300 rounded-full hover:bg-gray-50 transition-colors"
                      >
                        {source}
                      </button>
                    ))}
                </div>
              </div>
            </div>

            {/* Notifications Section */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-red-100 rounded-lg">
                  <Bell className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Notificaciones</h3>
                  <p className="text-sm text-gray-600">Configurar alertas automáticas</p>
                </div>
              </div>

              <div className="space-y-4">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={formData.alertsEnabled}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      alertsEnabled: e.target.checked
                    }))}
                    className="rounded border-gray-300"
                  />
                  <div>
                    <div className="font-medium text-gray-900">Alertas en plataforma</div>
                    <div className="text-sm text-gray-600">Mostrar alertas cuando se detecten picos de actividad</div>
                  </div>
                </label>

                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={formData.emailNotifications}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      emailNotifications: e.target.checked
                    }))}
                    className="rounded border-gray-300"
                  />
                  <div>
                    <div className="font-medium text-gray-900">Notificaciones por email</div>
                    <div className="text-sm text-gray-600">Recibir resumen diario y alertas importantes por correo</div>
                  </div>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200">
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              disabled={saving}
              className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={saving || loading}
              className="flex items-center gap-2 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
            >
              {saving ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {saving ? 'Guardando...' : 'Guardar Configuración'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};