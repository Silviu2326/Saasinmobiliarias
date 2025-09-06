import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  useAvmState, 
  useModels, 
  useComparables, 
  useValuation, 
  useMarketTrends,
  useGeospatialAnalysis,
  useAvmSettings,
  useRealTimeUpdates,
  useKeyboardShortcuts
} from './hooks';
import { subjectSchema } from './schema';
import { 
  formatCurrency, 
  formatArea, 
  formatPercent, 
  formatDistance,
  getConfidenceColor,
  getMarketPositionColor,
  getMarketPositionText,
  getPropertyTypeLabel,
  getConditionLabel,
  getModelTypeLabel,
  calculateConfidence
} from './utils';
import type { Subject, ViewMode, AvmFilters } from './types';

// Simple components
const SimpleCard: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`bg-white rounded-lg border border-gray-200 shadow-sm ${className}`}>
    {children}
  </div>
);

const SimpleButton: React.FC<{ 
  children: React.ReactNode; 
  onClick?: () => void; 
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
}> = ({ 
  children, 
  onClick, 
  variant = 'primary', 
  size = 'md', 
  disabled = false,
  className = '' 
}) => {
  const baseClasses = 'inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2';
  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-300',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700 disabled:bg-gray-300',
    outline: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:bg-gray-100',
    ghost: 'text-gray-600 hover:bg-gray-100 disabled:text-gray-400'
  };
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className} ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

const SimpleBadge: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${className}`}>
    {children}
  </span>
);

const SimpleInput: React.FC<{
  type?: string;
  placeholder?: string;
  value?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
}> = ({ type = 'text', placeholder, value, onChange, className = '' }) => (
  <input
    type={type}
    placeholder={placeholder}
    value={value}
    onChange={onChange}
    className={`block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 ${className}`}
  />
);

const SimpleSelect: React.FC<{
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  children: React.ReactNode;
  className?: string;
}> = ({ value, onChange, children, className = '' }) => (
  <select
    value={value}
    onChange={onChange}
    className={`block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 ${className}`}
  >
    {children}
  </select>
);

// Subject Form Component
const SubjectForm: React.FC<{
  subject: Partial<Subject>;
  onChange: (subject: Partial<Subject>) => void;
  onSubmit: () => void;
  loading: boolean;
}> = ({ subject, onChange, onSubmit, loading }) => {
  const handleInputChange = (field: keyof Subject, value: any) => {
    onChange({ ...subject, [field]: value });
  };

  return (
    <SimpleCard className="p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Datos del Inmueble</h3>
        <p className="text-sm text-gray-600">Introduce los datos del inmueble a valorar</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Dirección</label>
          <SimpleInput
            placeholder="Calle, número, ciudad..."
            value={subject.address || ''}
            onChange={(e) => handleInputChange('address', e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Superficie (m²)</label>
          <SimpleInput
            type="number"
            placeholder="80"
            value={subject.area || ''}
            onChange={(e) => handleInputChange('area', parseInt(e.target.value) || 0)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Año de construcción</label>
          <SimpleInput
            type="number"
            placeholder="2000"
            value={subject.buildingYear || ''}
            onChange={(e) => handleInputChange('buildingYear', parseInt(e.target.value) || 0)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Habitaciones</label>
          <SimpleInput
            type="number"
            placeholder="3"
            value={subject.rooms || ''}
            onChange={(e) => handleInputChange('rooms', parseInt(e.target.value) || 0)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Baños</label>
          <SimpleInput
            type="number"
            placeholder="2"
            value={subject.bathrooms || ''}
            onChange={(e) => handleInputChange('bathrooms', parseInt(e.target.value) || 0)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de propiedad</label>
          <SimpleSelect
            value={subject.propertyType || ''}
            onChange={(e) => handleInputChange('propertyType', e.target.value)}
          >
            <option value="">Seleccionar tipo</option>
            <option value="apartment">Piso</option>
            <option value="house">Casa</option>
            <option value="penthouse">Ático</option>
            <option value="studio">Estudio</option>
            <option value="duplex">Dúplex</option>
          </SimpleSelect>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Estado de conservación</label>
          <SimpleSelect
            value={subject.condition || ''}
            onChange={(e) => handleInputChange('condition', e.target.value)}
          >
            <option value="">Seleccionar estado</option>
            <option value="excellent">Excelente</option>
            <option value="good">Bueno</option>
            <option value="fair">Regular</option>
            <option value="poor">Malo</option>
          </SimpleSelect>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Código postal</label>
          <SimpleInput
            placeholder="28001"
            value={subject.postalCode || ''}
            onChange={(e) => handleInputChange('postalCode', e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Ciudad</label>
          <SimpleInput
            placeholder="Madrid"
            value={subject.city || ''}
            onChange={(e) => handleInputChange('city', e.target.value)}
          />
        </div>
      </div>

      <div className="mt-6 flex gap-3">
        <SimpleButton onClick={onSubmit} disabled={loading}>
          {loading ? 'Buscando comparables...' : 'Buscar Comparables'}
        </SimpleButton>
        <SimpleButton variant="outline" onClick={() => onChange({})}>
          Limpiar
        </SimpleButton>
      </div>
    </SimpleCard>
  );
};

// Model Selector Component
const ModelSelector: React.FC<{
  models: any[];
  selectedModels: string[];
  onModelToggle: (modelId: string) => void;
  onRunValuation: () => void;
  loading: boolean;
}> = ({ models, selectedModels, onModelToggle, onRunValuation, loading }) => {
  return (
    <SimpleCard className="p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Modelos de Valoración</h3>
        <p className="text-sm text-gray-600">Selecciona los modelos a utilizar</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {models.map((model) => (
          <div key={model.id} className="border rounded-lg p-4 hover:bg-gray-50">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedModels.includes(model.id)}
                    onChange={() => onModelToggle(model.id)}
                    className="mt-0.5 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">{model.name}</span>
                      <SimpleBadge className={`text-xs ${
                        model.complexity === 'high' ? 'bg-red-100 text-red-800' :
                        model.complexity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {model.complexity === 'high' ? 'Alta' : model.complexity === 'medium' ? 'Media' : 'Baja'}
                      </SimpleBadge>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{getModelTypeLabel(model.type)}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                      <span>Precisión: {formatPercent(model.accuracy)}</span>
                      <span>Tiempo: {model.executionTime.toFixed(1)}s</span>
                    </div>
                  </div>
                </label>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedModels.length > 0 && (
        <div className="mt-6">
          <SimpleButton onClick={onRunValuation} disabled={loading} size="lg" className="w-full">
            {loading ? 'Ejecutando valoración...' : `Ejecutar Valoración (${selectedModels.length} modelos)`}
          </SimpleButton>
        </div>
      )}
    </SimpleCard>
  );
};

