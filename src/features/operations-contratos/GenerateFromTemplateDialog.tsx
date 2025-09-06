import React, { useState, useEffect } from 'react';
import type { ContractTemplate, GenerateFromTemplateData } from './types';
import { contractsApi } from './apis';

interface GenerateFromTemplateDialogProps {
  contractId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: GenerateFromTemplateData) => void;
  isLoading: boolean;
}

export default function GenerateFromTemplateDialog({
  contractId,
  isOpen,
  onClose,
  onSubmit,
  isLoading
}: GenerateFromTemplateDialogProps) {
  const [templates, setTemplates] = useState<ContractTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<ContractTemplate | null>(null);
  const [variables, setVariables] = useState<Record<string, any>>({});
  const [loadingTemplates, setLoadingTemplates] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadTemplates();
    } else {
      // Reset state when dialog closes
      setSelectedTemplate(null);
      setVariables({});
    }
  }, [isOpen]);

  const loadTemplates = async () => {
    setLoadingTemplates(true);
    try {
      const templatesData = await contractsApi.getTemplates();
      setTemplates(templatesData);
    } catch (error) {
      console.error('Error loading templates:', error);
    } finally {
      setLoadingTemplates(false);
    }
  };

  const handleTemplateSelect = (template: ContractTemplate) => {
    setSelectedTemplate(template);
    
    // Initialize variables with empty values
    const initialVariables: Record<string, any> = {};
    template.variables.forEach(variable => {
      initialVariables[variable] = '';
    });
    setVariables(initialVariables);
  };

  const handleVariableChange = (variable: string, value: any) => {
    setVariables(prev => ({
      ...prev,
      [variable]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedTemplate || !contractId) return;

    // Validate required variables
    const missingVariables = selectedTemplate.variables.filter(
      variable => !variables[variable] || variables[variable].toString().trim() === ''
    );

    if (missingVariables.length > 0) {
      alert(`Por favor complete las siguientes variables: ${missingVariables.join(', ')}`);
      return;
    }

    onSubmit({
      templateId: selectedTemplate.id,
      templateName: selectedTemplate.name,
      variables
    });
  };

  const renderVariableInput = (variable: string) => {
    const value = variables[variable] || '';
    const isDate = variable.toLowerCase().includes('fecha');
    const isNumber = variable.toLowerCase().includes('precio') || 
                     variable.toLowerCase().includes('monto') || 
                     variable.toLowerCase().includes('valor');

    if (isDate) {
      return (
        <input
          type="date"
          value={value}
          onChange={(e) => handleVariableChange(variable, e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      );
    }

    if (isNumber) {
      return (
        <input
          type="number"
          value={value}
          onChange={(e) => handleVariableChange(variable, e.target.value)}
          placeholder="0"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      );
    }

    return (
      <input
        type="text"
        value={value}
        onChange={(e) => handleVariableChange(variable, e.target.value)}
        placeholder={`Ingrese ${variable.replace('_', ' ')}`}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Generar desde Plantilla</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
              disabled={isLoading}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Template Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Seleccionar Plantilla
              </label>
              
              {loadingTemplates ? (
                <div className="flex items-center justify-center py-8">
                  <svg className="animate-spin w-6 h-6 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span className="text-gray-600">Cargando plantillas...</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {templates.map((template) => (
                    <div
                      key={template.id}
                      onClick={() => handleTemplateSelect(template)}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                        selectedTemplate?.id === template.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-gray-900">{template.name}</h3>
                          <p className="text-sm text-gray-600 capitalize">
                            Tipo: {template.type}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Variables: {template.variables.length}
                          </p>
                        </div>
                        <div className="flex items-center">
                          <svg 
                            className={`w-5 h-5 ${selectedTemplate?.id === template.id ? 'text-blue-600' : 'text-gray-400'}`} 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {templates.length === 0 && !loadingTemplates && (
                <div className="text-center py-8 text-gray-500">
                  <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p>No hay plantillas disponibles</p>
                </div>
              )}
            </div>

            {/* Template Preview */}
            {selectedTemplate && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Vista Previa de la Plantilla
                </label>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">{selectedTemplate.name}</h4>
                  <div className="text-sm text-gray-600 whitespace-pre-line">
                    {selectedTemplate.content.substring(0, 300)}
                    {selectedTemplate.content.length > 300 && '...'}
                  </div>
                </div>
              </div>
            )}

            {/* Variables Configuration */}
            {selectedTemplate && selectedTemplate.variables.length > 0 && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Configurar Variables
                </label>
                <div className="space-y-4">
                  {selectedTemplate.variables.map((variable) => (
                    <div key={variable}>
                      <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                        {variable.replace(/_/g, ' ')} *
                      </label>
                      {renderVariableInput(variable)}
                    </div>
                  ))}
                </div>
                
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start">
                    <svg className="w-5 h-5 text-blue-600 mt-0.5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <p className="text-sm text-blue-800 font-medium">Información sobre variables</p>
                      <p className="text-xs text-blue-700 mt-1">
                        Estas variables se reemplazarán automáticamente en el contrato generado.
                        Asegúrese de completar todos los campos requeridos.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isLoading || !selectedTemplate}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Generando...</span>
                  </div>
                ) : (
                  'Generar Contrato'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}