import React, { useState } from 'react';
import { ChevronRight, Target, Shield, Calculator, Rocket } from 'lucide-react';
import type { Goal, Constraints, Recommendation } from '../types';
import { formatMoney, roundPrice } from '../utils';

interface PricingWizardProps {
  onComplete: (data: {
    goal: Goal;
    constraints: Constraints;
    proposal: {
      anchorPrice: number;
      listPrice: number;
      minAcceptable: number;
    };
  }) => void;
  recommendations?: Recommendation[];
}

const PricingWizard: React.FC<PricingWizardProps> = ({ onComplete, recommendations = [] }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [goal, setGoal] = useState<Goal>('EQUILIBRIO');
  const [horizon, setHorizon] = useState(60);
  const [constraints, setConstraints] = useState<Constraints>({
    minOwner: 0,
    bankAppraisal: undefined,
    pendingMortgage: undefined,
    legalWindowDays: undefined
  });
  const [proposal, setProposal] = useState({
    anchorPrice: 0,
    listPrice: 0,
    minAcceptable: 0
  });

  const steps = [
    { id: 1, name: 'Objetivo', icon: Target },
    { id: 2, name: 'Restricciones', icon: Shield },
    { id: 3, name: 'Propuesta', icon: Calculator },
    { id: 4, name: 'Publicación', icon: Rocket }
  ];

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete({ goal, constraints, proposal });
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const applyRecommendation = (rec: Recommendation) => {
    setProposal({
      anchorPrice: rec.anchorPrice,
      listPrice: rec.listPrice,
      minAcceptable: rec.minAcceptable
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Asistente de Precio</h3>

      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-8">
        {steps.map((step, index) => {
          const Icon = step.icon;
          return (
            <React.Fragment key={step.id}>
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    currentStep >= step.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-400'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span className={`text-xs mt-2 ${
                  currentStep >= step.id ? 'text-gray-900' : 'text-gray-400'
                }`}>
                  {step.name}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`flex-1 h-0.5 ${
                    currentStep > step.id ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Step Content */}
      <div className="min-h-[300px]">
        {currentStep === 1 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Objetivo de venta
              </label>
              <div className="grid grid-cols-1 gap-3">
                {[
                  { value: 'RAPIDEZ', label: 'Venta rápida', desc: 'Priorizar velocidad sobre precio' },
                  { value: 'EQUILIBRIO', label: 'Equilibrio', desc: 'Balance entre tiempo y precio' },
                  { value: 'MAX_PRECIO', label: 'Maximizar precio', desc: 'Obtener el mejor precio posible' }
                ].map((option) => (
                  <label
                    key={option.value}
                    className={`flex items-start p-4 border rounded-lg cursor-pointer transition-colors ${
                      goal === option.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="goal"
                      value={option.value}
                      checked={goal === option.value}
                      onChange={(e) => setGoal(e.target.value as Goal)}
                      className="mt-1 mr-3"
                    />
                    <div>
                      <p className="font-medium text-gray-900">{option.label}</p>
                      <p className="text-sm text-gray-500">{option.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Horizonte temporal
              </label>
              <select
                value={horizon}
                onChange={(e) => setHorizon(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value={30}>30 días</option>
                <option value={60}>60 días</option>
                <option value={90}>90 días</option>
                <option value={120}>120 días</option>
              </select>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Precio mínimo del propietario *
              </label>
              <input
                type="number"
                value={constraints.minOwner || ''}
                onChange={(e) => setConstraints({
                  ...constraints,
                  minOwner: Number(e.target.value)
                })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tasación bancaria
              </label>
              <input
                type="number"
                value={constraints.bankAppraisal || ''}
                onChange={(e) => setConstraints({
                  ...constraints,
                  bankAppraisal: e.target.value ? Number(e.target.value) : undefined
                })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Opcional"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hipoteca pendiente
              </label>
              <input
                type="number"
                value={constraints.pendingMortgage || ''}
                onChange={(e) => setConstraints({
                  ...constraints,
                  pendingMortgage: e.target.value ? Number(e.target.value) : undefined
                })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Opcional"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ventana legal (días)
              </label>
              <input
                type="number"
                value={constraints.legalWindowDays || ''}
                onChange={(e) => setConstraints({
                  ...constraints,
                  legalWindowDays: e.target.value ? Number(e.target.value) : undefined
                })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Opcional"
              />
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-6">
            {recommendations.length > 0 && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-700 mb-2">Recomendaciones disponibles:</p>
                <div className="space-y-2">
                  {recommendations.slice(0, 2).map((rec) => (
                    <button
                      key={rec.id}
                      onClick={() => applyRecommendation(rec)}
                      className="w-full text-left p-2 bg-white rounded border border-blue-300 hover:bg-blue-100 transition-colors"
                    >
                      <p className="text-sm font-medium">
                        Lista: {formatMoney(rec.listPrice)} • Min: {formatMoney(rec.minAcceptable)}
                      </p>
                      <p className="text-xs text-gray-600">
                        DOM esperado: {rec.domP50} días • Prob. cierre 60d: {Math.round(rec.closeProb60d * 100)}%
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Precio ancla (anchor)
                </label>
                <input
                  type="number"
                  value={proposal.anchorPrice || ''}
                  onChange={(e) => setProposal({
                    ...proposal,
                    anchorPrice: Number(e.target.value)
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Precio psicológico de referencia (puede ser mayor al de lista)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Precio de lista
                </label>
                <input
                  type="number"
                  value={proposal.listPrice || ''}
                  onChange={(e) => setProposal({
                    ...proposal,
                    listPrice: Number(e.target.value)
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0"
                />
                <div className="flex gap-2 mt-2">
                  {['99', '95', '000'].map((ending) => (
                    <button
                      key={ending}
                      onClick={() => setProposal({
                        ...proposal,
                        listPrice: roundPrice(proposal.listPrice, ending as any)
                      })}
                      className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                    >
                      Redondear {ending}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Precio mínimo negociable
                </label>
                <input
                  type="number"
                  value={proposal.minAcceptable || ''}
                  onChange={(e) => setProposal({
                    ...proposal,
                    minAcceptable: Number(e.target.value)
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Por debajo de este precio no se aceptarán ofertas
                </p>
              </div>
            </div>
          </div>
        )}

        {currentStep === 4 && (
          <div className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-4">Resumen de la estrategia</h4>
              <dl className="space-y-2">
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-600">Objetivo:</dt>
                  <dd className="text-sm font-medium">
                    {goal === 'RAPIDEZ' ? 'Venta rápida' : 
                     goal === 'EQUILIBRIO' ? 'Equilibrio' : 'Maximizar precio'}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-600">Horizonte:</dt>
                  <dd className="text-sm font-medium">{horizon} días</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-600">Precio ancla:</dt>
                  <dd className="text-sm font-medium">{formatMoney(proposal.anchorPrice)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-600">Precio de lista:</dt>
                  <dd className="text-sm font-medium">{formatMoney(proposal.listPrice)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-600">Mínimo aceptable:</dt>
                  <dd className="text-sm font-medium">{formatMoney(proposal.minAcceptable)}</dd>
                </div>
              </dl>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-700">
                Al confirmar, se aplicará la estrategia de precio a los canales de publicación configurados.
                Podrás revisar y ajustar los precios por canal antes de la publicación final.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
        <button
          onClick={handlePrev}
          disabled={currentStep === 1}
          className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Anterior
        </button>
        <button
          onClick={handleNext}
          disabled={currentStep === 2 && !constraints.minOwner}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
        >
          {currentStep === 4 ? 'Aplicar estrategia' : 'Siguiente'}
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default PricingWizard;