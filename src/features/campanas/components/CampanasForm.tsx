import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  X,
  Save,
  Calendar,
  DollarSign,
  Target,
  Users,
  Mail,
  MessageSquare,
  Globe,
  Zap,
  Info,
  Plus,
  Minus
} from 'lucide-react';
import { Campana } from '../index';

interface CampanasFormProps {
  campana: Campana | null;
  onSave: (data: Partial<Campana>) => void;
  onCancel: () => void;
  isModal?: boolean;
}

export const CampanasForm: React.FC<CampanasFormProps> = ({
  campana,
  onSave,
  onCancel,
  isModal = false
}) => {
  const [formData, setFormData] = useState({
    nombre: '',
    tipo: 'email' as 'email' | 'sms' | 'portales' | 'rpa',
    fechaInicio: '',
    fechaFin: '',
    presupuesto: 0,
    segmentacion: [] as string[],
    descripcion: '',
    objetivos: {
      impresiones: 0,
      clicks: 0,
      conversiones: 0
    },
    configuracion: {
      audiencia: '',
      mensajes: {
        asunto: '',
        contenido: ''
      },
      programacion: {
        frecuencia: 'unica' as 'unica' | 'diaria' | 'semanal' | 'mensual',
        diasSemana: [] as string[],
        hora: ''
      }
    }
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [newSegment, setNewSegment] = useState('');

  useEffect(() => {
    if (campana) {
      setFormData({
        nombre: campana.nombre,
        tipo: campana.tipo,
        fechaInicio: campana.fechaInicio.split('T')[0],
        fechaFin: campana.fechaFin.split('T')[0],
        presupuesto: campana.presupuesto,
        segmentacion: campana.segmentacion,
        descripcion: '',
        objetivos: {
          impresiones: campana.metricas.impresiones,
          clicks: campana.metricas.clicks,
          conversiones: campana.metricas.conversiones
        },
        configuracion: {
          audiencia: '',
          mensajes: {
            asunto: '',
            contenido: ''
          },
          programacion: {
            frecuencia: 'unica',
            diasSemana: [],
            hora: ''
          }
        }
      });
    }
  }, [campana]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleNestedChange = (parent: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent as keyof typeof prev] as any,
        [field]: value
      }
    }));
  };

  const handleAddSegment = () => {
    if (newSegment.trim() && !formData.segmentacion.includes(newSegment.trim())) {
      setFormData(prev => ({
        ...prev,
        segmentacion: [...prev.segmentacion, newSegment.trim()]
      }));
      setNewSegment('');
    }
  };

  const handleRemoveSegment = (segment: string) => {
    setFormData(prev => ({
      ...prev,
      segmentacion: prev.segmentacion.filter(s => s !== segment)
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    }

    if (!formData.fechaInicio) {
      newErrors.fechaInicio = 'La fecha de inicio es requerida';
    }

    if (!formData.fechaFin) {
      newErrors.fechaFin = 'La fecha de fin es requerida';
    }

    if (formData.fechaInicio && formData.fechaFin && formData.fechaInicio >= formData.fechaFin) {
      newErrors.fechaFin = 'La fecha de fin debe ser posterior a la fecha de inicio';
    }

    if (formData.presupuesto <= 0) {
      newErrors.presupuesto = 'El presupuesto debe ser mayor a 0';
    }

    if (formData.segmentacion.length === 0) {
      newErrors.segmentacion = 'Debe agregar al menos un segmento';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const campaignData: Partial<Campana> = {
      nombre: formData.nombre,
      tipo: formData.tipo,
      fechaInicio: new Date(formData.fechaInicio).toISOString(),
      fechaFin: new Date(formData.fechaFin).toISOString(),
      presupuesto: formData.presupuesto,
      segmentacion: formData.segmentacion,
      estado: campana ? campana.estado : 'borrador'
    };

    onSave(campaignData);
  };

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'email':
        return <Mail className="h-4 w-4" />;
      case 'sms':
        return <MessageSquare className="h-4 w-4" />;
      case 'portales':
        return <Globe className="h-4 w-4" />;
      case 'rpa':
        return <Zap className="h-4 w-4" />;
      default:
        return <Target className="h-4 w-4" />;
    }
  };

  const tiposOptions = [
    { value: 'email', label: 'Email Marketing', icon: Mail, color: 'text-blue-600 bg-blue-100' },
    { value: 'sms', label: 'SMS Marketing', icon: MessageSquare, color: 'text-green-600 bg-green-100' },
    { value: 'portales', label: 'Portales Inmobiliarios', icon: Globe, color: 'text-purple-600 bg-purple-100' },
    { value: 'rpa', label: 'Automatización RPA', icon: Zap, color: 'text-orange-600 bg-orange-100' }
  ];

  const segmentosComunes = [
    'Compradores potenciales',
    'Vendedores',
    'Inversores',
    'Primera vivienda',
    'Lujo',
    'Comercial',
    'Alquiler',
    'Leads calientes',
    'Clientes recurrentes'
  ];

  return (
    <div className={`${isModal ? 'p-6' : 'bg-white rounded-lg shadow-sm border border-gray-200 p-6'}`}>
      {isModal && (
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">
            {campana ? 'Editar Campaña' : 'Nueva Campaña'}
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre de la Campaña *
            </label>
            <input
              type="text"
              value={formData.nombre}
              onChange={(e) => handleInputChange('nombre', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.nombre ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Ej: Campaña de Verano 2024"
            />
            {errors.nombre && (
              <p className="mt-1 text-sm text-red-600">{errors.nombre}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Campaña *
            </label>
            <div className="grid grid-cols-2 gap-2">
              {tiposOptions.map((option) => (
                <motion.button
                  key={option.value}
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleInputChange('tipo', option.value)}
                  className={`p-3 border rounded-lg flex items-center space-x-2 transition-all ${
                    formData.tipo === option.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className={`p-1 rounded ${option.color}`}>
                    <option.icon className="h-3 w-3" />
                  </div>
                  <span className="text-xs font-medium">{option.label}</span>
                </motion.button>
              ))}
            </div>
          </div>
        </div>

        {/* Dates and Budget */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha de Inicio *
            </label>
            <div className="relative">
              <input
                type="date"
                value={formData.fechaInicio}
                onChange={(e) => handleInputChange('fechaInicio', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.fechaInicio ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              <Calendar className="absolute right-3 top-3 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
            {errors.fechaInicio && (
              <p className="mt-1 text-sm text-red-600">{errors.fechaInicio}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha de Fin *
            </label>
            <div className="relative">
              <input
                type="date"
                value={formData.fechaFin}
                onChange={(e) => handleInputChange('fechaFin', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.fechaFin ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              <Calendar className="absolute right-3 top-3 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
            {errors.fechaFin && (
              <p className="mt-1 text-sm text-red-600">{errors.fechaFin}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Presupuesto (€) *
            </label>
            <div className="relative">
              <input
                type="number"
                value={formData.presupuesto}
                onChange={(e) => handleInputChange('presupuesto', parseFloat(e.target.value) || 0)}
                className={`w-full px-3 py-2 pl-8 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.presupuesto ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="0.00"
                min="0"
                step="0.01"
              />
              <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
            {errors.presupuesto && (
              <p className="mt-1 text-sm text-red-600">{errors.presupuesto}</p>
            )}
          </div>
        </div>

        {/* Segmentation */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Segmentación *
          </label>
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={newSegment}
                onChange={(e) => setNewSegment(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Agregar segmento personalizado"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSegment())}
              />
              <button
                type="button"
                onClick={handleAddSegment}
                className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {segmentosComunes.map((segmento) => (
                <button
                  key={segmento}
                  type="button"
                  onClick={() => {
                    if (!formData.segmentacion.includes(segmento)) {
                      setFormData(prev => ({
                        ...prev,
                        segmentacion: [...prev.segmentacion, segmento]
                      }));
                    }
                  }}
                  className={`px-3 py-1 text-xs rounded-full border ${
                    formData.segmentacion.includes(segmento)
                      ? 'bg-blue-100 text-blue-700 border-blue-300'
                      : 'bg-gray-100 text-gray-600 border-gray-300 hover:bg-gray-200'
                  }`}
                >
                  {segmento}
                </button>
              ))}
            </div>

            {formData.segmentacion.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">Segmentos seleccionados:</p>
                <div className="flex flex-wrap gap-2">
                  {formData.segmentacion.map((segmento) => (
                    <motion.div
                      key={segmento}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="inline-flex items-center bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm"
                    >
                      <Users className="h-3 w-3 mr-1" />
                      {segmento}
                      <button
                        type="button"
                        onClick={() => handleRemoveSegment(segmento)}
                        className="ml-2 text-blue-500 hover:text-blue-700"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
            {errors.segmentacion && (
              <p className="mt-1 text-sm text-red-600">{errors.segmentacion}</p>
            )}
          </div>
        </div>

        {/* Objectives */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Objetivos de la Campaña
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Impresiones objetivo</label>
              <input
                type="number"
                value={formData.objetivos.impresiones}
                onChange={(e) => handleNestedChange('objetivos', 'impresiones', parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="10000"
                min="0"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Clicks objetivo</label>
              <input
                type="number"
                value={formData.objetivos.clicks}
                onChange={(e) => handleNestedChange('objetivos', 'clicks', parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="500"
                min="0"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Conversiones objetivo</label>
              <input
                type="number"
                value={formData.objetivos.conversiones}
                onChange={(e) => handleNestedChange('objetivos', 'conversiones', parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="25"
                min="0"
              />
            </div>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Descripción
          </label>
          <textarea
            value={formData.descripcion}
            onChange={(e) => handleInputChange('descripcion', e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Describe los objetivos y estrategia de esta campaña..."
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end space-x-3 pt-4 border-t">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancelar
          </button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Save className="h-4 w-4 mr-2" />
            {campana ? 'Actualizar' : 'Crear'} Campaña
          </motion.button>
        </div>
      </form>

      {/* Info Panel */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start">
          <Info className="h-5 w-5 text-blue-600 mr-3 mt-0.5" />
          <div>
            <p className="text-sm text-blue-800 font-medium">Tips para crear campañas efectivas:</p>
            <ul className="text-xs text-blue-700 mt-1 space-y-1">
              <li>• Utiliza nombres descriptivos que identifiquen claramente la campaña</li>
              <li>• Segmenta tu audiencia para obtener mejores resultados</li>
              <li>• Establece objetivos realistas basados en campañas anteriores</li>
              <li>• Considera el tiempo de ejecución al definir el presupuesto</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};