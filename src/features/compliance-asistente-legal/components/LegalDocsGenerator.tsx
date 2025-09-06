import { useState, useEffect } from 'react';
import { FileText, Download, Edit3, Copy } from 'lucide-react';
import { useLegalDocuments } from '../hooks';

export function LegalDocsGenerator() {
  const { templates, loadTemplates, generate } = useLegalDocuments();
  const [selectedTemplate, setSelectedTemplate] = useState<string>('mandate');
  const [generatedDoc, setGeneratedDoc] = useState<any>(null);
  
  const [variables, setVariables] = useState({
    client_name: '',
    client_dni: '',
    client_address: '',
    agency_name: '',
    agency_cif: '',
    agency_address: '',
    property_address: '',
    property_ref: '',
    price: '',
    commission: '',
    date: new Date().toLocaleDateString('es-ES'),
    duration: '6 meses',
    exclusive: 'sí',
  });

  useEffect(() => {
    loadTemplates();
  }, [loadTemplates]);

  const templateInfo = {
    mandate: {
      name: 'Mandato de venta/alquiler',
      description: 'Autorización del propietario para gestionar la operación',
      requiredVars: ['client_name', 'agency_name', 'property_address', 'date', 'duration'],
    },
    dpa: {
      name: 'Encargo de tratamiento (DPA)',
      description: 'Acuerdo de procesamiento de datos con proveedores',
      requiredVars: ['agency_name', 'agency_cif', 'date'],
    },
    privacy_clauses: {
      name: 'Cláusulas RGPD',
      description: 'Cláusulas de protección de datos para contratos',
      requiredVars: ['agency_name', 'agency_address', 'date'],
    },
    assignment: {
      name: 'Contrato de cesión',
      description: 'Cesión de derechos sobre la propiedad',
      requiredVars: ['client_name', 'agency_name', 'property_address', 'price', 'date'],
    },
  };

  const handleGenerate = async () => {
    const result = await generate.mutateAsync({
      template: selectedTemplate as any,
      variables,
    });
    setGeneratedDoc(result);
  };

  const handleDownload = () => {
    if (!generatedDoc) return;
    
    const blob = new Blob([generatedDoc.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedTemplate}-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopy = () => {
    if (!generatedDoc) return;
    navigator.clipboard.writeText(generatedDoc.content);
  };

  const currentTemplateInfo = templateInfo[selectedTemplate as keyof typeof templateInfo];
  const missingVars = currentTemplateInfo?.requiredVars.filter(
    v => !variables[v as keyof typeof variables]
  ) || [];

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b">
        <h3 className="text-lg font-semibold mb-2">Generador de Documentos Legales</h3>
        <p className="text-sm text-gray-600">
          Genera documentos legales con las variables necesarias para tu operación
        </p>
      </div>

      <div className="p-6">
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Seleccionar plantilla
          </label>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(templateInfo).map(([key, info]) => (
              <button
                key={key}
                onClick={() => setSelectedTemplate(key)}
                className={`p-4 border rounded-lg text-left hover:bg-gray-50 ${
                  selectedTemplate === key
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200'
                }`}
              >
                <div className="flex items-start gap-3">
                  <FileText className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-sm">{info.name}</h4>
                    <p className="text-xs text-gray-500 mt-1">{info.description}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="border-t pt-6">
          <h4 className="font-medium mb-4">Variables del documento</h4>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Nombre cliente *
              </label>
              <input
                type="text"
                value={variables.client_name}
                onChange={(e) => setVariables({ ...variables, client_name: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-sm"
                placeholder="Juan Pérez García"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                DNI/NIE cliente
              </label>
              <input
                type="text"
                value={variables.client_dni}
                onChange={(e) => setVariables({ ...variables, client_dni: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-sm"
                placeholder="12345678A"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Nombre agencia *
              </label>
              <input
                type="text"
                value={variables.agency_name}
                onChange={(e) => setVariables({ ...variables, agency_name: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-sm"
                placeholder="Inmobiliaria XYZ S.L."
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                CIF agencia
              </label>
              <input
                type="text"
                value={variables.agency_cif}
                onChange={(e) => setVariables({ ...variables, agency_cif: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-sm"
                placeholder="B12345678"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Dirección propiedad
              </label>
              <input
                type="text"
                value={variables.property_address}
                onChange={(e) => setVariables({ ...variables, property_address: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-sm"
                placeholder="Calle Mayor 123, 28001 Madrid"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Precio
              </label>
              <input
                type="text"
                value={variables.price}
                onChange={(e) => setVariables({ ...variables, price: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-sm"
                placeholder="250.000 €"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Comisión
              </label>
              <input
                type="text"
                value={variables.commission}
                onChange={(e) => setVariables({ ...variables, commission: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-sm"
                placeholder="3% + IVA"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Duración mandato
              </label>
              <select
                value={variables.duration}
                onChange={(e) => setVariables({ ...variables, duration: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-sm"
              >
                <option value="3 meses">3 meses</option>
                <option value="6 meses">6 meses</option>
                <option value="1 año">1 año</option>
                <option value="indefinido">Indefinido</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Exclusividad
              </label>
              <select
                value={variables.exclusive}
                onChange={(e) => setVariables({ ...variables, exclusive: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-sm"
              >
                <option value="sí">Sí</option>
                <option value="no">No</option>
              </select>
            </div>
          </div>

          {missingVars.length > 0 && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                Faltan variables obligatorias: {missingVars.join(', ')}
              </p>
            </div>
          )}

          <button
            onClick={handleGenerate}
            disabled={missingVars.length > 0 || generate.isPending}
            className="mt-6 w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {generate.isPending ? 'Generando...' : 'Generar documento'}
          </button>
        </div>

        {generatedDoc && (
          <div className="mt-6 border-t pt-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium">Documento generado</h4>
              <div className="flex gap-2">
                <button
                  onClick={handleCopy}
                  className="px-3 py-1 text-sm border rounded hover:bg-gray-50 flex items-center gap-1"
                >
                  <Copy className="h-3 w-3" />
                  Copiar
                </button>
                <button
                  onClick={handleDownload}
                  className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-1"
                >
                  <Download className="h-3 w-3" />
                  Descargar
                </button>
              </div>
            </div>

            <div className="border rounded-lg p-4 bg-gray-50">
              <pre className="text-sm whitespace-pre-wrap font-mono">
                {generatedDoc.content}
              </pre>
            </div>

            <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
              <span>ID: {generatedDoc.id}</span>
              <span>Versión: {generatedDoc.version}</span>
              <span>Estado: {generatedDoc.status}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}