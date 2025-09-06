import React, { useState, useEffect } from 'react';
import { X, Save, TestTube, AlertTriangle, CheckCircle } from 'lucide-react';
import { 
  Regla, 
  CreateReglaRequest, 
  UpdateReglaRequest,
  TriggerType,
  ActionConfig,
  ActionType,
  TRIGGERS_DISPONIBLES,
  CONFIGURACIONES_ACCION
} from '../types/regla.types';
import { CondicionBuilder } from './CondicionBuilder';

interface ReglaFormProps {
  regla?: Regla | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CreateReglaRequest | UpdateReglaRequest) => Promise<void>;
  onTest?: (testData: any) => Promise<void>;
  isLoading?: boolean;
  isTesting?: boolean;
  testResult?: { success: boolean; result: string; actions: string[] } | null;
}

export const ReglaForm: React.FC<ReglaFormProps> = ({
  regla,
  isOpen,
  onClose,
  onSave,
  onTest,
  isLoading = false,
  isTesting = false,
  testResult
}) => {
  const isEditing = !!regla;
  
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    trigger: 'nuevo_lead' as TriggerType,
    condiciones: [],
    acciones: [],
    activa: true,
    prioridad: 1
  });

  const [activeTab, setActiveTab] = useState<'config' | 'condiciones' | 'acciones' | 'test'>('config');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize form data when regla changes
  useEffect(() => {
    if (regla) {
      setFormData({
        nombre: regla.nombre,
        descripcion: regla.descripcion || '',
        trigger: regla.trigger,
        condiciones: regla.condiciones,
        acciones: regla.acciones,
        activa: regla.activa,
        prioridad: regla.prioridad
      });
    } else {
      setFormData({
        nombre: '',
        descripcion: '',
        trigger: 'nuevo_lead',
        condiciones: [],
        acciones: [],
        activa: true,
        prioridad: 1
      });
    }
    setActiveTab('config');
    setErrors({});
  }, [regla, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    }

    if (formData.condiciones.length === 0) {
      newErrors.condiciones = 'Debe definir al menos una condición';
    }

    if (formData.acciones.length === 0) {
      newErrors.acciones = 'Debe definir al menos una acción';
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
      onClose();
    } catch (error) {
      console.error('Error saving regla:', error);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const addAccion = () => {
    const newAccion: ActionConfig = {
      type: 'enviar_email',
      parameters: {}
    };
    
    handleInputChange('acciones', [...formData.acciones, newAccion]);
  };

  const updateAccion = (index: number, updates: Partial<ActionConfig>) => {
    const updatedAcciones = formData.acciones.map((accion, i) => 
      i === index ? { ...accion, ...updates } : accion
    );
    handleInputChange('acciones', updatedAcciones);
  };

  const removeAccion = (index: number) => {
    const updatedAcciones = formData.acciones.filter((_, i) => i !== index);
    handleInputChange('acciones', updatedAcciones);
  };

  const handleTest = () => {
    if (onTest) {
      const testData = {
        // Mock test data based on trigger type
        trigger: formData.trigger,
        condiciones: formData.condiciones,
        acciones: formData.acciones
      };
      onTest(testData);
    }
  };

  const renderActionParameters = (accion: ActionConfig, index: number) => {
    const config = CONFIGURACIONES_ACCION[accion.type];
    if (!config) return null;

    return (
      <div className="space-y-3 mt-3">
        {config.parameters.map(param => (
          <div key={param.key}>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              {param.label} {param.required && <span className="text-red-500">*</span>}
            </label>
            
            {param.type === 'select' && param.options ? (
              <select
                value={accion.parameters[param.key] || ''}
                onChange={(e) => updateAccion(index, {
                  parameters: { ...accion.parameters, [param.key]: e.target.value }
                })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                disabled={isLoading}
              >
                <option value="">Seleccionar...</option>
                {param.options.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                value={accion.parameters[param.key] || ''}
                onChange={(e) => updateAccion(index, {
                  parameters: { ...accion.parameters, [param.key]: e.target.value }
                })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                disabled={isLoading}
              />
            )}
          </div>
        ))}
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {isEditing ? 'Editar Regla' : 'Nueva Regla'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
            disabled={isLoading}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex px-6">
            {[
              { key: 'config', label: 'Configuración', hasError: errors.nombre },
              { key: 'condiciones', label: 'Condiciones', hasError: errors.condiciones },
              { key: 'acciones', label: 'Acciones', hasError: errors.acciones },
              ...(isEditing ? [{ key: 'test', label: 'Probar', hasError: false }] : [])
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`px-4 py-3 text-sm font-medium border-b-2 relative ${
                  activeTab === tab.key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
                {tab.hasError && (
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></div>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Configuration Tab */}
            {activeTab === 'config' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre de la Regla *
                  </label>
                  <input
                    type="text"
                    value={formData.nombre}
                    onChange={(e) => handleInputChange('nombre', e.target.value)}
                    placeholder="ej. Lead Premium Madrid"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.nombre ? 'border-red-300' : 'border-gray-300'
                    }`}
                    disabled={isLoading}
                  />
                  {errors.nombre && (
                    <p className="mt-1 text-sm text-red-600">{errors.nombre}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descripción
                  </label>
                  <textarea
                    rows={3}
                    value={formData.descripcion}
                    onChange={(e) => handleInputChange('descripcion', e.target.value)}
                    placeholder="Describe qué hace esta regla y cuándo se debe usar"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Evento Disparador *
                  </label>
                  <select
                    value={formData.trigger}
                    onChange={(e) => handleInputChange('trigger', e.target.value as TriggerType)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={isLoading}
                  >
                    {Object.entries(TRIGGERS_DISPONIBLES).map(([key, trigger]) => (
                      <option key={key} value={key}>
                        {trigger.icon} {trigger.label} - {trigger.description}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.activa}
                        onChange={(e) => handleInputChange('activa', e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        disabled={isLoading}
                      />
                      <span className="text-sm font-medium text-gray-700">
                        Activar regla inmediatamente
                      </span>
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Prioridad
                    </label>
                    <input
                      type="number"
                      value={formData.prioridad}
                      onChange={(e) => handleInputChange('prioridad', parseInt(e.target.value))}
                      min="1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={isLoading}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Conditions Tab */}
            {activeTab === 'condiciones' && (
              <div>
                <CondicionBuilder
                  trigger={formData.trigger}
                  condiciones={formData.condiciones}
                  onChange={(condiciones) => handleInputChange('condiciones', condiciones)}
                  disabled={isLoading}
                />
                {errors.condiciones && (
                  <p className="mt-2 text-sm text-red-600">{errors.condiciones}</p>
                )}
              </div>
            )}

            {/* Actions Tab */}
            {activeTab === 'acciones' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-gray-900">
                    Acciones {formData.acciones.length > 0 && `(${formData.acciones.length})`}
                  </h4>
                  <button
                    type="button"
                    onClick={addAccion}
                    disabled={isLoading}
                    className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    Agregar Acción
                  </button>
                </div>

                {formData.acciones.length === 0 ? (
                  <div className="p-6 text-center border-2 border-dashed border-gray-300 rounded-lg">
                    <p className="text-gray-500 mb-3">
                      Define qué acciones se ejecutarán cuando se cumplan las condiciones
                    </p>
                    <button
                      type="button"
                      onClick={addAccion}
                      disabled={isLoading}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Primera Acción
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {formData.acciones.map((accion, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h5 className="text-sm font-medium text-gray-900">
                            Acción {index + 1}
                          </h5>
                          <button
                            type="button"
                            onClick={() => removeAccion(index)}
                            disabled={isLoading}
                            className="text-gray-400 hover:text-red-600"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Tipo de Acción
                          </label>
                          <select
                            value={accion.type}
                            onChange={(e) => updateAccion(index, { 
                              type: e.target.value as ActionType,
                              parameters: {} // Reset parameters when type changes
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            disabled={isLoading}
                          >
                            {Object.entries(CONFIGURACIONES_ACCION).map(([key, config]) => (
                              <option key={key} value={key}>
                                {config.label} - {config.description}
                              </option>
                            ))}
                          </select>
                        </div>

                        {renderActionParameters(accion, index)}
                      </div>
                    ))}
                  </div>
                )}

                {errors.acciones && (
                  <p className="text-sm text-red-600">{errors.acciones}</p>
                )}
              </div>
            )}

            {/* Test Tab */}
            {activeTab === 'test' && isEditing && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-2">Probar Regla</h4>
                  <p className="text-sm text-gray-600 mb-4">
                    Ejecuta una prueba de esta regla para verificar que funciona correctamente.
                  </p>
                  
                  <button
                    type="button"
                    onClick={handleTest}
                    disabled={isTesting || isLoading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                  >
                    <TestTube className={`w-4 h-4 ${isTesting ? 'animate-spin' : ''}`} />
                    {isTesting ? 'Probando...' : 'Ejecutar Prueba'}
                  </button>
                </div>

                {testResult && (
                  <div className={`p-4 rounded-lg border ${
                    testResult.success 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-red-50 border-red-200'
                  }`}>
                    <div className="flex items-start gap-3">
                      {testResult.success ? (
                        <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <h5 className={`font-medium ${
                          testResult.success ? 'text-green-800' : 'text-red-800'
                        }`}>
                          {testResult.success ? 'Prueba Exitosa' : 'Prueba Fallida'}
                        </h5>
                        <p className={`text-sm mt-1 ${
                          testResult.success ? 'text-green-700' : 'text-red-700'
                        }`}>
                          {testResult.result}
                        </p>
                        {testResult.actions.length > 0 && (
                          <div className="mt-2">
                            <p className="text-sm font-medium">Acciones ejecutadas:</p>
                            <ul className="text-sm list-disc list-inside mt-1">
                              {testResult.actions.map((action, index) => (
                                <li key={index}>{CONFIGURACIONES_ACCION[action as ActionType]?.label || action}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </form>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Guardando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                {isEditing ? 'Actualizar' : 'Crear'} Regla
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};