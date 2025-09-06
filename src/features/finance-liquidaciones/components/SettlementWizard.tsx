import React from 'react';
import { X, ChevronLeft, ChevronRight, Check, Calendar, Users, Calculator, FileText } from 'lucide-react';
import type { WizardStep1Data, WizardStep2Data, WizardStep3Data, WizardStep4Data, CommissionItem, CalculationResult } from '../types';
import { useSettlementWizard, useCatalogs } from '../hooks';
import { formatCurrency, formatDate, formatPeriod } from '../utils';
import { validateWizardStep1, validateWizardStep2, validateWizardStep4 } from '../schema';

interface SettlementWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (settlement: any) => void;
}

export const SettlementWizard: React.FC<SettlementWizardProps> = ({ isOpen, onClose, onComplete }) => {
  const {
    currentStep,
    step1Data,
    step2Data,
    step3Data,
    step4Data,
    isLoading,
    error,
    completeStep1,
    loadEligibleCommissions,
    completeStep2,
    calculateStep3,
    completeStep3,
    completeStep4,
    goToStep,
    resetWizard
  } = useSettlementWizard();

  const { offices, teams, agents, getTeamsByOffice, getAgentsByTeam } = useCatalogs();

  const handleClose = () => {
    resetWizard();
    onClose();
  };

  const handleComplete = async (data: WizardStep4Data) => {
    const result = await completeStep4(data);
    if (result) {
      onComplete(result);
      handleClose();
    }
  };

  if (!isOpen) return null;

  const steps = [
    { number: 1, title: 'Configuración', icon: Calendar },
    { number: 2, title: 'Selección', icon: Users },
    { number: 3, title: 'Cálculos', icon: Calculator },
    { number: 4, title: 'Finalizar', icon: FileText },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={handleClose}></div>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          {/* Header */}
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Nueva liquidación</h3>
              <button onClick={handleClose} className="p-2 hover:bg-gray-100 rounded">
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Progress Steps */}
            <div className="flex items-center mt-4">
              {steps.map((step, index) => {
                const Icon = step.icon;
                const isActive = currentStep === step.number;
                const isCompleted = currentStep > step.number;
                
                return (
                  <React.Fragment key={step.number}>
                    <div className="flex items-center">
                      <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                        isCompleted ? 'bg-green-500 border-green-500 text-white' :
                        isActive ? 'bg-blue-500 border-blue-500 text-white' :
                        'border-gray-300 text-gray-400'
                      }`}>
                        {isCompleted ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                      </div>
                      <div className="ml-2">
                        <div className={`text-sm font-medium ${
                          isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-400'
                        }`}>
                          {step.title}
                        </div>
                      </div>
                    </div>
                    {index < steps.length - 1 && (
                      <div className={`flex-1 h-0.5 mx-4 ${
                        isCompleted ? 'bg-green-500' : 'bg-gray-300'
                      }`} />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-6 min-h-96">
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            {currentStep === 1 && <Step1 onComplete={completeStep1} onLoadCommissions={loadEligibleCommissions} />}
            {currentStep === 2 && step2Data && <Step2 data={step2Data} onComplete={completeStep2} onCalculate={calculateStep3} />}
            {currentStep === 3 && step3Data && <Step3 data={step3Data} onComplete={completeStep3} />}
            {currentStep === 4 && <Step4 onComplete={handleComplete} />}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 flex justify-between">
            <button
              onClick={currentStep > 1 ? () => goToStep(currentStep - 1) : handleClose}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
              disabled={isLoading}
            >
              <ChevronLeft className="h-4 w-4" />
              {currentStep > 1 ? 'Anterior' : 'Cancelar'}
            </button>

            {isLoading && (
              <div className="flex items-center gap-2 text-blue-600">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                Procesando...
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Step 1 Component
const Step1: React.FC<{ onComplete: (data: WizardStep1Data) => void; onLoadCommissions: () => void }> = ({ onComplete, onLoadCommissions }) => {
  const { offices, getTeamsByOffice, getAgentsByTeam } = useCatalogs();
  const [formData, setFormData] = React.useState<WizardStep1Data>({
    period: new Date().toISOString().slice(0, 7),
    scope: 'OFFICE',
    origin: 'VENTA',
    onlyApproved: true
  });
  const [errors, setErrors] = React.useState<string[]>([]);

  const teams = formData.officeId ? getTeamsByOffice(formData.officeId) : [];
  const agents = formData.teamId ? getAgentsByTeam(formData.teamId) : [];

  const handleSubmit = async () => {
    const validation = validateWizardStep1(formData);
    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }

    setErrors([]);
    onComplete(formData);
    await onLoadCommissions();
  };

  return (
    <div className="space-y-6">
      <div>
        <h4 className="text-lg font-medium text-gray-900 mb-4">Configuración de la liquidación</h4>
        
        {errors.length > 0 && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <ul className="text-red-700 text-sm space-y-1">
              {errors.map((error, index) => <li key={index}>• {error}</li>)}
            </ul>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Período</label>
            <input
              type="month"
              value={formData.period}
              onChange={(e) => setFormData({ ...formData, period: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Origen</label>
            <select
              value={formData.origin}
              onChange={(e) => setFormData({ ...formData, origin: e.target.value as any })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="VENTA">Venta</option>
              <option value="ALQUILER">Alquiler</option>
              <option value="MIXTO">Mixto</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Ámbito</label>
            <div className="space-y-3">
              <div className="flex gap-4">
                {(['OFFICE', 'TEAM', 'AGENT'] as const).map((scope) => (
                  <label key={scope} className="flex items-center">
                    <input
                      type="radio"
                      name="scope"
                      value={scope}
                      checked={formData.scope === scope}
                      onChange={(e) => setFormData({ ...formData, scope: e.target.value as any })}
                      className="mr-2"
                    />
                    {scope === 'OFFICE' ? 'Oficina' : scope === 'TEAM' ? 'Equipo' : 'Agente individual'}
                  </label>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <select
                  value={formData.officeId || ''}
                  onChange={(e) => setFormData({ ...formData, officeId: e.target.value || undefined, teamId: undefined, agentId: undefined })}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={formData.scope === 'OFFICE'}
                >
                  <option value="">Seleccionar oficina</option>
                  {offices.map(office => <option key={office.id} value={office.id}>{office.name}</option>)}
                </select>

                <select
                  value={formData.teamId || ''}
                  onChange={(e) => setFormData({ ...formData, teamId: e.target.value || undefined, agentId: undefined })}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={formData.scope !== 'TEAM' && formData.scope !== 'AGENT' || !teams.length}
                >
                  <option value="">Seleccionar equipo</option>
                  {teams.map(team => <option key={team.id} value={team.id}>{team.name}</option>)}
                </select>

                <select
                  value={formData.agentId || ''}
                  onChange={(e) => setFormData({ ...formData, agentId: e.target.value || undefined })}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={formData.scope !== 'AGENT' || !agents.length}
                >
                  <option value="">Seleccionar agente</option>
                  {agents.map(agent => <option key={agent.id} value={agent.id}>{agent.name}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.onlyApproved}
                onChange={(e) => setFormData({ ...formData, onlyApproved: e.target.checked })}
                className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              Solo incluir comisiones aprobadas
            </label>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSubmit}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          Continuar
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

// Step 2 Component
const Step2: React.FC<{ 
  data: WizardStep2Data;
  onComplete: (selectedItems: string[]) => void;
  onCalculate: () => void;
}> = ({ data, onComplete, onCalculate }) => {
  const [selectedItems, setSelectedItems] = React.useState<Set<string>>(new Set());
  const [errors, setErrors] = React.useState<string[]>([]);

  const handleSubmit = async () => {
    const selectedArray = Array.from(selectedItems);
    const validation = validateWizardStep2({ selectedItems: selectedArray });
    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }

    setErrors([]);
    onComplete(selectedArray);
    await onCalculate();
  };

  const toggleItem = (itemId: string) => {
    const newSet = new Set(selectedItems);
    if (newSet.has(itemId)) {
      newSet.delete(itemId);
    } else {
      newSet.add(itemId);
    }
    setSelectedItems(newSet);
  };

  return (
    <div className="space-y-6">
      <div>
        <h4 className="text-lg font-medium text-gray-900 mb-4">
          Seleccionar comisiones ({data.items.length} disponibles)
        </h4>
        
        {errors.length > 0 && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <ul className="text-red-700 text-sm space-y-1">
              {errors.map((error, index) => <li key={index}>• {error}</li>)}
            </ul>
          </div>
        )}

        <div className="mb-4 flex justify-between items-center">
          <span className="text-sm text-gray-600">
            {selectedItems.size} de {data.items.length} seleccionadas
          </span>
          <button
            onClick={() => setSelectedItems(selectedItems.size === data.items.length ? new Set() : new Set(data.items.map(item => item.id)))}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            {selectedItems.size === data.items.length ? 'Deseleccionar todas' : 'Seleccionar todas'}
          </button>
        </div>

        <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg">
          {data.items.map((item) => (
            <div
              key={item.id}
              className={`p-3 border-b border-gray-200 cursor-pointer hover:bg-gray-50 ${
                selectedItems.has(item.id) ? 'bg-blue-50' : ''
              }`}
              onClick={() => toggleItem(item.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={selectedItems.has(item.id)}
                    onChange={() => {}}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <div>
                    <div className="text-sm font-medium text-gray-900">{item.ref}</div>
                    <div className="text-sm text-gray-500">{item.agentName}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">
                    {formatCurrency(item.commissionAmount)}
                  </div>
                  <div className="text-sm text-gray-500">
                    {formatDate(item.date)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSubmit}
          disabled={selectedItems.size === 0}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          Calcular
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

// Step 3 Component
const Step3: React.FC<{ 
  data: WizardStep3Data;
  onComplete: () => void;
}> = ({ data, onComplete }) => {
  return (
    <div className="space-y-6">
      <div>
        <h4 className="text-lg font-medium text-gray-900 mb-4">Resumen de cálculos</h4>
        
        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-gray-900">{formatCurrency(data.totalGross)}</div>
              <div className="text-sm text-gray-600">Total bruto</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">-{formatCurrency(data.totalWithholdings)}</div>
              <div className="text-sm text-gray-600">Retenciones</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{formatCurrency(data.totalNet)}</div>
              <div className="text-sm text-gray-600">Total neto</div>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h5 className="font-medium text-gray-900">Detalle por agente</h5>
          {data.calculations.map((calc) => (
            <div key={calc.agentId} className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-medium text-gray-900">{calc.agentName}</div>
                  <div className="text-sm text-gray-500">{calc.items.length} comisiones</div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-medium text-gray-900">{formatCurrency(calc.net)}</div>
                  <div className="text-sm text-gray-500">
                    Bruto: {formatCurrency(calc.gross)} | Ret.: {formatCurrency(calc.withholdings)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={onComplete}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          Continuar
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

// Step 4 Component
const Step4: React.FC<{ onComplete: (data: WizardStep4Data) => void }> = ({ onComplete }) => {
  const [formData, setFormData] = React.useState<WizardStep4Data>({
    name: '',
    notes: ''
  });
  const [errors, setErrors] = React.useState<string[]>([]);

  const handleSubmit = () => {
    const validation = validateWizardStep4(formData);
    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }

    setErrors([]);
    onComplete(formData);
  };

  return (
    <div className="space-y-6">
      <div>
        <h4 className="text-lg font-medium text-gray-900 mb-4">Finalizar liquidación</h4>
        
        {errors.length > 0 && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <ul className="text-red-700 text-sm space-y-1">
              {errors.map((error, index) => <li key={index}>• {error}</li>)}
            </ul>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nombre de la liquidación</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Ej: Liquidación enero 2024 - Oficina Madrid"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Notas (opcional)</label>
            <textarea
              value={formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Notas adicionales sobre esta liquidación..."
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSubmit}
          className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
        >
          <Check className="h-4 w-4" />
          Crear liquidación
        </button>
      </div>
    </div>
  );
};