// Comparables Table Component
const ComparablesTable: React.FC<{
  comps: any[];
  loading: boolean;
}> = ({ comps, loading }) => {
  if (loading) {
    return (
      <SimpleCard className="p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Cargando comparables...</p>
        </div>
      </SimpleCard>
    );
  }

  if (comps.length === 0) {
    return (
      <SimpleCard className="p-6 text-center">
        <p className="text-gray-500">No hay comparables disponibles</p>
      </SimpleCard>
    );
  }

  return (
    <SimpleCard className="overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Comparables Encontrados</h3>
        <p className="text-sm text-gray-600">{comps.length} propiedades similares</p>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dirección</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Superficie</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Precio</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">€/m²</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Similitud</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Distancia</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {comps.slice(0, 10).map((comp, index) => (
              <tr key={comp.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">{comp.address}</div>
                  <div className="text-sm text-gray-500">{getPropertyTypeLabel(comp.propertyType)}</div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">{formatArea(comp.area)}</td>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{formatCurrency(comp.salePrice)}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{formatCurrency(comp.pricePerM2)}</td>
                <td className="px-6 py-4">
                  <SimpleBadge className={`${
                    comp.similarity > 0.8 ? 'bg-green-100 text-green-800' :
                    comp.similarity > 0.6 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {formatPercent(comp.similarity * 100)}
                  </SimpleBadge>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">{formatDistance(comp.distanceToSubject)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SimpleCard>
  );
};

// Valuation Results Component
const ValuationResults: React.FC<{
  results: any[];
  loading: boolean;
}> = ({ results, loading }) => {
  if (loading) {
    return (
      <SimpleCard className="p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Ejecutando valoración...</p>
        </div>
      </SimpleCard>
    );
  }

  if (results.length === 0) {
    return (
      <SimpleCard className="p-6 text-center">
        <p className="text-gray-500">No hay resultados de valoración</p>
      </SimpleCard>
    );
  }

  return (
    <div className="space-y-6">
      {results.map((result, index) => (
        <SimpleCard key={result.id} className="p-6">
          <div className="mb-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Valoración {index + 1}
              </h3>
              <div className="flex items-center gap-2">
                <SimpleBadge className={getConfidenceColor(result.confidence)}>
                  {formatPercent(result.confidence * 100)} confianza
                </SimpleBadge>
                <SimpleBadge className={getMarketPositionColor(result.marketPosition)}>
                  {getMarketPositionText(result.marketPosition)}
                </SimpleBadge>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{formatCurrency(result.estimatedValue)}</div>
              <div className="text-sm text-gray-600">Valor estimado</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-semibold text-gray-900">{formatCurrency(result.pricePerM2)}</div>
              <div className="text-sm text-gray-600">€/m²</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-medium text-gray-900">
                {formatCurrency(result.confidenceRange.low)} - {formatCurrency(result.confidenceRange.high)}
              </div>
              <div className="text-sm text-gray-600">Rango de confianza ({result.confidenceRange.percentage}%)</div>
            </div>
          </div>

          {result.riskFactors && result.riskFactors.length > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Factores de Riesgo</h4>
              <div className="space-y-2">
                {result.riskFactors.slice(0, 3).map((factor: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between text-sm">
                    <span className="text-gray-700">{factor.factor}</span>
                    <SimpleBadge className={`${
                      factor.impact === 'positive' ? 'bg-green-100 text-green-800' :
                      factor.impact === 'negative' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {factor.severity === 'high' ? 'Alto' : factor.severity === 'medium' ? 'Medio' : 'Bajo'}
                    </SimpleBadge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </SimpleCard>
      ))}
    </div>
  );
};

