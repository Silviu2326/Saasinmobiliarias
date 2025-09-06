import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Plus, Minus } from 'lucide-react';
import { ABTest } from '../services/abTestingService';

interface ABTestFormProps {
  test?: ABTest;
  onSubmit: (data: Omit<ABTest, 'id' | 'createdAt'>) => Promise<void>;
  onCancel: () => void;
}

export const ABTestForm: React.FC<ABTestFormProps> = ({ test, onSubmit, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: test?.name || '',
    hypothesis: test?.hypothesis || '',
    status: test?.status || 'draft' as const,
    startDate: test?.startDate?.split('T')[0] || '',
    endDate: test?.endDate?.split('T')[0] || '',
    variants: test?.variants || [
      {
        id: 'a',
        name: 'Variante A (Control)',
        description: '',
        trafficPercentage: 50,
        metrics: {
          impressions: 0,
          clicks: 0,
          conversions: 0,
          ctr: 0,
          conversionRate: 0
        }
      },
      {
        id: 'b',
        name: 'Variante B',
        description: '',
        trafficPercentage: 50,
        metrics: {
          impressions: 0,
          clicks: 0,
          conversions: 0,
          ctr: 0,
          conversionRate: 0
        }
      }
    ],
    goal: test?.goal || {
      metric: 'ctr' as const,
      description: ''
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await onSubmit({
        ...formData,
        variants: formData.variants.map(variant => ({
          ...variant,
          metrics: variant.metrics || {
            impressions: 0,
            clicks: 0,
            conversions: 0,
            ctr: 0,
            conversionRate: 0
          }
        }))
      });
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setLoading(false);
    }
  };

  const addVariant = () => {
    const newVariant = {
      id: `variant_${Date.now()}`,
      name: `Variante ${String.fromCharCode(65 + formData.variants.length)}`,
      description: '',
      trafficPercentage: Math.floor(100 / (formData.variants.length + 1)),
      metrics: {
        impressions: 0,
        clicks: 0,
        conversions: 0,
        ctr: 0,
        conversionRate: 0
      }
    };
    
    setFormData(prev => ({
      ...prev,
      variants: [...prev.variants, newVariant]
    }));
  };

  const removeVariant = (index: number) => {
    if (formData.variants.length <= 2) return;
    
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index)
    }));
  };

  const updateVariant = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.map((variant, i) => 
        i === index ? { ...variant, [field]: value } : variant
      )
    }));
  };

  const totalTrafficPercentage = formData.variants.reduce((sum, v) => sum + v.trafficPercentage, 0);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">
            {test ? 'Editar Test A/B' : 'Nuevo Test A/B'}
          </h3>
          <button
            type="button"
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre del Test
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Objetivo de Conversión
            </label>
            <select
              value={formData.goal.metric}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                goal: { ...prev.goal, metric: e.target.value as 'ctr' | 'openRate' | 'conversions' }
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ctr">CTR (Click Through Rate)</option>
              <option value="openRate">Tasa de Apertura</option>
              <option value="conversions">Conversiones</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Hipótesis
          </label>
          <textarea
            value={formData.hypothesis}
            onChange={(e) => setFormData(prev => ({ ...prev, hypothesis: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Descripción del Objetivo
          </label>
          <input
            type="text"
            value={formData.goal.description}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              goal: { ...prev.goal, description: e.target.value }
            }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="ej. Tasa de apertura de emails de bienvenida"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha de Inicio
            </label>
            <input
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha de Fin
            </label>
            <input
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-md font-medium">Variantes</h4>
            <button
              type="button"
              onClick={addVariant}
              className="flex items-center gap-2 px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Agregar Variante
            </button>
          </div>

          <div className="space-y-4">
            {formData.variants.map((variant, index) => (
              <motion.div
                key={variant.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 border border-gray-200 rounded-lg"
              >
                <div className="flex justify-between items-start mb-3">
                  <h5 className="font-medium">Variante {String.fromCharCode(65 + index)}</h5>
                  {formData.variants.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removeVariant(index)}
                      className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Nombre</label>
                    <input
                      type="text"
                      value={variant.name}
                      onChange={(e) => updateVariant(index, 'name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-600 mb-1">
                      Tráfico (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={variant.trafficPercentage}
                      onChange={(e) => updateVariant(index, 'trafficPercentage', parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="mt-3">
                  <label className="block text-sm text-gray-600 mb-1">Descripción</label>
                  <textarea
                    value={variant.description}
                    onChange={(e) => updateVariant(index, 'description', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={2}
                    placeholder="ej. Asunto del email, texto del botón, URL de destino..."
                  />
                </div>
              </motion.div>
            ))}
          </div>

          {totalTrafficPercentage !== 100 && (
            <div className="text-amber-600 text-sm mt-2">
              ⚠️ El tráfico total debe sumar 100% (actual: {totalTrafficPercentage}%)
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50"
            disabled={loading || totalTrafficPercentage !== 100}
          >
            {loading ? 'Guardando...' : (test ? 'Actualizar' : 'Crear Test')}
          </button>
        </div>
      </form>
    </motion.div>
  );
};