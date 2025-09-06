import { useState } from 'react';
import { FileText, AlertTriangle, Shield, ChevronRight, ChevronLeft, Download } from 'lucide-react';
import { useDpiaLight } from '../hooks';
import type { DpiaReport } from '../types';

export function DpiaLightWizard() {
  const { currentReport, create } = useDpiaLight();
  const [step, setStep] = useState(1);
  
  const [formData, setFormData] = useState<Partial<DpiaReport>>({
    scope: '',
    context: '',
    risks: [],
    measures: [],
    responsible: '',
  });

  const [newRisk, setNewRisk] = useState({
    category: 'legal' as const,
    description: '',
    score: 3,
    mitigation: '',
  });

  const [newMeasure, setNewMeasure] = useState('');

  const handleAddRisk = () => {
    if (!newRisk.description) return;
    
    setFormData({
      ...formData,
      risks: [
        ...(formData.risks || []),
        { ...newRisk, id: `risk-${Date.now()}` }
      ],
    });
    
    setNewRisk({
      category: 'legal',
      description: '',
      score: 3,
      mitigation: '',
    });
  };

  const handleRemoveRisk = (id: string) => {
    setFormData({
      ...formData,
      risks: formData.risks?.filter(r => r.id !== id) || [],
    });
  };

  const handleAddMeasure = () => {
    if (!newMeasure) return;
    
    setFormData({
      ...formData,
      measures: [...(formData.measures || []), newMeasure],
    });
    setNewMeasure('');
  };

  const handleRemoveMeasure = (index: number) => {
    setFormData({
      ...formData,
      measures: formData.measures?.filter((_, i) => i !== index) || [],
    });
  };

  const handleSubmit = async () => {
    await create.mutateAsync(formData);
    setStep(4);
  };

  const downloadReport = () => {
    const report = currentReport || formData;
    const content = `
EVALUACIÓN DE IMPACTO EN PROTECCIÓN DE DATOS (DPIA LIGHT)
==========================================================

ALCANCE:
${report.scope}

CONTEXTO:
${report.context}

EVALUACIÓN DE RIESGOS:
${report.risks?.map((r, i) => `
${i + 1}. [${r.category.toUpperCase()}] ${r.description}
   - Puntuación de riesgo: ${r.score}/5
   ${r.mitigation ? `- Mitigación: ${r.mitigation}` : ''}
`).join('')}

MEDIDAS DE MITIGACIÓN:
${report.measures?.map((m, i) => `${i + 1}. ${m}`).join('\n')}

RESPONSABLE:
${report.responsible}

Fecha de generación: ${new Date().toLocaleDateString('es-ES')}
    `;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dpia-light-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getRiskColor = (score: number) => {
    if (score >= 4) return 'text-red-600 bg-red-50';
    if (score >= 3) return 'text-yellow-600 bg-yellow-50';
    return 'text-green-600 bg-green-50';
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b">
        <h3 className="text-lg font-semibold mb-2">Asistente DPIA Ligero</h3>
        <div className="flex items-center gap-2 mt-4">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`flex-1 h-2 rounded-full ${
                s <= step ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
        <div className="flex justify-between mt-2 text-xs text-gray-600">
          <span>Contexto</span>
          <span>Riesgos</span>
          <span>Medidas</span>
          <span>Resumen</span>
        </div>
      </div>

      <div className="p-6">
        {step === 1 && (
          <div className="space-y-4">
            <h4 className="font-medium mb-3">Paso 1: Contexto y Alcance</h4>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Alcance del tratamiento
              </label>
              <textarea
                value={formData.scope}
                onChange={(e) => setFormData({ ...formData, scope: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Describa qué datos se tratarán y con qué finalidad..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contexto de la operación
              </label>
              <textarea
                value={formData.context}
                onChange={(e) => setFormData({ ...formData, context: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Tipo de operación, partes involucradas, duración..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Responsable del tratamiento
              </label>
              <input
                type="text"
                value={formData.responsible}
                onChange={(e) => setFormData({ ...formData, responsible: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="DPO o responsable de cumplimiento"
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h4 className="font-medium mb-3">Paso 2: Evaluación de Riesgos</h4>
            
            <div className="border rounded-lg p-4 bg-gray-50">
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Categoría
                  </label>
                  <select
                    value={newRisk.category}
                    onChange={(e) => setNewRisk({ ...newRisk, category: e.target.value as any })}
                    className="w-full px-2 py-1 text-sm border rounded"
                  >
                    <option value="legal">Legal</option>
                    <option value="security">Seguridad</option>
                    <option value="operational">Operacional</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Puntuación (1-5)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={newRisk.score}
                    onChange={(e) => setNewRisk({ ...newRisk, score: Number(e.target.value) })}
                    className="w-full px-2 py-1 text-sm border rounded"
                  />
                </div>
              </div>
              
              <input
                type="text"
                value={newRisk.description}
                onChange={(e) => setNewRisk({ ...newRisk, description: e.target.value })}
                placeholder="Descripción del riesgo"
                className="w-full px-2 py-1 text-sm border rounded mb-2"
              />
              
              <input
                type="text"
                value={newRisk.mitigation}
                onChange={(e) => setNewRisk({ ...newRisk, mitigation: e.target.value })}
                placeholder="Medida de mitigación (opcional)"
                className="w-full px-2 py-1 text-sm border rounded mb-2"
              />
              
              <button
                onClick={handleAddRisk}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Añadir riesgo
              </button>
            </div>

            <div className="space-y-2">
              {formData.risks?.map((risk) => (
                <div
                  key={risk.id}
                  className={`border rounded-lg p-3 ${getRiskColor(risk.score)}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <AlertTriangle className="h-4 w-4" />
                        <span className="font-medium text-sm">
                          [{risk.category}] Riesgo {risk.score}/5
                        </span>
                      </div>
                      <p className="text-sm">{risk.description}</p>
                      {risk.mitigation && (
                        <p className="text-xs mt-1 opacity-75">
                          Mitigación: {risk.mitigation}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => handleRemoveRisk(risk.id)}
                      className="ml-2 text-red-600 hover:text-red-800"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
              
              {(!formData.risks || formData.risks.length === 0) && (
                <div className="text-center py-4 text-gray-500 text-sm">
                  No hay riesgos evaluados. Añada al menos un riesgo.
                </div>
              )}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h4 className="font-medium mb-3">Paso 3: Medidas de Mitigación</h4>
            
            <div className="border rounded-lg p-4 bg-gray-50">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMeasure}
                  onChange={(e) => setNewMeasure(e.target.value)}
                  placeholder="Describa una medida de mitigación..."
                  className="flex-1 px-3 py-2 border rounded-lg"
                />
                <button
                  onClick={handleAddMeasure}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Añadir
                </button>
              </div>
            </div>

            <div className="space-y-2">
              {formData.measures?.map((measure, index) => (
                <div key={index} className="flex items-center gap-2 p-3 border rounded-lg">
                  <Shield className="h-4 w-4 text-green-600" />
                  <span className="flex-1 text-sm">{measure}</span>
                  <button
                    onClick={() => handleRemoveMeasure(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    ×
                  </button>
                </div>
              ))}
              
              {(!formData.measures || formData.measures.length === 0) && (
                <div className="text-center py-4 text-gray-500 text-sm">
                  No hay medidas definidas. Añada al menos una medida de mitigación.
                </div>
              )}
            </div>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h5 className="font-medium text-blue-900 mb-2">Medidas recomendadas:</h5>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Cifrado de datos en tránsito y reposo</li>
                <li>• Control de acceso basado en roles</li>
                <li>• Registro de auditoría de accesos</li>
                <li>• Formación del personal</li>
                <li>• Revisión periódica de permisos</li>
                <li>• Procedimientos de respuesta a incidentes</li>
              </ul>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <h4 className="font-medium mb-3">Paso 4: Resumen del DPIA</h4>
            
            <div className="border rounded-lg p-4 space-y-3">
              <div>
                <h5 className="text-sm font-medium text-gray-700">Alcance:</h5>
                <p className="text-sm mt-1">{formData.scope}</p>
              </div>
              
              <div>
                <h5 className="text-sm font-medium text-gray-700">Contexto:</h5>
                <p className="text-sm mt-1">{formData.context}</p>
              </div>
              
              <div>
                <h5 className="text-sm font-medium text-gray-700">
                  Riesgos identificados: {formData.risks?.length || 0}
                </h5>
                <div className="mt-2 space-y-1">
                  {formData.risks?.map((risk, i) => (
                    <div key={i} className="text-sm flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-xs ${getRiskColor(risk.score)}`}>
                        {risk.score}/5
                      </span>
                      <span>{risk.description}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h5 className="text-sm font-medium text-gray-700">
                  Medidas de mitigación: {formData.measures?.length || 0}
                </h5>
                <ul className="mt-2 space-y-1">
                  {formData.measures?.map((measure, i) => (
                    <li key={i} className="text-sm">• {measure}</li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h5 className="text-sm font-medium text-gray-700">Responsable:</h5>
                <p className="text-sm mt-1">{formData.responsible}</p>
              </div>
            </div>

            {create.isSuccess && (
              <div className="p-3 bg-green-50 text-green-700 rounded-lg">
                ✓ DPIA creado exitosamente. ID: {currentReport?.id}
              </div>
            )}

            <button
              onClick={downloadReport}
              className="w-full py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
            >
              <Download className="h-4 w-4" />
              Descargar informe DPIA
            </button>
          </div>
        )}

        <div className="flex justify-between mt-6">
          <button
            onClick={() => setStep(Math.max(1, step - 1))}
            disabled={step === 1}
            className="px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Anterior
          </button>
          
          {step < 4 ? (
            <button
              onClick={() => {
                if (step === 3) {
                  handleSubmit();
                } else {
                  setStep(step + 1);
                }
              }}
              disabled={
                (step === 1 && (!formData.scope || !formData.context || !formData.responsible)) ||
                (step === 2 && (!formData.risks || formData.risks.length === 0)) ||
                (step === 3 && (!formData.measures || formData.measures.length === 0))
              }
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {step === 3 ? 'Generar informe' : 'Siguiente'}
              <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={() => {
                setStep(1);
                setFormData({
                  scope: '',
                  context: '',
                  risks: [],
                  measures: [],
                  responsible: '',
                });
              }}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50"
            >
              Nuevo DPIA
            </button>
          )}
        </div>
      </div>
    </div>
  );
}