// Main AVM Page Component
const AvmPage: React.FC = () => {
  const avmState = useAvmState();
  const { models, loading: modelsLoading } = useModels();
  const { filteredComps, loading: compsLoading, searchComps } = useComparables();
  const { results, loading: valuationLoading, startValuation } = useValuation();
  const { settings } = useAvmSettings();

  // Enable keyboard shortcuts
  useKeyboardShortcuts();
  const { connected } = useRealTimeUpdates();

  const [currentSubject, setCurrentSubject] = useState<Partial<Subject>>({});
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const [step, setStep] = useState<'form' | 'comparables' | 'models' | 'results'>('form');

  const handleSubjectSubmit = useCallback(async () => {
    try {
      // Validate subject data
      const validatedSubject = subjectSchema.parse({
        ...currentSubject,
        id: `subject-${Date.now()}`
      });
      
      await searchComps(validatedSubject as Subject);
      setStep('comparables');
    } catch (error) {
      console.error('Error validating subject:', error);
    }
  }, [currentSubject, searchComps]);

  const handleModelToggle = useCallback((modelId: string) => {
    setSelectedModels(prev => 
      prev.includes(modelId)
        ? prev.filter(id => id !== modelId)
        : [...prev, modelId]
    );
  }, []);

  const handleRunValuation = useCallback(async () => {
    if (currentSubject && selectedModels.length > 0) {
      try {
        await startValuation(currentSubject as Subject, selectedModels);
        setStep('results');
      } catch (error) {
        console.error('Error starting valuation:', error);
      }
    }
  }, [currentSubject, selectedModels, startValuation]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">AVM - Valoración Automática</h1>
              <p className="text-sm text-gray-600">Sistema de valoración automatizada de inmuebles</p>
            </div>
            <div className="flex items-center gap-4">
              {connected && (
                <SimpleBadge className="bg-green-100 text-green-800">
                  En línea
                </SimpleBadge>
              )}
              <SimpleButton variant="outline" size="sm">
                Configuración
              </SimpleButton>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center space-x-4">
            {[
              { key: 'form', label: 'Datos del Inmueble', active: step === 'form' },
              { key: 'comparables', label: 'Comparables', active: step === 'comparables' },
              { key: 'models', label: 'Modelos', active: step === 'models' },
              { key: 'results', label: 'Resultados', active: step === 'results' }
            ].map((stepItem, index) => (
              <div key={stepItem.key} className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                  stepItem.active ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  {index + 1}
                </div>
                <span className={`ml-2 text-sm font-medium ${
                  stepItem.active ? 'text-blue-600' : 'text-gray-500'
                }`}>
                  {stepItem.label}
                </span>
                {index < 3 && (
                  <div className="ml-4 w-8 h-0.5 bg-gray-200"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        <AnimatePresence mode="wait">
          {step === 'form' && (
            <motion.div
              key="form"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-6xl mx-auto"
            >
              <SubjectForm
                subject={currentSubject}
                onChange={setCurrentSubject}
                onSubmit={handleSubjectSubmit}
                loading={compsLoading}
              />
            </motion.div>
          )}

          {step === 'comparables' && (
            <motion.div
              key="comparables"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-7xl mx-auto space-y-6"
            >
              <div className="flex justify-between items-center">
                <SimpleButton variant="outline" onClick={() => setStep('form')}>
                  ← Volver a datos
                </SimpleButton>
                <SimpleButton 
                  onClick={() => setStep('models')}
                  disabled={filteredComps.length === 0}
                >
                  Continuar a modelos →
                </SimpleButton>
              </div>
              
              <ComparablesTable comps={filteredComps} loading={compsLoading} />
            </motion.div>
          )}

          {step === 'models' && (
            <motion.div
              key="models"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-6xl mx-auto space-y-6"
            >
              <div className="flex justify-between items-center">
                <SimpleButton variant="outline" onClick={() => setStep('comparables')}>
                  ← Volver a comparables
                </SimpleButton>
              </div>

              <ModelSelector
                models={models}
                selectedModels={selectedModels}
                onModelToggle={handleModelToggle}
                onRunValuation={handleRunValuation}
                loading={valuationLoading}
              />
            </motion.div>
          )}

          {step === 'results' && (
            <motion.div
              key="results"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-6xl mx-auto space-y-6"
            >
              <div className="flex justify-between items-center">
                <SimpleButton variant="outline" onClick={() => setStep('models')}>
                  ← Volver a modelos
                </SimpleButton>
                <div className="flex gap-2">
                  <SimpleButton variant="outline">Exportar PDF</SimpleButton>
                  <SimpleButton variant="outline">Exportar CSV</SimpleButton>
                  <SimpleButton onClick={() => {
                    setStep('form');
                    setCurrentSubject({});
                    setSelectedModels([]);
                  }}>
                    Nueva Valoración
                  </SimpleButton>
                </div>
              </div>

              <ValuationResults results={results} loading={valuationLoading} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AvmPage;